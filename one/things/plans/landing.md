# ONE Stack - Complete Feature List

## 🎯 Overview

**ONE Stack** is the most comprehensive Astro starter template with enterprise-grade authentication, real-time backend, and production-ready features. Built for developers who want to ship SaaS applications, blogs, dashboards, and modern web apps without building authentication from scratch.

## 🔐 Authentication System (6 Methods)

### 1. Email/Password Authentication
- ✅ Secure password hashing (SHA-256, upgradeable to bcrypt)
- ✅ Session management (30-day expiry)
- ✅ HttpOnly cookies for XSS protection
- ✅ Password strength indicator UI component
- ✅ User-friendly error messages
- ✅ Automatic session cleanup on password change
- 📍 **Pages**: `/signin`, `/signup`
- 📍 **Components**: `SimpleSignInForm.tsx`, `SimpleSignUpForm.tsx`, `PasswordStrengthIndicator.tsx`

### 2. OAuth Social Login (GitHub & Google)
- ✅ GitHub OAuth integration
- ✅ Google OAuth integration
- ✅ Automatic account creation on first OAuth login
- ✅ Seamless session management across providers
- ✅ OAuth state validation for security
- ✅ Beautiful social login buttons with icons
- 📍 **Pages**: `/signin`, `/signup`
- 📍 **Components**: `SocialLoginButtons.tsx`

### 3. Password Reset Flow
- ✅ Email-based password reset with secure tokens
- ✅ Reset links expire after 1 hour
- ✅ Email sending via Resend (@convex-dev/resend)
- ✅ Custom HTML email templates
- ✅ All existing sessions invalidated after password reset
- ✅ Rate limited (3 attempts per hour per email)
- 📍 **Pages**: `/forgot-password`, `/reset-password`
- 📍 **Components**: `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`
- 📍 **Convex**: `requestPasswordReset`, `resetPassword`, `validateResetToken`

### 4. Email Verification
- ✅ Automated verification emails on sign-up
- ✅ Verification tokens expire after 24 hours
- ✅ Email sending via Resend component
- ✅ Custom verification page with auto-verification
- ✅ Track verification status in user profile
- ✅ Beautiful email templates
- 📍 **Pages**: `/verify-email`
- 📍 **Components**: `VerifyEmailForm.tsx`
- 📍 **Convex**: `verifyEmail`, `isEmailVerified`, `createEmailVerificationToken`

### 5. Magic Links (Passwordless Authentication)
- ✅ One-click sign-in via email link
- ✅ 15-minute expiry for security
- ✅ One-time use only (token invalidated after use)
- ✅ Rate limited (3 per hour per email)
- ✅ No password required
- ✅ Beautiful magic link request form
- 📍 **Pages**: `/request-magic-link`, `/auth/magic-link`
- 📍 **Components**: `RequestMagicLinkForm.tsx`, `MagicLinkAuth.tsx`
- 📍 **Convex**: `requestMagicLink`, `signInWithMagicLink`, `createMagicLinkToken`

### 6. Two-Factor Authentication (TOTP)
- ✅ Google Authenticator, Authy, 1Password compatible
- ✅ QR code setup for easy configuration
- ✅ 10 backup codes for account recovery
- ✅ Client-side TOTP verification
- ✅ Password required to disable 2FA
- ✅ 30-second time window (standard TOTP)
- ✅ Enable/disable 2FA in settings
- 📍 **Pages**: `/settings` (2FA management)
- 📍 **Components**: `TwoFactorSettings.tsx`
- 📍 **Convex**: `setup2FA`, `verify2FA`, `disable2FA`, `get2FAStatus`

### 7. Rate Limiting & Security
- ✅ **Sign-in**: 5 attempts per 15 minutes (per email)
- ✅ **Sign-up**: 3 attempts per hour (per email)
- ✅ **Password reset**: 3 attempts per hour (per email)
- ✅ **Magic links**: 3 attempts per hour (per email)
- ✅ Powered by `@convex-dev/rate-limiter` component
- ✅ Prevents brute force attacks
- ✅ Automatic rate limit reset after time window
- 📍 **Convex**: `RateLimiter` in `auth.ts`

### 8. Session Management
- ✅ 30-day session expiry
- ✅ HttpOnly cookies (XSS protection)
- ✅ Automatic session cleanup on logout
- ✅ Session invalidation on password change
- ✅ Secure session tokens (256-bit random)
- ✅ Cross-page session persistence
- 📍 **Convex**: `sessions` table in `schema.ts`

