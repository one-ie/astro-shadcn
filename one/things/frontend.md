# Frontend.md - Astro Frontend Architecture

## Overview

**Astro 5.14+** powers the frontend layer of the ONE Platform with server-side rendering, islands architecture, and seamless integration with React 19, Convex, and the Hono API backend. This architecture enables:

1. **Content Collections**: Type-safe content management with `astro:content` module
2. **Islands Architecture**: Static-first with selective interactivity
3. **Dual Integration**: Hono API for mutations, Convex hooks for real-time queries
4. **SSR + Edge**: Server-side rendering on Cloudflare Pages
5. **Component Library**: shadcn/ui components with Tailwind CSS v4

**Key Principle:** Frontend is **user-customizable "vibe code"** while backend (Hono + Convex) remains stable and shared across tenants.

## Architecture Vision

```
┌─────────────────────────────────────────────────────────┐
│                   ASTRO FRONTEND                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages (.astro files)                            │  │
│  │  - SSR routing (file-based)                      │  │
│  │  - Static generation                             │  │
│  │  - Dynamic routes                                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Content Collections (astro:content)             │  │
│  │  - Type-safe schemas with Zod                    │  │
│  │  - Blog, docs, marketing content                 │  │
│  │  - References between collections                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  React Components (Interactive Islands)          │  │
│  │  - shadcn/ui components                          │  │
│  │  - Convex hooks (real-time data)                 │  │
│  │  - Hono API client (mutations)                   │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  UI Components (shadcn/ui)                       │  │
│  │  - Button, Card, Dialog, etc.                    │  │
│  │  - Tailwind CSS v4 styling                       │  │
│  │  - Dark mode support                             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │ HTTP & WebSocket
                    ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND INTEGRATION LAYER                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Hono API Client (REST API)                      │  │
│  │  /api/auth/*   - Authentication                  │  │
│  │  /api/tokens/* - Token purchases                 │  │
│  │  /api/agents/* - Agent management                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Convex Hooks (Real-time Data)                   │  │
│  │  useQuery()    - Live data subscriptions         │  │
│  │  useMutation() - Optimistic updates              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

**Frontend Framework:**
- Astro 5.14+ (SSR, file-based routing)
- React 19 (interactive components)
- TypeScript 5.9+ (strict mode)

**UI & Styling:**
- shadcn/ui (50+ components)
- Tailwind CSS v4 (modern CSS-based config)
- Radix UI primitives

**State & Data:**
- Nanostores (lightweight state)
- Convex hooks (real-time data)
- Hono API client (mutations)

**Content:**
- `astro:content` (type-safe collections)
- Zod (schema validation)
- MDX support

**Deployment:**
- Cloudflare Pages (edge SSR)
- React 19 edge compatibility (`react-dom/server.edge`)

## Content Collections with astro:content

### 1. Collection Schema Definition

Content collections provide type-safe content management with automatic validation.

#### `src/content/config.ts`

```typescript
import { defineCollection, z, reference } from 'astro:content';

/**
 * Blog collection with rich metadata
 */
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    author: reference('authors'), // Reference to authors collection
    tags: z.array(z.string()).default([]),
    category: z.enum(['tutorial', 'news', 'guide', 'review', 'article']).default('article'),
    readingTime: z.number().optional(),
    featured: z.boolean().default(false),
    relatedPosts: z.array(reference('blog')).optional(), // References to other posts
  }),
});

/**
 * Authors collection
 */
const authorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
    twitter: z.string().optional(),
    github: z.string().optional(),
  }),
});

/**
 * Docs collection with nested structure
 */
const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    category: z.string(),
    related: z.array(reference('docs')).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  authors: authorsCollection,
  docs: docsCollection,
};
```

### 2. Querying Collections

#### Get All Entries

```typescript
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';

// Get all published blog posts
const allPosts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date descending
const sortedPosts = allPosts.sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
---

<Layout>
  <h1>Blog Posts</h1>
  {sortedPosts.map(post => (
    <article>
      <h2><a href={`/blog/${post.slug}`}>{post.data.title}</a></h2>
      <p>{post.data.description}</p>
      <time>{post.data.date.toLocaleDateString()}</time>
    </article>
  ))}
