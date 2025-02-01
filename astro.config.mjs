// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react(), tailwind()],
  markdown: {
    // markdown config
  },
  vite: {
    assetsInclude: ['**/*.md'],
    build: {
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@assistant-ui/react')) {
              return 'assistant-ui-chunk';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('components/ui/')) {
              return 'ui-components';
            }
          }
        }
      }
    },
    ssr: {
      noExternal: ['@assistant-ui/react']
    }
  },
  output: 'server',
  adapter: netlify()
});