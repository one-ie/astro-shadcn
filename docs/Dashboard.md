# Dashboard.md - Multi-Tenant UI Architecture

**Purpose:** Define the dashboard UI system for platform owner, organization owners, organization users, and customers in the Hono multi-tenant architecture.

---

## Overview

The ONE Platform has **four distinct dashboard experiences** based on user role:

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM OWNER                           │
│  (You - System Admin)                                       │
│  - Manage all organizations                                 │
│  - Platform-wide analytics                                  │
│  - System configuration                                     │
│  - Billing & revenue                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   ORGANIZATION OWNER                        │
│  (Business Admin)                                           │
│  - Manage their organization                                │
│  - Team members & permissions                               │
│  - Organization settings                                    │
│  - Org-level analytics                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   ORGANIZATION USER                         │
│  (Employee/Member)                                          │
│  - Access org resources                                     │
│  - Personal workspace                                       │
│  - Team collaboration                                       │
│  - Limited settings                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER/END-USER                       │
│  (Public User)                                              │
│  - Purchase tokens/content                                  │
│  - Consume content                                          │
│  - Personal profile                                         │
│  - Transaction history                                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Each role sees a **completely different dashboard** built from the same component library, powered by the same Hono API + Convex backend.

---

## Architecture Pattern

### Multi-Tenant Dashboard Flow

```
User Signs In
    ↓
Middleware: Check session (Better Auth)
    ↓
Middleware: Determine role (platform_owner, org_owner, org_user, customer)
    ↓
Middleware: Fetch org context (if applicable)
    ↓
Route to appropriate dashboard
    ↓
┌─────────────────────────────────────────────────────────┐
│  Platform Owner Dashboard (/admin/*)                    │
│  Organization Owner Dashboard (/org/:orgId/admin/*)     │
│  Organization User Dashboard (/org/:orgId/*)            │
│  Customer Dashboard (/dashboard/*)                      │
└─────────────────────────────────────────────────────────┘
    ↓
Load role-specific components
    ↓
Fetch data via Convex hooks (real-time) + Hono API (mutations)
    ↓
Render dashboard with proper permissions
```

---

## 1. Platform Owner Dashboard (System Admin)

**Route:** `/admin/*`
**Role:** `platform_owner`
**Access:** You (system administrator)

### Features

**Organization Management:**
- View all organizations
- Create/suspend/delete organizations
- Assign organization owners
- Set organization limits (users, storage, API calls)

**Platform Analytics:**
- Total revenue across all orgs
- Active users (platform-wide)
- API usage metrics
- Storage consumption
- Error rates

**System Configuration:**
- Feature flags (enable/disable features globally)
- Rate limits (API, database queries)
- Email templates
- Pricing plans

**Billing & Revenue:**
- Subscription management (all orgs)
- Payment processing
- Revenue reports
- Churn analysis

### Implementation

#### Page: `/admin/index.astro`

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import AdminLayout from '@/layouts/AdminLayout.astro';
import PlatformStats from '@/components/admin/PlatformStats';
import OrganizationList from '@/components/admin/OrganizationList';
import RevenueChart from '@/components/admin/RevenueChart';

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

// Verify platform owner role
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });

if (!user || user.role !== 'platform_owner') {
  return Astro.redirect('/403');
}

// Fetch platform-wide stats
const platformStats = await convex.query(api.queries.admin.getPlatformStats);
const organizations = await convex.query(api.queries.admin.listOrganizations);
---

<AdminLayout title="Platform Admin Dashboard">
  <div class="space-y-8">
    <h1 class="text-4xl font-bold">Platform Dashboard</h1>

    <!-- Real-time stats -->
    <PlatformStats client:load initialStats={platformStats} />

    <!-- Revenue chart -->
    <RevenueChart client:load />

    <!-- Organization list -->
    <OrganizationList client:load initialOrgs={organizations} />
  </div>
</AdminLayout>
```

#### Component: `src/components/admin/PlatformStats.tsx`

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PlatformStatsProps {
  initialStats: {
    totalOrgs: number;
    totalUsers: number;
    totalRevenue: number;
    activeUsers: number;
  };
}

/**
 * Platform-wide statistics (real-time)
 */
export function PlatformStats({ initialStats }: PlatformStatsProps) {
  // Real-time updates via Convex
  const stats = useQuery(api.queries.admin.getPlatformStats) || initialStats;

  return (
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-4xl font-bold">{stats.totalOrgs}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-4xl font-bold">{stats.totalUsers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-4xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Users (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-4xl font-bold">{stats.activeUsers}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Component: `src/components/admin/OrganizationList.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Effect } from 'effect';
import { api as convexApi } from '@/convex/_generated/api';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '@/convex/_generated/dataModel';

