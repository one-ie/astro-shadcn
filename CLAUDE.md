# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference for Agents

**BEFORE starting ANY task, read these in order:**
1. **[AGENTS.md](./AGENTS.md)** - Convex development patterns (queries, mutations, actions, schema)
2. **[docs/Rules.md](./docs/Rules.md)** - Golden rules for AI code generation
3. **[docs/Workflow.md](./docs/Workflow.md)** - Ontology-driven development flow
4. **[docs/Patterns.md](./docs/Patterns.md)** - Proven code patterns to replicate
5. **[docs/Architecture.md](./docs/Architecture.md)** - System architecture & functional programming
6. **[docs/Files.md](./docs/Files.md)** - File system map (where everything goes)

## Development Commands

### Core Development

```bash
# Start development server (localhost:4321)
bun run dev

# Build for production (includes TypeScript checking)
bun run build

# Preview production build
bun run preview

# TypeScript checking only
bunx astro check

# Generate content collection types
bunx astro sync
```

### Package Manager

This project uses **bun** as the preferred package manager (evidenced by `bun.lockb`). Always use `bun` commands when managing dependencies.

## Architecture Overview

### Core Stack

- **Astro 5.14+** with server-side rendering (`output: 'server'`)
- **React 19** components with selective hydration via `client:load`
- **@astrojs/cloudflare** adapter for Cloudflare Pages deployment with edge SSR
- **shadcn/ui** complete component library (50+ components pre-installed)
- **Tailwind CSS v4** with modern CSS-based configuration and dark mode
- **TypeScript 5.9+** in strict mode with path aliases
- **Nanostores** for lightweight state management
- **Recharts 2.15+** for data visualization
- **@astrojs/sitemap** for automatic sitemap generation
- **@astrojs/rss** for RSS feed generation
- **Convex** for real-time backend and authentication
- **Better Auth** for authentication with GitHub and Google OAuth
- **@convex-dev/resend** component for email functionality

### Key Architectural Patterns

**Islands Architecture**: This project follows Astro's islands pattern where:

- Pages are `.astro` files that render statically by default
- React components need `client:load` directive for interactivity
- Most UI is static for optimal performance

**Content Collections**: Blog content uses Astro's type-safe content collections:

- Content schema defined in `src/content/config.ts` with Zod validation
- Blog posts in `src/content/blog/` with frontmatter
- Dynamic routing via `[...slug].astro` with static generation

**Theme System**: Advanced dark/light mode implementation with Tailwind v4:

- CSS custom properties in `src/styles/global.css` using HSL color format
- `@variant dark (.dark &)` for dark mode support
- `ThemeInit.astro` component prevents FOUC (Flash of Unstyled Content)
- localStorage persistence with server-side rendering support
- Dark class applied to `<html>` element via JavaScript

### Path Aliases

```typescript
"@/*": ["src/*"]
"@components/*": ["src/components/*"]
"@layouts/*": ["src/layouts/*"]
"@lib/*": ["src/lib/*"]
"@stores/*": ["src/stores/*"]
"@content/*": ["src/content/*"]
"@hooks/*": ["src/hooks/*"]
"@types/*": ["src/types/*"]
"@config/*": ["src/config/*"]
```

### Component Architecture

**shadcn/ui Integration**: Complete component library in `src/components/ui/`

- Components follow shadcn conventions with Radix UI primitives
- Use `className` prop for styling (not `class`)
- All components are React-based and need `client:load` for interactivity

**Custom Components**:

- `Sidebar.tsx`: Expandable navigation with hover states and active route detection
- `ModeToggle.tsx`: Dark/light mode switcher
- `Chart.tsx`: Recharts integration for data visualization
- `ThemeInit.astro`: Theme initialization without JavaScript flash
- `BlogSearch.tsx`: Real-time blog post search with filtering
- `TableOfContents.tsx`: Auto-generated ToC with IntersectionObserver tracking
- `ShareButtons.tsx`: Native Web Share API + social media buttons
- `ErrorBoundary.tsx`: React error boundary with alert UI

### Blog System Features

**Multi-View Blog Interface**:

- List view and grid view (2/3/4 columns) controlled by URL parameters
- View mode switching: `/blog?view=grid&columns=3`
- Real-time search filtering by title and description
- Responsive image handling with lazy loading
- Date formatting with `Intl.DateTimeFormat`

**Content Structure**:

```typescript
// Blog schema (src/content/config.ts)
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z.enum(['tutorial', 'news', 'guide', 'review', 'article']).default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
});
```

**Blog Features**:

- **Real-time Search**: BlogSearch component with instant filtering
- **Table of Contents**: Auto-generated from markdown headings with active tracking
- **Social Sharing**: Native Web Share API + Twitter, Facebook, LinkedIn buttons
- **Tags & Categories**: Rich metadata for content organization
- **RSS Feed**: Auto-generated at `/rss.xml` with all blog posts
- **Sitemap**: Auto-generated with `@astrojs/sitemap`

### State Management

**Nanostores Pattern**: Lightweight reactive state

- Layout state in `src/stores/layout.ts`
- localStorage persistence
- Cross-component reactivity with `@nanostores/react`

### Styling Architecture

**Tailwind CSS v4 Configuration**: Modern CSS-based configuration

- No `tailwind.config.mjs` file - configuration in CSS using `@theme` blocks
- Uses `@tailwindcss/vite` plugin in `astro.config.mjs`
- CSS imports via `@import "tailwindcss"`
- `@plugin "@tailwindcss/typography"` for typography support
- Dark mode via `@variant dark (.dark &)` selector

**Global Styles**: `src/styles/global.css` defines:

- `@theme` blocks with HSL color values (e.g., `--color-background: 0 0% 100%`)
- Colors wrapped with `hsl()` function: `hsl(var(--color-background))`
- `.dark` class overrides for dark mode colors
- `@source` directive to scan component files
- Base typography and spacing
- Component-specific custom styles

**Important Tailwind v4 Guidelines**:

- ALWAYS use HSL format for colors, not OKLCH
- ALWAYS wrap color variables with `hsl()`: `hsl(var(--color-background))`
- Define theme colors in `@theme` blocks with `--color-*` pattern
- Use `@variant dark (.dark &)` for dark mode utilities
- NO `@apply` directive in Tailwind v4 - use vanilla CSS or utility classes directly in HTML
- NEVER use `@apply border-border` or similar - these utility classes don't exist in v4
- NEVER use `@layer base` with `@apply` - define base styles with vanilla CSS only
- Add `@source` directive to scan component directories
- Border colors are automatically applied via `* { border-color: hsl(var(--color-border)); }` in global.css

## Development Guidelines

### React Component Usage in Astro

```astro
---
// Always import React components in frontmatter
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
---

<!-- Add client:load for interactive components -->
<Button client:load>Interactive Button</Button>
<Card>Static card content</Card>
```

### Content Collections

- Blog posts go in `src/content/blog/`
- Use frontmatter matching the BlogSchema
- Run `npx astro sync` after content changes to update types
- Reference type: `CollectionEntry<"blog">` (lowercase)

### Theme System

- Theme switching handled by `ModeToggle.tsx`
- Use Tailwind dark mode classes: `dark:bg-background` or `dark:text-foreground`
- Theme persistence automatic via localStorage
- Colors defined in CSS using HSL format with `hsl()` wrapper
- Example: `className="bg-background text-foreground dark:bg-background"`

### Performance Considerations

- Minimize `client:load` usage - only for truly interactive components
- Static generation is preferred for all routes
- Use Astro's `<Image>` component for automatic optimization
- Images should have alt text, lazy loading, and proper dimensions
- RSS feed and sitemap automatically generated on build
- ~30KB gzipped JavaScript for entire site
- Perfect 100/100 Lighthouse scores across all metrics

### Common Issues

- **Type Errors**: Run `npx astro sync` to regenerate content types
- **Build Failures**: Check TypeScript errors with `npx astro check`
- **Hydration Issues**: Ensure React components have `client:load` when needed
- **Styling Issues**: Use `className` not `class` in React components
- **Render Props Not Working**: Astro JSX doesn't support React render props - render content directly in component
- **Image Optimization**: Use Astro's `<Image>` component in .astro files, plain `<img>` in React components

## Project Structure Notes

### Key Directories

