# Convex Integration Toggle Plan

## Overview

Create a flexible architecture that allows the site to operate in three modes:

1. **Static Mode**: Pure static site with content collections only
2. **Database Mode**: Fully database-driven with Convex
3. **Hybrid Mode**: Content collections + Convex queries

## Architecture Strategy

### 1. Environment Configuration

**Create feature flags in `src/config/features.ts`:**

```typescript
export const FEATURES = {
  CONVEX_ENABLED: import.meta.env.CONVEX_ENABLED === 'true',
  AUTH_ENABLED: import.meta.env.AUTH_ENABLED === 'true',
  STATIC_MODE: import.meta.env.STATIC_MODE === 'true',
} as const;

export type SiteMode = 'static' | 'database' | 'hybrid';

export function getSiteMode(): SiteMode {
  if (FEATURES.STATIC_MODE) return 'static';
  if (FEATURES.CONVEX_ENABLED) return 'hybrid';
  return 'static';
}
```

**Environment variables:**

```bash
# .env.example
CONVEX_ENABLED=false        # Toggle Convex features
AUTH_ENABLED=false          # Toggle authentication
STATIC_MODE=true            # Force static site generation
CONVEX_URL=                 # Only needed if CONVEX_ENABLED=true
```

### 2. Adapter Configuration

**Dynamic adapter selection in `astro.config.mjs`:**

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

const isStatic = process.env.STATIC_MODE === 'true';
const convexEnabled = process.env.CONVEX_ENABLED === 'true';

export default defineConfig({
  output: isStatic ? 'static' : 'server',
  adapter: isStatic
    ? undefined
    : cloudflare({
        platformProxy: { enabled: convexEnabled },
      }),
  // ... rest of config
});
```

### 3. Data Layer Abstraction

**Create unified data interface in `src/lib/data/index.ts`:**

```typescript
import type { CollectionEntry } from 'astro:content';
import { FEATURES } from '@/config/features';

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  tags: string[];
  category: string;
  content?: string;
  image?: string;
}

export interface DataProvider {
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  // Add more methods as needed
}

class StaticDataProvider implements DataProvider {
  async getBlogPosts(): Promise<BlogPost[]> {
    const { getCollection } = await import('astro:content');
    const posts = await getCollection('blog');
    return posts.map(transformContentEntry);
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const { getEntry } = await import('astro:content');
    const post = await getEntry('blog', slug);
    return post ? transformContentEntry(post) : null;
  }
}

class ConvexDataProvider implements DataProvider {
  async getBlogPosts(): Promise<BlogPost[]> {
    const { api } = await import('convex/_generated/api');
    const client = getConvexClient();
    const posts = await client.query(api.blog.list);
    return posts.map(transformConvexPost);
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const { api } = await import('convex/_generated/api');
    const client = getConvexClient();
    return await client.query(api.blog.getBySlug, { slug });
  }
}

class HybridDataProvider implements DataProvider {
  private static: StaticDataProvider;
  private convex: ConvexDataProvider;

  async getBlogPosts(): Promise<BlogPost[]> {
    const [staticPosts, dbPosts] = await Promise.all([
      this.static.getBlogPosts(),
      this.convex.getBlogPosts(),
    ]);
    return [...staticPosts, ...dbPosts].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }
}

export function getDataProvider(): DataProvider {
  const mode = getSiteMode();

  switch (mode) {
    case 'static':
      return new StaticDataProvider();
    case 'database':
      return new ConvexDataProvider();
    case 'hybrid':
      return new HybridDataProvider();
  }
}
```

### 4. Component Refactoring

**Update components to use data provider:**

**`src/pages/blog/index.astro`:**

```astro
---
import { getDataProvider } from '@/lib/data';

const dataProvider = getDataProvider();
const posts = await dataProvider.getBlogPosts();
---

<BlogSearch client:load posts={posts} />
```

**`src/pages/blog/[...slug].astro`:**

```astro
---
import { getDataProvider } from '@/lib/data';
import { FEATURES } from '@/config/features';