interface Organization {
  _id: Id<'entities'>;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  userCount: number;
  plan: string;
  createdAt: number;
}

export function OrganizationList({ initialOrgs }: { initialOrgs: Organization[] }) {
  const { toast } = useToast();

  // Real-time org list
  const orgs = useQuery(convexApi.queries.admin.listOrganizations) || initialOrgs;

  const handleSuspendOrg = async (orgId: Id<'entities'>) => {
    const program = apiClient.request('/admin/organizations/suspend', {
      method: 'POST',
      body: JSON.stringify({ orgId }),
    }).pipe(
      Effect.catchAll((error) =>
        Effect.sync(() => {
          toast({
            title: 'Error',
            description: 'Failed to suspend organization',
            variant: 'destructive',
          });
        })
      )
    );

    await Effect.runPromise(program);
  };

  return (
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Organizations</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Organization</Button>
          </DialogTrigger>
          <DialogContent>
            {/* Create org form */}
          </DialogContent>
        </Dialog>
      </div>

      <div class="grid gap-4">
        {orgs.map((org) => (
          <Card key={org._id}>
            <CardContent class="flex justify-between items-center p-6">
              <div>
                <h3 class="font-bold">{org.name}</h3>
                <p class="text-sm text-muted-foreground">
                  {org.userCount} users • {org.plan} plan
                </p>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleSuspendOrg(org._id)}
                >
                  Suspend
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Organization Owner Dashboard

**Route:** `/org/:orgId/admin/*`
**Role:** `org_owner`
**Access:** Business admin (one per organization)

### Features

**Team Management:**
- Invite team members
- Assign roles & permissions
- Remove members
- View member activity

**Organization Settings:**
- Update org profile
- Branding (logo, colors, domain)
- Billing information
- Subscription plan

**Analytics (Org-Scoped):**
- Org-specific revenue
- Active users in org
- Content created
- Token usage

**Resource Management:**
- View all org content
- Manage AI agents
- Configure automations
- Set org-wide defaults

### Implementation

#### Page: `/org/[orgId]/admin/index.astro`

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import OrgAdminLayout from '@/layouts/OrgAdminLayout.astro';
import OrgStats from '@/components/org-admin/OrgStats';
import TeamMembers from '@/components/org-admin/TeamMembers';
import OrgSettings from '@/components/org-admin/OrgSettings';

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });

// Verify org ownership
const orgId = Astro.params.orgId;
const membership = await convex.query(api.queries.organizations.getMembership, {
  userId: user._id,
  orgId,
});

if (!membership || membership.role !== 'org_owner') {
  return Astro.redirect('/403');
}

// Fetch org data
const org = await convex.query(api.queries.organizations.get, { id: orgId });
const stats = await convex.query(api.queries.organizations.getStats, { orgId });
const members = await convex.query(api.queries.organizations.listMembers, { orgId });
---

<OrgAdminLayout title={`${org.name} - Admin`} orgId={orgId}>
  <div class="space-y-8">
    <h1 class="text-4xl font-bold">{org.name} Dashboard</h1>

    <!-- Org stats -->
    <OrgStats client:load orgId={orgId} initialStats={stats} />

    <!-- Team members -->
    <TeamMembers client:load orgId={orgId} initialMembers={members} />

    <!-- Settings -->
    <OrgSettings client:load orgId={orgId} org={org} />
  </div>
</OrgAdminLayout>
```

#### Component: `src/components/org-admin/TeamMembers.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Effect } from 'effect';
import { api as convexApi } from '@/convex/_generated/api';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Id } from '@/convex/_generated/dataModel';

interface Member {
  userId: Id<'entities'>;
  email: string;
  name: string;
  role: 'org_owner' | 'org_user';
  joinedAt: number;
}

