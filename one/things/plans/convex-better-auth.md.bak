# Adding Convex, Better Auth, and Better Auth UI to Your Astro Project

**This guide shows you exactly what to add to your existing Astro project** that already has React 19, Tailwind CSS 4.x, and shadcn/ui configured. You'll integrate a fresh Convex database backend with Better Auth for complete authentication (GitHub OAuth, Google OAuth, and email/password) using Better Auth UI's pre-built components.

## 🎯 Implementation Status: Hybrid Approach

This project uses a **hybrid authentication system** that combines:
- **Custom Convex Backend**: Custom authentication mutations and queries for flexibility
- **Better Auth UI Frontend**: Beautiful, pre-built React components for the user interface

### ✅ What's Implemented

#### Custom Convex Authentication Backend
- ✅ Convex database with custom schema (`users` and `sessions` tables)
- ✅ Custom auth mutations: `signUp`, `signIn`, `signOut`, `signInWithOAuth`
- ✅ Token-based session management with 30-day expiry
- ✅ SHA-256 password hashing (upgrade to bcrypt recommended for production)
- ✅ Secure httpOnly cookies for session tokens
- ✅ GitHub OAuth integration with custom handlers
- ✅ Google OAuth integration with custom handlers

#### Better Auth UI Integration
- ✅ Better Auth UI components library installed
- ✅ `AuthView` component for unified sign-in/sign-up experience
- ✅ `UserButton` component with dropdown menu
- ✅ `SettingsCards` component for account management
- ✅ `AuthUIProvider` wrapper for Better Auth UI configuration
- ✅ Better Auth UI styles integrated with shadcn/ui theme
- ✅ API bridge (`/api/auth/[...all].ts`) connecting UI to custom backend

#### Authentication Flow
- ✅ `/auth` - Unified authentication page with AuthView
- ✅ `/dashboard` - Protected route example with UserButton
- ✅ `/settings` - Account settings with SettingsCards
- ✅ Middleware for authentication checking on every request
- ✅ OAuth callback handlers for GitHub and Google
- ✅ Server-side cookie management for security

### 📁 Key Files

**Frontend Components:**
- `src/components/AuthUIProvider.tsx` - Better Auth UI configuration wrapper
- `src/components/UserButton.tsx` - User button with Better Auth UI
- `src/lib/auth-client.ts` - Better Auth client for UI components
- `src/pages/auth.astro` - Unified authentication page
- `src/pages/settings.astro` - Account settings page
- `src/pages/dashboard.astro` - Example protected page

**Backend/API:**
- `convex/schema.ts` - Database schema (users, sessions)
- `convex/auth.ts` - Custom authentication mutations and queries
- `src/pages/api/auth/[...all].ts` - API bridge for Better Auth UI
- `src/pages/api/auth/github.ts` & `github/callback.ts` - GitHub OAuth
- `src/pages/api/auth/google.ts` & `google/callback.ts` - Google OAuth
- `src/pages/api/auth/set-cookie.ts` - Secure cookie setter
- `src/middleware.ts` - Authentication middleware

### 🎨 Features

- **Email/Password Authentication**: Custom implementation with validation
- **OAuth (GitHub & Google)**: Full OAuth 2.0 flow with account linking
- **Session Management**: Token-based with secure httpOnly cookies
- **Protected Routes**: Middleware-based authentication checks
- **Beautiful UI**: Better Auth UI components with shadcn/ui theming
- **Account Settings**: Profile management, password changes, session viewing
- **Responsive Design**: Mobile-friendly authentication flows

### 🚀 Why This Hybrid Approach?

1. **Flexibility**: Custom backend allows full control over auth logic
2. **Beautiful UI**: Better Auth UI provides production-ready components
3. **Type Safety**: Convex provides end-to-end TypeScript safety
4. **Performance**: Lightweight custom backend with no unnecessary dependencies
5. **Maintainability**: Separation of concerns between backend logic and UI

### 📝 Quick Start

1. **Authentication Page**: Visit `/auth` for sign-in/sign-up
2. **Dashboard**: Visit `/dashboard` (requires authentication)
3. **Settings**: Visit `/settings` to manage your account
4. **OAuth**: Click GitHub or Google buttons on auth page

---

# Full Implementation Guide (Original Better Auth Component Approach)

The sections below describe the full Better Auth component integration. Our current implementation uses a hybrid approach (described above) that combines custom Convex auth with Better Auth UI components.