export async function getStaticPaths() {
  if (!FEATURES.STATIC_MODE) return [];

  const dataProvider = getDataProvider();
  const posts = await dataProvider.getBlogPosts();

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { slug } = Astro.params;
const dataProvider = getDataProvider();
const post = await dataProvider.getBlogPost(slug);
---
```

### 5. Authentication Abstraction

**Create conditional auth wrapper in `src/lib/auth/index.ts`:**

```typescript
import { FEATURES } from '@/config/features';

export interface AuthProvider {
  getUser(): Promise<User | null>;
  signIn(provider: string): Promise<void>;
  signOut(): Promise<void>;
}

class NoAuthProvider implements AuthProvider {
  async getUser() {
    return null;
  }
  async signIn() {
    throw new Error('Auth disabled');
  }
  async signOut() {
    throw new Error('Auth disabled');
  }
}

class BetterAuthProvider implements AuthProvider {
  // Real implementation
}

export function getAuthProvider(): AuthProvider {
  return FEATURES.AUTH_ENABLED
    ? new BetterAuthProvider()
    : new NoAuthProvider();
}
```

### 6. Conditional Component Loading

**Create wrapper components:**

**`src/components/ConditionalAuth.astro`:**

```astro
---
import { FEATURES } from '@/config/features';
const { fallback } = Astro.props;
---

{FEATURES.AUTH_ENABLED ? <slot /> : <Fragment>{fallback}</Fragment>}
```

**Usage:**

```astro
<ConditionalAuth fallback={(<div>Login Disabled</div>)}>
  <LoginForm client:load />
</ConditionalAuth>
```

### 7. Build Scripts

**Add mode-specific build commands to `package.json`:**

```json
{
  "scripts": {
    "dev": "astro dev",
    "dev:static": "STATIC_MODE=true astro dev",
    "dev:database": "CONVEX_ENABLED=true AUTH_ENABLED=true astro dev",
    "dev:hybrid": "CONVEX_ENABLED=true astro dev",

    "build": "astro build",
    "build:static": "STATIC_MODE=true astro build",
    "build:database": "CONVEX_ENABLED=true AUTH_ENABLED=true astro build",
    "build:hybrid": "CONVEX_ENABLED=true astro build"
  }
}
```

### 8. Type Safety

**Conditional type exports:**

```typescript
// src/types/index.ts
import type { FEATURES } from '@/config/features';

export type ConditionalConvexTypes = typeof FEATURES.CONVEX_ENABLED extends true
  ? import('convex/react').ConvexReactClient
  : never;
```

### 9. Dependency Management

**Optional dependencies strategy:**

- Keep Convex as regular dependency (tree-shaking will remove unused code)
- Use dynamic imports: `await import('convex/react')` only when needed
- Vite will optimize bundle based on dead code elimination

**OR** for strict separation:

```json
{
  "dependencies": {
    "astro": "^5.14.0"
  },
  "optionalDependencies": {
    "convex": "^1.x.x",
    "better-auth": "^1.x.x"
  }
}
```

### 10. Migration Path

**Step-by-step implementation:**

1. **Phase 1: Feature Flags**
   - Add environment variables
   - Create `src/config/features.ts`
   - No breaking changes

2. **Phase 2: Data Abstraction**
   - Create `src/lib/data/` directory
   - Implement provider interfaces
   - Add transformer utilities

3. **Phase 3: Component Updates**
   - Update blog pages to use data provider
   - Add conditional rendering
   - Test all three modes

4. **Phase 4: Auth Abstraction**
   - Create auth provider interface
   - Update auth components
   - Add conditional wrappers

5. **Phase 5: Build Configuration**
   - Update `astro.config.mjs`
   - Add build scripts
   - Update deployment workflows

6. **Phase 6: Documentation**
   - Update CLAUDE.md
   - Create mode-switching guide
   - Document environment variables

## Benefits

✅ **Zero Breaking Changes**: Existing code works as-is in database mode
✅ **Progressive Enhancement**: Start static, add database when needed
✅ **Performance**: Static mode = fastest possible site
✅ **Flexibility**: Switch modes with environment variables
✅ **Type Safety**: Full TypeScript support in all modes
✅ **Testing**: Easy to test without database dependencies
✅ **Cost**: Static mode = zero backend costs

## File Structure

```
src/
├── config/
│   ├── features.ts          # Feature flags & mode detection
│   └── site.ts              # Existing site config
├── lib/
│   ├── data/
│   │   ├── index.ts         # Main data provider interface
│   │   ├── static.ts        # Content collection provider
│   │   ├── convex.ts        # Convex provider
│   │   ├── hybrid.ts        # Combined provider
│   │   └── types.ts         # Shared data types
│   └── auth/
│       ├── index.ts         # Auth provider interface
│       ├── better-auth.ts   # Better Auth implementation
│       └── no-auth.ts       # Disabled auth stub
├── components/
│   ├── ConditionalAuth.astro
│   └── ConditionalFeature.astro
└── pages/
    └── blog/
        ├── index.astro      # Updated to use data provider
        └── [...slug].astro  # Updated to use data provider
```

## Testing Strategy

1. **Static Mode**: Run `bun build:static` and verify no Convex imports
2. **Database Mode**: Run `bun build:database` and test all Convex features
3. **Hybrid Mode**: Test content collection + database queries together
4. **Bundle Analysis**: Check bundle size in each mode

## Future Enhancements

- Admin UI to switch modes at runtime
- Content sync tool (markdown → Convex)
- Preview mode (database content in development)
- A/B testing between modes
- Gradual rollout (percentage of users see database content)
