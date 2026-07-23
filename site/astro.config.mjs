import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://toolbox.seudominio.com.br',
  // 'hybrid' = páginas .astro são estáticas, endpoints com `export const prerender = false`
  // rodam como serverless functions. Necessário para /api/latest e /api/releases.
  output: 'hybrid',
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