## 🎨 UI Components (50+ shadcn/ui)

### Pre-installed Components
All shadcn/ui components are pre-configured and ready to use:

**Layout & Navigation:**
- ✅ Sidebar (with collapsible state)
- ✅ Navigation Menu
- ✅ Breadcrumb
- ✅ Tabs
- ✅ App Sidebar (dashboard)

**Forms & Inputs:**
- ✅ Button (with variants)
- ✅ Input
- ✅ Textarea
- ✅ Select
- ✅ Checkbox
- ✅ Radio Group
- ✅ Switch
- ✅ Slider
- ✅ Calendar
- ✅ Date Picker
- ✅ Input OTP (for 2FA codes)
- ✅ Form (with react-hook-form)

**Data Display:**
- ✅ Card
- ✅ Table (@tanstack/react-table)
- ✅ Badge
- ✅ Avatar
- ✅ Progress
- ✅ Chart (Recharts integration)
- ✅ Carousel
- ✅ Pagination
- ✅ Skeleton

**Feedback & Overlays:**
- ✅ Dialog
- ✅ Alert Dialog
- ✅ Sheet
- ✅ Drawer (vaul)
- ✅ Popover
- ✅ Tooltip
- ✅ Toast
- ✅ Sonner (toast notifications)
- ✅ Alert

**Interactive:**
- ✅ Accordion
- ✅ Collapsible
- ✅ Dropdown Menu
- ✅ Context Menu
- ✅ Menubar
- ✅ Hover Card
- ✅ Command (cmdk)
- ✅ Resizable Panels

**Specialized:**
- ✅ Scroll Area
- ✅ Separator
- ✅ Aspect Ratio
- ✅ Toggle
- ✅ Toggle Group

### Custom Components

**Authentication:**
- ✅ `AuthCard.tsx` - Wrapper for auth forms with consistent styling
- ✅ `SimpleSignInForm.tsx` - Sign in with email/password
- ✅ `SimpleSignUpForm.tsx` - Sign up with email/password
- ✅ `SocialLoginButtons.tsx` - GitHub & Google OAuth buttons
- ✅ `PasswordStrengthIndicator.tsx` - Visual password strength meter
- ✅ `ForgotPasswordForm.tsx` - Password reset request
- ✅ `ResetPasswordForm.tsx` - Password reset with token
- ✅ `VerifyEmailForm.tsx` - Email verification
- ✅ `MagicLinkAuth.tsx` - Magic link sign-in handler
- ✅ `RequestMagicLinkForm.tsx` - Request magic link
- ✅ `TwoFactorSettings.tsx` - 2FA setup & management

**Blog:**
- ✅ `BlogSearch.tsx` - Real-time blog post filtering
- ✅ `TableOfContents.tsx` - Auto-generated ToC with active tracking
- ✅ `ShareButtons.tsx` - Native Web Share API + social media

**Dashboard:**
- ✅ `DashboardLayout.tsx` - Dashboard wrapper with sidebar
- ✅ `AppSidebar.tsx` - Collapsible sidebar navigation
- ✅ `SiteHeader.tsx` - Dashboard header with user menu
- ✅ `NavUser.tsx` - User profile dropdown
- ✅ `NavMain.tsx` - Main navigation items
- ✅ `NavDocuments.tsx` - Documents navigation
- ✅ `NavSecondary.tsx` - Secondary navigation
- ✅ `SectionCards.tsx` - Dashboard section cards

**Mail Demo:**
- ✅ `MailLayout.tsx` - Gmail-style email UI
- ✅ `MailList.tsx` - Email list with filtering
- ✅ `MailDisplay.tsx` - Email detail view
- ✅ `AccountSwitcher.tsx` - Multi-account switcher
- ✅ `Nav.tsx` - Mail navigation
- ✅ `MobileSidebar.tsx` - Responsive sidebar

**Utilities:**
- ✅ `ModeToggle.tsx` - Dark/light theme switcher
- ✅ `ErrorBoundary.tsx` - React error boundary with alert UI
- ✅ `Chart.tsx` - Recharts wrapper
- ✅ `ConvexClientProvider.tsx` - Convex client context

## 📝 Blog System

