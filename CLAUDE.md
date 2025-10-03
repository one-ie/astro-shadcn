# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**For Convex-specific development patterns and best practices, see [AGENTS.md](./AGENTS.md)** - a concise reference optimized for AI agents.

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
