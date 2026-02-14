import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    type: z.string(),
    title: z.string(),
    draft: z.boolean(),
    description: z.string(),
    ogp: z.string(),
    tag: z.array(z.string()),
    changelog: z.array(
      z.object({
        summary: z.string(),
        date: z.string(),
      }),
    ),
  }),
});

export const collections = { posts };
