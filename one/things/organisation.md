# Organization (Thing)

Purpose: Define the `organization` thing and its relationships, events, and queries as part of the single source of truth.

## Overview

The ONE Platform operates as a multi-tenant system where:
- **Platform Owner (Anthony)** owns the infrastructure and smart contracts (100%)
- **Organizations** are tenant containers for resources and users
- **Org Owners** manage their organizations and members
- **Org Users** have scoped access to organization resources

## Thing Type: `organization`

**Properties Structure:**
```typescript
{
  type: "organization",
  name: string,
  properties: {
    // Identity
    slug: string,              // URL-friendly (e.g., "acme")
    domain?: string,           // Custom domain (e.g., "acme.one.ie")
    logo?: string,
    description?: string,

    // Status & Plan
    status: "active" | "suspended" | "trial" | "cancelled",
    plan: "starter" | "pro" | "enterprise",

    // Limits & Usage
    limits: {
      users: number,
      storage: number,         // GB
      apiCalls: number,        // Per month
      inferences: number,      // Per month (NEW)
    },
    usage: {
      users: number,
      storage: number,
      apiCalls: number,
      inferences: number,      // (NEW)
    },

    // Billing
    billing: {
      customerId?: string,     // Stripe customer ID
      subscriptionId?: string,
      currentPeriodEnd?: number,
      // Blockchain billing (NEW)
      cryptoEnabled: boolean,
      treasuryAddress?: {
        sui?: string,
        solana?: string,
        base?: string,
      },
    },

    // Settings
    settings: {
      allowSignups: boolean,
      requireEmailVerification: boolean,
      enableTwoFactor: boolean,
      allowedDomains?: string[],
      // Inference settings (NEW)
      inferenceEnabled: boolean,
      inferenceModels: string[],  // ["gpt-4", "claude-3.5", "llama-3"]
    },

    // Revenue share (if org generates platform revenue)
    revenueShare?: number,     // 0.0 to 1.0 (0 = platform keeps all)

    createdAt: number,
    trialEndsAt?: number,
  },
  status: "active",
}
```

## Core Relationships (Connections)

**Membership:** `creator` → `organization` via `member_of`
- `metadata.role`: `"org_owner"` | `"org_user"`
- `metadata.permissions`: Array of permission strings

**Ownership:** `creator` → `organization` via `owns`
- Platform owner (Anthony) owns the ONE organization at 100%
- Org owners may own their organizations

**Resource Ownership:** `organization` → resources via `owns`
- Content, workflows, tokens, products, websites
- All org resources link back to org via ownership connection

## Core Events

**Organization Lifecycle:**
- `organization_created` - When organization is created
- `organization_updated` - Settings, plan, or limits changed
- `user_invited_to_org` - Invitation sent
- `user_joined_org` - User accepts invitation
- `user_removed_from_org` - User removed from org

**Billing Events:**
- `payment_event` - Subscription payments (Stripe or crypto)
- `subscription_event` - Plan changes (starter → pro → enterprise)

**Inference Events (NEW):**
- `inference_request` - Org member requests inference
- `inference_completed` - Result delivered
- `inference_quota_exceeded` - Monthly limit hit

**Revenue Events (NEW):**
- `org_revenue_generated` - When org's activity generates platform revenue
- `revenue_share_distributed` - If org has revenue share agreement

## Code Examples

### Create ONE Platform Organization (Anthony's)

```typescript
// Create the ONE organization (owned by Anthony)
const oneOrgId = await db.insert("entities", {
  type: "organization",
  name: "ONE Platform",
  properties: {
    slug: "one",
    domain: "one.ie",
    status: "active",
    plan: "enterprise",
    limits: {
      users: 1000000,      // Unlimited for platform
      storage: 1000000,    // 1PB
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },
    billing: {
      cryptoEnabled: true,
      treasuryAddress: {
        sui: process.env.PLATFORM_TREASURY_SUI,
        solana: process.env.PLATFORM_TREASURY_SOLANA,
        base: process.env.PLATFORM_TREASURY_BASE,
      },
    },
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      inferenceEnabled: true,
      inferenceModels: ["gpt-4", "claude-3.5", "llama-3"],
    },
    revenueShare: 0,  // Anthony keeps 100% of revenue
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Anthony owns the ONE organization (100%)
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
});

// Anthony is also a member with org_owner role
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
  },
  createdAt: Date.now(),
});

// Log creation event
await db.insert("events", {
  type: "organization_created",
  actorId: anthonyId,
  targetId: oneOrgId,
  timestamp: Date.now(),
  metadata: {
    name: "ONE Platform",
    slug: "one",
    plan: "enterprise",
  },
});
```

### Create Customer Organization (Multi-Tenant)

