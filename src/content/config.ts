import { defineCollection, z } from 'astro:content';

// Define the stream schema
const streamSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.date(),
	draft: z.boolean().optional(),
	picture: z.string().optional(),
	image: z.string().optional()
});

// Define the stream collection schema
const stream = defineCollection({
	type: 'content',
	schema: streamSchema,
});

export const collections = {
	'stream': stream
};

// Export the stream schema type
export type StreamSchema = z.infer<typeof streamSchema>;

