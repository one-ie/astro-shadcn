import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z
    .enum(['tutorial', 'news', 'guide', 'review', 'article'])
    .default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
});

// Define the Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

export const collections = {
  blog: blog,
};

// Export the Blog schema type
export type BlogSchema = z.infer<typeof BlogSchema>;
