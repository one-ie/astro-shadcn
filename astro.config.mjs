// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), partytown()],
  markdown: {
    // add markdown config here
  },
  build: {
    // Force all styles to be inlined to eliminate render-blocking CSS
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Reduce the size threshold for inlining assets
      assetsInlineLimit: 4096, // 4kb
      cssCodeSplit: true,
    },
    css: {
      // Enable CSS code splitting
      modules: {
        // Generate more readable class names in development
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    }
  }
});