### Core Features
- ✅ **Content Collections** - Type-safe blog posts with Zod validation
- ✅ **Multi-view Layouts** - List, 2-column, 3-column, 4-column grid views
- ✅ **View Switcher** - URL parameter-based view switching (`?view=grid&columns=3`)
- ✅ **Real-time Search** - Instant filtering by title and description
- ✅ **Table of Contents** - Auto-generated from markdown headings with IntersectionObserver tracking
- ✅ **Social Sharing** - Native Web Share API + Twitter, Facebook, LinkedIn buttons
- ✅ **RSS Feed** - Auto-generated at `/rss.xml` with all blog posts
- ✅ **Reading Time** - Automatic reading time calculation
- ✅ **Featured Posts** - Highlight important posts
- ✅ **Draft Posts** - Hide posts from production
- 📍 **Pages**: `/blog`, `/blog/[slug]`

### Blog Schema
```typescript
{
  title: string,
  description: string,
  date: Date,
  draft?: boolean,
  image?: string,
  author: string (default: 'ONE'),
  tags: string[] (default: []),
  category: 'tutorial' | 'news' | 'guide' | 'review' | 'article' (default: 'article'),
  readingTime?: number,
  featured: boolean (default: false)
}
```

### Blog Features Breakdown
- ✅ **Search**: Real-time client-side filtering with zero latency
- ✅ **Categories**: Tutorial, News, Guide, Review, Article
- ✅ **Tags**: Unlimited tags per post with filtering
- ✅ **Images**: Lazy loading with responsive optimization
- ✅ **Markdown**: Full markdown support with syntax highlighting
- ✅ **SEO**: Open Graph tags, Twitter Cards, canonical URLs
- ✅ **Accessibility**: Proper heading hierarchy, alt text, keyboard navigation

## 🌐 Deployment

### Cloudflare Pages with React 19 SSR
**The "Impossible" Achievement 🎉**

This template successfully deploys **Astro 5 + React 19** with full server-side rendering on **Cloudflare Pages** - something previously considered impossible due to React 19's `MessageChannel` requirement in Cloudflare Workers runtime.

**How We Solved It:**
```javascript
// astro.config.mjs
vite: {
  resolve: {
    alias: {
      'react-dom/server': 'react-dom/server.edge',
    },
  },
}
```

**Why This Works:**
- React 19's default `react-dom/server` uses `MessageChannel` (not available in Cloudflare Workers)
- `react-dom/server.edge` is designed for edge runtimes with Web Streams support
- The Vite alias tells the bundler to use the edge-compatible version
- Result: Full React 19 SSR on Cloudflare's global edge network ⚡

**Deployment Features:**
- ✅ Global CDN with sub-100ms response times
- ✅ Automatic HTTPS
- ✅ Zero-config deployments
- ✅ Edge SSR (server-side rendering at the edge)
- ✅ Environment variables
- ✅ Cloudflare KV for session storage
- ✅ Cloudflare Workers compatibility
- ✅ `wrangler` CLI integration

**Deploy Command:**
```bash
bun run build
wrangler pages deploy dist --project-name=one-stack --commit-dirty=true
```

## 🎯 SEO & Performance

### SEO Features
- ✅ **Meta Tags** - Open Graph, Twitter Cards
- ✅ **Canonical URLs** - Prevent duplicate content
- ✅ **Sitemap** - Auto-generated with `@astrojs/sitemap`
- ✅ **RSS Feed** - `/rss.xml` for blog posts
- ✅ **Robots.txt** - Search engine crawling rules
- ✅ **Image Optimization** - Astro's built-in Image component
- ✅ **Lazy Loading** - Images load on scroll
- ✅ **Alt Text** - All images have descriptive alt text
- ✅ **Semantic HTML** - Proper heading hierarchy and landmarks

### Performance Features
- ✅ **Islands Architecture** - Only interactive components hydrate
- ✅ **Minimal JavaScript** - ~30KB gzipped for the entire site
- ✅ **CSS-First** - Tailwind v4 with zero runtime overhead
- ✅ **Static Generation** - Pre-rendered pages for instant loads
- ✅ **Smart Bundling** - Code splitting and tree shaking
- ✅ **Image Optimization** - Automatic WebP conversion
- ✅ **Font Optimization** - Preloading and swap strategies
- ✅ **Critical CSS** - Inlined critical styles

### Lighthouse Scores
**Perfect 100/100 across all metrics:**
- 🚀 Performance: 100
- ♿ Accessibility: 100
- 🔧 Best Practices: 100
- 🔍 SEO: 100

## ♿ Accessibility

