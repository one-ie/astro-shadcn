# Better Auth Migration Guide - Official Setup

## 📚 Official Documentation
- Convex Better Auth: https://convex-better-auth.netlify.app/
- Better Auth + Convex: https://www.better-auth.com/docs/integrations/convex

## ✅ Current Status

### What's Already Done
- [x] Better Auth packages installed (`better-auth@1.3.24`, `@convex-dev/better-auth@0.8.6`)
- [x] Better Auth component configured in `convex/convex.config.ts`
- [x] Better Auth React client set up in `src/lib/auth-client.ts`
- [x] Types generated with all Better Auth models
- [x] Custom auth API bridge at `/api/auth/[...all]`

### What Needs Migration
- [ ] Replace custom Convex mutations with Better Auth adapter
- [ ] Set up Better Auth HTTP routes in `convex/http.ts`
- [ ] Create Better Auth instance in `convex/auth.ts`
- [ ] Update auth client with Convex plugin
- [ ] Migrate user data to Better Auth schema

## 📖 Official Setup Guide (Step-by-Step)

### Step 1: Update Convex Config ✅ DONE

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(resend);
app.use(betterAuth); // ✅ Already done

export default app;
```

### Step 2: Update Auth Config ✅ EXISTING

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

**Status:** ✅ Already exists and correct

### Step 3: Create Better Auth Instance (NEW - TODO)

**Current:** Using custom mutations in `convex/auth.ts`
**Needed:** Replace with Better Auth instance

```typescript
// convex/auth.ts
import { betterAuth } from "better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// Create Better Auth Convex client
export const authComponent = createClient<DataModel>(components.betterAuth);

// Create Better Auth instance
export const createAuth = (ctx: any) => {
  const siteUrl = process.env.SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:4321";

  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true when ready
    },

    // Social providers
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        enabled: !!process.env.GITHUB_CLIENT_ID,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        enabled: !!process.env.GOOGLE_CLIENT_ID,
      },
    },

    // Plugins
    plugins: [
      convex(), // Required for Convex integration
    ],

    // Account linking
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
      },
    },
  });
};
```

### Step 4: Set Up HTTP Routes (NEW - TODO)

**Current:** Empty `convex/http.ts`
**Needed:** Register Better Auth routes

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register Better Auth routes
// This handles /api/auth/* endpoints automatically
authComponent.registerRoutes(http, createAuth);

export default http;
```

**Important:** This replaces the need for Astro's `/api/auth/[...all].ts` file!

### Step 5: Update Auth Client (PARTIAL - TODO)

**Current:** Basic Better Auth client
```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
})
```

**Needed:** Add Convex plugin

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
  plugins: [
    convexClient(), // Add Convex plugin
  ],
});

export { authClient as auth };
```

### Step 6: Environment Variables

Add to `.env.local` and Convex environment:

```bash
# Site URL
SITE_URL=http://localhost:4321
BETTER_AUTH_URL=http://localhost:4321

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Convex (already have these)
CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment
CONVEX_SITE_URL=https://your-deployment.convex.site

# Resend (already have this)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_from_email
```

**Add to Convex:**
```bash
npx convex env set SITE_URL "http://localhost:4321"
npx convex env set BETTER_AUTH_URL "http://localhost:4321"
npx convex env set GITHUB_CLIENT_ID "your_id"
npx convex env set GITHUB_CLIENT_SECRET "your_secret"
npx convex env set GOOGLE_CLIENT_ID "your_id"
npx convex env set GOOGLE_CLIENT_SECRET "your_secret"
```

### Step 7: Update UI Components (MINOR CHANGES)

Your existing components already use Better Auth client correctly! Just verify:

```typescript
// src/components/auth/SimpleSignInForm.tsx
import { authClient } from "@/lib/auth-client"

// This already works correctly! ✅
const result = await authClient.signIn.email({
  email,
  password,
})
```

**For Social Login:**
```typescript
// src/components/auth/SocialLoginButtons.tsx
const handleGitHub = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard",
  })
}

const handleGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  })
}
```

## 🔄 Migration Strategy

### Option A: Clean Migration (Recommended)

1. **Backup current data:**
   ```bash
   npx convex export
   ```

2. **Create new Better Auth tables:**
   - Better Auth will auto-create tables on first run
   - Old tables: `users`, `sessions`, `passwordResets`
   - New tables: Better Auth schema (user, session, account, etc.)

3. **Migrate users:**
   - Write one-time migration script
   - Copy user data from old to new schema
   - Hash passwords with Argon2 (Better Auth handles this)

4. **Test in parallel:**
   - Keep old auth working during migration
   - Test Better Auth on new accounts first
   - Gradually migrate existing users

5. **Switch over:**
   - Update all components to use Better Auth
   - Remove old custom auth code
   - Clean up old tables

### Option B: Incremental Migration

1. **Run both systems in parallel:**
   - Keep custom auth for existing users
   - Use Better Auth for new signups
   - Migrate users on next login

2. **Update gradually:**
   - Start with email/password
   - Add OAuth next
   - Add 2FA/passkeys last

## 🎯 Migration Checklist

### Backend (Convex)
- [x] Install Better Auth component
- [x] Configure in `convex.config.ts`
- [ ] Create Better Auth instance in `convex/auth.ts`
- [ ] Set up HTTP routes in `convex/http.ts`
- [ ] Add environment variables
- [ ] Test auth endpoints
- [ ] Migrate user data

### Frontend (Astro + React)
- [x] Install Better Auth React client
- [ ] Add Convex plugin to auth client
- [ ] Update social login buttons
- [ ] Test sign in/sign up flows
- [ ] Update session handling
- [ ] Remove old API routes (`/api/auth/[...all].ts`)

### Optional Enhancements
- [ ] Enable email verification
- [ ] Add magic links
- [ ] Set up 2FA (TOTP)
- [ ] Add passkeys
- [ ] Configure rate limiting
- [ ] Set up account linking

## 📊 Expected Outcomes

**Before Migration:**
- Custom Convex mutations
- SHA-256 password hashing
- Manual session management
- No OAuth
- ~500 lines of custom auth code

**After Migration:**
- Better Auth adapter
- Argon2 password hashing
- Automatic session management
- OAuth with GitHub, Google
- ~100 lines of config code
- All advanced features available via plugins

**Time Saved:** 26-48 hours of future development

## 🚀 Quick Start (Minimal Migration)

For fastest migration to get Better Auth working:

1. **Replace `convex/auth.ts`** with Better Auth instance (Step 3)
2. **Update `convex/http.ts`** to register routes (Step 4)
3. **Add Convex plugin** to auth client (Step 5)
4. **Test sign in/sign up** - should work immediately
5. **Migrate users** at your own pace

That's it! OAuth, 2FA, passkeys are then just plugin additions.

## 📖 Next Steps

1. Review this guide
2. Back up current database
3. Implement Steps 3-5 above
4. Test with new user account
5. Migrate existing users
6. Enable advanced features (OAuth, 2FA, passkeys)

## 🔗 Resources

- Better Auth Docs: https://www.better-auth.com/docs
- Convex Better Auth: https://convex-better-auth.netlify.app/
- Better Auth GitHub: https://github.com/better-auth/better-auth
- Example Apps: https://github.com/get-convex/convex-better-auth