```typescript
// Customer creates their own organization
const customerOrgId = await db.insert("entities", {
  type: "organization",
  name: "Acme Corp",
  properties: {
    slug: "acme",
    domain: "acme.one.ie",
    plan: "pro",
    limits: {
      users: 50,
      storage: 100,        // GB
      apiCalls: 100000,
      inferences: 10000,   // 10K inferences/month
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },
    billing: {
      customerId: "cus_stripe123",
      subscriptionId: "sub_stripe456",
      cryptoEnabled: false,
    },
    settings: {
      allowSignups: false,
      requireEmailVerification: true,
      enableTwoFactor: false,
      inferenceEnabled: true,
      inferenceModels: ["gpt-4", "claude-3.5"],
    },
    revenueShare: 0.1,  // Customer gets 10% revenue share if they refer users
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Customer is org_owner
await db.insert("connections", {
  fromThingId: customerId,
  toThingId: customerOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["read", "write", "admin", "billing"],
  },
  createdAt: Date.now(),
});
```

### Track Organization Inference Usage

```typescript
// User in org requests inference
await db.insert("events", {
  type: "inference_request",
  actorId: userId,
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    organizationId: customerOrgId,
    model: "gpt-4",
    cost: 0.045,
    price: 0.10,
  },
});

// Update org usage
const org = await db.get(customerOrgId);
await db.patch(customerOrgId, {
  properties: {
    ...org.properties,
    usage: {
      ...org.properties.usage,
      inferences: org.properties.usage.inferences + 1,
    },
  },
  updatedAt: Date.now(),
});

// Check if quota exceeded
if (org.properties.usage.inferences >= org.properties.limits.inferences) {
  await db.insert("events", {
    type: "inference_quota_exceeded",
    actorId: "system",
    targetId: customerOrgId,
    timestamp: Date.now(),
    metadata: {
      limit: org.properties.limits.inferences,
      usage: org.properties.usage.inferences,
    },
  });
}
```

### Revenue Share Distribution

```typescript
// When customer org generates platform revenue
await db.insert("events", {
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: anthonyId,  // Platform owner
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,     // $1K generated by org
    orgShare: 100.00,          // 10% to org
    platformShare: 900.00,     // 90% to Anthony
    revenueSharePercentage: 0.1,
  },
});

// Distribute revenue share (if configured)
if (org.properties.revenueShare > 0) {
  await db.insert("events", {
    type: "revenue_share_distributed",
    actorId: anthonyId,
    targetId: customerId,
    timestamp: Date.now(),
    metadata: {
      amount: 100.00,
      percentage: 0.1,
      network: "sui",
      txDigest: "...",
    },
  });
}
```

## Queries

**List organization members:**
```typescript
const members = await db
  .query("connections")
  .withIndex("to_type", q =>
    q.eq("toThingId", organizationId)
     .eq("relationshipType", "member_of")
  )
  .collect();

const memberEntities = await Promise.all(
  members.map(m => db.get(m.fromThingId))
);
```

**List organization resources:**
```typescript
const resources = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", organizationId)
     .eq("relationshipType", "owns")
  )
  .collect();
```

**Get organization inference usage:**
```typescript
const org = await db.get(organizationId);
const usage = org.properties.usage.inferences;
const limit = org.properties.limits.inferences;
const percentageUsed = (usage / limit) * 100;
```

**Recent organization activity:**
```typescript
const events = await db
  .query("events")
  .withIndex("type_time", q => q.eq("targetId", organizationId))
  .order("desc")
  .take(100)
  .collect();
```

**Calculate organization revenue (for revenue share):**
```typescript
const revenueEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "org_revenue_generated")
  )
  .filter(q => q.eq(q.field("actorId"), organizationId))
  .collect();

const totalRevenue = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.totalRevenue,
  0
);
const orgShare = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.orgShare,
  0
);
```

## Multi-Tenant Isolation

**Access Control Pattern:**
```typescript
// Check if user can access org resource
export const canAccess = async (
  userId: Id<"entities">,
  organizationId: Id<"entities">,
  requiredPermission: string
) => {
  const membership = await db
    .query("connections")
    .withIndex("from_type", q =>
      q.eq("fromThingId", userId)
       .eq("toThingId", organizationId)
       .eq("relationshipType", "member_of")
    )
    .first();

  if (!membership) return false;

  const permissions = membership.metadata.permissions || [];
  return permissions.includes("*") || permissions.includes(requiredPermission);
};
```

## Notes

- **Platform Owner (Anthony)** - Owns ONE organization at 100%, receives all platform revenue
- **Multi-tenant** - Each organization isolated via membership connections
- **Protocol-agnostic** - Blockchain interactions via `metadata.network`
- **Inference quotas** - Monthly limits enforced per organization
- **Revenue share** - Optional revenue split for referring orgs (configurable 0-100%)
- **Blockchain billing** - Organizations can pay via crypto (SUI/Solana/Base)
- **Usage tracking** - All inference/API usage tracked in org properties
- **Event history** - Complete audit trail of org activity