## Prerequisites check

Before starting, confirm your existing project has:
- ✅ Astro with React 19 integration configured
- ✅ Tailwind CSS 4.x working
- ✅ shadcn/ui components installed with CSS variables enabled
- ✅ SSR or hybrid mode enabled (required for auth middleware)

## Step 1: Install required packages

Install the authentication and database packages you'll need:

```bash
npm install better-auth @daveyplate/better-auth-ui @convex-dev/better-auth convex@latest
```

**What these do:**
- `better-auth` - Core authentication library (v1.3.23)
- `@daveyplate/better-auth-ui` - Pre-built React auth UI components (v3.2.5)
- `@convex-dev/better-auth` - Official Convex component for Better Auth (v0.8.6)
- `convex` - Convex backend client library

## Step 2: Initialize Convex

Create your Convex project and start the development server:

```bash
npx convex dev
```

This command creates the Convex configuration files and starts a local dev server. Keep it running in a separate terminal—it auto-generates TypeScript types as you work.

**Files created:**
- `convex/` directory for backend functions
- `.env.local` with your `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`

## Step 3: Configure Astro for SSR

Authentication middleware requires server-side rendering. Update your Astro config:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node' // or vercel, netlify, cloudflare

export default defineConfig({
  output: 'server', // Changed from 'static'
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react()
  ]
})
```

Install your adapter if not already present:

```bash
npm install @astrojs/node
# or: npm install @astrojs/vercel
# or: npm install @astrojs/netlify
```

## Step 4: Register Convex Better Auth component

Create the Convex configuration file to register the Better Auth component:

```typescript
// convex.config.ts
import { defineApp } from "convex/server"
import betterAuth from "@convex-dev/better-auth/convex.config"

const app = defineApp()
app.use(betterAuth)

export default app
```

Configure the auth provider:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
}
```

## Step 5: Set up OAuth providers

### Create GitHub OAuth App

Navigate to https://github.com/settings/developers and click "New OAuth App":

1. **Application name**: Your app name
2. **Homepage URL**: `http://localhost:4321` (Astro default)
3. **Authorization callback URL**: `http://localhost:4321/api/auth/callback/github`
4. Click "Register application"
5. Generate a client secret and **save both Client ID and Client Secret immediately**

**For production**, create a separate OAuth app with your production domain:
- Callback URL: `https://yourdomain.com/api/auth/callback/github`

### Create Google OAuth Credentials

Navigate to https://console.cloud.google.com/

1. **Create or select a project**
2. **Configure OAuth consent screen** (required first):
   - Go to: APIs & Services → OAuth consent screen
   - Select "External" user type
   - Fill in app name, user support email, developer email
   - Add scopes: `openid`, `email`, `profile`
   - Add test users (for development)
   - Save and continue

3. **Create credentials**:
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - **Authorized redirect URIs**:
     - Add: `http://localhost:4321/api/auth/callback/google`
     - Add: `https://yourdomain.com/api/auth/callback/google` (production)
   - Click "Create"
   - **Save Client ID and Client Secret immediately**

## Step 6: Configure environment variables

Set your Convex environment variables (these go in the Convex dashboard, not your .env file):

```bash
# Generate and set Better Auth secret
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Set your site URL
npx convex env set SITE_URL http://localhost:4321

# Add OAuth credentials
npx convex env set GITHUB_CLIENT_ID your_github_client_id
npx convex env set GITHUB_CLIENT_SECRET your_github_client_secret
npx convex env set GOOGLE_CLIENT_ID your_google_client_id
npx convex env set GOOGLE_CLIENT_SECRET your_google_client_secret
```

For production, add the `--prod` flag:

```bash
npx convex env set BETTER_AUTH_SECRET your_production_secret --prod
npx convex env set SITE_URL https://yourdomain.com --prod
# ... repeat for other vars
```

Your `.env.local` should already have (auto-created by `npx convex dev`):

```bash
CONVEX_DEPLOYMENT=dev:adjective-animal-123
NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud
```

## Step 7: Create Better Auth server instance

This file configures Better Auth on the Convex backend:

```typescript
// convex/auth.ts
import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { components } from "./_generated/api"
import { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import { betterAuth } from "better-auth"

const siteUrl = process.env.SITE_URL!

// Component client for Convex + Better Auth integration
export const authComponent = createClient<DataModel>(components.betterAuth)

// Create Better Auth instance with Convex adapter
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    logger: { disabled: optionsOnly },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    
    // Email and password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    
    // OAuth providers
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline", // Get refresh tokens
        prompt: "select_account", // Allow account selection
      },
    },
    
    // REQUIRED: Convex plugin for compatibility
    plugins: [convex()],
  })
}

// Example query to get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx)
  },
})
```

