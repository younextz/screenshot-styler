import { readFile, lstat, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { Browser } from 'playwright';
import { RENDERER_VERSION } from '../src/utils/composeScreenshot';
import { HelperError, LIMITS, validateDimensions, type RenderArguments } from './contract';
import { loadBackground, readBounded, writeAtomic, type BackgroundAsset } from './files';
import { inspectImage } from './imageHeader';
import { download, validateRemoteUrl } from './network';
import type { BrowserInput } from './browser';

export function parseArguments(args: string[]): RenderArguments {
  let values;
  try {
    ({ values } = parseArgs({ args, options: {
      input: { type: 'string' }, url: { type: 'string' }, output: { type: 'string' },
      background: { type: 'string', default: 'light' }, size: { type: 'string', default: 'native' },
      force: { type: 'boolean', default: false }, offline: { type: 'boolean', default: false },
    } }));
  } catch { throw new HelperError('INVALID_ARGUMENT', 'Invalid arguments. Run with --help for usage.'); }
  const { input, url, output, background, size, force, offline } = values;
  const format = output ? extname(output).slice(1).toLowerCase() : '';
  if (Boolean(input) === Boolean(url) || !output || !['png', 'svg'].includes(format) ||
    !['light', 'dark'].includes(background) || !['native', '4k'].includes(size) ||
    (size === '4k' && format === 'svg') || (offline && url)) {
    throw new HelperError('INVALID_ARGUMENT', 'Supply exactly one --input or --url and a .png/.svg --output. Use light/dark and native/4k; 4k requires PNG and offline requires a file.');
  }
  if (url) validateRemoteUrl(url);
  return { input, url, output: resolve(output), background: background as 'light' | 'dark',
    format: format as 'png' | 'svg', size: size as 'native' | '4k', force, offline };
}

interface Release {
  rendererVersion: string;
  release: string;
  backgrounds: Record<'light' | 'dark', BackgroundAsset>;
}

async function run(args: RenderArguments) {
  if (args.input && resolve(args.input) === args.output) {
    throw new HelperError('INVALID_ARGUMENT', 'Input and output must be different files.');
  }
  try {
    const existing = await lstat(args.output);
    if (!args.force || !existing.isFile()) throw new HelperError('OUTPUT_EXISTS', 'Output exists. Choose another file or use --force for a regular file.');
  } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await access(dirname(args.output));
  const release = JSON.parse(await readFile(new URL('./release.json', import.meta.url), 'utf8')) as Release;
  if (release.rendererVersion !== RENDERER_VERSION || !release.backgrounds?.[args.background]) {
    throw new HelperError('ASSET_INTEGRITY_FAILED', 'Helper files belong to different releases. Reinstall a complete archive.');
  }
  const { chromium } = await import('playwright').catch(() => { throw new HelperError('RUNTIME_MISSING', 'Run npm ci in the helper directory.'); });
  await access(chromium.executablePath()).catch(() => { throw new HelperError('RUNTIME_MISSING', 'Run npx --no-install playwright install chromium in the helper directory.'); });
  const source = args.input ? await readBounded(args.input, LIMITS.inputBytes) : await download(args.url!);
  const sourceInfo = inspectImage(source);
  validateDimensions(sourceInfo.width, sourceInfo.height, args.size);
  const cache = process.env.SCREENSHOT_STYLER_CACHE_DIR ?? join(homedir(), '.cache', 'screenshot-styler');
  const background = await loadBackground(release.backgrounds[args.background], cache, args.offline);
  const browserCode = await readFile(new URL('./browser.js', import.meta.url), 'utf8');
  let browser: Browser | undefined;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    browser = await chromium.launch({ headless: true, timeout: LIMITS.renderMs, args: ['--disable-background-networking'] });
    const activeBrowser = browser;
    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        reject(new HelperError('RENDER_FAILED', 'Rendering exceeded its 30-second deadline.'));
        void activeBrowser.close().catch(() => undefined);
      }, LIMITS.renderMs);
    });
    const task = async () => {
      const context = await activeBrowser.newContext({ serviceWorkers: 'block' });
      await context.route('**/*', (route) => route.abort());
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
      await page.addScriptTag({ content: browserCode });
      const input: BrowserInput = {
        imageData: `data:${sourceInfo.mime};base64,${source.toString('base64')}`,
        backgroundData: `data:image/png;base64,${background.toString('base64')}`,
        width: sourceInfo.width, height: sourceInfo.height, format: args.format, size: args.size,
      };
      return page.evaluate((input) => window.ScreenshotStyler.render(input), input);
    };
    const result = await Promise.race([task(), deadline]);
    clearTimeout(timer);
    const output = Buffer.from(result.base64, 'base64');
    if (output.length > LIMITS.outputBytes) throw new HelperError('OUTPUT_TOO_LARGE', 'Encoded output exceeds 32 MiB.');
    await writeAtomic(args.output, output, args.force);
    return { ok: true, output: args.output, format: args.format, width: result.width, height: result.height,
      bytes: output.length, rendererVersion: RENDERER_VERSION, release: release.release };
  } catch (error: unknown) {
    if (error instanceof HelperError) throw error;
    if (error instanceof Error && error.message.includes('OUTPUT_TOO_LARGE')) throw new HelperError('OUTPUT_TOO_LARGE', 'Encoded output exceeds 32 MiB.');
    throw new HelperError('RENDER_FAILED', timedOut ? 'Rendering exceeded its deadline.' : 'Could not render image. Verify the image and Chromium installation.');
  } finally {
    clearTimeout(timer);
    await browser?.close();
  }
}

export async function main(args: string[]): Promise<void> {
  try {
    if (args.length === 1 && args[0] === '--help') {
      console.log(JSON.stringify({ rendererVersion: RENDERER_VERSION, usage: 'node render.mjs (--input FILE | --url HTTPS_URL) --output FILE.png|FILE.svg [--background light|dark] [--size native|4k] [--force] [--offline]', limits: LIMITS }));
      return;
    }
    console.log(JSON.stringify(await run(parseArguments(args))));
  } catch (error: unknown) {
    const failure = error instanceof HelperError ? error : new HelperError('RENDER_FAILED', 'Unable to access helper files or output destination. Check setup and filesystem permissions.');
    console.log(JSON.stringify({ ok: false, code: failure.code, message: failure.message }));
    process.exitCode = 1;
  }
}
