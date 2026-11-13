import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Lets tests import components with the same '@/' alias the app uses.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
