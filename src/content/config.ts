import { defineCollection, z } from 'astro:content';

const works = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    year: z.number(),
    technique_es: z.string(),
    technique_en: z.string(),
    width_cm: z.number().nullable(),
    height_cm: z.number().nullable(),
    depth_cm: z.number().nullable().optional(),
    kind: z.enum(['painting', 'installation', 'object']),
    series: z.enum(['cuba', 'miami', 'sf', 'roma', 'espana', 'none']).default('none'),
    status: z.enum(['available', 'reserved', 'sold']),
    price_eur: z.number().nullable(),
    featured: z.boolean().default(false),
    cover: image(),
    gallery: z.array(image()).default([]),
    story_es: z.string(),
    story_en: z.string(),
    order: z.number().default(0),
  }),
});
export const collections = { works };
