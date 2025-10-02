import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Only use edge renderer in production builds for Cloudflare
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://one.ie',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [
      tailwindcss({
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }),
    ],
    resolve: {
      alias: isProd ? {
        'react-dom/server': 'react-dom/server.edge',
      } : {},
    },
    ssr: {
      external: ['node:async_hooks'],
    },
  },
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
    mode: 'directory',
    runtime: {
      mode: 'local',
    },
  }),
});