### WCAG 2.1 AA Compliant
- ✅ **Skip to Content** - Keyboard-accessible skip link
- ✅ **ARIA Labels** - Proper semantic markup throughout
- ✅ **Focus Indicators** - Visible focus states on all interactive elements
- ✅ **Screen Reader Support** - Tested with VoiceOver and NVDA
- ✅ **Keyboard Navigation** - Fully navigable without a mouse
- ✅ **Color Contrast** - WCAG AA compliant contrast ratios
- ✅ **Heading Hierarchy** - Proper h1-h6 structure
- ✅ **Alt Text** - All images have descriptive alt text
- ✅ **Form Labels** - All inputs have associated labels
- ✅ **Error Messages** - Clear, descriptive error messages

## 🎨 Styling

### Tailwind CSS v4
- ✅ **Modern CSS-based config** - No JavaScript config file
- ✅ **`@theme` blocks** - Define theme in CSS
- ✅ **Dark Mode** - Class-based dark mode with `@variant dark`
- ✅ **HSL Colors** - All colors use HSL format for better manipulation
- ✅ **Semantic Colors** - Background, foreground, primary, secondary, etc.
- ✅ **No FOUC** - Theme initialized before page render
- ✅ **localStorage persistence** - Theme preference saved
- ✅ **Typography Plugin** - `@tailwindcss/typography` for prose styles

### Dark Mode
- ✅ **Class-based** - `.dark` class on `<html>` element
- ✅ **No Flash** - `ThemeInit.astro` prevents FOUC
- ✅ **localStorage** - Preference persisted across sessions
- ✅ **System Preference** - Respects OS dark mode setting
- ✅ **Toggle Component** - Beautiful theme switcher UI
- ✅ **All Components** - Every component supports dark mode

## 🛠️ Developer Experience

### TypeScript
- ✅ **Strict Mode** - Full type safety with no implicit any
- ✅ **Path Aliases** - Clean imports with `@/` prefix
- ✅ **Type Generation** - Auto-generated types for content collections
- ✅ **Convex Types** - Fully typed database schema and functions
- ✅ **React 19 Types** - Latest React types

### Code Quality
- ✅ **ESLint** - Pre-configured with TypeScript and Astro rules
- ✅ **Prettier** - Code formatting with Astro plugin
- ✅ **VS Code Settings** - Optimized workspace configuration
- ✅ **Git Hooks** - Pre-commit linting (optional)
- ✅ **Type Checking** - `bunx astro check` for full type safety

### Hot Reload
- ✅ **Fast Refresh** - Instant updates during development
- ✅ **HMR** - Hot module replacement for React components
- ✅ **Content Updates** - Blog posts update without full reload

## 🤖 MCP Integration (Model Context Protocol)

ONE Stack includes **3 pre-configured MCP servers** for AI-assisted development with Claude Code and other AI assistants.

### What are MCPs?
Model Context Protocol enables AI assistants to interact with external tools and services. This means your AI assistant can automatically:
- Install and configure components
- Deploy your application
- Access real-time documentation
- Troubleshoot issues

### Configured MCP Servers

#### 1. shadcn MCP - Component Management
**Command:** `npx shadcn@latest mcp`

**Features:**
- 🔍 Search and discover shadcn/ui components
- 📥 Add new components automatically
- 📖 View documentation and examples
- 🎨 Get usage patterns and best practices

**Example Usage:**
```
You: "Add the data-table component"
Claude: [Uses MCP to search, install, and show you examples]
```

#### 2. Cloudflare Builds MCP - Deployment Automation
**Command:** `npx mcp-remote https://builds.mcp.cloudflare.com/sse`

**Features:**
- 🚀 Monitor deployment status in real-time
- 📊 View build logs and analytics
- 🔄 Trigger new deployments
- ⚙️ Manage environment variables

**Example Usage:**
```
You: "Deploy to production and show me the logs"
Claude: [Uses MCP to deploy and monitor progress]
```

#### 3. Cloudflare Docs MCP - Documentation Access
**Command:** `npx mcp-remote https://docs.mcp.cloudflare.com/sse`

**Features:**
- 📚 Search Cloudflare documentation
- 💡 Get code examples for Workers, Pages, KV, R2
- 🔧 Access API references
- 📖 Learn deployment best practices

**Example Usage:**
```
You: "How do I set up KV storage for sessions?"
Claude: [Uses MCP to fetch relevant docs and provide examples]
```

