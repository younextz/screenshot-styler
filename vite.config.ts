/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
