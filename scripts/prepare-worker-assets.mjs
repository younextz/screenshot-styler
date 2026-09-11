import { mkdir, readdir, rename } from 'node:fs/promises';

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