### Configuration File

The `.mcp.json` file in the project root:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "cloudflare-builds": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://builds.mcp.cloudflare.com/sse"]
    },
    "cloudflare-docs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://docs.mcp.cloudflare.com/sse"]
    }
  }
}
```

### Benefits of MCP Integration

1. ⚡ **Faster Development** - AI can install and configure components automatically
2. 🎯 **Better Context** - Access to real-time docs and examples
3. 🚀 **Deployment Automation** - Deploy directly from conversation
4. 🐛 **Easier Troubleshooting** - AI has access to latest documentation
5. 📚 **Continuous Learning** - AI teaches you best practices from official docs
6. 🔄 **Streamlined Workflow** - Fewer context switches, more productivity

### Popular Additional MCPs

You can extend the `.mcp.json` with these popular MCPs:

- **GitHub MCP** - Repository management and PR creation
- **Figma MCP** - Design file access and component extraction
- **Postgres MCP** - Database queries and schema management
- **Stripe MCP** - Payment integration and testing
- **Sentry MCP** - Error tracking and monitoring

### Getting Started with MCPs

MCPs work automatically when using Claude Code or other MCP-compatible AI assistants. **No additional setup required!**

Just ask your AI assistant to:
- "Add the calendar component from shadcn"
- "Deploy this to Cloudflare Pages"
- "Show me Cloudflare Workers documentation for handling POST requests"

The MCP system handles the rest!

## 📊 Database (Convex)

### Schema
```typescript
// users - User accounts
{
  email: string,
  passwordHash: string,
  name?: string,
  emailVerified: boolean,
  createdAt: number
}

// sessions - User sessions
{
  userId: Id<"users">,
  token: string,
  expiresAt: number,
  createdAt: number
}

// passwordResets - Password reset tokens
{
  userId: Id<"users">,
  token: string,
  expiresAt: number,
  createdAt: number,
  used: boolean
}

// emailVerifications - Email verification tokens
{
  userId: Id<"users">,
  email: string,
  token: string,
  expiresAt: number,
  createdAt: number,
  verified: boolean
}

// magicLinks - Magic link tokens
{
  email: string,
  token: string,
  expiresAt: number,
  createdAt: number,
  used: boolean
}

// twoFactorAuth - 2FA settings
{
  userId: Id<"users">,
  secret: string,
  backupCodes: string[],
  enabled: boolean,
  createdAt: number
}
```

### Convex Features
- ✅ **Real-time Subscriptions** - Automatic UI updates when data changes
- ✅ **Typed Functions** - Full TypeScript support
- ✅ **Auto-generated API** - No manual API routes needed
- ✅ **Mutations** - Transactional writes to database
- ✅ **Queries** - Reactive reads from database
- ✅ **Actions** - Non-reactive operations (emails, external APIs)
- ✅ **Scheduled Functions** - Run functions on a schedule
- ✅ **File Storage** - Built-in file upload/download

### Convex Components
- ✅ **@convex-dev/resend** - Email sending component
- ✅ **@convex-dev/rate-limiter** - Rate limiting component
- ✅ **@convex-dev/better-auth** - Authentication integration

## 📧 Email System

### Resend Integration
- ✅ **@convex-dev/resend** - Convex component for email
- ✅ **Password Reset Emails** - Custom HTML templates
- ✅ **Email Verification** - Welcome emails with verification links
- ✅ **Magic Link Emails** - Passwordless login emails
- ✅ **Email Tracking** - Track sent emails
- ✅ **Custom Templates** - Beautiful HTML email templates
- ✅ **Environment Variables** - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

### Email Types
1. **Password Reset** - Sent when user requests password reset
2. **Email Verification** - Sent on sign-up to verify email
3. **Magic Link** - Sent for passwordless authentication

## 🔒 Security Features

### Implemented
- ✅ **HttpOnly Cookies** - Prevent XSS attacks
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Secure Password Hashing** - SHA-256 (upgradeable to bcrypt)
- ✅ **Email Verification** - Prevent spam accounts
- ✅ **OAuth State Validation** - Prevent CSRF attacks
- ✅ **Token Expiry** - Sessions: 30 days, Reset: 1 hour, Verification: 24 hours
- ✅ **One-time Tokens** - Password reset and magic link tokens can only be used once
- ✅ **Session Cleanup** - Automatic cleanup on logout and password change
- ✅ **HTTPS** - Automatic with Cloudflare Pages

### Production Recommendations
- ⚠️ Upgrade from SHA-256 to bcrypt for password hashing
- ⚠️ Implement CAPTCHA for sign-up forms
- ⚠️ Monitor authentication logs
- ⚠️ Implement account lockout after repeated failures
- ⚠️ Add email notification for suspicious activity
- ⚠️ Implement IP-based rate limiting

## 🎯 Use Cases

Perfect for:
- 📝 **SaaS Applications** - Full authentication and user management out of the box
- 🎨 **Blogs & Documentation** - Advanced blog system with search and SEO
- 🚀 **Landing Pages** - Beautiful components and dark mode
- 📊 **Dashboards** - Pre-built dashboard components and layouts
- 🛍️ **E-commerce** - Product catalogs with shadcn/ui components
- 📱 **Progressive Web Apps** - Fast, installable web apps
- 🎓 **Educational Platforms** - Content collections and user accounts
- 💼 **Portfolios** - Showcase projects with beautiful UI

## 🚀 Getting Started

### Quick Start
```bash
# Clone the repository
git clone https://github.com/one-ie/stack.git
cd stack