</Layout>
```

#### Get Single Entry with References

```typescript
---
// src/pages/blog/[...slug].astro
import { getEntry, getEntries } from 'astro:content';

const { slug } = Astro.params;
const post = await getEntry('blog', slug);

if (!post) {
  return Astro.redirect('/404');
}

// Render content
const { Content, headings } = await post.render();

// Get referenced author
const author = await getEntry(post.data.author);

// Get related posts
const relatedPosts = post.data.relatedPosts
  ? await getEntries(post.data.relatedPosts)
  : [];
---

<Layout title={post.data.title}>
  <article>
    <h1>{post.data.title}</h1>

    {/* Author info */}
    <div class="author">
      <img src={author.data.avatar} alt={author.data.name} />
      <p>{author.data.name}</p>
    </div>

    {/* Rendered content */}
    <Content />

    {/* Related posts */}
    {relatedPosts.length > 0 && (
      <aside>
        <h3>Related Posts</h3>
        {relatedPosts.map(related => (
          <a href={`/blog/${related.slug}`}>{related.data.title}</a>
        ))}
      </aside>
    )}
  </article>
</Layout>
```

### 3. Dynamic Routes with Type Safety

```typescript
---
// src/pages/blog/[...slug].astro
import { getCollection, type CollectionEntry } from 'astro:content';

// Generate static paths
export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

// Type-safe props
type Props = {
  post: CollectionEntry<'blog'>;
};

const { post } = Astro.props;
const { Content, headings } = await post.render();
---

<Layout title={post.data.title}>
  <Content />
</Layout>
```

### 4. Collection References Pattern

```typescript
// Content file: src/content/blog/my-post.md
---
title: "Building with Astro"
author: "john-doe" # References src/content/authors/john-doe.json
relatedPosts:
  - "getting-started"
  - "advanced-patterns"
tags: ["astro", "tutorial"]
---

Content goes here...
```

```typescript
// Author file: src/content/authors/john-doe.json
{
  "name": "John Doe",
  "bio": "Full-stack developer",
  "avatar": "/images/john.jpg",
  "twitter": "@johndoe"
}
```

### 5. Advanced Queries with Filtering

```typescript
---
import { getCollection } from 'astro:content';

// Filter by tag
const tag = Astro.url.searchParams.get('tag');
const posts = await getCollection('blog', ({ data }) => {
  if (tag) {
    return data.tags.includes(tag) && !data.draft;
  }
  return !data.draft;
});

// Filter by category
const category = 'tutorial';
const tutorials = await getCollection('blog', ({ data }) => {
  return data.category === category && !data.draft;
});

// Featured posts only
const featured = await getCollection('blog', ({ data }) => {
  return data.featured === true && !data.draft;
});
---
```

## React Components with Dual Integration

### Pattern: Hono API for Mutations + Convex for Queries

This dual approach combines the best of both worlds:
- **Hono API**: Business logic, authentication, payments
- **Convex Hooks**: Real-time data, live updates

### Example: Token Purchase Component

```typescript
// src/components/features/tokens/TokenPurchase.tsx
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api as honoApi } from '@/lib/api';
import { api as convexApi } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '@/convex/_generated/dataModel';

interface TokenPurchaseProps {
  tokenId: Id<'entities'>;
}

/**
 * Token purchase demonstrating dual integration:
 * - Convex useQuery for real-time token data
 * - Hono API for purchase mutation
 */
