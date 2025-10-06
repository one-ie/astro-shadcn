# Development.md - ONE Platform Development Guide

**Version:** 1.0.0
**Status:** Production Ready
**Tagline:** Build AI-native platforms with Astro + Content Collections + API

---

## Overview

**ONE Platform** is a unified development approach where:

- **Frontend:** Astro with content collections
- **Backend:** API-driven (our API or any API like Notion, Strapi, etc.)
- **Dashboard:** Embeds backend UI components
- **Auth:** Better Auth for authentication
- **Extensions:** Add entities via API, Claude Code, or dashboard UI

**One Mode. Maximum Flexibility.**

---

## Getting Started

### Option 1: Clone the Repository

```bash
# Clone the official repo
git clone https://github.com/one-ie/one
cd one

# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start development
bun run dev
```

### Option 2: Use npx oneie

```bash
# Bootstrap a new project
npx oneie create my-platform

# Install dependencies
cd my-platform
bun install

# Start development
bun run dev
```

Both options give you the **same unified architecture**:
- Astro frontend with content collections
- API connection (our API or yours)
- Better Auth integration
- Dashboard with embedded backend UI

---

## Architecture

### The Unified Stack

```
┌─────────────────────────────────────────────────────────┐
│             ASTRO FRONTEND (Your Code)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Content Collections (Type-Safe Data)            │  │
│  │  - Blog posts                                    │  │
│  │  - Agents (from API)                             │  │
│  │  - Tools (from API)                              │  │
│  │  - Custom entities (from API)                    │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Dashboard (dashboard.astro)                     │  │
│  │  - Embeds backend UI components                  │  │
│  │  - Real-time entity management                   │  │
│  │  - Agent/tool creation forms                     │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Better Auth (Authentication)                    │  │
│  │  - Email/password                                │  │
│  │  - OAuth (GitHub, Google)                        │  │
│  │  - Session management                            │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ↓ HTTP API Calls
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (api.one.ie or yours)          │
│  - Hono API routes                                      │
│  - Convex database (4-table ontology)                   │
│  - Effect.ts services (business logic)                  │
│  - Real-time subscriptions                              │
└─────────────────────────────────────────────────────────┘
```

---

## Content Collections (The Hub)

**Content collections** are how you connect to ANY backend API:

### Configuration

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

/**
 * Blog posts (local markdown)
 */
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string(),
  }),
});

/**
 * Agents (from API)
 */
const agents = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://api.one.ie/agents');
    const agents = await response.json();

    return agents.map((agent: any) => ({
      id: agent.id,
      data: {
        name: agent.name,
        description: agent.description,
        model: agent.model,
        capabilities: agent.capabilities,
      },
    }));
  },
});

/**
 * Tools (from API)
 */
const tools = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://api.one.ie/tools');
    const tools = await response.json();

    return tools.map((tool: any) => ({
      id: tool.id,
      data: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  },
});

/**
 * Custom entities (dynamically from API)
 */
const entities = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://api.one.ie/entities');
    const entities = await response.json();

    return entities.map((entity: any) => ({
      id: entity.id,
      data: entity.properties, // Flexible schema
    }));
  },
});

export const collections = {
  blog,
  agents,
  tools,
  entities,
};
```

### Using Collections

```astro
---
// src/pages/agents/index.astro
import { getCollection } from 'astro:content';
import Layout from '@/layouts/Layout.astro';

// Load agents from API via content collection
const agents = await getCollection('agents');
---

<Layout title="AI Agents">
  <div class="grid grid-cols-3 gap-4">
    {agents.map((agent) => (
      <div class="border rounded-lg p-4">
        <h3 class="font-bold">{agent.data.name}</h3>
        <p class="text-sm text-muted-foreground">{agent.data.description}</p>
        <a href={`/agents/${agent.id}`}>View Agent →</a>
      </div>
    ))}
  </div>
</Layout>
```

**Key Benefits:**
- Type-safe data from any API
- Automatic validation with Zod
- SSR data fetching
- Works with Notion, Strapi, Contentful, or our API
- Add new collections without changing code

---

## Dashboard (Embedded Backend UI)

The dashboard embeds backend UI components for managing your platform:

```astro
---
// src/pages/dashboard.astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import CreateEntity from '@/components/dashboard/CreateEntity';
import EntityList from '@/components/dashboard/EntityList';
import AgentBuilder from '@/components/dashboard/AgentBuilder';

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

// Fetch user data
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });

