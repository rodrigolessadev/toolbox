import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
// No Astro 5+, `output: 'static'` (padrão) já se comporta como o antigo 'hybrid':
// páginas .astro são estáticas por padrão, e endpoints com `export const prerender = false`
// rodam como serverless functions. Necessário para /api/latest e /api/releases.
export default defineConfig({
  site: 'https://toolbox.seudominio.com.br',
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
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  build: {
    assets: 'assets',
  },
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom'],
    },
  },
});