export function TokenPurchase({ tokenId }: TokenPurchaseProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Real-time token data via Convex (auto-updates!)
  const token = useQuery(convexApi.queries.entities.get, { id: tokenId });

  // Purchase via Hono API (handles validation, payment, etc.)
  const handlePurchase = async (amount: number) => {
    setLoading(true);
    try {
      const result = await honoApi.purchaseTokens(tokenId, amount);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success!',
        description: `Purchased ${amount} tokens`,
      });

      // Convex subscription will auto-update the balance!
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!token) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{token.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Price: ${token.properties.price}</p>
          <p>Your balance: {token.properties.balance || 0} tokens</p>
        </div>

        <Button
          onClick={() => handlePurchase(100)}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Buy 100 Tokens'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Example: Creator Dashboard with Real-Time Stats

```typescript
// src/components/dashboard/CreatorStats.tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Id } from '@/convex/_generated/dataModel';

interface CreatorStatsProps {
  creatorId: Id<'entities'>;
}

/**
 * Dashboard with live stats
 * Pure Convex hooks - no API calls needed!
 */
export function CreatorStats({ creatorId }: CreatorStatsProps) {
  // Real-time stats via Convex query
  const stats = useQuery(api.queries.dashboard.getCreatorStats, { creatorId });

  // Real-time content list
  const content = useQuery(api.queries.content.listByCreator, { creatorId });

  // Real-time revenue events
  const revenue = useQuery(api.queries.events.getRevenueTotal, { creatorId });

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${revenue?.total || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Pieces</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{content?.length || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.audienceCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Example: Agent Creation with Hono API

```typescript
// src/components/features/agents/CreateAgent.tsx
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

/**
 * Agent creation form
 * Uses Hono API for complex business logic
 */
export function CreateAgent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    model: 'gpt-4',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Hono API for complex validation + creation
      const result = await api.createAgent(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Agent Created!',
        description: `${formData.name} is ready to go`,
      });

      // Redirect to agent page
      window.location.href = `/agents/${result.id}`;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Agent'}
      </Button>
    </form>
  );
}
```

## File Structure

```
src/
├── pages/                      # File-based routing
│   ├── index.astro             # Homepage
│   ├── blog/
│   │   ├── index.astro         # Blog listing
│   │   └── [...slug].astro     # Dynamic blog posts
│   ├── docs/
│   │   └── [...slug].astro     # Documentation pages
│   ├── dashboard/
│   │   ├── index.astro         # Dashboard home
│   │   ├── content.astro       # Content management
│   │   ├── tokens.astro        # Token management
│   │   └── agents.astro        # Agent management
│   ├── auth/
│   │   ├── signin.astro        # Sign in page
│   │   ├── signup.astro        # Sign up page
│   │   └── reset.astro         # Password reset
│   ├── rss.xml.ts              # RSS feed generator
│   └── 404.astro               # 404 error page
│
├── content/                    # Content collections
│   ├── config.ts               # Collection schemas
│   ├── blog/                   # Blog posts (markdown)
│   │   ├── getting-started.md
│   │   └── advanced-patterns.md
│   ├── authors/                # Author data (JSON)
│   │   └── john-doe.json
│   └── docs/                   # Documentation (markdown)
│       ├── introduction.md
│       └── api-reference.md
│
├── components/                 # React components
│   ├── features/               # Feature-specific components
│   │   ├── tokens/
│   │   │   ├── TokenPurchase.tsx
│   │   │   ├── TokenBalance.tsx
│   │   │   └── TokenList.tsx
│   │   ├── agents/
│   │   │   ├── CreateAgent.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   └── AgentList.tsx
│   │   ├── content/
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   └── ContentList.tsx
│   │   └── dashboard/
│   │       ├── CreatorStats.tsx
│   │       ├── RevenueChart.tsx
│   │       └── ActivityFeed.tsx
│   │
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (50+ components)
│   │
│   ├── layout/                 # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   └── shared/                 # Shared components
│       ├── BlogSearch.tsx
│       ├── TableOfContents.tsx
│       ├── ShareButtons.tsx
│       └── ErrorBoundary.tsx
│
├── layouts/                    # Astro layouts
│   ├── Layout.astro            # Base layout
│   ├── Blog.astro              # Blog post layout
│   └── Docs.astro              # Documentation layout
│
├── lib/                        # Utilities
│   ├── api.ts                  # Hono API client
│   ├── utils.ts                # General utilities
│   └── reading-time.ts         # Reading time calculator
│
├── hooks/                      # React hooks
│   ├── use-toast.tsx           # Toast notifications
│   ├── use-theme.tsx           # Dark mode
│   └── use-auth.tsx            # Authentication
│
├── stores/                     # Nanostores
│   ├── layout.ts               # Layout state
│   └── auth.ts                 # Auth state
│
├── styles/                     # Global styles
│   └── global.css              # Tailwind v4 config + custom CSS
│
└── config/                     # Configuration
    └── site.ts                 # Site configuration
