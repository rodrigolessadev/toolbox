import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/plugins' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    version: z.string(),
    author: z.string().optional(),
    language: z.string().optional(),
    icon: z.string().optional(),
    command: z.string().optional(),
    tags: z.array(z.string()).default([]),
    download_url: z.string().optional(),
    updated_at: z.string().optional(),
  }),
});

export const collections = { docs, plugins };
