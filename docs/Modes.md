# Modes.md - Operating Modes

**Purpose:** Document the two operating modes of the ONE Platform: Standalone (content-only) and Full-Stack (with API).

---

## Overview

The ONE Platform can operate in **two distinct modes** depending on your needs:

```
┌─────────────────────────────────────────────────────────────┐
│                    STANDALONE MODE                          │
│  - Content collections (markdown)                           │
│  - AI inference (Vercel AI SDK)                             │
│  - Static site generation                                   │
│  - No authentication                                        │
│  - No backend agents                                        │
│  - Perfect for: Blogs, docs, marketing sites                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      API MODE                               │
│  - Everything from Standalone +                             │
│  - Full authentication (Better Auth)                        │
│  - Backend agents (10 types)                                │
│  - Multi-tenant organizations                               │
│  - Real-time data (Convex)                                  │
│  - Business logic (Effect.ts services)                      │
│  - Perfect for: SaaS, platforms, full applications          │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Start simple with Standalone mode, upgrade to API mode when you need dynamic features.

---

## Mode 1: Standalone Mode (Content Only)

### What You Get

**✅ Content Collections**
- Blog posts (markdown)
- Courses & lessons (markdown)
- Videos (markdown metadata)
- Podcasts (markdown metadata)
- Documentation (markdown)
- Any custom content type

**✅ AI Inference (Vercel AI SDK)**
- System prompts from markdown files
- Content as context for AI
- Streaming responses
- Local AI processing (no API required)

**✅ Static Site Generation**
- Fast, cacheable pages
- SEO-friendly
- Perfect Lighthouse scores
- Deploy to any static host

**❌ What You DON'T Get**
- No user authentication
- No backend agents
- No real-time data
- No multi-tenancy
- No database

### Use Cases

**Perfect for:**
- Personal blogs
- Documentation sites
- Marketing websites
- Course platforms (pre-recorded)
- Portfolio sites
- Static content sites

**Not suitable for:**
- User accounts/logins
- Dynamic dashboards
- Real-time features
- Multi-tenant SaaS
- E-commerce with checkout

### Configuration

#### 1. Project Structure

```
/
├── src/
│   ├── content/
│   │   ├── blog/           # Blog posts (markdown)
│   │   ├── courses/        # Courses (markdown)
│   │   ├── lessons/        # Lessons (markdown)
│   │   ├── videos/         # Video metadata (markdown)
│   │   ├── podcasts/       # Podcast metadata (markdown)
│   │   └── config.ts       # Content collection schemas
│   ├── pages/
│   │   ├── blog/
│   │   │   └── [...slug].astro
│   │   ├── courses/
│   │   │   └── [...slug].astro
│   │   └── index.astro
│   └── prompts/
│       ├── system.md       # AI system prompt
│       └── context/        # Context for AI
├── .env.local
└── astro.config.mjs
```

#### 2. Content Collection Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Blog collection
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('ONE'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['tutorial', 'news', 'guide', 'review', 'article']).default('article'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Course collection
const courseCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    instructor: z.string(),
    duration: z.number(), // hours
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()).default([]),
    price: z.number().optional(),
    thumbnail: z.string().optional(),
  }),
});

// Lesson collection
const lessonCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    courseId: z.string(), // Reference to course
    order: z.number(),
    duration: z.number(), // minutes
    videoUrl: z.string().optional(),
    resources: z.array(z.string()).default([]),
  }),
});

// Video collection
const videoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    videoUrl: z.string(), // YouTube, Vimeo, etc.
    thumbnail: z.string().optional(),
    duration: z.number(), // seconds
    publishedAt: z.date(),
    tags: z.array(z.string()).default([]),
  }),
});

// Podcast collection
const podcastCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    audioUrl: z.string(),
    episode: z.number(),
    season: z.number().optional(),
    duration: z.number(), // seconds
    publishedAt: z.date(),
    guests: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  courses: courseCollection,
  lessons: lessonCollection,
  videos: videoCollection,
  podcasts: podcastCollection,
};
```

#### 3. AI System Prompt (Markdown)

```markdown
<!-- src/prompts/system.md -->
# AI Assistant System Prompt

You are a helpful AI assistant for the ONE Platform documentation.

## Your Role
- Help users understand the ONE Platform
- Provide code examples
- Explain concepts clearly
- Be concise and accurate

## Context Available
You have access to:
- All blog posts
- All documentation
- All course content

## Response Style
- Use markdown formatting
- Include code examples when relevant
- Link to relevant documentation
- Keep responses under 500 words unless asked for detail
```