- `src/pages/`: File-based routing (`.astro` files)
  - `blog/index.astro`: Blog listing with search
  - `blog/[...slug].astro`: Dynamic blog post pages
  - `rss.xml.ts`: RSS feed generator
  - `404.astro`: Custom 404 error page
- `src/layouts/`: Layout components (`Layout.astro`, `Blog.astro`)
- `src/components/`: React components
  - `ui/`: 50+ shadcn/ui components
  - `BlogSearch.tsx`, `TableOfContents.tsx`, `ShareButtons.tsx`, etc.
- `src/content/`: Content collections with type-safe schemas
  - `blog/`: Blog posts in markdown
  - `config.ts`: Content collection schemas
- `src/lib/`: Utility functions
  - `utils.ts`: cn() for Tailwind class merging
  - `reading-time.ts`: Reading time calculator
- `src/config/`: Site configuration
  - `site.ts`: Centralized site settings
- `src/stores/`: Nanostores for state management
- `src/styles/`: Global CSS and design tokens

### Configuration Files

- `astro.config.mjs`: Astro configuration with React, sitemap, Cloudflare adapter, and `@tailwindcss/vite` plugin
- `wrangler.toml`: Cloudflare Workers configuration with Node.js compatibility
- `components.json`: shadcn/ui configuration
- `convex/convex.config.ts`: Convex components configuration including Resend email component
- `src/styles/global.css`: Tailwind v4 CSS-based configuration with `@theme` blocks
- `tsconfig.json`: TypeScript with path aliases and strict mode
- `.eslintrc.json`: ESLint configuration for TypeScript and Astro
- `.prettierrc`: Prettier configuration with Astro plugin
- `.vscode/settings.json`: VS Code workspace settings
- `src/config/site.ts`: Centralized site configuration
- `.mcp.json`: MCP server configuration for shadcn, Cloudflare, and Convex integrations

## Writing Beautiful Tailwind v4 + Astro Code

When writing code for this project, follow these best practices:

**1. Color Usage**

```astro
<!-- CORRECT: Use semantic color names -->
<div class="bg-background text-foreground border border-border">
  <div class="dark:bg-card dark:text-card-foreground">
    <!-- AVOID: Don't use arbitrary values when semantic colors exist -->
    <div class="bg-[#ffffff] text-[#000000]"></div>
  </div>
</div>
```

**2. Component Structure**

```astro
---
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
---

<Card>
  <CardHeader>
    <CardTitle>Beautiful Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p class="text-muted-foreground">Use semantic colors</p>
    <Button client:load>Interactive</Button>
  </CardContent>
</Card>
```

**3. Responsive Design**

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Mobile-first approach -->
</div>
```

**4. Dark Mode**

```astro
<div
  class="bg-card text-card-foreground dark:bg-card dark:text-card-foreground"
>
  <!-- Colors automatically switch via CSS variables -->
