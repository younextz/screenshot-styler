import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'vite';
import { zipSync } from 'fflate';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist', 'agents');
const temporary = await mkdtemp(join(tmpdir(), 'screenshot-styler-build-'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const read = (path) => readFile(join(root, path));

try {
  await build({
    configFile: false, publicDir: false, logLevel: 'warn',
    build: {
      target: 'es2022', outDir: temporary, emptyOutDir: false,
      lib: { entry: join(root, 'agent/browser.ts'), name: 'ScreenshotStyler', formats: ['iife'], fileName: () => 'browser.js' },
    },
  });
  await build({
    configFile: false, publicDir: false, logLevel: 'warn',
    build: {
      target: 'node22', ssr: join(root, 'agent/entry.ts'), outDir: temporary, emptyOutDir: false,
      rollupOptions: { external: ['playwright', 'ipaddr.js'], output: { entryFileNames: 'render.mjs' } },
    },
  });

  const packageBytes = await read('agent/package.json');
  const packageInfo = JSON.parse(packageBytes);
  const rendererSource = (await read('src/utils/composeScreenshot.ts')).toString();
  if (!rendererSource.includes(`RENDERER_VERSION = '${packageInfo.version}'`)) {
    throw new Error('Helper package and renderer versions differ');
  }
  const backgrounds = {};
  await mkdir(join(output, 'assets'), { recursive: true });
  for (const variant of ['light', 'dark']) {
    const bytes = await read(`public/backgrounds/bg-${variant}-bubbles.png`);
    const sha256 = hash(bytes);
    backgrounds[variant] = { sha256, bytes: bytes.length, url: `https://nitk.me/ss/agents/assets/${sha256}.png` };
    await writeFile(join(output, 'assets', `${sha256}.png`), bytes);
  }

  const files = {
    'render.mjs': await readFile(join(temporary, 'render.mjs')),
    'browser.js': await readFile(join(temporary, 'browser.js')),
    'package.json': packageBytes,
    'package-lock.json': await read('agent/package-lock.json'),
    'GUIDE.md': await read('public/agents/guide.md'),
    'SKILL.md': await read('public/agents/screenshot-styler/SKILL.md'),
    'LICENSE': await read('LICENSE'),
  };
  // Content-address the entire release, not just the renderer's semantic version.
  const fingerprint = createHash('sha256').update(JSON.stringify(backgrounds));
  for (const [name, bytes] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    fingerprint.update(name).update(hash(bytes));
  }
  const release = `${packageInfo.version}-${fingerprint.digest('hex').slice(0, 16)}`;
  files['release.json'] = Buffer.from(JSON.stringify({ rendererVersion: packageInfo.version, release, backgrounds }, null, 2) + '\n');
  const releaseDirectory = join(output, 'releases', release);
  await mkdir(releaseDirectory, { recursive: true });
  const entries = Object.fromEntries(Object.entries(files).map(([name, bytes]) => [
    `screenshot-styler-helper/${name}`, [bytes, { mtime: new Date('2020-01-01T00:00:00Z') }],
  ]));
  const archive = zipSync(entries, { level: 9 });
  await writeFile(join(releaseDirectory, 'helper.zip'), archive);
  await writeFile(join(releaseDirectory, 'SKILL.md'), files['SKILL.md']);
  await writeFile(join(output, 'manifest.json'), JSON.stringify({
    schemaVersion: 1, rendererVersion: packageInfo.version, release,
    guide: 'https://nitk.me/ss/agents/guide.md',
    helper: { url: `https://nitk.me/ss/agents/releases/${release}/helper.zip`, sha256: hash(archive), bytes: archive.length },
    skill: { url: `https://nitk.me/ss/agents/releases/${release}/SKILL.md`, sha256: hash(files['SKILL.md']) },
    backgrounds,
  }, null, 2) + '\n');
  console.log(`Agent release ${release}: ${archive.length} bytes; backgrounds downloaded separately.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
