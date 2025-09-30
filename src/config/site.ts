import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  navigation: Omit<NavigationItem, 'icon'>[];
}

export const siteConfig: SiteConfig = {
  name: 'Astro + shadcn/ui',
  description:
    'A modern web template built with Astro and shadcn/ui components',
  url: 'https://astro-shadcn.example.com',

  author: {
    name: 'Your Name',
    email: 'hello@example.com',
    url: 'https://example.com',
  },

  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
  },

  navigation: [
    { title: 'Home', path: '/' },
    { title: 'Blog', path: '/blog' },
    { title: 'README', path: '/readme' },
    { title: 'License', path: '/mit-license' },
  ],
};