</div>
```

This is a high-performance, developer-friendly setup that combines static site generation with selective interactivity for optimal user experience. Always use Tailwind v4 CSS-based configuration and React 19 patterns.

## Deployment

### Cloudflare Pages with React 19 SSR

This project uses **Astro 5 + React 19** with full server-side rendering on **Cloudflare Pages**, which was considered impossible due to React 19's `MessageChannel` requirement. We solved this by configuring Vite to use `react-dom/server.edge`.

**Key Configuration** (in `astro.config.mjs`):

```javascript
export default defineConfig({
  // ... other config
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
    ssr: {
      external: ['node:async_hooks'],
    },
  },
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
```

**Why This Works:**
- React 19's default `react-dom/server` uses `MessageChannel` (not available in Cloudflare Workers)
- `react-dom/server.edge` is designed for edge runtimes with Web Streams support
- The Vite alias tells the bundler to use the edge version instead
- This makes React 19 SSR fully compatible with Cloudflare Workers runtime

**Deployment Commands:**

```bash
# Build for production
bun run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=astro-shadcn --commit-dirty=true
```

**Live Deployment:**
- Main: https://6f06e33b.astro-shadcn-4lu.pages.dev
- Alias: https://convex.astro-shadcn-4lu.pages.dev

### Environment Variables

Required environment variables for Convex and authentication:

```bash
CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-from-email@yourdomain.com
```

### Convex Components

This project uses Convex components for extended functionality:

**Resend Email Component** (`@convex-dev/resend`):
- Configured in `convex/convex.config.ts`
- Used for password reset emails and transactional notifications
- Supports email tracking, status updates, and event handling
- Works in Cloudflare Workers edge runtime

**Configuration Pattern**:
```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";

const app = defineApp();
app.use(resend);

export default app;
```

**Usage Pattern**:
```typescript
// In Convex mutations/actions
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

const resend = new Resend(components.resend, { testMode: false });

// Send email via internal action
await resend.sendEmail(ctx, {
  from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  to: email,
  subject: "Your Subject",
  html: "<p>Email content</p>",
});
```

**Important Notes**:
- Email sending MUST be done in internal actions (not mutations or queries)
- Use `ctx.scheduler.runAfter(0, ...)` to schedule email sending from mutations
- Split functionality: mutations create tokens/data, actions send emails asynchronously
- Never use Node.js Resend SDK directly in Convex - use the component instead
- This pattern prevents mutations from hanging while waiting for email delivery

**Example: Password Reset Flow**:
```typescript
// Public mutation - creates token and schedules email
export const requestPasswordReset = mutation({
  args: { email: v.string(), baseUrl: v.string() },
  handler: async (ctx, args) => {
    // Create token via internal mutation
    const result = await ctx.runMutation(internal.auth.createPasswordResetToken, {
      email: args.email,
    });

    if (!result) return { success: true };

    const resetLink = `${args.baseUrl}/reset-password?token=${result.token}`;

    // Schedule email asynchronously - mutation returns immediately
    await ctx.scheduler.runAfter(0, internal.auth.sendPasswordResetEmailAction, {
      email: result.email,
      resetLink,
    });

    return { success: true };
  },
});

// Internal action - sends email (runs in background)
export const sendPasswordResetEmailAction = internalAction({
  args: { email: v.string(), resetLink: v.string() },
  handler: async (ctx, args) => {
    const resend = new Resend(components.resend, { testMode: false });
    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: args.email,
      subject: "Reset your password",
      html: `<a href="${args.resetLink}">Reset Password</a>`,
    });
  },
});
```

### Cloudflare KV Setup

The adapter uses Cloudflare KV for session storage. Add the KV binding to your Cloudflare Pages project:

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "SESSION"
id = "your-kv-namespace-id"
```

Create a KV namespace in the Cloudflare dashboard and add the ID to your configuration.

## AI Agent Development Process

This section defines the exact process AI agents must follow when implementing features. This ensures consistency, quality, and adherence to the ontology-driven architecture.

### The 4-Table Ontology (MEMORIZE THIS)

**Every feature MUST use these 4 tables:**

```
┌─────────────┐
│  ENTITIES   │ ← Everything is an entity (users, agents, content, tokens)
└──────┬──────┘
       │
       ├──→ ┌──────────────┐
       │    │ CONNECTIONS  │ ← All relationships between entities
       │    └──────────────┘
       │
       ├──→ ┌──────────────┐
       │    │   EVENTS     │ ← All actions, changes, time-series data
       │    └──────────────┘
       │
       └──→ ┌──────────────┐
            │    TAGS      │ ← Categorization and taxonomy
            └──────────────┘
```

**Rules:**
- If modeling a "thing" → use **entities** table
- If modeling "X relates to Y" → use **connections** table
- If modeling "X happened at time T" → use **events** table
- If modeling "categories" → use **tags** table + entityTags junction

### Step-by-Step Feature Implementation

#### Step 1: Read Context (MANDATORY)

Before writing ANY code, read these files:

1. **AGENTS.md** - Convex patterns
2. **docs/Rules.md** - Golden rules
3. **docs/Workflow.md** - Ontology flow
4. **docs/Patterns.md** - Code patterns
5. **docs/Files.md** - File locations

#### Step 2: Map Feature to Ontology

**Ask yourself:**
- What entities are involved?
- What connections between entities?
- What events need to be logged?
- What tags/categories are needed?

**Example: "Token Purchase" Feature**

