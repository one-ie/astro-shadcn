# 🚀 Astro 5 + Shadcn/UI + Tailwind v4 Starter Kit

A production-ready, enterprise-grade starter template combining Astro's performance with Shadcn's beautiful components and Tailwind CSS v4's modern CSS-based configuration. Featuring advanced blog system, search, accessibility, and SEO optimizations.

## ✨ What's Inside

### 🏗️ Architecture (The Beautiful Separation)

Three-layer architecture with **Effect.ts as the glue**:

```
Frontend (Astro + React) → Effect.ts Services → Backend (Hono + Convex)
```

**Frontend Layer** ([docs/Frontend.md](./docs/Frontend.md)):
- **Astro 5.14+** - Lightning-fast SSR with islands architecture
- **React 19** - Edge-compatible server rendering
- **shadcn/ui** - 50+ pre-installed components
- **Tailwind CSS v4** - Modern CSS-based configuration
- **Content Collections** - Type-safe blog with astro:content

**Backend Layer** ([docs/Hono.md](./docs/Hono.md)):
- **Hono API** - Lightweight REST API on Cloudflare Workers
- **Convex** - Real-time database with typed functions
- **Better Auth** - Authentication with Convex adapter
- **4-Table Ontology** - entities, connections, events, tags

**Glue Layer (Effect.ts 100%)** ([docs/Architecture.md](./docs/Architecture.md)):
- **Effect.ts** - ALL business logic (pure functional programming)
- **Service Providers** - External APIs (OpenAI, Stripe, Blockchain, etc.)
- **Typed Errors** - Explicit error handling throughout
- **Dependency Injection** - Automatic wiring of services

### 🎯 Key Features

- **Complete Auth System** - Email/password, OAuth (GitHub/Google), password reset, email verification, magic links, 2FA
- **Rate Limiting** - Brute force protection with configurable limits
- **Email Integration** - @convex-dev/resend for transactional emails
- **Dark Mode** - Beautiful theme switching with no FOUC
- **Blog System** - Full-featured with search, tags, categories, ToC
- **SEO Optimized** - Sitemap, RSS feed, OG tags, canonical URLs
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation
- **100/100 Lighthouse** - Perfect performance scores
- **TypeScript 5.9+** - Full type safety with strict mode
- **Cloudflare Deployment** - Global edge network with full SSR support

### 🎨 Screenshots

