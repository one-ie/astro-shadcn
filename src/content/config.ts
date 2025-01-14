import { defineCollection, z } from 'astro:content';

// Define the stream schema
const streamSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.date(),
	picture: z.string().optional(),
});

// Define the stream collection schema
export const collections = {
	'stream': defineCollection({
		type: 'content',
		schema: streamSchema,
	}),
  docs: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string().optional()
    })
  })
};

// Export the stream schema type
export type StreamSchema = z.infer<typeof streamSchema>;

  })
};

// Export the stream schema type
export type StreamSchema = z.infer<typeof streamSchema>;

  })
};

// Export the stream schema type
export type StreamSchema = z.infer<typeof streamSchema>;
