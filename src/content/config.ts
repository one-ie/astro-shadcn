import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  picture: z.string().optional(),
  image: z.string().optional()
});

// Define the Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

export const collections = {
  'blog': blog
};

// Export the Blog schema type
export type BlogSchema = z.infer<typeof BlogSchema>;
