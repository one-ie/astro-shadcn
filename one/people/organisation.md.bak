# Organisation: Multi-Tenant Container

**Organisations own things and delegate ownership to people.**

---

## The Organisation Thing

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
      inferences: number,      // Per month
    },
    usage: {
      users: number,
      storage: number,
      apiCalls: number,
      inferences: number,
    },

    // Billing
    billing: {
      customerId?: string,     // Stripe customer ID
      subscriptionId?: string,
      currentPeriodEnd?: number,
      // Blockchain billing
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
      // Inference settings
      inferenceEnabled: boolean,
      inferenceModels: string[],  // ["gpt-4", "claude-3.5"]
    },

    // Revenue share (if org generates platform revenue)
    revenueShare?: number,     // 0.0 to 1.0 (0 = platform keeps all)

    createdAt: number,
    trialEndsAt?: number,
  },
  status: "active",
}
```

---

## Organisation Connections

### Membership
`creator` → `organization` via `member_of`

```typescript
{
  fromThingId: userId,
  toThingId: organizationId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner" | "org_user",
    permissions: ["read", "write", "admin", "billing"],
    invitedBy?: Id<"things">,
    invitedAt?: number,
    joinedAt: number,
  },
  createdAt: Date.now()
}
```

**Roles:**
- `org_owner` - Full control of organization
- `org_user` - Limited access to organization resources

### Ownership
`creator` → `organization` via `owns`

```typescript
{
  fromThingId: platformOwnerId,
  toThingId: organizationId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
  },
  createdAt: Date.now()
}
```

### Resource Ownership
`organization` → resources via `owns`

```typescript
{
  fromThingId: organizationId,
  toThingId: contentId,
  relationshipType: "owns",
  metadata: {
    createdBy: userId,  // User who created it
  },
  createdAt: Date.now()
}
```

---

## Organisation Events

### Lifecycle
- `organization_created` - When organization is created
- `organization_updated` - Settings, plan, or limits changed
- `user_invited_to_org` - Invitation sent
- `user_joined_org` - User accepts invitation
- `user_removed_from_org` - User removed from org

### Billing
- `payment_event` - Subscription payments (Stripe or crypto)
- `subscription_event` - Plan changes (starter → pro → enterprise)

### Inference
- `inference_request` - Org member requests inference
- `inference_completed` - Result delivered
- `inference_quota_exceeded` - Monthly limit hit

### Revenue
- `org_revenue_generated` - When org's activity generates platform revenue
- `revenue_share_distributed` - If org has revenue share agreement

---

## Multi-Tenant Isolation

Every query must filter by organization:

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

---

## The ONE Organisation

Platform owner creates the ONE organization:

```typescript
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
    usage: { users: 0, storage: 0, apiCalls: 0, inferences: 0 },
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
    revenueShare: 0,  // Platform owner keeps 100%
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

---

## Customer Organisations

Multi-tenant customers create their own organizations:

```typescript
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
      inferences: 10000,   // 10K/month
    },
    usage: { users: 0, storage: 0, apiCalls: 0, inferences: 0 },
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
    revenueShare: 0.1,  // 10% revenue share if they refer users
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

---

## Inference Quotas

Track and enforce inference limits per organization:

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

// Check quota
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
  throw new Error("Inference quota exceeded");
}
```

---

## Revenue Sharing

Organizations can generate platform revenue and receive a share:

```typescript
// When customer org generates platform revenue
await db.insert("events", {
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,     // $1K generated by org
    orgShare: 100.00,          // 10% to org
    platformShare: 900.00,     // 90% to platform owner
    revenueSharePercentage: 0.1,
  },
});

// Distribute revenue share (if configured)
if (org.properties.revenueShare > 0) {
  await db.insert("events", {
    type: "revenue_share_distributed",
    actorId: platformOwnerId,
    targetId: orgOwnerId,
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

---

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

**Calculate organization revenue:**
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
```

---

## Key Principles

- **Platform Owner** - Owns ONE organization at 100%
- **Multi-tenant** - Each organization isolated via membership connections
- **Protocol-agnostic** - Blockchain interactions via `metadata.network`
- **Inference quotas** - Monthly limits enforced per organization
- **Revenue share** - Optional revenue split for referring orgs (0-100%)
- **Usage tracking** - All inference/API usage tracked in org properties
- **Event history** - Complete audit trail of org activity

**Organizations own things. People customize within organizations.**
