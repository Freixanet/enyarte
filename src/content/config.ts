import { defineCollection } from 'astro:content';

const works = defineCollection({
  loader: {
    name: 'f0-empty',
    load: async ({ store }) => {
      store.clear();
    },
  },
});

export const collections = { works };
