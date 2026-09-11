import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readdir, rename, link, stat, unlink, utimes } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { HelperError, LIMITS } from './contract';
import { download, HttpError } from './network';

export function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function readBounded(path: string, maxBytes: number): Promise<Buffer> {
  const file = await open(path, 'r');
  try {
    const info = await file.stat();
    if (!info.isFile()) throw new HelperError('INVALID_ARGUMENT', 'Input must be a regular file.');
    if (info.size > maxBytes) throw new HelperError('INPUT_TOO_LARGE', 'File exceeds the byte limit.');
    const chunks: Buffer[] = [];
    let length = 0;
    // Also bound reads if a file grows after stat().
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      const bytes = chunk as Buffer;
      length += bytes.length;
      if (length > maxBytes) throw new HelperError('INPUT_TOO_LARGE', 'File exceeds the byte limit.');
      chunks.push(bytes);
    }
    return Buffer.concat(chunks);
  } finally { await file.close(); }
}

export async function writeAtomic(path: string, bytes: Uint8Array, force: boolean): Promise<void> {
  const temporary = join(dirname(path), `.screenshot-styler-${randomUUID()}.tmp`);
  const file = await open(temporary, 'wx', 0o600);
  try {
    await file.writeFile(bytes);
    await file.close();
    if (force) await rename(temporary, path);
    else {
      // link() fails atomically if the destination appeared while rendering.
      try { await link(temporary, path); } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
          throw new HelperError('OUTPUT_EXISTS', 'Output already exists. Choose another destination or use --force.');
        }
        throw error;
      }
    }
  } finally {
    await file.close();
    await unlink(temporary).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error; });
  }
}

export interface BackgroundAsset { sha256: string; url: string; bytes: number }

export async function loadBackground(asset: BackgroundAsset, cache: string, offline: boolean): Promise<Buffer> {
  if (!/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isSafeInteger(asset.bytes) || asset.bytes > LIMITS.inputBytes || asset.bytes < 1) {
    throw new HelperError('ASSET_INTEGRITY_FAILED', 'Invalid release asset metadata.');
  }
  await mkdir(cache, { recursive: true, mode: 0o700 });
  const path = join(cache, `${asset.sha256}.png`);
  try {
    const bytes = await readBounded(path, LIMITS.inputBytes);
    if (sha256(bytes) !== asset.sha256 || bytes.length !== asset.bytes) {
      throw new HelperError('ASSET_INTEGRITY_FAILED', 'Cached background is corrupt. Remove it and retry online.');
    }
    await utimes(path, new Date(), new Date());
    return bytes;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  if (offline) throw new HelperError('ASSET_UNAVAILABLE', 'Selected background is not cached. Run once online first.');
  let bytes: Buffer | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { bytes = await download(asset.url); break; } catch (error: unknown) {
      const transient = error instanceof HelperError &&
        (error.code === 'FETCH_TIMEOUT' || (error.code === 'FETCH_FAILED' && (!(error instanceof HttpError) || error.status >= 500)));
      if (!transient || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  if (!bytes || sha256(bytes) !== asset.sha256 || bytes.length !== asset.bytes) {
    throw new HelperError('ASSET_INTEGRITY_FAILED', 'Downloaded background does not match this release.');
  }
  const entries = await Promise.all((await readdir(cache)).filter((name) => /^[a-f0-9]{64}\.png$/.test(name)).map(async (name) => {
    const path = join(cache, name);
    const info = await stat(path);
    return { path, bytes: info.size, accessed: info.mtimeMs };
  }));
  let total = entries.reduce((sum, entry) => sum + entry.bytes, 0) + bytes.length;
  for (const entry of entries.sort((a, b) => a.accessed - b.accessed)) {
    if (total <= LIMITS.cacheBytes) break;
    await unlink(entry.path);
    total -= entry.bytes;
  }
  await writeAtomic(path, bytes, true);
  return bytes;
}
