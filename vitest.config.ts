import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['test/components/**', 'jsdom']],
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
});