export function TeamMembers({
  orgId,
  initialMembers,
}: {
  orgId: Id<'entities'>;
  initialMembers: Member[];
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'org_user'>('org_user');

  // Real-time member list
  const members = useQuery(convexApi.queries.organizations.listMembers, { orgId }) || initialMembers;

  const handleInvite = async () => {
    const program = apiClient.request('/org/invite', {
      method: 'POST',
      body: JSON.stringify({
        orgId,
        email: inviteEmail,
        role: inviteRole,
      }),
    });

    await Effect.runPromise(program);
    setInviteEmail('');
  };

  const handleRemoveMember = async (userId: Id<'entities'>) => {
    const program = apiClient.request('/org/remove-member', {
      method: 'POST',
      body: JSON.stringify({ orgId, userId }),
    });

    await Effect.runPromise(program);
  };

  return (
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Team Members</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <div class="space-y-4">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as 'org_user')}
              >
                <option value="org_user">User</option>
              </Select>
              <Button onClick={handleInvite}>Send Invite</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div class="grid gap-4">
        {members.map((member) => (
          <Card key={member.userId}>
            <CardContent class="flex justify-between items-center p-6">
              <div>
                <p class="font-bold">{member.name}</p>
                <p class="text-sm text-muted-foreground">{member.email}</p>
                <p class="text-xs text-muted-foreground">{member.role}</p>
              </div>
              {member.role !== 'org_owner' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                >
                  Remove
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Organization User Dashboard

**Route:** `/org/:orgId/*`
**Role:** `org_user`
**Access:** Team members, employees

### Features

**Personal Workspace:**
- My content
- My agents
- My tasks
- Recent activity

**Team Collaboration:**
- Shared content library
- Team agents
- Messages/notifications
- Activity feed

**Resource Access:**
- View org content
- Use org agents
- Access org templates
- Limited settings (profile only)

### Implementation

#### Page: `/org/[orgId]/index.astro`

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import OrgUserLayout from '@/layouts/OrgUserLayout.astro';
import MyWorkspace from '@/components/org-user/MyWorkspace';
import TeamResources from '@/components/org-user/TeamResources';
import ActivityFeed from '@/components/org-user/ActivityFeed';

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });

// Verify org membership
const orgId = Astro.params.orgId;
const membership = await convex.query(api.queries.organizations.getMembership, {
  userId: user._id,
  orgId,
});

if (!membership) {
  return Astro.redirect('/403');
}

// Fetch user's workspace data
const myContent = await convex.query(api.queries.content.listByUser, {
  userId: user._id,
  orgId,
});

const teamResources = await convex.query(api.queries.organizations.getSharedResources, {
  orgId,
});
---

<OrgUserLayout title="My Workspace" orgId={orgId}>
  <div class="space-y-8">
    <h1 class="text-4xl font-bold">Welcome, {user.name}!</h1>

    <!-- My workspace -->
    <MyWorkspace client:load userId={user._id} orgId={orgId} initialContent={myContent} />

    <!-- Team resources -->
    <TeamResources client:load orgId={orgId} resources={teamResources} />

    <!-- Activity feed -->
    <ActivityFeed client:load userId={user._id} orgId={orgId} />
  </div>
</OrgUserLayout>
```

---

## 4. Customer Dashboard (End-User)

**Route:** `/dashboard/*`
**Role:** `customer`
**Access:** Public users, content consumers

### Features

**Content Access:**
- Purchased content
- Bookmarked content
- Recommended content
- Content history

**Token Management:**
- Token balance
- Purchase history
- Spend history
- Token packages

**Profile:**
- Personal information
- Payment methods
- Subscription status
- Preferences

**Transactions:**
- Purchase history
- Invoices
- Refunds
- Support tickets

### Implementation

#### Page: `/dashboard/index.astro`

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import CustomerLayout from '@/layouts/CustomerLayout.astro';
import TokenBalance from '@/components/customer/TokenBalance';
import PurchasedContent from '@/components/customer/PurchasedContent';
import RecommendedContent from '@/components/customer/RecommendedContent';

// Check authentication
const session = Astro.cookies.get('session')?.value;
if (!session) {
  return Astro.redirect('/signin');
}

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.auth.getCurrentUser, { sessionToken: session });

// Fetch customer data
const tokenBalance = await convex.query(api.queries.tokens.getBalance, {
  userId: user._id,
});

const purchasedContent = await convex.query(api.queries.content.listPurchased, {
  userId: user._id,
});

const recommended = await convex.query(api.queries.content.getRecommended, {
  userId: user._id,
});
---

<CustomerLayout title="My Dashboard">
  <div class="space-y-8">
    <h1 class="text-4xl font-bold">Welcome, {user.name}!</h1>

    <!-- Token balance -->
    <TokenBalance client:load userId={user._id} initialBalance={tokenBalance} />

    <!-- Purchased content -->
    <PurchasedContent client:load content={purchasedContent} />

    <!-- Recommended -->
    <RecommendedContent client:load content={recommended} />
  </div>
</CustomerLayout>
```

#### Component: `src/components/customer/TokenBalance.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Effect } from 'effect';
import { api as convexApi } from '@/convex/_generated/api';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import type { Id } from '@/convex/_generated/dataModel';

export function TokenBalance({
  userId,
  initialBalance,
}: {
  userId: Id<'entities'>;
  initialBalance: number;
}) {
  // Real-time balance
  const balance = useQuery(convexApi.queries.tokens.getBalance, { userId }) || initialBalance;

  const handlePurchase = async (amount: number) => {
    const program = apiClient.request('/tokens/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });

    await Effect.runPromise(program);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balance</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p class="text-5xl font-bold">{balance.toLocaleString()} tokens</p>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Buy More Tokens</Button>
          </DialogTrigger>
          <DialogContent>
            <div class="space-y-4">
              <h3 class="text-xl font-bold">Purchase Tokens</h3>
              <div class="grid grid-cols-3 gap-4">
                <Button onClick={() => handlePurchase(100)}>
                  100 tokens
                  <br />
                  $10
                </Button>
                <Button onClick={() => handlePurchase(500)}>
                  500 tokens
                  <br />
                  $45
                </Button>
                <Button onClick={() => handlePurchase(1000)}>
                  1000 tokens
                  <br />
                  $80
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

---

## Permission System

### Role-Based Access Control (RBAC)

**Database Schema:**

```typescript
// convex/schema.ts
export default defineSchema({
  entities: defineTable({
    entityType: v.string(),
    // ... other fields
    role: v.optional(v.union(
      v.literal('platform_owner'),
      v.literal('org_owner'),
      v.literal('org_user'),
      v.literal('customer')
    )),
  }),

  connections: defineTable({
    fromEntityId: v.id('entities'),
    toEntityId: v.id('entities'),
    relationshipType: v.string(),
    metadata: v.any(), // { role: 'org_owner' | 'org_user', permissions: [] }
  }),
});
```

**Permission Checks (Hono Middleware):**

```typescript
// api/src/middleware/permissions.ts
import { Effect, Context } from 'effect';
import { ConvexDatabase } from '../services/convex';

export class PermissionError {
  readonly _tag = 'PermissionError';
  constructor(readonly message: string) {}
}

/**
 * Check if user is platform owner
 */
export const requirePlatformOwner = Effect.gen(function* () {
  const db = yield* ConvexDatabase;
  const session = yield* SessionService;

  const user = yield* session.getUser();

  if (user.role !== 'platform_owner') {
    return yield* Effect.fail(new PermissionError('Platform owner access required'));
  }

  return user;
});

/**
 * Check if user owns organization
 */
export const requireOrgOwner = (orgId: string) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const session = yield* SessionService;

    const user = yield* session.getUser();

    // Check membership
    const membership = yield* db.query(api.queries.organizations.getMembership, {
      userId: user._id,
      orgId,
    });

    if (!membership || membership.role !== 'org_owner') {
      return yield* Effect.fail(new PermissionError('Organization owner access required'));
    }

    return { user, membership };
  });

/**
 * Check if user is member of organization
 */
export const requireOrgMember = (orgId: string) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const session = yield* SessionService;

    const user = yield* session.getUser();

    const membership = yield* db.query(api.queries.organizations.getMembership, {
      userId: user._id,
      orgId,
    });

    if (!membership) {
      return yield* Effect.fail(new PermissionError('Organization access required'));
    }

    return { user, membership };
  });
