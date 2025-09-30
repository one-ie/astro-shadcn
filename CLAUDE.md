# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

```bash
# Start development server (localhost:4321)
npm run dev
# or
pnpm dev

# Build for production (includes TypeScript checking)
npm run build
# or
pnpm build

# Preview production build
npm run preview
# or
pnpm preview

# TypeScript checking only
npx astro check

# Generate content collection types
npx astro sync
```

### Package Manager

This project uses **pnpm** as the preferred package manager (evidenced by `pnpm-lock.yaml`). Always use `pnpm` commands when managing dependencies.

## Architecture Overview

### Core Stack

- **Astro 5.14+** with static site generation (`output: 'static'`)
- **React 19** components with selective hydration via `client:load`
- **shadcn/ui** complete component library (50+ components pre-installed)
- **Tailwind CSS v4** with modern CSS-based configuration and dark mode
- **TypeScript 5.9+** in strict mode with path aliases
- **Nanostores** for lightweight state management
- **Recharts 2.15+** for data visualization
- **@astrojs/sitemap** for automatic sitemap generation
- **@astrojs/rss** for RSS feed generation

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
- No `@apply` directive - use vanilla CSS or utility classes directly
- Add `@source` directive to scan component directories

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

- `astro.config.mjs`: Astro configuration with React, sitemap, and `@tailwindcss/vite` plugin
- `components.json`: shadcn/ui configuration
- `src/styles/global.css`: Tailwind v4 CSS-based configuration with `@theme` blocks
- `tsconfig.json`: TypeScript with path aliases and strict mode
- `.eslintrc.json`: ESLint configuration for TypeScript and Astro
- `.prettierrc`: Prettier configuration with Astro plugin
- `.vscode/settings.json`: VS Code workspace settings
- `src/config/site.ts`: Centralized site configuration

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
