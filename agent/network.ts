import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { isIP } from 'node:net';
import ipaddr from 'ipaddr.js';
import { HelperError, LIMITS } from './contract';

export function isPublicAddress(address: string): boolean {
  try {
    // process() also classifies IPv4-mapped IPv6 by its underlying IPv4 address.
    return ipaddr.process(address).range() === 'unicast';
  } catch {
    return false;
  }
}

export function validateRemoteUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new HelperError('INVALID_ARGUMENT', 'Expected a public HTTPS image URL.'); }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') ||
    hostname === 'localhost' || hostname.endsWith('.localhost') || (isIP(hostname) && !isPublicAddress(hostname))) {
    throw new HelperError('INVALID_ARGUMENT', 'Only public HTTPS URLs on port 443 without credentials are supported.');
  }
  url.hash = '';
  return url;
}

export interface DownloadOptions {
  maxBytes?: number;
  timeoutMs?: number;
}

export class HttpError extends HelperError {
  constructor(public readonly status: number) {
    super('FETCH_FAILED', `Image host returned HTTP ${status}.`);
  }
}

export async function download(value: string, options: DownloadOptions = {}): Promise<Buffer> {
  const maxBytes = options.maxBytes ?? LIMITS.inputBytes;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const error = new HelperError('FETCH_TIMEOUT', 'Download exceeded its deadline.');
      controller.abort(error);
      reject(error);
    }, options.timeoutMs ?? LIMITS.downloadMs);
  });

  const visit = async (value: string, redirects: number): Promise<Buffer> => {
    const url = validateRemoteUrl(value);
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await lookup(hostname, { all: true });
    controller.signal.throwIfAborted();
    if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
      throw new HelperError('INVALID_ARGUMENT', 'The image host must resolve only to public IP addresses.');
    }
    const pinned = addresses[0];
    const response = await new Promise<{ body?: Buffer; location?: string }>((resolve, reject) => {
      const req = request(url, {
        method: 'GET', agent: false, family: pinned.family, maxHeaderSize: 16 * 1024,
        signal: controller.signal,
        // Connect to exactly the address validated above; TLS still validates the original hostname.
        lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family),
        headers: { Accept: 'image/png, image/jpeg', 'Accept-Encoding': 'identity', 'User-Agent': 'ScreenshotStyler/1.0.0' },
      }, (res) => {
        const status = res.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          const location = res.headers.location;
          res.destroy();
          if (!location || redirects >= 3) reject(new HelperError('FETCH_FAILED', 'Invalid or excessive image redirects.'));
          else {
            try { resolve({ location: new URL(location, url).href }); }
            catch { reject(new HelperError('FETCH_FAILED', 'Invalid redirect URL.')); }
          }
          return;
        }
        if (status !== 200) { res.destroy(); reject(new HttpError(status)); return; }
        if (res.headers['content-encoding'] && res.headers['content-encoding'] !== 'identity') {
          res.destroy(); reject(new HelperError('FETCH_FAILED', 'Encoded HTTP bodies are not supported.')); return;
        }
        if (Number(res.headers['content-length']) > maxBytes) {
          res.destroy(); reject(new HelperError('INPUT_TOO_LARGE', 'Download exceeds the byte limit.')); return;
        }
        let length = 0;
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          length += chunk.length;
          if (length > maxBytes) {
            reject(new HelperError('INPUT_TOO_LARGE', 'Download exceeds the byte limit.')); res.destroy();
          } else chunks.push(chunk);
        });
        res.on('end', () => resolve({ body: Buffer.concat(chunks) }));
        res.on('error', reject);
        res.on('aborted', () => reject(new HelperError('FETCH_FAILED', 'Image download was interrupted.')));
      });
      req.on('error', reject);
      req.end();
    });
    return response.location ? visit(response.location, redirects + 1) : response.body!;
  };

  try {
    return await Promise.race([visit(value, 0), timeout]);
  } catch (error: unknown) {
    if (error instanceof HelperError) throw error;
    throw new HelperError('FETCH_FAILED', 'Could not download the image. Check the public URL and network connection.');
  } finally {
    clearTimeout(timer!);
  }
}