#### 4. AI Inference with Vercel AI SDK

```typescript
// src/lib/ai.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getCollection } from 'astro:content';
import fs from 'fs/promises';

/**
 * Load system prompt from markdown
 */
async function getSystemPrompt(): Promise<string> {
  const content = await fs.readFile('src/prompts/system.md', 'utf-8');
  // Strip frontmatter if present
  return content.replace(/^---[\s\S]*?---/, '').trim();
}

/**
 * Get context from content collections
 */
async function getContext(query: string): Promise<string> {
  const blog = await getCollection('blog');
  const docs = await getCollection('docs');

  // Simple keyword matching (you can use vector search here)
  const relevantPosts = blog.filter(post =>
    post.data.title.toLowerCase().includes(query.toLowerCase()) ||
    post.data.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const context = relevantPosts.map(post =>
    `# ${post.data.title}\n${post.data.description}\n\n${post.body}`
  ).join('\n\n---\n\n');

  return context;
}

/**
 * AI inference with markdown context
 */
export async function generateResponse(userMessage: string) {
  const systemPrompt = await getSystemPrompt();
  const context = await getContext(userMessage);

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'system',
        content: `Here is relevant context from the documentation:\n\n${context}`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return result.toAIStreamResponse();
}
```

#### 5. API Route for AI Chat

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { generateResponse } from '@/lib/ai';

export const POST: APIRoute = async ({ request }) => {
  const { message } = await request.json();

  if (!message) {
    return new Response('Message required', { status: 400 });
  }

  try {
    const response = await generateResponse(message);
    return response;
  } catch (error) {
    console.error('AI error:', error);
    return new Response('AI generation failed', { status: 500 });
  }
};
```

#### 6. Frontend Chat Component

```tsx
// src/components/AIChat.tsx
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-4 max-w-md ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
```

#### 7. Environment Variables (Standalone)

```bash
# .env.local (Standalone Mode)

# AI Configuration (optional - can use local models)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR use local models (no key needed)

# Site Configuration
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SITE_NAME=ONE Platform

# No API keys needed for standalone mode!
```

---

## Mode 2: API Mode (Full Stack)

### What You Get

**✅ Everything from Standalone Mode +**

**✅ Authentication**
- User registration/login
- OAuth (GitHub, Google)
- Email verification
- Password reset
- Two-factor authentication
- Session management

**✅ Backend Agents**
- Strategy agent
- Marketing agent
- Sales agent
- Research agent
- And 6 more business function agents

**✅ Real-Time Data**
- Live dashboard updates
- WebSocket subscriptions
- Optimistic UI updates

**✅ Multi-Tenancy**
- Organizations
- Role-based access control (platform_owner, org_owner, org_user, customer)
- Team collaboration

**✅ Database & Business Logic**
- 4-table ontology (entities, connections, events, tags)
- Effect.ts services
- Type-safe mutations
- Complete audit trail

### Use Cases

**Perfect for:**
- SaaS applications
- Multi-tenant platforms
- Creator platforms
- E-learning platforms with user progress
- E-commerce
- Social networks
- Any app requiring user accounts

### Configuration

#### 1. Environment Variables (API Mode)

```bash
# .env.local (API Mode)

# ==============================================================================
# CONVEX (Backend Database + Functions)
# ==============================================================================
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ==============================================================================
# BETTER AUTH (Authentication)
# ==============================================================================
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com
# OR for local development
# BETTER_AUTH_URL=http://localhost:4321

# ==============================================================================
# OAUTH PROVIDERS (Optional)
# ==============================================================================
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ==============================================================================
# EMAIL (For verification, password reset)
# ==============================================================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ==============================================================================
# AI PROVIDERS (For agents)
# ==============================================================================
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# ==============================================================================
# PAYMENTS (Optional)
# ==============================================================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ==============================================================================
# API CONFIGURATION
# ==============================================================================
# Connect to ONE API
PUBLIC_API_URL=https://api.one.ie
# OR use your own backend
# PUBLIC_API_URL=http://localhost:3000

# ==============================================================================
# SITE CONFIGURATION
# ==============================================================================
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SITE_NAME=ONE Platform
```

#### 2. Enable API Mode