```

**Usage in Hono Routes:**

```typescript
// api/src/routes/admin.ts
import { requirePlatformOwner } from '../middleware/permissions';

app.get('/admin/organizations', async (c) => {
  const program = Effect.gen(function* () {
    // Verify platform owner
    const user = yield* requirePlatformOwner;

    // Fetch all orgs
    const db = yield* ConvexDatabase;
    const orgs = yield* db.query(api.queries.admin.listOrganizations);

    return orgs;
  }).pipe(Effect.provide(MainLayer));

  return runEffectHandler(c, program);
});
```

---

## Multi-Tenant Routing Strategy

### URL Structure

```
Platform Owner:
  /admin/*                    - Platform admin dashboard

Organization Owner:
  /org/:orgId/admin/*         - Org admin dashboard

Organization User:
  /org/:orgId/*               - Org user workspace

Customer:
  /dashboard/*                - Customer dashboard
  /content/:contentId         - View content
  /tokens                     - Manage tokens
```

### Route Protection Middleware

```typescript
// src/middleware/auth.ts
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;
  const session = context.cookies.get('session')?.value;

  // Public routes
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return next();
  }

  // Require authentication
  if (!session) {
    return context.redirect('/signin');
  }

  // Fetch user
  const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
  const user = await convex.query(api.queries.auth.getCurrentUser, {
    sessionToken: session,
  });

  if (!user) {
    return context.redirect('/signin');
  }

  // Platform admin routes
  if (pathname.startsWith('/admin/')) {
    if (user.role !== 'platform_owner') {
      return context.redirect('/403');
    }
  }

  // Organization routes
  if (pathname.startsWith('/org/')) {
    const orgId = pathname.split('/')[2];
    const membership = await convex.query(api.queries.organizations.getMembership, {
      userId: user._id,
      orgId,
    });

    if (!membership) {
      return context.redirect('/403');
    }

    // Org admin routes
    if (pathname.includes('/admin/')) {
      if (membership.role !== 'org_owner') {
        return context.redirect('/403');
      }
    }
  }

  return next();
};
```

---

## Component Library Organization

### File Structure

```
src/components/
├── admin/                      # Platform owner components
│   ├── PlatformStats.tsx
│   ├── OrganizationList.tsx
│   ├── RevenueChart.tsx
│   └── SystemConfig.tsx
│
├── org-admin/                  # Organization owner components
│   ├── OrgStats.tsx
│   ├── TeamMembers.tsx
│   ├── OrgSettings.tsx
│   └── BillingInfo.tsx
│
├── org-user/                   # Organization user components
│   ├── MyWorkspace.tsx
│   ├── TeamResources.tsx
│   ├── ActivityFeed.tsx
│   └── PersonalSettings.tsx
│
├── customer/                   # Customer components
│   ├── TokenBalance.tsx
│   ├── PurchasedContent.tsx
│   ├── RecommendedContent.tsx
│   └── TransactionHistory.tsx
│
└── shared/                     # Shared across all dashboards
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── NotificationBell.tsx
    └── SearchBar.tsx
```

---

## Real-Time Updates Strategy

### Convex Subscriptions by Role

**Platform Owner:**
```typescript
// Real-time platform stats
const platformStats = useQuery(api.queries.admin.getPlatformStats);
const orgList = useQuery(api.queries.admin.listOrganizations);
const revenueData = useQuery(api.queries.admin.getRevenueData);
```

**Organization Owner:**
```typescript
// Real-time org stats
const orgStats = useQuery(api.queries.organizations.getStats, { orgId });
const members = useQuery(api.queries.organizations.listMembers, { orgId });
const orgRevenue = useQuery(api.queries.organizations.getRevenue, { orgId });
```

**Organization User:**
```typescript
// Real-time workspace
const myContent = useQuery(api.queries.content.listByUser, { userId, orgId });
const teamActivity = useQuery(api.queries.activity.getTeamFeed, { orgId });
const notifications = useQuery(api.queries.notifications.list, { userId });
```

**Customer:**
```typescript
// Real-time balance and purchases
const balance = useQuery(api.queries.tokens.getBalance, { userId });
const purchases = useQuery(api.queries.transactions.list, { userId });
const recommended = useQuery(api.queries.content.getRecommended, { userId });
```

---

## Summary

### Dashboard Types

| Role | Route | Features | Access Level |
|------|-------|----------|--------------|
| **Platform Owner** | `/admin/*` | Manage all orgs, platform analytics, system config | Full platform access |
| **Organization Owner** | `/org/:orgId/admin/*` | Manage org, team, billing | Full org access |
| **Organization User** | `/org/:orgId/*` | Personal workspace, team resources | Limited org access |
| **Customer** | `/dashboard/*` | Purchased content, tokens, profile | Personal data only |

### Key Architecture Decisions

1. **Role-Based Routing**: Different URL structures for different roles
2. **Permission Middleware**: Effect.ts services for permission checks
3. **Real-Time Updates**: Convex hooks for live data per role
4. **Shared Components**: Same UI library (shadcn/ui) for all dashboards
5. **Multi-Tenant Data**: Organization context in all queries/mutations

### Related Documentation

- **[Frontend.md](./Frontend.md)** - Astro + React frontend patterns
- **[Middleware.md](./Middleware.md)** - API client and auth middleware
- **[Hono.md](./Hono.md)** - Hono API backend with multi-tenancy
- **[Architecture.md](./Architecture.md)** - Complete system architecture

Each dashboard provides a **role-specific experience** while sharing the same backend infrastructure! 🚀
