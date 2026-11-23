/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { componentTagger } from 'lovable-tagger';

// The iPhone bezel is added by the owner once Apple grants permission; it is never
// downloaded by the build. Without it the iPhone layout stays hidden.
function deviceFrameInfo(): { model: string; version: string } | null {
  const image = path.resolve(__dirname, 'public/devices/iphone-portrait.png');
  const metadata = path.resolve(__dirname, 'public/devices/iphone-portrait.json');
  if (!existsSync(image)) return null;
  const { model } = existsSync(metadata) ? JSON.parse(readFileSync(metadata, 'utf8')) as { model?: unknown } : { model: undefined };
  if (typeof model !== 'string' || !model.trim() || model.length > 60) {
    throw new Error('public/devices/iphone-portrait.json must contain {"model": "<device name, up to 60 characters>"}');
  }
  const version = createHash('sha256').update(readFileSync(image)).digest('hex').slice(0, 12);
  return { model: model.trim(), version };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/ss/',
  define: {
    __STUDIO_BACKGROUND_URLS__: JSON.stringify(Object.fromEntries(['light', 'dark'].map((variant) => {
      const source = `backgrounds/bg-${variant}-bubbles.png`;
      const hash = createHash('sha256').update(readFileSync(path.resolve(__dirname, 'public', source))).digest('hex');
      return [variant, mode === 'production' ? `/ss/agents/assets/${hash}.png` : `/ss/${source}`];
    }))),
    __STUDIO_DEVICE_FRAME__: JSON.stringify(deviceFrameInfo()),
  },
  server: {
    // Use default Vite debug port and IPv4-compatible host for debugger support
    host: true, // equivalent to 0.0.0.0
    port: 5173,
    allowedHosts: true,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
}));