// Fetch entities
const entities = await convex.query(api.queries.entities.listByUser, { userId: user._id });
---

<Layout title="Dashboard">
  <div class="space-y-8">
    <h1 class="text-4xl font-bold">Welcome, {user.name}!</h1>

    <!-- Create new entity via UI -->
    <CreateEntity client:load userId={user._id} />

    <!-- List all entities -->
    <EntityList client:load entities={entities} />

    <!-- Agent builder (embedded backend UI) -->
    <AgentBuilder client:load />
  </div>
</Layout>
```

**Dashboard Features:**
- Create new entities via UI forms
- Manage agents, tools, content
- Real-time updates via Convex hooks
- Role-based access control
- Embedded backend components

---

## Adding New Entity Types

You can extend the ontology in **three ways**:

### 1. Via API

```bash
# Create new entity type
curl -X POST https://api.one.ie/admin/entity-types \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "newsletter",
    "schema": {
      "title": "string",
      "content": "string",
      "subscribers": "number"
    }
  }'
```

### 2. Via Claude Code / Cursor

Tell your AI assistant:

```
"Add a new entity type called 'newsletter' with fields: title, content, subscribers"
```

Claude Code will:
1. Update the schema
2. Create Convex mutations
3. Generate UI components
4. Add to content collections

### 3. Via Dashboard UI

Go to `/dashboard/admin/entity-types` and use the form:

```tsx
// src/components/dashboard/CreateEntityType.tsx
import { useState } from 'react';
import { Effect } from 'effect';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateEntityType() {
  const [name, setName] = useState('');
  const [schema, setSchema] = useState('{}');

  const handleSubmit = async () => {
    const program = apiClient.request('/admin/entity-types', {
      method: 'POST',
      body: JSON.stringify({
        name,
        schema: JSON.parse(schema),
      }),
    });

    await Effect.runPromise(program);

    alert(`Entity type "${name}" created!`);
  };

  return (
    <div class="space-y-4">
      <h2 class="text-2xl font-bold">Create Entity Type</h2>

      <Input
        placeholder="Entity type name (e.g., newsletter)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        placeholder='Schema JSON: {"title": "string", "content": "string"}'
        value={schema}
        onChange={(e) => setSchema(e.target.value)}
        class="w-full h-32 border rounded p-2"
      />

      <Button onClick={handleSubmit}>Create Entity Type</Button>
    </div>
  );
}
```

**Once created:**
- New entity type appears in content collections
- CRUD operations available via API
- UI components auto-generated
- Type-safe access in Astro

---

## Authentication (Better Auth)

Better Auth is pre-configured:

### Configuration

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Usage in Astro Pages

```astro
---
// src/pages/protected.astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Check session
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

// Fetch user
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });
---

<Layout>
  <h1>Welcome, {user.name}!</h1>
</Layout>
```

### Usage in React Components

```tsx
import { useSession } from '@/lib/auth-client';

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
    </div>
  );
}
```

---

## API Connection Patterns

### Pattern 1: Content Collections (Static Data)

Load data at build time:

```typescript
// src/content/config.ts
const products = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://api.one.ie/products');
    return response.json();
  },
});
```

### Pattern 2: SSR Data Fetching (Per-Request)

Load data on each request:

```astro
---
// src/pages/products/[id].astro
const { id } = Astro.params;

const response = await fetch(`https://api.one.ie/products/${id}`);
const product = await response.json();
---

<Layout>
  <h1>{product.name}</h1>
  <p>{product.description}</p>
</Layout>
```

### Pattern 3: Client-Side (Real-Time)

Use Convex hooks for live data:

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function LiveProducts() {
  const products = useQuery(api.queries.products.list);

  return (
    <div>
      {products?.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Pattern 4: Mutations (API Calls)

Use API client for mutations:

```tsx
import { Effect } from 'effect';
import { apiClient } from '@/lib/api-client';

