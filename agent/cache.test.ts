// @vitest-environment node
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HelperError } from './contract';
import { loadBackground, sha256 } from './files';
import { HttpError } from './network';

const mocks = vi.hoisted(() => ({ download: vi.fn() }));
vi.mock('./network', async (importOriginal) => ({ ...await importOriginal<typeof import('./network')>(), download: mocks.download }));
let cache: string;
const bytes = Buffer.from('public background');
const asset = { sha256: sha256(bytes), bytes: bytes.length, url: 'https://example.com/bg.png' };

beforeEach(async () => { cache = await mkdtemp(join(tmpdir(), 'styler-cache-')); mocks.download.mockReset(); });
afterEach(async () => { await rm(cache, { recursive: true, force: true }); });

it('downloads a selected background once and reuses verified bytes on the next call', async () => {
  mocks.download.mockResolvedValue(bytes);
  expect(await loadBackground(asset, cache, false)).toEqual(bytes);
  expect(await loadBackground(asset, cache, false)).toEqual(bytes);
  expect(mocks.download).toHaveBeenCalledExactlyOnceWith(asset.url);
  expect(await readdir(cache)).toEqual([`${asset.sha256}.png`]);
  expect(await readFile(join(cache, `${asset.sha256}.png`))).toEqual(bytes);
});

it('does not cache bytes with the wrong digest or retry an integrity failure', async () => {
  mocks.download.mockResolvedValue(Buffer.from('wrong bytes'));
  await expect(loadBackground(asset, cache, false)).rejects.toMatchObject({ code: 'ASSET_INTEGRITY_FAILED' });
  expect(mocks.download).toHaveBeenCalledTimes(1);
  expect(await readdir(cache)).toEqual([]);
});

it('backs off for a transient failure but does not retry a permanent HTTP rejection', async () => {
  mocks.download.mockRejectedValueOnce(new HelperError('FETCH_TIMEOUT', 'timed out')).mockResolvedValueOnce(bytes);
  expect(await loadBackground(asset, cache, false)).toEqual(bytes);
  expect(mocks.download).toHaveBeenCalledTimes(2);
  await rm(join(cache, `${asset.sha256}.png`));
  mocks.download.mockReset().mockRejectedValue(new HttpError(404));
  await expect(loadBackground(asset, cache, false)).rejects.toMatchObject({ code: 'FETCH_FAILED' });
  expect(mocks.download).toHaveBeenCalledTimes(1);
});