**Important note**: You'll see TypeScript errors until you save this file and Convex generates the types. Keep `npx convex dev` running.

## Step 8: Register HTTP routes

Create the Convex HTTP router to handle Better Auth API endpoints:

```typescript
// convex/http.ts
import { httpRouter } from "convex/server"
import { authComponent, createAuth } from "./auth"

const http = httpRouter()

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth)

export default http
```

## Step 9: Create auth API route handler

Astro needs an API route to proxy auth requests to Convex. Create a catch-all route:

```typescript
// src/pages/api/auth/[...all].ts
import type { APIRoute } from "astro"

export const prerender = false // Disable static generation

export const ALL: APIRoute = async ({ request }) => {
  const convexUrl = import.meta.env.NEXT_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
  
  // Forward auth requests to Convex
  const url = new URL(request.url)
  const convexAuthUrl = `${convexUrl}/api/auth${url.pathname.replace('/api/auth', '')}`
  
  return fetch(convexAuthUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: 'half'
  } as RequestInit)
}
```

## Step 10: Create Better Auth client

Set up the client-side auth instance:

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react"
import { convexClient } from "@convex-dev/better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [convexClient()],
})
```

## Step 11: Set up Convex client provider

Create a Convex provider component that integrates with Better Auth:

```tsx
// src/components/ConvexClientProvider.tsx
"use client"

import { ReactNode } from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { authClient } from "@/lib/auth-client"

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL

const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  )
}
```

## Step 12: Add Better Auth UI styles

Import Better Auth UI styles into your global CSS file:

```css
/* src/styles/globals.css or wherever your Tailwind imports are */
@import "@daveyplate/better-auth-ui/css";

/* Your existing Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your existing shadcn/ui CSS variables remain unchanged */
```

Better Auth UI inherits your shadcn/ui theming automatically since it's built on shadcn/ui components.

## Step 13: Set up authentication middleware

Create middleware to check authentication status on every request:

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware"
import { authClient } from "./lib/auth-client"

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // Fetch session from Better Auth
    const response = await fetch(
      `${import.meta.env.PUBLIC_CONVEX_URL}/api/auth/get-session`,
      {
        headers: context.request.headers,
      }
    )
    
    if (response.ok) {
      const session = await response.json()
      context.locals.user = session?.user || null
      context.locals.session = session?.session || null
    } else {
      context.locals.user = null
      context.locals.session = null
    }
  } catch (error) {
    context.locals.user = null
    context.locals.session = null
  }
  
  return next()
})
```

Add TypeScript types for `Astro.locals`:

```typescript
// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      emailVerified: boolean
    } | null
    session: {
      id: string
      userId: string
      expiresAt: Date
    } | null
  }
}
```

## Step 14: Create Auth UI Provider wrapper

Set up the Better Auth UI provider with your configuration:

```tsx
// src/components/AuthProviders.tsx
"use client"

import { ReactNode } from "react"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"

// For Astro, we need to handle navigation differently
// This component will be used inside Astro islands
export function AuthProviders({ children }: { children: ReactNode }) {
  const navigate = (path: string) => {
    window.location.href = path
  }
  
  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={navigate}
      
      // Social login configuration
      social={{
        providers: ["github", "google"],
        signIn: "optional" // or "required"
      }}
      
      // Password requirements
      credentials={{
        passwordValidation: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
        },
        confirmPassword: true
      }}
      
      // Sign up customization
      signUp={{
        fields: ["name"]
      }}
      
      // Two-factor authentication
      twoFactor={{
        enabled: true,
        methods: ["totp"]
      }}
      
      // Custom view paths (optional)
      viewPaths={{
        SIGN_IN: "sign-in",
        SIGN_UP: "sign-up",
        FORGOT_PASSWORD: "forgot-password",
        RESET_PASSWORD: "reset-password",
      }}
    >
      {children}
    </AuthUIProvider>
  )
}
```

## Step 15: Update your root layout

Wrap your application with both Convex and Auth providers:

```astro
---
// src/layouts/Layout.astro
import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { AuthProviders } from "@/components/AuthProviders"

interface Props {
  title: string
}

const { title } = Astro.props
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <ConvexClientProvider client:only="react">
      <AuthProviders client:only="react">
        <slot />
      </AuthProviders>
    </ConvexClientProvider>
  </body>
</html>
```

**Critical**: Use `client:only="react"` for provider components to avoid hydration mismatches in Astro.

## Step 16: Create authentication pages

Create a dynamic route to handle all auth views:

```astro
---
// src/pages/auth/[pathname].astro
import Layout from "@/layouts/Layout.astro"
import { AuthCard } from "@daveyplate/better-auth-ui"

export const prerender = false // Disable prerendering for auth pages

const { pathname } = Astro.params
---

<Layout title="Authentication">
  <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10">
    <div class="w-full max-w-md px-4">
      <AuthCard 
        pathname={pathname} 
        client:load
        classNames={{
          base: "shadow-xl",
          header: "bg-gradient-to-r from-primary to-primary/80"
        }}
      />
    </div>
  </main>
</Layout>
```

This single route handles all authentication flows:
- `/auth/sign-in` - Sign in page
- `/auth/sign-up` - Sign up page  
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset confirmation

## Step 17: Create user interface components

Build components that use Better Auth UI and your auth state:

```tsx
// src/components/UserButton.tsx
import { authClient } from "@/lib/auth-client"

export function UserButton() {
  const { data: session, isPending } = authClient.useSession()
  
  if (isPending) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
  }
  
  if (!session) {
    return (
      <a href="/auth/sign-in">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Sign In
        </button>
      </a>
    )
  }
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{session.user.name || session.user.email}</span>
      <button
        onClick={() => authClient.signOut()}
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
      >
        Sign Out
      </button>
    </div>
  )
}
```

Use it in your pages with appropriate hydration:

```astro
---
// src/pages/index.astro
import Layout from "@/layouts/Layout.astro"
import { UserButton } from "@/components/UserButton"
---

<Layout title="Home">
  <header class="border-b">
    <div class="container mx-auto flex items-center justify-between py-4">
      <h1 class="text-xl font-bold">My App</h1>
      <UserButton client:load />
    </div>
  </header>
  
  <main class="container mx-auto py-8">
    <h2>Welcome!</h2>
  </main>
</Layout>
```

## Step 18: Create protected routes

Implement route protection using middleware or page-level checks:

### Method 1: Page-level protection

```astro
---
// src/pages/dashboard.astro
import Layout from "@/layouts/Layout.astro"
import { UserButton } from "@/components/UserButton"

export const prerender = false

// Redirect if not authenticated
const session = Astro.locals.session
if (!session) {
  return Astro.redirect("/auth/sign-in?redirect=/dashboard")
}
---

<Layout title="Dashboard">
  <header class="border-b">
    <div class="container mx-auto flex items-center justify-between py-4">
      <h1 class="text-xl font-bold">Dashboard</h1>
      <UserButton client:load />
    </div>
  </header>
  
  <main class="container mx-auto py-8">
    <h2>Welcome, {Astro.locals.user?.name}!</h2>
    <p>Email: {Astro.locals.user?.email}</p>
  </main>
</Layout>
```

### Method 2: Middleware-based route guards

Enhance your middleware to protect entire route patterns:

```typescript
// src/middleware.ts
import { defineMiddleware, sequence } from "astro:middleware"

const authMiddleware = defineMiddleware(async (context, next) => {
  // ... your existing session fetch code
  return next()
})

const routeGuard = defineMiddleware(async ({ url, locals, redirect }, next) => {
  const protectedRoutes = [
    /^\/dashboard($|\/.*)/,
    /^\/profile($|\/.*)/,
    /^\/settings($|\/.*)/
  ]
  
  const isProtected = protectedRoutes.some(pattern => pattern.test(url.pathname))
  
  if (isProtected && !locals.session) {
    return redirect(`/auth/sign-in?redirect=${url.pathname}`)
  }
  
  return next()
})

export const onRequest = sequence(authMiddleware, routeGuard)
```

## Step 19: Create account settings page

Use Better Auth UI's settings components for a complete account management interface:

```astro
---
// src/pages/settings.astro
import Layout from "@/layouts/Layout.astro"
import { SettingsCards } from "@daveyplate/better-auth-ui"

export const prerender = false

const session = Astro.locals.session
if (!session) {
  return Astro.redirect("/auth/sign-in?redirect=/settings")
}
---

<Layout title="Account Settings">
  <main class="container mx-auto py-8 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>
    <SettingsCards client:load />
  </main>
</Layout>
```

