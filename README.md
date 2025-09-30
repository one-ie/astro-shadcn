# 🚀 Astro 5 + Shadcn/UI + Tailwind v4 Starter Kit

A production-ready, enterprise-grade starter template combining Astro's performance with Shadcn's beautiful components and Tailwind CSS v4's modern CSS-based configuration. Featuring advanced blog system, search, accessibility, and SEO optimizations.

## ✨ What's Inside

- **Astro 5.14+** - Lightning-fast static site generation
- **React 19** - Latest React with improved performance
- **Tailwind CSS v4** - Modern CSS-based configuration with HSL colors
- **Shadcn/UI** - Complete component library (50+ components)
- **TypeScript 5.9+** - Full type safety with strict mode
- **Dark Mode** - Beautiful theme switching with no FOUC
- **Blog System** - Full-featured with search, tags, categories, ToC
- **SEO Optimized** - Sitemap, RSS feed, OG tags, canonical URLs
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation
- **100/100 Lighthouse** - Perfect performance scores

### 🎨 Screenshots

![Astro Shadcn UI](https://astro-shadcn.one.ie/screenshots/screenshot.png)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/one-ie/astro-shadcn.git

# Navigate to project
cd astro-shadcn

# Install dependencies (using pnpm recommended)
pnpm install

# Start development server
pnpm dev

# Or with npm
npm install
npm run dev
```

Visit `http://localhost:4321` - You're ready to go! 🎉

## 🎯 Key Features

### 📝 Advanced Blog System

- **Content Collections** - Type-safe blog posts with Zod validation
- **Multi-view Layouts** - List, 2-column, 3-column, and 4-column grid views
- **Real-time Search** - Instant filtering by title and description
- **Rich Metadata** - Tags, categories, author, featured posts, reading time
- **Table of Contents** - Auto-generated with IntersectionObserver tracking
- **Social Sharing** - Native Web Share API + social media buttons
- **RSS Feed** - Auto-generated at `/rss.xml`

### 🔍 SEO & Performance

- **Meta Tags** - Open Graph, Twitter Cards, canonical URLs
- **Sitemap** - Auto-generated with `@astrojs/sitemap`
- **Image Optimization** - Astro's built-in Image component with lazy loading
- **Minimal JavaScript** - Only interactive components hydrate
- **Perfect Scores** - 100/100 Lighthouse across all metrics

### ♿ Accessibility Features

- **Skip to Content** - Keyboard-accessible skip link
- **ARIA Labels** - Proper semantic markup throughout
- **Focus Indicators** - Visible focus states on all interactive elements
- **Screen Reader Support** - Tested with VoiceOver and NVDA
- **Keyboard Navigation** - Fully navigable without a mouse

### 🛠️ Developer Experience

- **ESLint & Prettier** - Pre-configured code formatting
- **VS Code Settings** - Optimized workspace configuration
- **Path Aliases** - Clean imports with `@/` prefix
- **Type Safety** - Strict TypeScript with no implicit any
- **Hot Reload** - Fast refresh during development

## 🎨 Pre-installed Components

All Shadcn/UI components are pre-configured for Astro with 50+ components ready to use:

```astro
---
// Example usage in .astro file
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
---

<Button client:load>Click me!</Button>
```

### Available Components (50+)

**Layout & Navigation:**
- ✅ Sidebar, Navigation Menu, Breadcrumb, Tabs

**Forms & Inputs:**
- ✅ Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Calendar, Date Picker, Input OTP

**Data Display:**
- ✅ Card, Table, Badge, Avatar, Progress, Chart (Recharts), Carousel

**Feedback & Overlays:**
- ✅ Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Toast, Sonner, Alert

**Interactive:**
- ✅ Accordion, Collapsible, Dropdown Menu, Context Menu, Menubar, Hover Card, Command, Resizable Panels

**Custom Components:**
- ✅ BlogSearch - Real-time blog post filtering
- ✅ TableOfContents - Auto-generated with active tracking
- ✅ ShareButtons - Native + social media sharing
- ✅ ErrorBoundary - React error boundary with alerts
- ✅ ModeToggle - Theme switcher component

## 🛠️ Project Structure

```text
astro-shadcn/
├── src/
│   ├── components/
│   │   ├── ui/              # 50+ Shadcn components
│   │   ├── BlogSearch.tsx   # Real-time blog search
│   │   ├── TableOfContents.tsx
│   │   ├── ShareButtons.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ModeToggle.tsx   # Theme switcher
│   │   └── Sidebar.tsx      # Expandable navigation
│   ├── layouts/
│   │   ├── Layout.astro     # Base layout with SEO
│   │   └── Blog.astro       # Blog post layout with ToC
│   ├── pages/
│   │   ├── index.astro      # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro  # Blog index with search
│   │   │   └── [...slug].astro # Dynamic blog posts
│   │   ├── rss.xml.ts       # RSS feed generator
│   │   └── 404.astro        # Custom 404 page
│   ├── content/
│   │   ├── config.ts        # Content collections schema
│   │   └── blog/            # Blog posts in markdown
│   ├── lib/
│   │   ├── utils.ts         # cn() utility for Tailwind
│   │   └── reading-time.ts  # Reading time calculator
│   ├── config/
│   │   └── site.ts          # Site configuration
│   └── styles/
│       └── global.css       # Tailwind v4 with @theme blocks
├── .vscode/
│   ├── settings.json        # Workspace settings
│   └── extensions.json      # Recommended extensions
├── astro.config.mjs         # Astro + sitemap config
├── components.json          # Shadcn/ui configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript with path aliases
└── CLAUDE.md                # AI assistant instructions
```

### Using Components

```astro
---
// src/pages/index.astro
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
---

<Card>
  <CardHeader>
    <CardTitle>Welcome to Astro + Shadcn!</CardTitle>
  </CardHeader>
  <Button client:load>Interactive Button</Button>
</Card>
```

## 🚀 Development Workflow

### Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Lint code with ESLint
pnpm format           # Format with Prettier

# Type Checking
npx astro check       # TypeScript type checking
npx astro sync        # Sync content collection types
```

### Adding Blog Posts

Create a new markdown file in `src/content/blog/`:

```markdown
---
title: 'Your Post Title'
description: 'A brief description'
date: 2025-01-15
author: 'Your Name'
tags: ['astro', 'react', 'tailwind']
category: 'tutorial'
featured: true
image: '/path/to/image.jpg'
---

Your content here with full markdown support!

## Headings auto-generate Table of Contents

Content is automatically indexed for search.
```

### Using React Components in Astro

```astro
---
// Always add client:load for interactive components
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
---

<!-- Interactive component needs client:load -->
<Dialog client:load>
  <Button client:load>Click me!</Button>
</Dialog>

<!-- Static components don't need hydration -->
<Card>
  <CardHeader>
    <CardTitle>Static Card</CardTitle>
  </CardHeader>
</Card>
```

### Customizing Theme

Edit `src/styles/global.css` to customize colors:

```css
@theme {
  --color-primary: 0 0% 9%;
  --color-background: 0 0% 100%;
  /* Add your custom colors */
}

/* Dark mode overrides */
.dark {
  --color-background: 0 0% 3.9%;
  --color-foreground: 0 0% 98%;
}
```

## 🔍 Troubleshooting

### Common Issues & Solutions

**Type Errors After Adding Content**
```bash
npx astro sync  # Regenerate content collection types
```

**Component Not Interactive**
```astro
<!-- Add client:load directive -->
<Button client:load>Click me</Button>
```

**Styling Issues**
```astro
<!-- Use className (not class) in React components -->
<Button className="custom-class">Button</Button>

<!-- Use class in Astro files -->
<div class="custom-class">Content</div>
```

**Build Failures**
```bash
npx astro check  # Check for TypeScript errors
pnpm lint        # Check for linting errors
```

## 💡 Pro Tips

1. **Component Usage in Astro**

   ```astro
   ---
   // Always import in the frontmatter
   import { Button } from '@/components/ui/button';
   ---

   <!-- Use in template -->
   <Button client:load>Click me!</Button>
   ```

2. **Styling with Tailwind v4**

   ```astro
   <!-- Use semantic color names that work in both light and dark modes -->
   <div class="bg-background text-foreground border border-border">
     <Button class="m-4">Styled Button</Button>
   </div>
   ```

3. **Layout Usage**

   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---

   <Layout title="Home">
     <!-- Your content -->
   </Layout>
   ```

## 📊 Performance & Screenshots

### ⚡ Lighthouse Scores

![Desktop Performance](https://astro-shadcn.one.ie/screenshots/lighthouse-desktop.png)

Perfect scores across all metrics:

- 🚀 Performance: 100
- ♿ Accessibility: 100
- 🔧 Best Practices: 100
- 🔍 SEO: 100

### What Makes It Fast?

- **Islands Architecture** - Only interactive components hydrate
- **Image Optimization** - Automatic WebP conversion and lazy loading
- **Minimal JavaScript** - ~30KB gzipped for the entire site
- **CSS-First** - Tailwind v4 with zero runtime overhead
- **Static Generation** - Pre-rendered pages for instant loads
- **Smart Bundling** - Code splitting and tree shaking enabled

## 📚 Documentation & Resources

### Official Docs
- [Astro Documentation](https://docs.astro.build)
- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React 19 Release](https://react.dev/blog/2025/01/29/react-19)

### Project Docs
- `CLAUDE.md` - AI assistant instructions and architecture guide
- `improve.md` - Detailed improvement roadmap and best practices

## 🤝 Contributing & Support

- Join [Astro Discord](https://astro.build/chat)
- Check [Astro Documentation](https://docs.astro.build)
- File an [Issue on GitHub](https://github.com/one-ie/astro-shadcn/issues)

## 📦 What's New

### Latest Updates

- ✅ **Blog Search** - Real-time filtering by title/description
- ✅ **Table of Contents** - Auto-generated with active tracking
- ✅ **Social Sharing** - Native Web Share API + social buttons
- ✅ **Enhanced Schema** - Tags, categories, author, reading time
- ✅ **SEO Optimized** - Sitemap, RSS, OG tags, canonical URLs
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Developer Tools** - ESLint, Prettier, VS Code settings
- ✅ **Error Handling** - 404 page + React error boundaries

## 🎯 Use Cases

Perfect for:
- 📝 Technical blogs and documentation sites
- 🎨 Portfolio and personal websites
- 🚀 Landing pages and marketing sites
- 📊 Dashboards and admin panels
- 🛍️ E-commerce frontends
- 📱 Progressive Web Apps

---

Built with 🚀 Astro 5, ⚡ Tailwind v4, ⚛️ React 19, and 🎨 Shadcn/UI by [ONE](https://one.ie)

**License:** MIT