export function CreateProduct() {
  const handleCreate = async () => {
    const program = apiClient.request('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Product',
        price: 99,
      }),
    });

    await Effect.runPromise(program);
  };

  return <button onClick={handleCreate}>Create Product</button>;
}
```

---

## Extending with Custom APIs

ONE works with **any API**, not just ours:

### Example: Notion API

```typescript
// src/content/config.ts
const notionPages = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://api.notion.com/v1/databases/YOUR_DB_ID/query', {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
      method: 'POST',
    });

    const data = await response.json();

    return data.results.map((page: any) => ({
      id: page.id,
      data: {
        title: page.properties.Name.title[0].plain_text,
        content: page.properties.Content.rich_text[0].plain_text,
      },
    }));
  },
});
```

### Example: Strapi CMS

```typescript
// src/content/config.ts
const strapiArticles = defineCollection({
  type: 'data',
  loader: async () => {
    const response = await fetch('https://your-strapi.com/api/articles');
    const { data } = await response.json();

    return data.map((article: any) => ({
      id: article.id,
      data: article.attributes,
    }));
  },
});
```

**Key Point:** Content collections work with ANY REST API. Swap backends without changing frontend code.

---

## Development Workflow

### 1. Clone/Bootstrap Project

```bash
# Option 1: Clone repo
git clone https://github.com/one-ie/one

# Option 2: Use npx
npx oneie create my-project
```

### 2. Configure API Connection

```bash
# .env
PUBLIC_API_URL=https://api.one.ie
PUBLIC_CONVEX_URL=https://your-convex.convex.cloud

# Or use custom API
PUBLIC_API_URL=https://your-api.com
```

### 3. Define Content Collections

```typescript
// src/content/config.ts
export const collections = {
  blog,        // Local markdown
  agents,      // From API
  tools,       // From API
  entities,    // Dynamic from API
};
```

### 4. Build Pages

```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content';

const agents = await getCollection('agents');
const blog = await getCollection('blog');
---

<Layout>
  {/* Your UI here */}
</Layout>
```

### 5. Add Components

```tsx
// src/components/AgentCard.tsx
export function AgentCard({ agent }) {
  return (
    <div class="border rounded-lg p-4">
      <h3>{agent.data.name}</h3>
      <p>{agent.data.description}</p>
    </div>
  );
}
```

### 6. Extend with Claude Code

Ask Claude:
- "Add a new page for creating agents"
- "Build a token purchase flow"
- "Create a dashboard showing my earnings"

Claude generates the code. The API handles the logic.

---

## AI-Native Development with Claude Code

### Setup

```bash
# Open project in Claude Code
claude

# Or use Cursor
cursor .
```

### Example Prompts

**Create a new feature:**
```
"Build a course marketplace page that:
- Fetches courses from /api/courses
- Shows them in a grid with search/filter
- Has a purchase button using the token API
- Redirects to course player after purchase"
```

**Add a new entity type:**
```
"Add a 'newsletter' entity type with:
- title (string)
- content (markdown)
- subscribers (number)
- scheduled_at (date)

Create the schema, API routes, and dashboard UI"
```

**Build a complex workflow:**
```
"Create a workflow where:
1. User creates an AI agent
2. Agent auto-generates content
3. Content gets published to their blog
4. Analytics track performance

Show me the Effect.ts services and React components"
```

Claude Code:
1. Reads the documentation (CLAUDE.md)
2. Understands the ontology (Ontology.md)
3. Generates type-safe code
4. Uses existing patterns
5. Tests everything

**Result:** Production-ready code in minutes.

---

## Deployment

### Build

```bash
# Build for production
bun run build

# Preview build
bun run preview
```

### Deploy to Cloudflare Pages

```bash
# Deploy
wrangler pages deploy dist --project-name=my-platform
```

### Environment Variables

Set in Cloudflare Pages dashboard:

```bash
PUBLIC_API_URL=https://api.one.ie
PUBLIC_CONVEX_URL=https://your-convex.convex.cloud
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
```

---

## Summary

**ONE Platform Development:**

1. **One Mode:** Astro + content collections + API
2. **Content Collections:** Connect to any API (ours or yours)
3. **Dashboard:** Embeds backend UI for entity management
4. **Better Auth:** Pre-configured authentication
5. **Extend:**
   - Via API calls
   - Via Claude Code/Cursor
   - Via dashboard UI
6. **Flexible:** Works with our API, Notion, Strapi, etc.

**The Result:**
- Type-safe frontend (Astro + TypeScript)
- Flexible backend (any API)
- AI-native development (Claude Code ready)
- Production-ready (Better Auth, Convex, Effect.ts)

**Ship AI-native platforms in minutes, not months.** 🚀

---

## Related Documentation

- **[Frontend.md](./Frontend.md)** - Astro + React patterns
- **[Middleware.md](./Middleware.md)** - API client and auth
- **[Dashboard.md](./Dashboard.md)** - Multi-tenant dashboards
- **[Hono.md](./Hono.md)** - API backend architecture
- **[Architecture.md](./Architecture.md)** - Complete system design

**Start building:** `npx oneie create my-platform`
