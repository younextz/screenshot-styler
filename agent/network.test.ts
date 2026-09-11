// @vitest-environment node
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import type { RequestOptions } from 'node:https';
import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { download } from './network';

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock('node:dns/promises', () => ({ lookup: mocks.lookup }));
vi.mock('node:https', () => ({ request: mocks.request }));

interface Reply { status?: number; headers?: Record<string, string>; chunks?: Buffer[] }
let replies: Reply[];

beforeEach(() => {
  replies = [];
  mocks.lookup.mockReset().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
  mocks.request.mockReset().mockImplementation((_url: URL, options: RequestOptions, callback: (res: IncomingMessage) => void) => {
    const request = new EventEmitter();
    Object.assign(request, { end: () => {
      const reply = replies.shift() ?? {};
      const stream = Readable.from(reply.chunks ?? [Buffer.from('image')]) as IncomingMessage;
      stream.statusCode = reply.status ?? 200;
      stream.headers = reply.headers ?? {};
      options.signal?.addEventListener('abort', () => stream.destroy(new Error('aborted')), { once: true });
      callback(stream);
    } });
    return request;
  });
});
afterEach(() => vi.useRealTimers());

it('pins the validated DNS address to the actual HTTPS connection', async () => {
  mocks.lookup.mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }]).mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }]);
  expect(await download('https://example.com/a.png')).toEqual(Buffer.from('image'));
  const options = mocks.request.mock.calls[0][1] as RequestOptions;
  const callback = vi.fn();
  options.lookup?.('example.com', {}, callback);
  expect(callback).toHaveBeenCalledWith(null, '8.8.8.8', 4);
  expect(options.family).toBe(4);
  expect(mocks.lookup).toHaveBeenCalledTimes(1);
});

it('rejects mixed public/private DNS results before opening a connection', async () => {
  mocks.lookup.mockResolvedValue([{ address: '8.8.8.8', family: 4 }, { address: '10.0.0.1', family: 4 }]);
  await expect(download('https://example.com/a')).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  expect(mocks.request).not.toHaveBeenCalled();
});

it('revalidates redirects and stops at the redirect limit', async () => {
  replies.push({ status: 302, headers: { location: 'https://127.0.0.1/secret' } });
  await expect(download('https://example.com/a')).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  expect(mocks.request).toHaveBeenCalledTimes(1);
  replies.push(...Array.from({ length: 4 }, () => ({ status: 302, headers: { location: '/again' } })));
  await expect(download('https://example.com/a')).rejects.toMatchObject({ code: 'FETCH_FAILED' });
  expect(mocks.request).toHaveBeenCalledTimes(5);
});

it('bounds actual streamed bytes even when the host omits or lies about length', async () => {
  replies.push({ headers: { 'content-length': '1' }, chunks: [Buffer.alloc(5), Buffer.alloc(5)] });
  await expect(download('https://example.com/a', { maxBytes: 8 })).rejects.toMatchObject({ code: 'INPUT_TOO_LARGE' });
});

it('rejects compressed responses and excessive declared length', async () => {
  replies.push({ headers: { 'content-encoding': 'gzip' } });
  await expect(download('https://example.com/a')).rejects.toMatchObject({ code: 'FETCH_FAILED' });
  replies.push({ headers: { 'content-length': '100' } });
  await expect(download('https://example.com/a', { maxBytes: 10 })).rejects.toMatchObject({ code: 'INPUT_TOO_LARGE' });
});

it('applies the download deadline to DNS resolution', async () => {
  vi.useFakeTimers();
  mocks.lookup.mockReturnValue(new Promise(() => undefined));
  const result = expect(download('https://example.com/a', { timeoutMs: 100 })).rejects.toMatchObject({ code: 'FETCH_TIMEOUT' });
  await vi.advanceTimersByTimeAsync(100);
  await result;
  expect(mocks.request).not.toHaveBeenCalled();
});
