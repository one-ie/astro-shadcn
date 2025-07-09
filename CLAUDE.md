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
- **Astro 5** with static site generation (`output: 'static'`)
- **React** components with selective hydration via `client:load`
- **shadcn/ui** complete component library pre-installed
- **Tailwind CSS** with custom design tokens and dark mode
- **TypeScript** in strict mode with path aliases
- **Nanostores** for lightweight state management

### Key Architectural Patterns

**Islands Architecture**: This project follows Astro's islands pattern where:
- Pages are `.astro` files that render statically by default
- React components need `client:load` directive for interactivity
- Most UI is static for optimal performance

**Content Collections**: Blog content uses Astro's type-safe content collections:
- Content schema defined in `src/content/config.ts` with Zod validation
- Blog posts in `src/content/blog/` with frontmatter
- Dynamic routing via `[...slug].astro` with static generation

**Theme System**: Advanced dark/light mode implementation:
- CSS custom properties in `src/styles/global.css`
- `ThemeInit.astro` component prevents FOUC (Flash of Unstyled Content)
- localStorage persistence with server-side rendering support

### Path Aliases
```typescript
"@/*": ["src/*"]
"@components/*": ["src/components/*"]
"@layouts/*": ["src/layouts/*"] 
"@lib/*": ["src/lib/*"]
"@stores/*": ["src/stores/*"]
"@content/*": ["src/content/*"]
```

### Component Architecture

**shadcn/ui Integration**: Complete component library in `src/components/ui/`
- Components follow shadcn conventions with Radix UI primitives
- Use `className` prop for styling (not `class`)
- All components are React-based and need `client:load` for interactivity

**Custom Components**:
- `Sidebar.tsx`: Expandable navigation with hover states
- `ModeToggle.tsx`: Dark/light mode switcher
- `Chart.tsx`: Recharts integration for data visualization
- `ThemeInit.astro`: Theme initialization without JavaScript flash

### Blog System Features

**Multi-View Blog Interface**:
- List view and grid view (2/3/4 columns) controlled by URL parameters
- View mode switching: `/blog?view=grid&columns=3`
- Responsive image handling with error states
- Date formatting with `Intl.DateTimeFormat`

**Content Structure**:
```typescript
// Blog schema (src/content/config.ts)
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  picture: z.string().optional(),
  image: z.string().optional()
});
```

### State Management

**Nanostores Pattern**: Lightweight reactive state
- Layout state in `src/stores/layout.ts`
- localStorage persistence
- Cross-component reactivity with `@nanostores/react`

### Styling Architecture

**Tailwind Configuration**: Custom design system in `tailwind.config.mjs`
- CSS custom properties for theme consistency
- Typography plugin with custom styles
- Dark mode via `class` strategy
- Animation system with `tailwindcss-animate`

**Global Styles**: `src/styles/global.css` defines:
- CSS custom properties for light/dark themes
- Base typography and spacing
- Component-specific styles

## Development Guidelines

### React Component Usage in Astro
```astro
---
// Always import React components in frontmatter
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
- Use Tailwind dark mode classes: `dark:bg-slate-800`
- Theme persistence automatic via localStorage

### Performance Considerations
- Minimize `client:load` usage - only for truly interactive components
- Static generation is preferred for all routes
- Images should have alt text and error handling
- Use view transitions for smooth navigation

### Common Issues
- **Type Errors**: Run `npx astro sync` to regenerate content types
- **Build Failures**: Check TypeScript errors with `npx astro check`
- **Hydration Issues**: Ensure React components have `client:load` when needed
- **Styling Issues**: Use `className` not `class` in React components

## Project Structure Notes

### Key Directories
- `src/pages/`: File-based routing (`.astro` files)
- `src/layouts/`: Layout components (`Layout.astro`, `Blog.astro`)
- `src/components/ui/`: Complete shadcn/ui component library
- `src/content/`: Content collections with type-safe schemas
- `src/stores/`: Nanostores for state management
- `src/styles/`: Global CSS and design tokens

### Configuration Files
- `astro.config.mjs`: Astro configuration with React and Tailwind
- `components.json`: shadcn/ui configuration
- `tailwind.config.mjs`: Tailwind with custom design tokens
- `tsconfig.json`: TypeScript with path aliases and strict mode

This is a high-performance, developer-friendly setup that combines static site generation with selective interactivity for optimal user experience.