```typescript
// src/config/site.ts
export const siteConfig = {
  name: 'ONE Platform',
  url: import.meta.env.PUBLIC_SITE_URL,

  // API Mode: enabled when CONVEX_URL is set
  apiMode: !!import.meta.env.PUBLIC_CONVEX_URL,

  // API endpoint
  apiUrl: import.meta.env.PUBLIC_API_URL || 'https://api.one.ie',

  // Features enabled in API mode
  features: {
    auth: !!import.meta.env.PUBLIC_CONVEX_URL,
    agents: !!import.meta.env.PUBLIC_CONVEX_URL,
    organizations: !!import.meta.env.PUBLIC_CONVEX_URL,
    realtime: !!import.meta.env.PUBLIC_CONVEX_URL,
    payments: !!import.meta.env.STRIPE_PUBLISHABLE_KEY,
  },
};
```

#### 3. Conditional Rendering Based on Mode

```astro
---
// src/pages/index.astro
import { siteConfig } from '@/config/site';
import AIChat from '@/components/AIChat'; // Always available
import Dashboard from '@/components/Dashboard'; // Only in API mode
import AuthButtons from '@/components/AuthButtons'; // Only in API mode
---

<Layout>
  <h1>Welcome to ONE Platform</h1>

  {/* Always available: Content and AI chat */}
  <section>
    <h2>AI Assistant</h2>
    <AIChat client:load />
  </section>

  {/* Only in API mode: Authentication */}
  {siteConfig.features.auth && (
    <section>
      <AuthButtons client:load />
    </section>
  )}

  {/* Only in API mode: Dashboard */}
  {siteConfig.features.auth && (
    <section>
      <Dashboard client:load />
    </section>
  )}
</Layout>
```

#### 4. Content Collections with API Integration

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const apiMode = !!convexUrl;

/**
 * Blog collection - works in both modes
 */
const blogCollection = defineCollection({
  type: apiMode ? 'data' : 'content',
  loader: apiMode
    ? async () => {
        // API Mode: Load from Convex
        const convex = new ConvexHttpClient(convexUrl);
        const posts = await convex.query(api.queries.blog.list);
        return posts;
      }
    : undefined, // Standalone: Load from markdown
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('ONE'),
    tags: z.array(z.string()).default([]),
  }),
});

/**
 * Agents collection - only in API mode
 */
const agentsCollection = apiMode
  ? defineCollection({
      type: 'data',
      loader: async () => {
        const convex = new ConvexHttpClient(convexUrl);
        const agents = await convex.query(api.queries.agents.list);
        return agents;
      },
      schema: z.object({
        name: z.string(),
        type: z.enum(['strategy', 'marketing', 'sales', 'research', 'service', 'design', 'engineering', 'finance', 'legal', 'intelligence']),
        description: z.string(),
        capabilities: z.array(z.string()),
      }),
    })
  : undefined;

