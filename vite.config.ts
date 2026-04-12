import {defineConfig, type Plugin} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

/**
 * Sanity Studio is client-only (loaded via dynamic import inside useEffect).
 * During the SSR build, stub all sanity-related imports with an empty module
 * so the Worker bundle never tries to include or resolve the 4+ MB package.
 */
const SANITY_STUB_ID = '\0sanity-client-only-stub';
function sanityClientOnly(): Plugin {
  return {
    name: 'sanity-client-only',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      if (
        options?.ssr &&
        (id === 'sanity' ||
          id.startsWith('sanity/') ||
          id === '@sanity/vision' ||
          id === 'styled-components')
      ) {
        return SANITY_STUB_ID;
      }
    },
    load(id) {
      if (id === SANITY_STUB_ID) {
        // Provide no-op named exports for everything the schemas and config use.
        // None of this code ever runs server-side — it just satisfies Rollup's
        // export analysis so the SSR bundle can be built without the real package.
        return [
          'const noop = () => ({});',
          'export default noop;',
          'export {',
          '  noop as defineConfig,',
          '  noop as defineType,',
          '  noop as defineField,',
          '  noop as defineArrayMember,',
          '  noop as structureTool,',
          '  noop as visionTool,',
          '  noop as Studio,',
          '};',
        ].join('\n');
      }
    },
  };
}

export default defineConfig({
  plugins: [
    sanityClientOnly(),
    tailwindcss(),
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'rxjs',
        'rxjs/operators',
        '@sanity/client',
        'set-cookie-parser',
        'cookie',
        'react-router',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