```

## Astro Page Patterns

### Pattern 1: Static Page with Content Collection

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import Layout from '@/layouts/Layout.astro';
import BlogSearch from '@/components/shared/BlogSearch';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const sortedPosts = posts.sort((a, b) =>
  b.data.date.getTime() - a.data.date.getTime()
);
---

<Layout title="Blog">
  <div class="container py-8">
    <h1 class="text-4xl font-bold mb-8">Blog</h1>

    {/* Interactive search component */}
    <BlogSearch client:load posts={sortedPosts} />

    {/* Static list of posts */}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {sortedPosts.map(post => (
        <article class="border rounded-lg p-6">
          <h2 class="text-2xl font-semibold mb-2">
            <a href={`/blog/${post.slug}`}>{post.data.title}</a>
          </h2>
          <p class="text-muted-foreground mb-4">{post.data.description}</p>
          <time class="text-sm">{post.data.date.toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  </div>
</Layout>
```

### Pattern 2: Dynamic Page with SSR Data

```astro
---
// src/pages/dashboard/index.astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import CreatorStats from '@/components/dashboard/CreatorStats';

// SSR: Fetch user session via Hono API
const sessionRes = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/auth/session`, {
  headers: {
    cookie: Astro.request.headers.get('cookie') || '',
  },
});

const session = await sessionRes.json();

if (!session?.user) {
  return Astro.redirect('/auth/signin');
}

// SSR: Fetch initial data via Convex
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.entities.get, { id: session.user.id });
---

<Layout title="Dashboard">
  <div class="container py-8">
    <h1 class="text-4xl font-bold mb-8">Welcome, {user.name}!</h1>

    {/* Real-time stats component */}
    <CreatorStats client:load creatorId={session.user.id} />
  </div>
</Layout>
```

### Pattern 3: Content Page with References

```astro
---
// src/pages/blog/[...slug].astro
import { getEntry, getEntries, type CollectionEntry } from 'astro:content';
import Blog from '@/layouts/Blog.astro';
import TableOfContents from '@/components/shared/TableOfContents';
import ShareButtons from '@/components/shared/ShareButtons';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

type Props = { post: CollectionEntry<'blog'> };

const { post } = Astro.props;
const { Content, headings } = await post.render();

// Get referenced author
const author = await getEntry(post.data.author);

// Get related posts
const relatedPosts = post.data.relatedPosts
  ? await getEntries(post.data.relatedPosts)
  : [];
---

<Blog title={post.data.title} description={post.data.description}>
  <article class="max-w-3xl mx-auto">
    <header class="mb-8">
      <h1 class="text-5xl font-bold mb-4">{post.data.title}</h1>

      {/* Author info */}
      <div class="flex items-center gap-4 mb-4">
        <img src={author.data.avatar} alt={author.data.name} class="w-12 h-12 rounded-full" />
        <div>
          <p class="font-semibold">{author.data.name}</p>
          <time>{post.data.date.toLocaleDateString()}</time>
        </div>
      </div>

      {/* Share buttons */}
      <ShareButtons client:load title={post.data.title} />
    </header>

    {/* Table of contents */}
    <aside class="lg:fixed lg:top-24 lg:right-8 lg:w-64">
      <TableOfContents client:load headings={headings} />
    </aside>

    {/* Rendered content */}
    <div class="prose dark:prose-invert max-w-none">
      <Content />
    </div>

    {/* Related posts */}
    {relatedPosts.length > 0 && (
      <aside class="mt-12 border-t pt-8">
        <h3 class="text-2xl font-bold mb-4">Related Posts</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedPosts.map(related => (
            <a href={`/blog/${related.slug}`} class="border rounded-lg p-4 hover:bg-muted">
              <h4 class="font-semibold">{related.data.title}</h4>
              <p class="text-sm text-muted-foreground mt-2">{related.data.description}</p>
            </a>
          ))}
        </div>
      </aside>
    )}
  </article>
</Blog>
```

## Integration with 4-Table Ontology

The frontend integrates seamlessly with the ontology through Convex hooks and Hono API:

### Entities (User-Facing Data)

```typescript
// Query entities via Convex
const token = useQuery(api.queries.entities.get, { id: tokenId });
const agent = useQuery(api.queries.entities.get, { id: agentId });
const user = useQuery(api.queries.entities.get, { id: userId });

