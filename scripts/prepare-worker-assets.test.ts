// @vitest-environment node
import { execFile } from 'node:child_process';
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const exec = promisify(execFile);

it.each([
  { label: 'ordinary local build', ci: '', branch: '', args: [], redirect: false },
  { label: 'production CI build', ci: '1', branch: 'main', args: [], redirect: false },
  { label: 'feature branch CI build', ci: '1', branch: 'feature/agent-friendly-studio', args: [], redirect: true },
  { label: 'explicit local preview build', ci: '', branch: '', args: ['--preview'], redirect: true },
  { label: 'CI with missing branch metadata', ci: '1', branch: '', args: [], redirect: false },
])('packages $label with the correct root behavior', async ({ ci, branch, args, redirect }) => {
  const directory = await mkdtemp(join(tmpdir(), 'styler-packaging-'));
  try {
    await mkdir(join(directory, 'scripts'));
    await mkdir(join(directory, 'dist'));
    const script = join(directory, 'scripts', 'prepare-worker-assets.mjs');
    await copyFile('scripts/prepare-worker-assets.mjs', script);
    await writeFile(join(directory, 'dist', 'index.html'), '<html>studio</html>');
    await writeFile(join(directory, 'dist', '_redirects'), '/ss /ss/ 301\n');
    await writeFile(join(directory, 'dist', '_headers'), '/ss/\n  Cache-Control: no-cache\n');
    await exec(process.execPath, [script, ...args], {
      env: { ...process.env, WORKERS_CI: ci, WORKERS_CI_BRANCH: branch },
    });
    expect(await readFile(join(directory, 'dist', 'ss', 'index.html'), 'utf8')).toContain('studio');
    await expect(access(join(directory, 'dist', 'index.html'))).rejects.toMatchObject({ code: 'ENOENT' });
    const redirects = await readFile(join(directory, 'dist', '_redirects'), 'utf8');
    expect(redirects).toContain('/ss /ss/ 301');
    expect(/^\/ \/ss\/ 302$/m.test(redirects)).toBe(redirect);
    expect(await readFile(join(directory, 'dist', '_headers'), 'utf8')).toContain('Cache-Control: no-cache');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
