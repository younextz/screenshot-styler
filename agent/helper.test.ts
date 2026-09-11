// @vitest-environment node
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LIMITS, validateDimensions } from './contract';
import { inspectImage } from './imageHeader';
import { loadBackground, readBounded, sha256, writeAtomic } from './files';
import { isPublicAddress, validateRemoteUrl } from './network';
import { parseArguments } from './render';

const temporary: string[] = [];
async function directory() {
  const path = await mkdtemp(join(tmpdir(), 'styler-test-'));
  temporary.push(path);
  return path;
}
afterEach(async () => { await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

describe('helper contract', () => {
  it('defaults to light native PNG and rejects ambiguous or unsupported combinations', () => {
    expect(parseArguments(['--input', 'source.png', '--output', 'result.png'])).toMatchObject({ background: 'light', size: 'native', format: 'png', force: false });
    for (const args of [
      ['--input', 'a.png', '--url', 'https://example.com/a.png', '--output', 'b.png'],
      ['--input', 'a.png', '--output', 'b.svg', '--size', '4k'],
      ['--url', 'https://example.com/a.png', '--output', 'b.png', '--offline'],
      ['--input', 'a.png', '--output', 'b.png', '--background', 'red'],
      ['--input', 'a.png', '--output', 'b.png', '--unexpected'],
    ]) expect(() => parseArguments(args)).toThrow();
  });

  it('bounds source and intermediate output before decoding or canvas allocation', () => {
    expect(validateDimensions(1259, 768, 'native')).toEqual({ width: 1575, height: 1084 });
    expect(validateDimensions(1259, 768, '4k').width).toBe(3840);
    for (const [width, height] of [[0, 1], [9000, 2], [4096, 4096], [8000, 2000]]) {
      expect(() => validateDimensions(width, height, 'native')).toThrow();
    }
  });

  it('inspects the actual test PNG and rejects misleading or truncated files', async () => {
    const source = await readFile('test.png');
    expect(inspectImage(source)).toMatchObject({ mime: 'image/png' });
    expect(inspectImage(source).width).toBeGreaterThan(0);
    for (const bytes of [Buffer.from('<svg/>'), Buffer.from('<html/>'), source.subarray(0, 20), Buffer.from([255, 216, 255, 224, 0, 0])]) {
      expect(() => inspectImage(bytes)).toThrow();
    }
  });

  it('accounts for JPEG EXIF rotation and malformed segment lengths', () => {
    const exif = Buffer.from('45786966000049492a0008000000010012010300010000000600000000000000', 'hex');
    const length = Buffer.alloc(2); length.writeUInt16BE(exif.length + 2);
    const jpeg = Buffer.concat([Buffer.from([255, 216, 255, 225]), length, exif,
      Buffer.from([255, 192, 0, 11, 8, 0, 20, 0, 40, 1, 1, 17, 0, 255, 218])]);
    expect(inspectImage(jpeg)).toEqual({ width: 20, height: 40, mime: 'image/jpeg' });
    expect(() => inspectImage(Buffer.from([255, 216, 255, 225, 255, 255]))).toThrow();
  });
});

describe('remote input policy', () => {
  it.each(['127.0.0.1', '10.0.0.1', '169.254.169.254', '100.64.0.1', '192.168.1.1', '0.0.0.0', '224.0.0.1', '192.0.2.1', '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1'])('rejects non-public address %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])('accepts public address %s', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });
  it.each(['http://example.com/image.png', 'file:///tmp/a.png', 'https://u:p@example.com/a', 'https://example.com:444/a', 'https://127.1/a', 'https://[::ffff:127.0.0.1]/a', 'https://localhost/a'])('rejects unsafe URL %s', (url) => {
    expect(() => validateRemoteUrl(url)).toThrow();
  });
});

describe('file and cache behavior', () => {
  it('protects outputs and replaces them only explicitly', async () => {
    const path = join(await directory(), 'out.png');
    await writeAtomic(path, Buffer.from('first'), false);
    await expect(writeAtomic(path, Buffer.from('second'), false)).rejects.toMatchObject({ code: 'OUTPUT_EXISTS' });
    expect(await readFile(path, 'utf8')).toBe('first');
    await writeAtomic(path, Buffer.from('second'), true);
    expect(await readFile(path, 'utf8')).toBe('second');
    await expect(readBounded(path, 2)).rejects.toMatchObject({ code: 'INPUT_TOO_LARGE' });
  });
  it('uses a verified cached background offline, rejects corruption, and reports misses', async () => {
    const cache = await directory();
    const bytes = Buffer.from('background fixture');
    const hash = sha256(bytes);
    const asset = { sha256: hash, bytes: bytes.length, url: 'https://example.com/bg.png' };
    await expect(loadBackground(asset, cache, true)).rejects.toMatchObject({ code: 'ASSET_UNAVAILABLE' });
    await writeFile(join(cache, `${hash}.png`), bytes);
    expect(await loadBackground(asset, cache, true)).toEqual(bytes);
    await writeFile(join(cache, `${hash}.png`), 'corrupt');
    await expect(loadBackground(asset, cache, true)).rejects.toMatchObject({ code: 'ASSET_INTEGRITY_FAILED' });
    await expect(loadBackground({ ...asset, bytes: LIMITS.inputBytes + 1 }, cache, false)).rejects.toThrow();
  });
});