![Astro Shadcn UI](https://astro-shadcn.one.ie/screenshots/screenshot.png)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/one-ie/astro-shadcn.git

# Navigate to project
cd astro-shadcn

# Install dependencies (using bun recommended)
bun install

# Start development server
bun run dev

# Or with pnpm/npm
pnpm install && pnpm dev
npm install && npm run dev
```

Visit `http://localhost:4321` - You're ready to go! 🎉

## 🌐 Live Demo

Check out the live deployment on Cloudflare Pages:
- **Main**: [https://6f06e33b.astro-shadcn-4lu.pages.dev](https://6f06e33b.astro-shadcn-4lu.pages.dev)
- **Alias**: [https://convex.astro-shadcn-4lu.pages.dev](https://convex.astro-shadcn-4lu.pages.dev)

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
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Deployment
wrangler pages deploy dist --project-name=astro-shadcn --commit-dirty=true

# Code Quality
bun run lint             # Lint code with ESLint
bun run format           # Format with Prettier

# Type Checking
bunx astro check         # TypeScript type checking
bunx astro sync          # Sync content collection types
```

## 🌍 Deployment to Cloudflare Pages

### The "Impossible" Achievement 🎉

This project successfully deploys **Astro 5 + React 19** with full server-side rendering on **Cloudflare Pages** - something previously considered impossible due to React 19's `MessageChannel` requirement in Cloudflare Workers runtime.

### The Solution

We solved the compatibility issue by configuring Vite to use `react-dom/server.edge` instead of the default `react-dom/server`:

```javascript
// astro.config.mjs
export default defineConfig({
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
- React 19's default SSR uses `MessageChannel` (unavailable in Cloudflare Workers)
- `react-dom/server.edge` is designed for edge runtimes with Web Streams
- The Vite alias redirects imports to the edge-compatible version
- Result: Full React 19 SSR on Cloudflare's global edge network ⚡

### Deployment Steps

1. **Build the project:**
   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare Pages:**
   ```bash
   wrangler pages deploy dist --project-name=astro-shadcn --commit-dirty=true
   ```

3. **Set up environment variables** in Cloudflare Pages dashboard:
   ```bash
   CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_DEPLOYMENT=your-deployment-name
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=https://your-domain.com
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=your-from-email@yourdomain.com
   ```

4. **Configure Cloudflare KV** for session storage:
   - Create a KV namespace in Cloudflare dashboard
   - Bind it to your Pages project with name `SESSION`

### Configuration Files

- `astro.config.mjs` - Astro + Cloudflare adapter configuration
- `wrangler.toml` - Cloudflare Workers configuration
- `.mcp.json` - MCP servers for Cloudflare, Convex, and shadcn integrations

## 🔐 Authentication System

A complete, production-ready authentication system powered by **Convex** backend and **Better Auth** React client with enterprise-grade security features.

### 🎯 Authentication Features

#### ✅ Email/Password Authentication
- Secure password hashing with SHA-256 (upgrade to bcrypt for production)
- Session management with 30-day expiry
- HttpOnly cookies for security
- Password strength indicator
- Comprehensive error handling with user-friendly messages

#### ✅ OAuth Social Login
- **GitHub OAuth** - Sign in with GitHub
- **Google OAuth** - Sign in with Google
- Automatic account creation on first OAuth login
- Seamless session management across providers

#### ✅ Password Reset Flow
- Email-based password reset with secure tokens
- Reset links expire after 1 hour
- Email sending via Resend (@convex-dev/resend)
- Custom email templates
- All existing sessions invalidated after password reset

#### ✅ Email Verification
- Automated verification emails on sign-up
- Verification tokens expire after 24 hours
- Email sending via Resend component
- Custom verification page with auto-verification
- Track verification status in user profile

#### ✅ Rate Limiting & Security
- **Sign-in**: 5 attempts per 15 minutes (per email)
- **Sign-up**: 3 attempts per hour (per email)
- **Password reset**: 3 attempts per hour (per email)
- Powered by `@convex-dev/rate-limiter` component
- Prevents brute force attacks

### 🏗️ Architecture

**Hybrid Better Auth + Convex Setup:**

```
Frontend (Better Auth React) ←→ API Bridge (/api/auth/[...all]) ←→ Convex Mutations
                                                                      ↓
                                                           Custom Auth Logic
```

**Key Files:**
- `convex/auth.ts` - Custom auth mutations (signUp, signIn, OAuth, password reset, email verification)
- `convex/schema.ts` - Database schema (users, sessions, passwordResets, emailVerifications)
- `src/lib/auth-client.ts` - Better Auth React client configuration
- `src/pages/api/auth/[...all].ts` - API bridge connecting Better Auth UI to Convex backend
- `src/pages/api/auth/github/callback.ts` - GitHub OAuth callback handler
- `src/pages/api/auth/google/callback.ts` - Google OAuth callback handler

### 🚀 Authentication Pages

- `/signin` - Sign in with email/password or OAuth
- `/signup` - Create account with email/password or OAuth
- `/forgot-password` - Request password reset email
- `/reset-password` - Reset password with token
- `/verify-email` - Email verification with auto-verify
- `/dashboard` - Protected route example

### 🔧 Setting Up Authentication

1. **Configure OAuth Apps:**

   **GitHub OAuth:**
   - Create OAuth App at https://github.com/settings/developers
   - Set callback URL: `https://your-domain.com/api/auth/github/callback`
   - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`

   **Google OAuth:**
   - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Set callback URL: `https://your-domain.com/api/auth/google/callback`
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

2. **Configure Resend for Emails:**
   ```bash
   # Get API key from https://resend.com
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Set Auth Secrets:**
   ```bash
   BETTER_AUTH_SECRET=your-random-secret-key-here
   BETTER_AUTH_URL=https://your-domain.com  # or http://localhost:4321 for dev
   ```

4. **Deploy Convex Schema:**
   ```bash
   bunx convex deploy
   ```

### 💡 Usage Examples

**Check if user is authenticated:**
```typescript
// In Astro component
const token = Astro.cookies.get("auth_token")?.value;
const user = token ? await convex.query(api.auth.getCurrentUser, { token }) : null;

if (!user) {
  return Astro.redirect("/signin");
}
```

**Sign out:**
```typescript
import { authClient } from "@/lib/auth-client";

await authClient.signOut();
window.location.href = "/";
```

**Enable email verification on sign-up:**
```typescript
// Update SimpleSignUpForm.tsx
const result = await authClient.signUp.email({
  email,
  password,
  name,
  sendVerificationEmail: true,
  baseUrl: window.location.origin,
});
```

### 🔒 Security Best Practices

✅ **Implemented:**
- HttpOnly cookies prevent XSS attacks
- Rate limiting prevents brute force
- Secure password hashing
- Email verification prevents spam accounts
- OAuth state validation
- Token expiry (sessions: 30 days, reset: 1 hour, verification: 24 hours)

⚠️ **Production Recommendations:**
- Upgrade from SHA-256 to bcrypt for password hashing
- Enable HTTPS in production (automatic with Cloudflare Pages)
- Implement 2FA (TOTP) for sensitive accounts
- Add CAPTCHA for sign-up forms
- Monitor authentication logs
- Implement account lockout after repeated failures

#### ✅ Magic Links (Passwordless Authentication)
- One-click sign-in via email link
- 15-minute expiry for security
- One-time use only
- Rate limited (3 per hour)
- No password required

#### ✅ Two-Factor Authentication (TOTP)
- Google Authenticator, Authy, 1Password compatible
- QR code setup for easy configuration
- 10 backup codes for account recovery
- Client-side TOTP verification
- Password required to disable
- 30-second time window

### 📋 Remaining Auth Features

The following features are documented in `plans/NEXT-FEATURES.md`:

- **Passkeys (WebAuthn)** - Modern biometric authentication (Touch ID, Face ID)

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

- 🎉 **Cloudflare SSR** - React 19 SSR on Cloudflare Pages (previously impossible!)
- ✅ **Convex Integration** - Real-time backend with authentication
- ✅ **Complete Auth System** - 6 authentication methods implemented
- ✅ **Better Auth** - GitHub & Google OAuth with session management
- ✅ **Email Verification** - Automated email verification with 24-hour tokens
- ✅ **Rate Limiting** - Brute force protection (5 login attempts per 15 min)
- ✅ **Magic Links** - Passwordless authentication via email
- ✅ **Two-Factor Auth** - TOTP with Google Authenticator, Authy, 1Password
- ✅ **Email Component** - @convex-dev/resend for password reset and transactional emails
- ✅ **Edge Rendering** - Global CDN with sub-100ms response times
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
