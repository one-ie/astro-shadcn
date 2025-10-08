# Things: All Entities in ONE

**If you can point at it and say "this is a ___", it's a thing.**

For complete thing type definitions, see **[Ontology.md](./ontology.md#things-all-the-things)**

---

## The Thing Table

```typescript
{
  _id: Id<"things">,
  type: ThingType,              // See 66 types below
  name: string,                  // Display name
  properties: {                  // Type-specific properties (JSON)
    // Flexible schema - varies by type
  },
  status: "active" | "inactive" | "draft" | "published" | "archived",
  createdAt: number,
  updatedAt: number,
  deletedAt?: number
}
```

---

## 66 Thing Types

### Core (4)
- `creator` - Human creator with role (platform_owner, org_owner, org_user, customer)
- `ai_clone` - Digital twin of creator
- `audience_member` - Fan/user
- `organization` - Multi-tenant container

### Business Agents (10)
- `strategy_agent` - Vision, planning, OKRs
- `research_agent` - Market, trends, competitors
- `marketing_agent` - Content strategy, SEO
- `sales_agent` - Funnels, conversion
- `service_agent` - Support, onboarding
- `design_agent` - Brand, UI/UX
- `engineering_agent` - Tech, integration
- `finance_agent` - Revenue, forecasting
- `legal_agent` - Compliance, contracts
- `intelligence_agent` - Analytics, insights

### Content (7)
- `blog_post` - Written content
- `video` - Video content
- `podcast` - Audio content
- `social_post` - Social media post
- `email` - Email content
- `course` - Educational course
- `lesson` - Individual lesson

### Products (4)
- `digital_product` - Templates, tools, assets
- `membership` - Tiered membership
- `consultation` - 1-on-1 session
- `nft` - NFT collectible

### Community (3)
- `community` - Community space
- `conversation` - Thread/discussion
- `message` - Individual message

### Token (2)
- `token` - Token instance
- `token_contract` - Smart contract

### Platform (6)
- `website` - Auto-generated creator site
- `landing_page` - Custom landing page
- `template` - Design template
- `livestream` - Live broadcast
- `recording` - Saved livestream
- `media_asset` - Images, videos, files

### Business (7)
- `payment` - Payment transaction
- `subscription` - Recurring subscription
- `invoice` - Invoice record
- `metric` - Tracked metric
- `insight` - AI-generated insight
- `prediction` - AI prediction
- `report` - Analytics report

### Authentication & Session (5)
- `session` - User session (Better Auth)
- `oauth_account` - OAuth connection
- `verification_token` - Email/2FA verification
- `password_reset_token` - Password reset
- `ui_preferences` - User UI settings

### Marketing (6)
- `notification` - System notification
- `email_campaign` - Email marketing
- `announcement` - Platform announcement
- `referral` - Referral record
- `campaign` - Marketing campaign
- `lead` - Potential customer

### External Integrations (3)
- `external_agent` - External AI agent (ElizaOS, etc.)
- `external_workflow` - External workflow (n8n, Zapier)
- `external_connection` - Connection to external service

### Protocol Entities (2)
- `mandate` - Intent or cart mandate (AP2)
- `product` - Sellable product (ACP/marketplace)

---

## Common Patterns

### Pattern 1: Create Entity with Relationships

```typescript
// 1. Create thing
const thingId = await db.insert("things", {
  type: "course",
  name: "Fitness Fundamentals",
  properties: {
    title: "Fitness Fundamentals",
    description: "Learn the basics...",
    modules: 5,
    lessons: 25,
    price: 199.00,
  },
  status: "draft",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 2. Create ownership connection
await db.insert("connections", {
  fromThingId: creatorId,
  toThingId: thingId,
  relationshipType: "owns",
  createdAt: Date.now(),
});

// 3. Log creation event
await db.insert("events", {
  type: "entity_created",
  actorId: creatorId,
  targetId: thingId,
  timestamp: Date.now(),
  metadata: { entityType: "course" },
});
```

### Pattern 2: Query Things by Type

```typescript
// Get all courses
const courses = await db
  .query("things")
  .withIndex("by_type", q => q.eq("type", "course"))
  .collect();

// Get active courses for organization
const orgCourses = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", organizationId)
     .eq("relationshipType", "owns")
  )
  .collect();

const courseEntities = await Promise.all(
  orgCourses
    .filter(c => c.toThingId.type === "course")
    .map(c => db.get(c.toThingId))
);
```

### Pattern 3: Update Thing

```typescript
// Get current
const thing = await db.get(thingId);

// Merge updates
const newProperties = { ...thing.properties, published: true };

// Update
await db.patch(thingId, {
  properties: newProperties,
  status: "published",
  updatedAt: Date.now(),
});

// Log event
await db.insert("events", {
  type: "entity_updated",
  actorId: userId,
  targetId: thingId,
  timestamp: Date.now(),
  metadata: { updatedFields: ["status", "properties.published"] },
});
```

---

## Properties by Thing Type

Each thing type has specific properties. Examples:

### Creator Properties
```typescript
{
  role: "platform_owner" | "org_owner" | "org_user" | "customer",
  email: string,
  username: string,
  displayName: string,
  bio?: string,
  avatar?: string,
  niche: string[],
  expertise: string[],
  organizationId?: Id<"things">,
  permissions?: string[],
  walletAddresses?: { sui?: string; solana?: string; base?: string },
}
```

### Organization Properties
```typescript
{
  slug: string,
  domain?: string,
  plan: "starter" | "pro" | "enterprise",
  limits: { users: number; storage: number; apiCalls: number; inferences: number },
  usage: { users: number; storage: number; apiCalls: number; inferences: number },
  billing: { customerId?: string; cryptoEnabled: boolean },
  settings: { inferenceEnabled: boolean; inferenceModels: string[] },
  revenueShare?: number,
}
```

### Course Properties
```typescript
{
  title: string,
  description: string,
  modules: number,
  lessons: number,
  totalDuration: number,
  price: number,
  currency: string,
  enrollments: number,
  completions: number,
  averageRating: number,
  generatedBy: "ai" | "human" | "hybrid",
}
```

### Token Properties
```typescript
{
  contractAddress: string,
  blockchain: "base" | "ethereum" | "polygon" | "sui" | "solana",
  standard: "ERC20" | "ERC721" | "ERC1155",
  totalSupply: number,
  circulatingSupply: number,
  price: number,
  marketCap: number,
  utility: string[],
}
```

For complete property definitions, see **[Ontology.md](./ontology.md#properties-by-thing-type)**

---

## Embeddable Things

These thing types have content that gets embedded into knowledge:

- `blog_post` → `properties.content`
- `video` → `properties.transcript`
- `podcast` → `properties.transcript`
- `social_post` → `properties.text`
- `email` → `properties.content`
- `course` → `properties.description` + lessons
- `lesson` → `properties.content`
- `livestream` → `properties.recording.transcript`
- `website` → `properties.pages[].html` (stripped)

See **[knowledge.md](./knowledge.md#ingestion-pipeline)** for embedding details.

---

## Thing Lifecycle

```
draft → active → published → archived → deleted
  ↓       ↓          ↓           ↓          ↓
 edit   embed      share      archive    remove
```

Every state change logs an event:
- `entity_created`
- `entity_updated`
- `entity_archived`
- `entity_deleted`

---

## Validation Rules

- `type` must be valid ThingType
- `name` cannot be empty
- `properties` structure must match type
- `status` must be valid status
- `createdAt` and `updatedAt` required

---

## Performance

### Indexes
```typescript
things:
  - by_type(type)
  - by_status(status)
  - by_created(createdAt)
  - search_things(name, type, status)
```

### Query Optimization
- Always use indexes for filters
- Limit results with `.take(n)`
- Paginate large result sets
- Use `.collect()` sparingly

---

## Key Principles

- **Everything is a thing** - If it exists, it's in this table
- **Type-specific properties** - Flexible JSON schema per type
- **Status tracking** - Lifecycle via status field
- **Event-driven** - Every change logs an event
- **Embeddable** - Content things feed into knowledge
- **Protocol-agnostic** - Protocol details in `properties.metadata`

**Things are the foundation. Everything else connects to things.**
