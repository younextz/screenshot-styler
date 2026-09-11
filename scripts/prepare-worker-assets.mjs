import { appendFile, mkdir, readdir, rename } from 'node:fs/promises';

const outputDirectory = new URL('../dist/', import.meta.url);
const appDirectory = new URL('ss/', outputDirectory);
const entries = await readdir(outputDirectory);

// Cloudflare matches asset paths literally. Keep its control files at the root
// while placing the Vite output beneath the same /ss/ prefix as the app URLs.
await mkdir(appDirectory);
for (const entry of entries) {
  if (entry === '.assetsignore' || entry === '_redirects' || entry === '_headers') continue;
  await rename(new URL(entry, outputDirectory), new URL(entry, appDirectory));
}

// Workers Builds posts preview links to /, while the app is mounted at /ss/.
// Keep the production domain root available for the other app.
const preview = process.argv.includes('--preview') || (
  process.env.WORKERS_CI === '1' &&
  Boolean(process.env.WORKERS_CI_BRANCH) &&
  process.env.WORKERS_CI_BRANCH !== 'main'
);
if (preview) {
  await appendFile(new URL('_redirects', outputDirectory), '\n/ /ss/ 302\n');
  console.log('Preview build: redirecting the domain root to /ss/.');
}
