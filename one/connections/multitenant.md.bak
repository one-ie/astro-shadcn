# Multitenant.md - Multi-Tenant Architecture

## Overview

**Multi-tenancy** enables multiple organizations to use the ONE Platform while maintaining complete data isolation, custom branding, and independent configuration. This architecture leverages the 4-table ontology to provide:

1. **Organization Isolation**: Each org's data is completely separated
2. **Shared Infrastructure**: Single Hono API + Convex backend serves all orgs
3. **Custom Frontends**: Each org can deploy custom-branded Astro frontend
4. **Flexible Billing**: Per-org limits, quotas, and subscriptions
5. **Role-Based Access**: Granular permissions within each organization

**Key Principle:** Organizations are first-class entities in the ontology. All resources (tokens, agents, content) belong to an organization via connections.

## Architecture Vision

```
┌─────────────────────────────────────────────────────────────┐
│                   MULTI-TENANT FRONTENDS                     │
├─────────────────────────────────────────────────────────────┤
│  Org A Frontend          Org B Frontend      Org C Frontend │
│  orgA.oneie.com          orgB.oneie.com      orgC.oneie.com │
│  - Custom theme          - Custom theme      - Custom theme │
│  - Custom components     - Custom layout     - Mobile-first │
└────────────────┬─────────────────┬──────────────────┬────────┘
                 │                 │                  │
                 └────────┬────────┴──────────┬───────┘
                          │ Shared API        │
                          ▼                   │
┌─────────────────────────────────────────────▼───────────────┐
│              SHARED HONO API BACKEND                         │
│  - Organization middleware (extract orgId from subdomain)    │
│  - Role-based access control (RBAC)                          │
│  - Per-org rate limiting                                     │
│  - Per-org billing/quotas                                    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              SHARED CONVEX BACKEND                           │
│  - All orgs in single database                               │
│  - Data filtered by orgId (automatic isolation)              │
│  - Organizations table (entities with type: 'organization')  │
│  - Connections: user→org, org→resources                      │
│  - Events: per-org activity tracking                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Model (4-Table Ontology)

### Entities

**Organization Entity:**
```typescript
{
  _id: "org_xyz",
  type: "organization",
  name: "Acme Corp",
  properties: {
    slug: "acme-corp",           // Unique slug for subdomain
    domain: "acme-corp.oneie.com", // Custom domain
    plan: "pro",                  // Subscription tier
    settings: {
      branding: {
        logo: "https://...",
        primaryColor: "#FF5733",
        theme: "dark"
      },
      features: {
        aiClone: true,
        tokenEconomy: true,
        customDomain: true
      },
      limits: {
        maxUsers: 100,
        maxAgents: 10,
        maxTokens: 1000000
      }
    },
    billing: {
      stripeCustomerId: "cus_xxx",
      subscriptionId: "sub_xxx",
      currentPeriodEnd: 1735689600000
    }
  },
  status: "active",
  createdAt: 1704067200000,
  updatedAt: 1704067200000
}
```

**User Entity (enhanced with org context):**
```typescript
{
  _id: "user_abc",
  type: "user",
  name: "Sarah Johnson",
  properties: {
    email: "sarah@acmecorp.com",
    role: "creator",           // Global role
    currentOrgId: "org_xyz"    // Active organization
  },
  status: "active",
  createdAt: 1704067200000,
  updatedAt: 1704067200000
}
```

### Connections

**Organization Membership:**
```typescript
{
  fromEntityId: "user_abc",
  toEntityId: "org_xyz",
  relationshipType: "member_of",
  metadata: {
    role: "admin",              // Org-specific role: admin, member, viewer
    permissions: [
      "create_agents",
      "manage_users",
      "manage_billing"
    ],
    joinedAt: 1704067200000,
    invitedBy: "user_def"
  },
  createdAt: 1704067200000
}
```

**Resource Ownership (org owns resources):**
```typescript
// Organization → Token
{
  fromEntityId: "org_xyz",
  toEntityId: "token_123",
  relationshipType: "owns",
  createdAt: 1704067200000
}

// Organization → AI Clone
{
  fromEntityId: "org_xyz",
  toEntityId: "ai_clone_456",
  relationshipType: "owns",
  createdAt: 1704067200000
}