# Install dependencies (bun recommended)
bun install

# Set up environment variables
cp .env.example .env.local
# Add your Convex, GitHub OAuth, Google OAuth, and Resend credentials

# Deploy Convex schema
bunx convex deploy

# Start development server
bun run dev
```

Visit `http://localhost:4321` - You're ready to go! 🎉

### Environment Variables
```bash
# Convex
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4321

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 📦 What's Included Out of the Box

### Authentication Pages
- ✅ `/signin` - Sign in page
- ✅ `/signup` - Sign up page
- ✅ `/forgot-password` - Password reset request
- ✅ `/reset-password` - Password reset with token
- ✅ `/verify-email` - Email verification
- ✅ `/request-magic-link` - Magic link request
- ✅ `/auth/magic-link` - Magic link handler
- ✅ `/settings` - User settings (2FA management)
- ✅ `/dashboard` - Protected dashboard example

### Content Pages
- ✅ `/` - Homepage
- ✅ `/blog` - Blog index with search
- ✅ `/blog/[slug]` - Dynamic blog posts
- ✅ `/rss.xml` - RSS feed
- ✅ `/404` - Custom 404 page

### Demo Pages
- ✅ `/mail` - Gmail-style email UI demo
- ✅ `/readme` - Project documentation viewer
- ✅ `/install` - Installation guide

## 📚 Documentation

### Project Documentation
- **CLAUDE.md** - Complete AI assistant instructions (41 documentation files)
- **README.md** - This file (getting started, features, deployment)
- **CONVEX_SETUP_INSTRUCTIONS.md** - Convex setup guide
- **docs/** - 41 comprehensive documentation files covering:
  - Architecture & Strategy
  - Development workflows
  - Ontology & data models
  - Protocol specifications
  - Service layers
  - Frontend patterns
  - Deployment guides

### External Resources
- [Astro Documentation](https://docs.astro.build)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components/accordion)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Better Auth](https://www.better-auth.com)
- [React 19](https://react.dev)

## 🎉 What Makes ONE Stack Special

### 1. Most Comprehensive Authentication
**6 authentication methods** implemented and production-ready:
- Email/password, OAuth (GitHub/Google), password reset, email verification, magic links, 2FA

### 2. React 19 on Cloudflare Pages
**The "impossible" achievement** - Full React 19 SSR on Cloudflare Workers using `react-dom/server.edge`

### 3. 50+ Pre-installed Components
**Complete shadcn/ui library** ready to use with beautiful examples and demos

### 4. Real-time Backend
**Convex** provides real-time subscriptions, typed functions, and zero-config API

### 5. Perfect Lighthouse Scores
**100/100 across all metrics** - Performance, Accessibility, Best Practices, SEO

### 6. Production-Ready Security
**Rate limiting**, session management, HttpOnly cookies, email verification, 2FA

### 7. Advanced Blog System
**Multi-view layouts**, real-time search, ToC, social sharing, RSS feed

### 8. Enterprise-Grade Code Quality
**TypeScript strict mode**, ESLint, Prettier, path aliases, comprehensive docs

---

**Built with 🚀 Astro 5, ⚡ Tailwind v4, ⚛️ React 19, 🎨 shadcn/ui, 🔐 Better Auth, and 📊 Convex by [ONE](https://one.ie)**

**License:** MIT