```
Entities:
  - user (type: "creator" or "audience_member")
  - token (type: "token")

Connections:
  - user → token (relationshipType: "holds_tokens")
    metadata: { balance: number }

Events:
  - tokens_purchased (entityId: tokenId, actorId: userId)
    metadata: { amount, usdAmount, paymentId }
```

#### Step 3: Design Effect.ts Service (Business Logic)

**Pattern:**
```typescript
// convex/services/[category]/[service].ts
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;

      return {
        purchase: (args: PurchaseArgs) =>
          Effect.gen(function* () {
            // 1. Validate
            // 2. Charge payment
            // 3. Create/update connection
            // 4. Log event
            // 5. Return result
          })
      };
    }),
    dependencies: [ConvexDatabase.Default, StripeProvider.Default]
  }
) {}
```

**Rules:**
- Pure functions only
- Explicit types (no `any`)
- Typed errors (`_tag` pattern)
- Dependency injection
- Business logic ONLY (no Convex-specific code)

#### Step 4: Create Convex Wrapper (Thin Layer)

**Pattern:**
```typescript
// convex/mutations/tokens.ts
export const purchase = confect.mutation({
  args: { tokenId: v.id("entities"), amount: v.number() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.purchase(args);
    }).pipe(Effect.provide(MainLayer))
});
```

**Rules:**
- Thin wrapper only
- Validate args with Convex validators
- Call service
- Provide MainLayer
- Handle errors

#### Step 5: Create React Component (UI)

**Pattern:**
```typescript
// src/components/features/tokens/TokenPurchase.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function TokenPurchase({ tokenId }: { tokenId: Id<"entities"> }) {
  const purchase = useMutation(api.tokens.purchase);

  return (
    <Button onClick={() => purchase({ tokenId, amount: 100 })}>
      Buy 100 Tokens
    </Button>
  );
}
```

**Rules:**
- Use Convex hooks (`useQuery`, `useMutation`)
- Use shadcn/ui components
- Handle loading/error states
- Add `client:load` when used in Astro

#### Step 6: Create Astro Page (SSR)

**Pattern:**
```astro
---
// src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import TokenPurchase from "@/components/features/tokens/TokenPurchase";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(api.tokens.get, { id: Astro.params.id });
---

<Layout>
  <h1>{token.name}</h1>
  <TokenPurchase client:load tokenId={token._id} />
</Layout>
```

**Rules:**
- SSR data fetching in frontmatter
- Use ConvexHttpClient
- Pass data as props to React components
- Add `client:load` for interactive components

#### Step 7: Write Tests

**Unit Test Pattern:**
```typescript
// tests/unit/services/token.test.ts
describe("TokenService.purchase", () => {
  it("should purchase tokens successfully", async () => {
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: () => Effect.succeed({ id: "pay_123" })
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({ userId, tokenId, amount: 100 });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result.success).toBe(true);
  });
});
```

**Integration Test Pattern:**
```typescript
// tests/integration/token-purchase.test.ts
describe("Token Purchase Flow", () => {
  it("should complete full purchase flow", async () => {
    // Test full flow: mutation → service → external APIs → database
  });
});
```

#### Step 8: Update Documentation

**Update these files:**
- `docs/Patterns.md` - Add new pattern if novel
- `docs/Files.md` - Add new files to map
- Feature-specific docs if needed

### Common Patterns to Follow

#### Pattern 1: Create Entity with Relationships

```typescript
Effect.gen(function* () {
  // 1. Create entity
  const entityId = yield* Effect.tryPromise(() =>
    db.insert("entities", {
      type: "course",
      name: args.title,
      properties: { /* ... */ },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  );

  // 2. Create ownership connection
  yield* Effect.tryPromise(() =>
    db.insert("connections", {
      fromEntityId: args.creatorId,
      toEntityId: entityId,
      relationshipType: "owns",
      createdAt: Date.now(),
    })
  );

  // 3. Log creation event
  yield* Effect.tryPromise(() =>
    db.insert("events", {
      entityId,
      eventType: "course_created",
      timestamp: Date.now(),
      actorType: "user",
      actorId: args.creatorId,
      metadata: { /* ... */ },
    })
  );

  return entityId;
})
```

#### Pattern 2: Query with Relationships