The `SettingsCards` component automatically provides:
- Avatar upload
- Name and email changes
- Password management
- Two-factor authentication setup
- Active sessions management
- Linked social accounts
- Account deletion

## Step 20: Use Better Auth with Convex queries

Access authenticated user data in Convex queries and mutations:

```typescript
// convex/messages.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { authComponent } from "./auth"

// Protected query
export const getMyMessages = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    
    if (!user) {
      throw new Error("Not authenticated")
    }
    
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), user.id))
      .collect()
  },
})

// Protected mutation
export const createMessage = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    
    if (!user) {
      throw new Error("Not authenticated")
    }
    
    await ctx.db.insert("messages", {
      content: args.content,
      userId: user.id,
      createdAt: Date.now(),
    })
  },
})
```

Use these queries in your React components:

```tsx
// src/components/MessageList.tsx
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

export function MessageList() {
  const messages = useQuery(api.messages.getMyMessages)
  const createMessage = useMutation(api.messages.createMessage)
  
  if (!messages) return <div>Loading...</div>
  
  return (
    <div>
      <ul>
        {messages.map((msg) => (
          <li key={msg._id}>{msg.content}</li>
        ))}
      </ul>
      <button onClick={() => createMessage({ content: "Hello!" })}>
        Send Message
      </button>
    </div>
  )
}
```

## Customizing Better Auth UI with Tailwind 4

Better Auth UI uses your existing shadcn/ui theme automatically. To customize further, modify your CSS variables:

```css
/* src/styles/globals.css */

:root {
  /* These variables are already defined by shadcn/ui */
  /* Override them to customize Better Auth UI appearance */
  --primary: oklch(0.55 0.25 262); /* Brand color */
  --radius: 1rem; /* More rounded corners */
}

.dark {
  /* Dark mode overrides work automatically */
  --primary: oklch(0.75 0.2 262);
}
```

Customize individual Better Auth UI components with classNames:

```tsx
<AuthCard 
  pathname="sign-in"
  classNames={{
    base: "border-2 border-primary/20 shadow-2xl",
    header: "bg-gradient-to-r from-primary to-secondary",
    title: "text-2xl",
    footerLink: "text-primary hover:text-primary/80"
  }}
/>
```

## Testing your authentication flow

### Test email/password signup

1. Navigate to `http://localhost:4321/auth/sign-up`
2. Fill in name, email, and password
3. Click "Sign Up"
4. You should be signed in and redirected
5. Check Convex dashboard to see the user record created

### Test OAuth flows

**GitHub:**
1. Navigate to `http://localhost:4321/auth/sign-in`
2. Click "Sign in with GitHub"
3. Authorize the application (first time only)
4. You'll be redirected back and signed in

**Google:**
1. Navigate to `http://localhost:4321/auth/sign-in`
2. Click "Sign in with Google"
3. Select your Google account
4. Authorize the application
5. You'll be redirected back and signed in

### Test protected routes

1. Sign out if signed in
2. Try to access `http://localhost:4321/dashboard`
3. You should be redirected to sign-in
4. Sign in and you'll be redirected to dashboard

### Test account settings

1. Sign in to your account
2. Navigate to `http://localhost:4321/settings`
3. Test changing your name, email, or password
4. Test linking additional OAuth providers
5. Test session management

## Common integration issues and solutions

### Issue: Middleware not working

**Symptom**: `Astro.locals.session` is always null

**Solution**: Ensure you're using SSR mode, not static:

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server', // Not 'static'
  adapter: node()
})
```

### Issue: Hydration mismatch errors

**Symptom**: React hydration errors in console

**Solution**: Use `client:only="react"` for auth providers and components that access session state during render:

```astro
<ConvexClientProvider client:only="react">
  <AuthProviders client:only="react">
    <slot />
  </AuthProviders>
</ConvexClientProvider>
```

### Issue: OAuth callback 404 errors

**Symptom**: OAuth redirects result in 404

**Solution**: Verify your callback URLs match exactly:
- In GitHub/Google OAuth settings
- In your environment variables
- Use `http://localhost:4321` for local dev (Astro's default port)

### Issue: CORS errors with Convex

**Symptom**: API requests to Convex fail with CORS errors

**Solution**: Ensure your Convex `SITE_URL` environment variable matches your actual site URL:

```bash
npx convex env set SITE_URL http://localhost:4321
```

### Issue: Session not persisting

**Symptom**: Users get signed out on page refresh

**Solution**: Check that cookies are being set. Better Auth uses HTTP-only cookies by default. Ensure:
1. Your site URL is configured correctly
2. You're not blocking cookies in browser
3. In production, ensure HTTPS is enabled

### Issue: TypeScript errors in convex/auth.ts

**Symptom**: Import errors for generated types

**Solution**: Keep `npx convex dev` running. It auto-generates types. Save the file and wait a few seconds for generation to complete.

### Issue: React Context not working across islands

**Symptom**: Auth state not shared between components

**Solution**: Better Auth uses Nano Stores internally, so `authClient.useSession()` works across separate Astro islands automatically. Don't try to use React Context—it doesn't work across islands.

### Issue: Better Auth UI styles not applying

**Symptom**: Auth components look unstyled

**Solution**: Ensure you imported Better Auth UI CSS:

```css
/* src/styles/globals.css */
@import "@daveyplate/better-auth-ui/css";
```

And that shadcn/ui is configured with CSS variables enabled in your `components.json`.

## Production deployment checklist

Before deploying to production:

### Environment variables

- [ ] Set production `BETTER_AUTH_SECRET` (different from dev)
- [ ] Set production `SITE_URL` to your actual domain
- [ ] Update OAuth app callback URLs to production domain
- [ ] Set all OAuth credentials in production Convex environment
- [ ] Never commit `.env` files to version control

### OAuth configuration

- [ ] Create separate production OAuth apps for GitHub/Google
- [ ] Update callback URLs to production domain
- [ ] For Google: Consider publishing your OAuth consent screen for public use
- [ ] Test OAuth flows in production environment

### Security

- [ ] Enable HTTPS in production (required for secure cookies)
- [ ] Review your `trustedOrigins` in Better Auth config
- [ ] Set up proper CORS if frontend is on different domain
- [ ] Enable email verification for production accounts
- [ ] Consider adding rate limiting for auth endpoints

### Database

- [ ] Deploy Convex functions: `npx convex deploy`
- [ ] Verify database migrations completed successfully
- [ ] Test authentication flows in production
- [ ] Set up monitoring for auth-related errors

## File structure overview

Your project should now have these new files:

```
your-project/
├── src/
│   ├── components/
│   │   ├── ConvexClientProvider.tsx    # NEW
│   │   ├── AuthProviders.tsx           # NEW
│   │   └── UserButton.tsx              # NEW
│   ├── lib/
│   │   └── auth-client.ts              # NEW
│   ├── pages/
│   │   ├── auth/
│   │   │   └── [pathname].astro        # NEW
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all].ts         # NEW
│   │   ├── settings.astro              # NEW
│   │   └── dashboard.astro             # NEW (example)
│   ├── middleware.ts                   # NEW
│   └── env.d.ts                        # UPDATED
├── convex/
│   ├── auth.config.ts                  # NEW
│   ├── auth.ts                         # NEW
│   ├── http.ts                         # NEW
│   └── messages.ts                     # NEW (example)
├── convex.config.ts                    # NEW
└── astro.config.mjs                    # UPDATED
```

## React 19 compatibility notes

Better Auth and Better Auth UI have no known issues with React 19. Both libraries were developed with modern React patterns and use standard hooks that are fully compatible with React 19. Unlike some older authentication libraries (like NextAuth v4), Better Auth was built with the latest React ecosystem in mind and doesn't have legacy dependencies that conflict with React 19.

## Next steps and advanced features

Now that you have authentication working, consider adding:

**Two-factor authentication**: Already configured—users can enable it in settings

**Email verification**: Update your auth config:
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    // Implement email sending (Resend, SendGrid, etc.)
  }
}
```

**Organizations/Multi-tenancy**: Add the organizations plugin to Better Auth for team management

**Magic link authentication**: Enable passwordless login via email

**Passkeys/WebAuthn**: Add biometric authentication support

**Rate limiting**: Protect auth endpoints from brute force attacks

**Custom user fields**: Add additional fields to user profiles using Better Auth's `additionalFields` configuration

This integration gives you a production-ready authentication system with minimal code. Better Auth UI handles all the complex UI flows, Convex manages your backend securely, and everything integrates seamlessly with your existing Astro + React 19 + Tailwind 4 + shadcn/ui stack.