export const collections = {
  blog: blogCollection,
  ...(apiMode && { agents: agentsCollection }),
};
```

---

## Switching Between Modes

### Starting with Standalone

1. Clone repository
2. Install dependencies: `bun install`
3. Create content in `src/content/`
4. (Optional) Add AI key for chat
5. Run: `bun run dev`

**No backend setup required!**

### Upgrading to API Mode

1. Deploy Convex backend: `bunx convex deploy`
2. Add environment variables (see API Mode section)
3. Set `PUBLIC_CONVEX_URL` in `.env.local`
4. Restart dev server

**That's it! Features automatically enable.**

### Downgrading to Standalone

1. Remove `PUBLIC_CONVEX_URL` from `.env.local`
2. Restart dev server

**API features automatically disable.**

---

## Feature Comparison Matrix

| Feature | Standalone Mode | API Mode |
|---------|----------------|----------|
| **Content Collections** | ✅ Markdown files | ✅ Markdown OR API |
| **AI Chat** | ✅ Vercel AI SDK | ✅ Vercel AI SDK + Agents |
| **Static Pages** | ✅ Yes | ✅ Yes |
| **Authentication** | ❌ No | ✅ Better Auth |
| **User Accounts** | ❌ No | ✅ Yes |
| **Organizations** | ❌ No | ✅ Multi-tenant |
| **Backend Agents** | ❌ No | ✅ 10 agent types |
| **Real-time Data** | ❌ No | ✅ Convex subscriptions |
| **Database** | ❌ No | ✅ 4-table ontology |
| **Payments** | ❌ No | ✅ Stripe integration |
| **Deployment** | ✅ Any static host | ✅ Cloudflare Pages |
| **Cost** | 💰 Free (just hosting) | 💰 Convex free tier + hosting |

---

## Examples

### Example 1: Personal Blog (Standalone)

```bash
# .env.local
OPENAI_API_KEY=sk-...  # Optional for AI chat
PUBLIC_SITE_URL=https://myblog.com
PUBLIC_SITE_NAME=My Blog
```

**What you get:**
- Fast static blog
- AI chat assistant (optional)
- Perfect SEO
- Zero backend cost

### Example 2: SaaS Platform (API Mode)

```bash
# .env.local
CONVEX_URL=https://my-saas.convex.cloud
PUBLIC_CONVEX_URL=https://my-saas.convex.cloud
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://my-saas.com
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
```

**What you get:**
- User authentication
- Multi-tenant organizations
- Real-time dashboards
- Backend agents
- Payment processing
- Complete SaaS platform

### Example 3: Hybrid Approach

**Use standalone mode for:**
- Marketing pages (`/`, `/about`, `/pricing`)
- Blog (`/blog/*`)
- Documentation (`/docs/*`)

**Use API mode for:**
- Dashboard (`/dashboard/*`)
- User settings (`/settings`)
- Organization management (`/org/*`)

```astro
---
// src/pages/index.astro (Marketing - Standalone)
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---

<Layout>
  <h1>Welcome!</h1>
  <p>Read our latest posts</p>
  {posts.map(post => <BlogCard post={post} />)}
</Layout>
```

```astro
---
// src/pages/dashboard.astro (App - API Mode)
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const session = Astro.cookies.get('session')?.value;
if (!session) return Astro.redirect('/signin');

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const stats = await convex.query(api.queries.dashboard.getStats);
---

<DashboardLayout>
  <h1>Dashboard</h1>
  <StatsCards client:load initialStats={stats} />
</DashboardLayout>
```

---

## Best Practices

### When to Use Standalone Mode

✅ **Yes, use Standalone:**
- Personal website/blog
- Documentation site
- Marketing website
- Portfolio
- Content-heavy site with no user interactions
- Proof of concept
- Static course content

❌ **No, use API Mode:**
- User authentication required
- Need to track user progress
- Multi-user collaboration
- Real-time features
- E-commerce checkout
- SaaS application

### When to Use API Mode

✅ **Yes, use API Mode:**
- SaaS platform
- Multi-tenant application
- User authentication required
- Need backend agents
- Real-time dashboards
- E-commerce with users
- Social features
- Team collaboration

❌ **No, use Standalone:**
- Simple blog
- Static documentation
- No user accounts needed
- No dynamic features needed

### Hybrid Strategy

**Best of both worlds:**

1. **Marketing & Content** - Standalone mode
   - Blog, docs, marketing pages
   - Fast, static, SEO-friendly
   - No API overhead

2. **Application** - API mode
   - Dashboard, settings, user features
   - Real-time, authenticated
   - Full backend power

```typescript
// src/middleware.ts
export function onRequest({ url, locals }, next) {
  const appRoutes = ['/dashboard', '/settings', '/org'];
  const isAppRoute = appRoutes.some(route => url.pathname.startsWith(route));

  if (isAppRoute && !import.meta.env.PUBLIC_CONVEX_URL) {
    // Redirect to login page or show upgrade message
    return new Response('API mode required', { status: 403 });
  }

  return next();
}
```

---

## Migration Path

### Step 1: Start Standalone (Day 1)

```bash
git clone https://github.com/one-ie/one
cd one
bun install
bun run dev
```

**Focus:** Build content, design, marketing pages

### Step 2: Add AI Chat (Optional)

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

**Focus:** Enhanced user experience with AI

### Step 3: Deploy Static Site

```bash
bun run build
# Deploy to Vercel, Netlify, Cloudflare Pages (static)
```

**Focus:** Get live, collect feedback

### Step 4: Upgrade to API Mode (When Ready)

```bash
bunx convex deploy
# Add all API mode env vars
bun run dev
```

**Focus:** Add authentication, user features, agents

### Step 5: Deploy Full Stack

```bash
bun run build
# Deploy to Cloudflare Pages (with SSR)
```

**Focus:** Scale with full features

---

## Summary

**Two modes, one codebase:**

1. **Standalone Mode** = Markdown content + AI chat + Static site
2. **API Mode** = Everything + Auth + Agents + Real-time + Multi-tenant

**Choose based on needs:**
- Starting out? → Standalone
- Need users? → API Mode
- Best performance? → Hybrid (marketing static, app dynamic)

**The beauty:** Switch modes by adding/removing environment variables. No code changes required!

---

**Related Documentation:**
- [Frontend.md](./Frontend.md) - Astro frontend architecture
- [Middleware.md](./Middleware.md) - The glue layer
- [Dashboard.md](./Dashboard.md) - Multi-tenant UI
- [Hono.md](./Hono.md) - API backend (API mode only)
- [Development.md](./Development.md) - Development workflow