// Create entities via Hono API
await honoApi.createAgent({ name, description });
await honoApi.createContent({ title, body });
```

### Connections (Relationships)

```typescript
// Query connections
const userTokens = useQuery(api.queries.connections.list, {
  fromEntityId: userId,
  relationshipType: 'holds_tokens',
});

const creatorContent = useQuery(api.queries.connections.list, {
  fromEntityId: creatorId,
  relationshipType: 'authored',
});
```

### Events (Activity Feed)

```typescript
// Real-time activity feed
const recentEvents = useQuery(api.queries.events.recent, {
  entityId: userId,
  limit: 10,
});

// Revenue events
const revenueEvents = useQuery(api.queries.events.list, {
  actorId: creatorId,
  eventType: 'payment_received',
});
```

### Tags (Categorization)

```typescript
// Query by tags
const taggedContent = useQuery(api.queries.tags.getEntitiesByTag, {
  tagName: 'tutorial',
  entityType: 'content',
});
```

## "Vibe Code" Workflow

The frontend is designed for rapid prototyping and customization:

### Step 1: Design UI Mockup
```
User sketches dashboard layout
→ Identifies data needs (revenue, content count, etc.)
```

### Step 2: Write Astro Page
```astro
---
// src/pages/dashboard/custom.astro
import Layout from '@/layouts/Layout.astro';
import CustomDashboard from '@/components/custom/Dashboard';
---

<Layout>
  <CustomDashboard client:load />
</Layout>
```

### Step 3: Build React Component with Convex
```typescript
// src/components/custom/Dashboard.tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CustomDashboard() {
  const stats = useQuery(api.queries.dashboard.getStats);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Live data - no backend changes needed! */}
      <Card>Revenue: ${stats?.revenue}</Card>
      <Card>Content: {stats?.contentCount}</Card>
      <Card>Audience: {stats?.audienceCount}</Card>
    </div>
  );
}
```

### Step 4: Deploy
```bash
bun run build
wrangler pages deploy dist
```

**Result:** Custom frontend deployed in minutes while backend remains stable!

## When to Use What

### Use Astro Pages For:
- Static content (blog, docs, marketing)
- SSR data fetching (initial page load)
- SEO-critical pages
- File-based routing

### Use React Components For:
- Interactive features (forms, charts, real-time updates)
- Stateful UI (modals, dropdowns, tabs)
- Convex hooks (live data)
- Reusable widgets

### Use Content Collections For:
- Blog posts
- Documentation
- Marketing pages
- Any structured content with frontmatter

### Use Convex Hooks For:
- Real-time data
- Live subscriptions
- Dashboard stats
- Activity feeds

### Use Hono API For:
- Authentication
- Complex business logic
- Payment processing
- External API integrations

## Performance Best Practices

1. **Minimize `client:load`**: Only add to truly interactive components
2. **Use Content Collections**: Type-safe, optimized content
3. **SSR for Initial Data**: Fetch critical data server-side
4. **Static Generation**: Pre-render pages when possible
5. **Image Optimization**: Use Astro's `<Image>` component
6. **Code Splitting**: React components are auto-split
7. **Convex Subscriptions**: Efficient WebSocket-based updates

## Development Commands

```bash
# Start dev server (localhost:4321)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# TypeScript checking
bunx astro check

# Generate content types
bunx astro sync
```

## Deployment to Cloudflare Pages

### Build Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge', // React 19 edge compatibility
      },
    },
  },
});
```

### Deploy Commands

```bash
# Build
bun run build

# Deploy
wrangler pages deploy dist --project-name=one-platform
```

## Next Steps

1. **Read Content Collections Docs**: Understand schema patterns
2. **Explore shadcn/ui**: Learn available components
3. **Study Dual Integration**: Master Hono + Convex pattern
4. **Practice "Vibe Code"**: Build features rapidly with hooks
5. **Customize Frontend**: Make it your own!

**Result:** A high-performance, developer-friendly frontend that scales with your platform while remaining easy to customize and extend.
