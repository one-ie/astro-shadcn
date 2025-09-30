import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');

  // Filter out draft posts and sort by date (newest first)
  const publishedPosts = blog
    .filter((post: CollectionEntry<'blog'>) => !post.data.draft)
    .sort(
      (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
        b.data.date.valueOf() - a.data.date.valueOf()
    );

  return rss({
    title: 'ONE Blog',
    description: 'A blog built with Astro and shadcn/ui',
    site: context.site || 'https://one.ie',
    items: publishedPosts.map((post: CollectionEntry<'blog'>) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