// Organization → Content
{
  fromEntityId: "org_xyz",
  toEntityId: "content_789",
  relationshipType: "owns",
  createdAt: 1704067200000
}
```

**User-Resource Access (user accesses org resources):**
```typescript
// User → Resource (scoped to org)
{
  fromEntityId: "user_abc",
  toEntityId: "token_123",
  relationshipType: "has_access",
  metadata: {
    orgId: "org_xyz",         // Scoped to organization
    accessLevel: "edit"       // read, edit, admin
  },
  createdAt: 1704067200000
}
```

### Events

**Organization Events:**
```typescript
{
  entityId: "org_xyz",
  eventType: "organization_created",
  timestamp: 1704067200000,
  actorType: "user",
  actorId: "user_abc",
  metadata: {
    plan: "pro",
    source: "web"
  }
}

{
  entityId: "org_xyz",
  eventType: "user_invited",
  timestamp: 1704067200000,
  actorType: "user",
  actorId: "user_abc",
  metadata: {
    invitedUserId: "user_def",
    role: "member",
    email: "john@acmecorp.com"
  }
}

{
  entityId: "org_xyz",
  eventType: "plan_upgraded",
  timestamp: 1704067200000,
  actorType: "user",
  actorId: "user_abc",
  metadata: {
    oldPlan: "starter",
    newPlan: "pro",
    price: 99
  }
}
```

**Resource Events (scoped to org):**
```typescript
{
  entityId: "token_123",
  eventType: "tokens_purchased",
  timestamp: 1704067200000,
  actorType: "user",
  actorId: "user_abc",
  metadata: {
    orgId: "org_xyz",         // Organization context
    amount: 1000,
    price: 100,
    paymentId: "pay_xxx"
  }
}
```

### Tags

**Organization Tags:**
```typescript
{
  name: "industry:saas",
  category: "industry"
}

{
  name: "size:enterprise",
  category: "organization_size"
}

// Junction: organization → tags
{
  entityId: "org_xyz",
  tagId: "tag_industry_saas"
}
```

## Implementation Pattern

### 1. Organization Service (Effect.ts)

#### `convex/services/organizations/organization.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from '../providers/convex';
import type { Id } from '../../_generated/dataModel';

/**
 * Organization business logic
 * Handles org creation, membership, settings
 */

// Tagged errors
export class OrganizationNotFoundError {
  readonly _tag = 'OrganizationNotFoundError';
  constructor(readonly orgId: string) {}
}

export class DuplicateSlugError {
  readonly _tag = 'DuplicateSlugError';
  constructor(readonly slug: string) {}
}

export class InsufficientPermissionsError {
  readonly _tag = 'InsufficientPermissionsError';
  constructor(readonly userId: string, readonly permission: string) {}
}

export class QuotaExceededError {
  readonly _tag = 'QuotaExceededError';
  constructor(readonly resource: string, readonly limit: number) {}
}