```typescript
// Get entity with related data
const creator = await ctx.db.get(creatorId);

const content = await ctx.db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromEntityId", creatorId)
     .eq("relationshipType", "authored")
  )
  .collect();

return { ...creator, content };
```

#### Pattern 3: Update Entity

```typescript
Effect.gen(function* () {
  // Get current
  const current = yield* Effect.tryPromise(() => db.get(id));

  // Merge updates
  const newProperties = { ...current.properties, ...updates };

  // Update
  yield* Effect.tryPromise(() =>
    db.patch(id, {
      properties: newProperties,
      updatedAt: Date.now()
    })
  );

  // Log event
  yield* Effect.tryPromise(() =>
    db.insert("events", {
      entityId: id,
      eventType: "entity_updated",
      timestamp: Date.now(),
      metadata: { updatedFields: Object.keys(updates) }
    })
  );
})
```

### Technology Stack Rules

**Frontend:**
- Astro 5.14+ for pages
- React 19 for interactive components
- shadcn/ui for UI components
- Tailwind CSS v4 for styling
- TypeScript strict mode

**Backend:**
- Convex for database + functions
- Effect.ts for business logic
- Confect for bridging
- Better Auth for authentication
- Resend for emails

**Never:**
- Use `any` type (except in entity `properties`)
- Mix business logic in Convex functions
- Create custom backend routes (use Convex)
- Use relative imports (use `@/` aliases)
- Skip writing tests

### File Naming & Location

**Follow exactly:**
- React components: `src/components/features/[domain]/[Component].tsx`
- Services: `convex/services/[category]/[service].ts`
- Mutations: `convex/mutations/[domain].ts`
- Queries: `convex/queries/[domain].ts`
- Actions: `convex/actions/[category]/[action].ts`
- Tests: `tests/[unit|integration|e2e]/[name].test.ts`

**Naming:**
- Components: PascalCase.tsx
- Services: camelCase.ts
- Pages: kebab-case.astro
- Exports: Named exports (no defaults)

### Pre-Generation Checklist

Before generating ANY code, verify:

- [ ] I have read the required documentation
- [ ] I understand which entities/connections/events are involved
- [ ] I know the file locations per `docs/Files.md`
- [ ] I will use Effect.ts for business logic
- [ ] I will use explicit types everywhere
- [ ] I will write tests
- [ ] I will follow the patterns in `docs/Patterns.md`

### Post-Generation Checklist

After generating code, verify:

- [ ] TypeScript compiles (`bunx astro check`)
- [ ] Tests pass (`bun test`)
- [ ] No `any` types (except in `properties`)
- [ ] All errors are typed with `_tag`
- [ ] React components have loading/error states
- [ ] Convex functions are thin wrappers
- [ ] Files are in correct locations
- [ ] Documentation is updated

### Why This Process Works

**Traditional approach (fails):**
```
Write code → Hope it works → Debug → Refactor → Technical debt
```

**Ontology-driven approach (scales):**
```
Map to ontology → Design types → Generate code → Tests pass → Done
```

**Benefits:**
1. **Consistency** - Every feature follows same pattern
2. **Type Safety** - Compiler catches errors
3. **Testability** - Pure functions are easy to test
4. **Composability** - Services combine cleanly
5. **AI-Friendly** - Explicit patterns AI can learn

**Result:** Code quality IMPROVES as codebase grows because AI learns from proven patterns.

### Emergency: When Confused

If unsure about ANYTHING:

1. **STOP** - Don't generate code
2. **READ** - Re-read ontology and patterns
3. **SEARCH** - Find similar existing code
4. **ASK** - Request clarification from human
5. **SIMPLIFY** - Start with simplest solution

**NEVER:**
- Generate code you're uncertain about
- Use `any` because you don't know the type
- Skip reading documentation
- Modify files outside your domain
- Skip writing tests

### Key Principles

1. **Ontology First** - Map feature to 4 tables before coding
2. **Types Everywhere** - Explicit types catch errors at compile time
3. **Pure Functions** - Business logic in Effect.ts services
4. **Thin Wrappers** - Convex functions call services
5. **Test Everything** - Tests define expected behavior
6. **Follow Patterns** - Replicate proven patterns exactly
7. **Update Docs** - Keep documentation current

**This process ensures every feature makes the codebase BETTER, not worse.**
