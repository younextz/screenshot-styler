import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { unzipSync } from 'fflate';
import { chromium } from 'playwright';

const exec = promisify(execFile);
const origin = new URL(process.argv[2] ?? 'http://localhost:8787');
assert(['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname), 'Validation must use a local preview');
const root = resolve(import.meta.dirname, '..');
const artifacts = join(root, 'test-results', 'agent-validation');
const temporary = await mkdtemp(join(tmpdir(), 'styler-release-validation-'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const local = (url) => new URL(new URL(url, origin).pathname, origin);
const report = { checks: [], release: '', artifacts };
let browser;

async function response(path, type, cache) {
  const res = await fetch(local(path));
  assert.equal(res.status, 200, `GET ${path}`);
  assert.match(res.headers.get('content-type') ?? '', type);
  if (cache) assert.match(res.headers.get('cache-control') ?? '', cache);
  return res;
}

try {
  await access(chromium.executablePath());
  await mkdir(artifacts, { recursive: true });
  const html = await response('/ss/', /text\/html/, /no-cache/);
  assert.match(html.headers.get('link') ?? '', /agents\/guide\.md/);
  assert.match(await html.text(), /rel="alternate"[^>]+type="text\/markdown"/);
  await response('/ss/llms.txt', /text\/plain/);
  await response('/ss/agents/guide.md', /text\/markdown/, /no-cache/);
  await response('/ss/agents/screenshot-styler/SKILL.md', /text\/markdown/, /no-cache/);
  assert.equal((await fetch(local('/ss/api/v1/render'))).status, 404);
  const manifest = await (await response('/ss/agents/manifest.json', /application\/json/, /no-cache/)).json();
  report.release = manifest.release;
  const zip = Buffer.from(await (await response(manifest.helper.url, /application\/zip/, /immutable/)).arrayBuffer());
  assert.equal(hash(zip), manifest.helper.sha256);
  assert.equal(zip.length, manifest.helper.bytes);
  const skill = Buffer.from(await (await response(manifest.skill.url, /text\//, /immutable/)).arrayBuffer());
  assert.equal(hash(skill), manifest.skill.sha256);
  for (const [name, bytes] of Object.entries(unzipSync(zip))) {
    assert.match(name, /^screenshot-styler-helper\/[A-Za-z0-9.-]+$/);
    await mkdir(join(temporary, 'screenshot-styler-helper'), { recursive: true });
    await writeFile(join(temporary, name), bytes);
  }
  const helper = join(temporary, 'screenshot-styler-helper');
  const cache = join(temporary, 'cache');
  await mkdir(cache);
  for (const asset of Object.values(manifest.backgrounds)) {
    const bytes = Buffer.from(await (await response(asset.url, /image\/png/, /immutable/)).arrayBuffer());
    assert.equal(hash(bytes), asset.sha256);
    assert.equal(bytes.length, asset.bytes);
    // Production assets are unpublished on a feature branch; seed from verified local preview bytes.
    await writeFile(join(cache, `${asset.sha256}.png`), bytes);
  }
  report.checks.push('Static discovery, headers, manifest hashes, archive extraction, background integrity');
  await exec('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: helper, timeout: 120_000 });
  const guard = join(temporary, 'deny-network.mjs');
  await writeFile(guard, `import http from 'node:http'; import https from 'node:https'; import dns from 'node:dns/promises'; import { syncBuiltinESMExports } from 'node:module';
const deny = () => { throw new Error('Unexpected network request in warmed helper'); };
http.request = deny; https.request = deny; dns.lookup = deny; syncBuiltinESMExports();\n`);
  const helperEnv = { ...process.env, SCREENSHOT_STYLER_CACHE_DIR: cache, NODE_OPTIONS: `--import=${pathToFileURL(guard).href}` };
  async function render(args, failure) {
    let stdout;
    let code = 0;
    try { ({ stdout } = await exec(process.execPath, ['render.mjs', ...args], { cwd: helper, env: helperEnv, timeout: 75_000, maxBuffer: 1024 * 1024 })); }
    catch (error) { stdout = error.stdout; code = error.code; }
    const result = JSON.parse(stdout.trim());
    if (failure) { assert.notEqual(code, 0); assert.equal(result.code, failure); }
    else { assert.equal(code, 0, stdout); assert.equal(result.ok, true); }
    return result;
  }
  const fixture = join(root, 'test.png');
  for (const background of ['light', 'dark']) {
    await render(['--input', fixture, '--background', background, '--output', join(artifacts, `helper-${background}.png`), '--offline', '--force']);
  }
  // Warm normal mode must also avoid DNS/HTTP, not just the explicit offline flag.
  await render(['--input', fixture, '--output', join(artifacts, 'helper-light.svg'), '--force']);
  const fourK = await render(['--input', fixture, '--size', '4k', '--output', join(artifacts, 'helper-4k.png'), '--force']);
  assert.equal(Math.max(fourK.width, fourK.height), 3840);
  await render(['--input', fixture, '--output', join(artifacts, 'helper-light.png')], 'OUTPUT_EXISTS');
  await render(['--url', 'https://127.0.0.1/image.png', '--output', join(artifacts, 'bad.png')], 'INVALID_ARGUMENT');
  report.checks.push('Fresh archive install; light/dark PNG, SVG, 4K, overwrite protection; warmed runs with DNS/HTTP disabled');

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const derived = await page.evaluate(async (data) => {
    const image = new Image(); image.src = data; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    const jpeg = canvas.toDataURL('image/jpeg').split(',')[1];
    context.clearRect(0, 0, Math.ceil(canvas.width / 3), canvas.height);
    return { jpeg, transparent: canvas.toDataURL('image/png').split(',')[1] };
  }, `data:image/png;base64,${(await readFile(fixture)).toString('base64')}`);
  for (const [name, data] of Object.entries(derived)) {
    const source = join(temporary, `${name}.${name === 'jpeg' ? 'jpg' : 'png'}`);
    await writeFile(source, Buffer.from(data, 'base64'));
    await render(['--input', source, '--output', join(artifacts, `helper-${name}.png`), '--offline', '--force']);
  }
  report.checks.push('JPEG and transparent PNG inputs derived from test.png decode and export');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(local('/ss/').href);
  await page.locator('input[type=file]').setInputFiles(fixture);
  for (const background of ['light', 'dark']) {
    await page.getByRole('button', { name: background === 'light' ? 'Light' : 'Dark', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PNG', exact: true }).click();
    await (await download).saveAs(join(artifacts, `editor-${background}.png`));
  }
  async function compare(left, right) {
    const images = await Promise.all([left, right].map(async (name) => `data:image/png;base64,${(await readFile(join(artifacts, name))).toString('base64')}`));
    return page.evaluate(async (sources) => {
      const pixels = await Promise.all(sources.map(async (source) => {
        const image = new Image(); image.src = source; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
        return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data };
      }));
      let differences = 0;
      for (let index = 0; index < pixels[0].data.length; index++) if (pixels[0].data[index] !== pixels[1].data[index]) differences++;
      return { sameSize: pixels[0].width === pixels[1].width && pixels[0].height === pixels[1].height, differences };
    }, images);
  }
  for (const background of ['light', 'dark']) {
    assert.deepEqual(await compare(`helper-${background}.png`, `editor-${background}.png`), { sameSize: true, differences: 0 });
  }
  report.checks.push('Editor/helper decoded PNG pixels are identical for test.png with both backgrounds');
  const svg = await readFile(join(artifacts, 'helper-light.svg'), 'utf8');
  assert(!/href="(?:https?:|\/)/.test(svg), 'SVG must be self-contained');
  const svgSize = await page.evaluate(async (source) => {
    const image = new Image(); image.src = source; await image.decode(); return { width: image.width, height: image.height };
  }, `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
  assert(svgSize.width > 0 && svgSize.height > 0, 'Standalone SVG must decode');
  await page.screenshot({ path: join(artifacts, 'editor-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Use with an agent', exact: true }).click();
  assert(await page.getByRole('dialog').isVisible());
  await page.screenshot({ path: join(artifacts, 'agent-panel-desktop.png'), fullPage: true });
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Use with an agent');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Use with an agent', exact: true }).click();
  const bounds = await page.getByRole('dialog').boundingBox();
  assert(bounds.x >= 0 && bounds.x + bounds.width <= 390);
  await page.screenshot({ path: join(artifacts, 'agent-panel-mobile.png'), fullPage: true });
  for (let index = 0; index < 7; index++) {
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.querySelector('dialog[open]').contains(document.activeElement)));
  }
  assert.deepEqual(errors, []);
  report.checks.push('Self-contained SVG; desktop/mobile panel; Escape restores focus; modal Tab stays inside; no page errors');
  await writeFile(join(artifacts, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await rm(temporary, { recursive: true, force: true });
}