export class OrganizationService extends Effect.Service<OrganizationService>()(
  'OrganizationService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        /**
         * Create new organization
         */
        create: (args: {
          name: string;
          slug: string;
          creatorId: Id<'entities'>;
          plan?: string;
        }) =>
          Effect.gen(function* () {
            // Validate slug uniqueness
            const existing = yield* Effect.tryPromise(() =>
              db.query('entities')
                .withIndex('type_slug', (q) =>
                  q.eq('type', 'organization').eq('properties.slug', args.slug)
                )
                .first()
            );

            if (existing) {
              return yield* Effect.fail(new DuplicateSlugError(args.slug));
            }

            // Create organization entity
            const orgId = yield* Effect.tryPromise(() =>
              db.insert('entities', {
                type: 'organization',
                name: args.name,
                properties: {
                  slug: args.slug,
                  domain: `${args.slug}.oneie.com`,
                  plan: args.plan || 'starter',
                  settings: {
                    branding: {
                      primaryColor: '#3B82F6',
                      theme: 'light',
                    },
                    features: {
                      aiClone: args.plan === 'pro' || args.plan === 'enterprise',
                      tokenEconomy: true,
                      customDomain: args.plan === 'enterprise',
                    },
                    limits: {
                      maxUsers: args.plan === 'enterprise' ? -1 : args.plan === 'pro' ? 100 : 10,
                      maxAgents: args.plan === 'enterprise' ? -1 : args.plan === 'pro' ? 10 : 3,
                      maxTokens: args.plan === 'enterprise' ? -1 : 1000000,
                    },
                  },
                },
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // Add creator as admin
            yield* Effect.tryPromise(() =>
              db.insert('connections', {
                fromEntityId: args.creatorId,
                toEntityId: orgId,
                relationshipType: 'member_of',
                metadata: {
                  role: 'admin',
                  permissions: ['*'], // All permissions
                  joinedAt: Date.now(),
                },
                createdAt: Date.now(),
              })
            );

            // Log event
            yield* Effect.tryPromise(() =>
              db.insert('events', {
                entityId: orgId,
                eventType: 'organization_created',
                timestamp: Date.now(),
                actorType: 'user',
                actorId: args.creatorId,
                metadata: {
                  plan: args.plan || 'starter',
                  source: 'web',
                },
              })
            );

            return { orgId, slug: args.slug };
          }),

        /**
         * Add user to organization
         */
        addMember: (args: {
          orgId: Id<'entities'>;
          userId: Id<'entities'>;
          role: 'admin' | 'member' | 'viewer';
          invitedBy: Id<'entities'>;
        }) =>
          Effect.gen(function* () {
            // Check if inviter has permission
            const inviterMembership = yield* Effect.tryPromise(() =>
              db.query('connections')
                .withIndex('from_type', (q) =>
                  q.eq('fromEntityId', args.invitedBy).eq('relationshipType', 'member_of')
                )
                .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
                .first()
            );

            if (!inviterMembership || inviterMembership.metadata?.role !== 'admin') {
              return yield* Effect.fail(
                new InsufficientPermissionsError(args.invitedBy, 'manage_users')
              );
            }

            // Check org limits
            const org = yield* Effect.tryPromise(() => db.get(args.orgId));
            if (!org) {
              return yield* Effect.fail(new OrganizationNotFoundError(args.orgId));
            }

            const memberCount = yield* Effect.tryPromise(() =>
              db.query('connections')
                .withIndex('to_type', (q) =>
                  q.eq('toEntityId', args.orgId).eq('relationshipType', 'member_of')
                )
                .collect()
            ).pipe(Effect.map((members) => members.length));

            const maxUsers = org.properties.settings.limits.maxUsers;
            if (maxUsers !== -1 && memberCount >= maxUsers) {
              return yield* Effect.fail(new QuotaExceededError('users', maxUsers));
            }

            // Add member
            const permissions =
              args.role === 'admin'
                ? ['*']
                : args.role === 'member'
                ? ['create_agents', 'create_content', 'view_analytics']
                : ['view_content'];

            yield* Effect.tryPromise(() =>
              db.insert('connections', {
                fromEntityId: args.userId,
                toEntityId: args.orgId,
                relationshipType: 'member_of',
                metadata: {
                  role: args.role,
                  permissions,
                  joinedAt: Date.now(),
                  invitedBy: args.invitedBy,
                },
                createdAt: Date.now(),
              })
            );

            // Log event
            yield* Effect.tryPromise(() =>
              db.insert('events', {
                entityId: args.orgId,
                eventType: 'user_invited',
                timestamp: Date.now(),
                actorType: 'user',
                actorId: args.invitedBy,
                metadata: {
                  invitedUserId: args.userId,
                  role: args.role,
                },
              })
            );

            return { success: true };
          }),

        /**
         * Update organization settings
         */
        updateSettings: (args: {
          orgId: Id<'entities'>;
          userId: Id<'entities'>;
          settings: Record<string, any>;
        }) =>
          Effect.gen(function* () {
            // Check permissions
            const membership = yield* Effect.tryPromise(() =>
              db.query('connections')
                .withIndex('from_type', (q) =>
                  q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
                )
                .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
                .first()
            );

            if (!membership || membership.metadata?.role !== 'admin') {
              return yield* Effect.fail(
                new InsufficientPermissionsError(args.userId, 'manage_settings')
              );
            }

            // Update org
            const org = yield* Effect.tryPromise(() => db.get(args.orgId));
            if (!org) {
              return yield* Effect.fail(new OrganizationNotFoundError(args.orgId));
            }

            yield* Effect.tryPromise(() =>
              db.patch(args.orgId, {
                properties: {
                  ...org.properties,
                  settings: {
                    ...org.properties.settings,
                    ...args.settings,
                  },
                },
                updatedAt: Date.now(),
              })
            );

            // Log event
            yield* Effect.tryPromise(() =>
              db.insert('events', {
                entityId: args.orgId,
                eventType: 'settings_updated',
                timestamp: Date.now(),
                actorType: 'user',
                actorId: args.userId,
                metadata: {
                  updatedFields: Object.keys(args.settings),
                },
              })
            );

            return { success: true };
          }),

        /**
         * Check if user has permission in org
         */
        checkPermission: (args: {
          userId: Id<'entities'>;
          orgId: Id<'entities'>;
          permission: string;
        }) =>
          Effect.gen(function* () {
            const membership = yield* Effect.tryPromise(() =>
              db.query('connections')
                .withIndex('from_type', (q) =>
                  q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
                )
                .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
                .first()
            );

            if (!membership) {
              return false;
            }

            const permissions = membership.metadata?.permissions || [];
            return permissions.includes('*') || permissions.includes(args.permission);
          }),

        /**
         * Get organization by slug
         */
        getBySlug: (slug: string) =>
          Effect.gen(function* () {
            const org = yield* Effect.tryPromise(() =>
              db.query('entities')
                .withIndex('type_slug', (q) =>
                  q.eq('type', 'organization').eq('properties.slug', slug)
                )
                .first()
            );

            if (!org) {
              return yield* Effect.fail(new OrganizationNotFoundError(slug));
            }

            return org;
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

### 2. Organization Middleware (Hono)

#### `api/src/middleware/organization.ts`

```typescript
import { Context } from 'hono';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

/**
 * Organization middleware
 * Extracts orgId from subdomain or header
 * Validates user membership
 */

export const organizationMiddleware = async (c: Context, next: Function) => {
  const convex = new ConvexHttpClient(c.env.CONVEX_URL);

  // Extract org slug from subdomain
  const host = c.req.header('host') || '';
  const subdomain = host.split('.')[0];

  // Skip for main domain or API domain
  if (subdomain === 'api' || subdomain === 'www' || !subdomain.includes('oneie')) {
    // Try to get orgId from header (for API calls)
    const orgId = c.req.header('x-organization-id');
    if (orgId) {
      c.set('orgId', orgId);
    }
    await next();
    return;
  }

  try {
    // Get organization by slug
    const org = await convex.query(api.queries.organizations.getBySlug, {
      slug: subdomain,
    });

    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Check if org is active
    if (org.status !== 'active') {
      return c.json({ error: 'Organization is inactive' }, 403);
    }

    // Set org context
    c.set('orgId', org._id);
    c.set('org', org);

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid organization' }, 400);
  }
};

/**
 * Permission middleware
 * Checks if user has required permission in org
 */
export const requirePermission = (permission: string) => {
  return async (c: Context, next: Function) => {
    const orgId = c.get('orgId');
    const session = c.get('session'); // Set by auth middleware

    if (!orgId || !session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const convex = new ConvexHttpClient(c.env.CONVEX_URL);

    const hasPermission = await convex.query(
      api.queries.organizations.checkPermission,
      {
        userId: session.user.id,
        orgId,
        permission,
      }
    );

    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};
```

### 3. Organization Routes (Hono)

#### `api/src/routes/organizations.ts`

```typescript
import { Hono } from 'hono';
import { Effect } from 'effect';
import { convexMiddleware, ConvexService } from '../services/convex';
import { OrganizationService } from '../../../convex/services/organizations/organization';
import { auth } from '../auth';
import { requirePermission } from '../middleware/organization';

const app = new Hono();

app.use('*', convexMiddleware);

// POST /api/organizations - Create organization
app.post('/', async (c) => {
  const session = await auth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { name, slug, plan } = await c.req.json();

  const convex = c.get('convex') as ConvexService;
  const orgService = new OrganizationService();

  const program = orgService.create({
    name,
    slug,
    creatorId: session.user.id,
    plan,
  });

  const result = await Effect.runPromise(
    program.pipe(
      Effect.catchAll((error) => {
        if (error._tag === 'DuplicateSlugError') {
          return Effect.succeed({
            error: 'Slug already taken',
            code: 'DUPLICATE_SLUG',
          });
        }
        return Effect.succeed({ error: 'Failed to create organization' });
      })
    )
  );

  if ('error' in result) {
    return c.json(result, 400);
  }

  return c.json(result, 201);
});

// GET /api/organizations/:slug - Get organization
app.get('/:slug', async (c) => {
  const convex = c.get('convex') as ConvexService;
  const org = await convex.getOrganizationBySlug(c.req.param('slug'));

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  return c.json(org);
});

// POST /api/organizations/:id/members - Add member
app.post('/:id/members', requirePermission('manage_users'), async (c) => {
  const session = await auth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  const { userId, role } = await c.req.json();

  const orgService = new OrganizationService();
  const program = orgService.addMember({
    orgId: c.req.param('id'),
    userId,
    role,
    invitedBy: session.user.id,
  });

  const result = await Effect.runPromise(
    program.pipe(
      Effect.catchAll((error) => {
        if (error._tag === 'QuotaExceededError') {
          return Effect.succeed({
            error: `User limit exceeded (${error.limit})`,
            code: 'QUOTA_EXCEEDED',
          });
        }
        if (error._tag === 'InsufficientPermissionsError') {
          return Effect.succeed({
            error: 'Insufficient permissions',
            code: 'FORBIDDEN',
          });
        }
        return Effect.succeed({ error: 'Failed to add member' });
      })
    )
  );

  if ('error' in result) {
    return c.json(result, 400);
  }

  return c.json(result);
});

// PATCH /api/organizations/:id/settings - Update settings
app.patch('/:id/settings', requirePermission('manage_settings'), async (c) => {
  const session = await auth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  const settings = await c.req.json();

  const orgService = new OrganizationService();
  const program = orgService.updateSettings({
    orgId: c.req.param('id'),
    userId: session.user.id,
    settings,
  });

  const result = await Effect.runPromise(program);

  return c.json(result);
});

export const organizationRoutes = app;
```

### 4. Scoped Queries (Convex)

#### `convex/queries/tokens.ts` (with org filtering)

```typescript
import { v } from 'convex/values';
import { query } from '../_generated/server';

/**
 * Token queries scoped to organization
 */

export const list = query({
  args: {
    orgId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // Get tokens owned by organization
    const orgTokens = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.orgId).eq('relationshipType', 'owns')
      )
      .collect();

    const tokenIds = orgTokens
      .map((c) => c.toEntityId)
      .filter((id) => id !== undefined);

    const tokens = await Promise.all(
      tokenIds.map(async (id) => {
        const entity = await ctx.db.get(id);
        if (entity && entity.type === 'token') {
          return entity;
        }
        return null;
      })
    );

    return tokens.filter((t) => t !== null);
  },
});

export const getBalance = query({
  args: {
    userId: v.id('entities'),
    tokenId: v.id('entities'),
    orgId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // Verify token belongs to org
    const ownership = await ctx.db
      .query('connections')
      .withIndex('from_to', (q) =>
        q.eq('fromEntityId', args.orgId).eq('toEntityId', args.tokenId)
      )
      .filter((q) => q.eq(q.field('relationshipType'), 'owns'))
      .first();

    if (!ownership) {
      throw new Error('Token does not belong to organization');
    }

    // Get user's balance
    const connection = await ctx.db
      .query('connections')
      .withIndex('from_to', (q) =>
        q.eq('fromEntityId', args.userId).eq('toEntityId', args.tokenId)
      )
      .filter((q) => q.eq(q.field('relationshipType'), 'holds_tokens'))
      .first();

    return connection?.metadata?.balance || 0;
  },
});
```

### 5. Frontend: Organization Context

#### `src/lib/organization-context.tsx`

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface Organization {
  _id: Id<'entities'>;
  name: string;
  slug: string;
  settings: {
    branding: {
      logo?: string;
      primaryColor: string;
      theme: 'light' | 'dark';
    };
    features: Record<string, boolean>;
    limits: Record<string, number>;
  };
}

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  hasFeature: (feature: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({
  children,
  orgSlug,
}: {
  children: ReactNode;
  orgSlug: string;
}) {
  const organization = useQuery(api.queries.organizations.getBySlug, {
    slug: orgSlug,
  });

  const hasFeature = (feature: string) => {
    return organization?.properties.settings.features[feature] || false;
  };

  const hasPermission = (permission: string) => {
    // TODO: Check user's permissions in this org
    return true;
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization: organization || null,
        isLoading: organization === undefined,
        hasFeature,
        hasPermission,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
```

#### `src/pages/[org]/dashboard.astro`

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import { OrganizationProvider } from '@/lib/organization-context';
import Dashboard from '@/components/dashboard/Dashboard';

// Extract org slug from URL
const orgSlug = Astro.params.org;

// Fetch org data server-side
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const org = await convex.query(api.queries.organizations.getBySlug, {
  slug: orgSlug,
});

if (!org) {
  return Astro.redirect('/404');
}

// Apply org branding
const primaryColor = org.properties.settings.branding.primaryColor;
---

<Layout title={`${org.name} - Dashboard`}>
  <style define:vars={{ primaryColor }}>
    :root {
      --color-primary: var(--primaryColor);
    }
  </style>

  <OrganizationProvider client:load orgSlug={orgSlug}>
    <Dashboard client:load />
  </OrganizationProvider>
</Layout>
```

### 6. Feature Gating

#### `src/components/features/FeatureGate.tsx`

```typescript
import { useOrganization } from '@/lib/organization-context';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature, organization } = useOrganization();

  if (!hasFeature(feature)) {
    return (
      fallback || (
        <Alert>
          <AlertDescription>
            This feature is not available on your current plan.
            <a href={`/${organization?.slug}/billing`} className="underline ml-1">
              Upgrade now
            </a>
          </AlertDescription>
        </Alert>
      )
    );
  }

  return <>{children}</>;
}
```

**Usage:**

```typescript
import { FeatureGate } from '@/components/features/FeatureGate';
import { AICloneCreator } from '@/components/ai-clone/AICloneCreator';

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <FeatureGate feature="aiClone">
        <AICloneCreator />
      </FeatureGate>

      <FeatureGate feature="customDomain">
        <CustomDomainSettings />
      </FeatureGate>
    </div>
  );
}
```

## Subdomain Routing

### Cloudflare Pages Configuration

**`wrangler.toml`:**

```toml
name = "oneie-frontend"
compatibility_date = "2024-01-01"

[[routes]]
pattern = "*.oneie.com/*"
zone_name = "oneie.com"
custom_domain = true

[env.production]
routes = [
  { pattern = "*.oneie.com/*", custom_domain = true }
]
```

### Subdomain Extraction (Astro Middleware)

#### `src/middleware/organization.ts`

```typescript
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  // Skip main domain
  if (subdomain === 'www' || subdomain === 'oneie' || !host.includes('oneie.com')) {
    return next();
  }

  // Store org slug in context
  context.locals.orgSlug = subdomain;

  return next();
});
```

**Usage in pages:**

```astro
---
const orgSlug = Astro.locals.orgSlug;
---
```

## Billing & Quotas

### Plan Configuration

#### `convex/config/plans.ts`

```typescript
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    features: {
      aiClone: false,
      tokenEconomy: true,
      customDomain: false,
      analytics: 'basic',
    },
    limits: {
      maxUsers: 10,
      maxAgents: 3,
      maxTokens: 100000,
      maxContent: 100,
    },
  },
  pro: {
    name: 'Pro',
    price: 99,
    features: {
      aiClone: true,
      tokenEconomy: true,
      customDomain: false,
      analytics: 'advanced',
    },
    limits: {
      maxUsers: 100,
      maxAgents: 10,
      maxTokens: 1000000,
      maxContent: 1000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    features: {
      aiClone: true,
      tokenEconomy: true,
      customDomain: true,
      analytics: 'custom',
    },
    limits: {
      maxUsers: -1, // Unlimited
      maxAgents: -1,
      maxTokens: -1,
      maxContent: -1,
    },
  },
} as const;
```

### Quota Checking

```typescript
// In OrganizationService
checkQuota: (args: {
  orgId: Id<'entities'>;
  resource: 'users' | 'agents' | 'tokens' | 'content';
}) =>
  Effect.gen(function* () {
    const org = yield* Effect.tryPromise(() => db.get(args.orgId));
    if (!org) {
      return yield* Effect.fail(new OrganizationNotFoundError(args.orgId));
    }

    const limit = org.properties.settings.limits[`max${args.resource.charAt(0).toUpperCase() + args.resource.slice(1)}`];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, current: 0 };
    }

    // Count current usage
    const connections = yield* Effect.tryPromise(() =>
      db.query('connections')
        .withIndex('from_type', (q) =>
          q.eq('fromEntityId', args.orgId).eq('relationshipType', 'owns')
        )
        .collect()
    );

    const current = connections.length;

    if (current >= limit) {
      return yield* Effect.fail(new QuotaExceededError(args.resource, limit));
    }

    return { allowed: true, limit, current };
  })
```

## Multi-Tenant Benefits

### 1. Data Isolation

✅ **Complete separation**: Each org's data is isolated via `orgId` filtering
✅ **No cross-contamination**: Users can't access other orgs' resources
✅ **Audit trail**: All events tagged with `orgId`

### 2. Customization

✅ **Custom branding**: Logo, colors, theme per org
✅ **Feature flags**: Enable/disable features per org
✅ **Custom domains**: `acme-corp.oneie.com` or `app.acmecorp.com`

### 3. Scalability

✅ **Shared infrastructure**: Single API + database serves all orgs
✅ **Independent deployments**: Each org can have custom frontend
✅ **Cost efficiency**: Shared backend reduces operational costs

### 4. Flexibility

✅ **Per-org billing**: Different plans, pricing, quotas
✅ **Role-based access**: Granular permissions within each org
✅ **Multi-org users**: Users can belong to multiple organizations

## Migration from Single-Tenant

### Phase 1: Add Organization Entity

1. Create `organization` entity type in schema
2. Create default organization for existing users
3. Add `member_of` connections for all users

### Phase 2: Add Organization Ownership

1. Add `owns` connections: organization → resources
2. Update all resource creation to set ownership
3. Migrate existing resources to default org

### Phase 3: Add Organization Filtering

1. Update all queries to filter by `orgId`
2. Add organization middleware to Hono
3. Add organization context to frontend

### Phase 4: Enable Multi-Tenancy

1. Add subdomain routing
2. Enable custom branding per org
3. Add billing/quota system
4. Launch multi-org support

## Best Practices

### 1. Always Filter by orgId

```typescript
// ❌ Bad: No org filtering
const tokens = await ctx.db.query('entities').filter((q) => q.eq(q.field('type'), 'token')).collect();

// ✅ Good: Filtered by org
const orgTokens = await ctx.db
  .query('connections')
  .withIndex('from_type', (q) =>
    q.eq('fromEntityId', orgId).eq('relationshipType', 'owns')
  )
  .collect();
```

### 2. Check Permissions

```typescript
// ❌ Bad: No permission check
app.delete('/api/agents/:id', async (c) => {
  await convex.deleteAgent(c.req.param('id'));
});

// ✅ Good: Permission check
app.delete('/api/agents/:id', requirePermission('delete_agents'), async (c) => {
  await convex.deleteAgent(c.req.param('id'));
});
```

### 3. Respect Quotas

```typescript
// ✅ Always check quotas before creating resources
const quota = await orgService.checkQuota({ orgId, resource: 'agents' });
if (!quota.allowed) {
  throw new QuotaExceededError('agents', quota.limit);
}
```

### 4. Log Organization Events

```typescript
// ✅ All significant actions should be logged with orgId
await ctx.db.insert('events', {
  entityId: agentId,
  eventType: 'agent_created',
  timestamp: Date.now(),
  actorType: 'user',
  actorId: userId,
  metadata: {
    orgId,  // Include organization context
    agentType: 'ai_clone',
  },
});
```

## Next Steps

1. Add `organization` entity type to schema
2. Create OrganizationService (Effect.ts)
3. Add organization middleware to Hono
4. Implement subdomain routing
5. Add organization context to frontend
6. Implement feature gating
7. Add billing/subscription system
8. Enable custom domains
9. Migrate existing users to default org
10. Launch multi-tenant support

**Result:** A fully multi-tenant platform where organizations have complete data isolation, custom branding, and flexible billing, all powered by the 4-table ontology.
