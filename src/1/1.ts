import { z } from "zod";

// Navigation item schema
const navigationItemSchema = z.object({
  title: z.string(),
  path: z.string(),
  icon: z.string().optional()
});

// Contact schema
export const contactSchema = z.object({
  email: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  address: z.object({
    street: z.string(),
    area: z.string().optional(),
    city: z.string(),
    country: z.string(),
    zip: z.string().optional(),
  }).optional(),
  social: z.object({
    github: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    discord: z.string().optional(),
    medium: z.string().nullable(),
    facebook: z.string().optional(),
    tiktok: z.string().nullable(),
    threads: z.string().nullable(),
    mastodon: z.string().nullable(),
    slack: z.string().optional(),
    telegram_channel: z.string().optional(),
  }).optional(),
});

// SEO schema
export const seoSchema = z.object({
  canonical: z.string().url(),
  title: z.string().min(1).max(70),
  metaTitle: z.string().min(1).max(70).optional(),
  metaDescription: z.string().min(1).max(200).optional(),
  metaKeywords: z.array(z.string()),
  metaRobots: z.string().default("index, follow"),
  openGraph: z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.object({
      url: z.string(),
      width: z.number(),
      height: z.number(),
      alt: z.string(),
      type: z.string()
    }),
    locale: z.string(),
    site_name: z.string()
  }).default({
    type: 'article',
    title: '',
    description: '',
    image: {
      url: '',
      width: 1200,
      height: 630,
      alt: '',
      type: 'image/jpeg'
    },
    locale: 'en_IE',
    site_name: 'ONE'
  }),
  twitter: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    card: z.string(),
    site: z.string(),
    creator: z.string()
  }).default({
    title: '',
    description: '',
    image: '',
    card: 'summary_large_image',
    site: '@onedotie',
    creator: '@tonyoconnell'
  })
});

// Navigation schema
export const navigationSchema = z.object({
  top: z.object({
    logo: z.string().optional(),
    favicon: z.string().optional(),
    items: z.array(navigationItemSchema),
    buttons: z.array(navigationItemSchema).optional(),
  }),
  sidebar: z.array(navigationItemSchema).optional(),
  footer: z.object({
    columns: z.array(z.object({ 
      title: z.string().optional(),
      links: z.array(navigationItemSchema),
    })),
    bottom: z.object({
      copyright: z.string().optional(),
      links: z.array(navigationItemSchema),
    })
  })
});

// Layout schema
export const layoutSchema = z.object({
  showLeft: z.boolean().optional().default(true),
  showRight: z.boolean().optional().default(true),
  showTop: z.boolean().optional().default(true),
  showBottom: z.boolean().optional().default(true),
  rightSize: z.enum(['Full', 'Half', 'Quarter', 'Closed'])
});

// AI schema
export const aiSchema = z.object({
  provider: z.string(),
  model: z.string(),
  apiEndpoint: z.string(),
  runtime: z.string(),
  temperature: z.number().optional().default(0.7),
  maxTokens: z.number().optional().default(2000),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  welcome: z.object({
    message: z.string(),
    center: z.boolean().optional().default(true),
    avatar: z.string().optional(),
    suggestions: z.array(z.object({
      label: z.string(),
      prompt: z.string()
    })).optional().default([])
  }).optional().default({
    message: "How can I help you today?",
    center: true,
    suggestions: []
  })
});

// Main config schema
export const ConfigSchema = z.object({
  business: z.object({
    name: z.string(),
    description: z.string(),
    contact: contactSchema,
    seo: seoSchema
  }),
  page: z.object({
    layout: layoutSchema,
    navigation: navigationSchema
  }),
  ai: aiSchema
});

export type Config = z.infer<typeof ConfigSchema>;