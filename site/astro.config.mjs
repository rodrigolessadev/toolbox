import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const site = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://toolbox.vercel.app';

// https://astro.build/config
export default defineConfig({
  site,
  // 'hybrid' = páginas .astro são estáticas, endpoints com `export const prerender = false`
  // rodam como serverless functions. Necessário para /api/latest e /api/releases.
  output: 'static',
  adapter: vercel({
    edgeMiddleware: false,
    webAnalytics: { enabled: false },
  }),
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  build: {
    assets: 'assets',
  },
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom'],
    },
  },
});
