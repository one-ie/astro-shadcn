# People: Creators, Owners & Users

**People customize AI generation within organizations.**

---

## The Four Roles

```
┌────────────────────────────────────────────────────┐
│  Platform Owner (Anthony)                          │
│  - Owns 100% of ONE platform & contracts          │
│  - Controls all smart contracts                    │
│  - Receives all platform revenue                   │
└────────────────────────────────────────────────────┘
                        ↓ creates
┌────────────────────────────────────────────────────┐
│  Org Owner                                          │
│  - Owns/manages an organization                    │
│  - Invites org users                               │
│  - Controls org billing & settings                 │
└────────────────────────────────────────────────────┘
                        ↓ invites
┌────────────────────────────────────────────────────┐
│  Org User                                           │
│  - Works within an organization                    │
│  - Limited permissions                             │
│  - Creates content & uses tools                    │
└────────────────────────────────────────────────────┘
                        ↓ serves
┌────────────────────────────────────────────────────┐
│  Customer/Audience Member                           │
│  - Consumes content                                │
│  - Purchases products                              │
│  - Interacts with AI clones                        │
└────────────────────────────────────────────────────┘
```

---

## Platform Owner

**Owner:** Anthony O'Connell
- **Entity Type:** `creator` with `properties.role = "platform_owner"`
- **Ownership:** 100% of ONE smart contracts, IP, and infrastructure
- **URL:** https://one.ie
- **Permissions:** `["*"]` (all permissions)

### Properties

```typescript
{
  type: "creator",
  name: "Anthony O'Connell",
  properties: {
    role: "platform_owner",
    email: "anthony@one.ie",
    username: "anthony",
    displayName: "Anthony",

    // Blockchain addresses
    walletAddresses: {
      sui: "[SUI address]",
      solana: "[Solana address]",
      base: "[Base address]",
    },

    // Platform ownership
    platformOwnership: 100,  // %

    // Treasury addresses (revenue collection)
    treasuryAddresses: {
      sui: "[treasury address]",
      solana: "[treasury address]",
      base: "[treasury address]",
    },

    // Smart contract ownership
    contractOwnership: {
      sui: {
        inferencePayment: "[package ID]",
        tokenContract: "[package ID]",
        nftContract: "[package ID]",
        subscription: "[package ID]",
      },
      solana: {
        tokenMint: "[mint address]",
        stakingProgram: "[program ID]",
      },
      base: {
        tokenContract: "[contract address]",
        bridge: "[contract address]",
      },
    },

    // Permissions
    permissions: ["*"],  // All permissions
  },
  status: "active",
}
```

### Platform Owner Connections

```typescript
// Owns ONE organization
{
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "owns",
  metadata: { ownershipPercentage: 100 },
}

// Owns all smart contracts
{
  fromThingId: anthonyId,
  toThingId: tokenContractId,
  relationshipType: "owns",
  metadata: { network: "sui", ownershipPercentage: 100 },
}

// Member of ONE org with org_owner role
{
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "member_of",
  metadata: { role: "org_owner", permissions: ["*"] },
}
```

---

## Org Owner

**Role:** `"org_owner"`
- Manages an organization
- Full control over org settings, billing, members
- Can invite org users
- Can create/delete org resources

### Properties

```typescript
{
  type: "creator",
  name: "Jane Doe",
  properties: {
    role: "org_owner",  // Can also be "customer" if they're an org owner
    email: "jane@acme.com",
    username: "jane",
    displayName: "Jane",
    bio: "Founder of Acme Corp",
    avatar: "https://...",

    // Organization context
    organizationId: acmeOrgId,  // Primary/current org
    permissions: ["read", "write", "admin", "billing"],

    // Creator-specific
    niche: ["fitness", "wellness"],
    expertise: ["content-creation", "marketing"],
    targetAudience: "fitness-enthusiasts",
  },
  status: "active",
}
```

### Org Owner Connections

```typescript
// Member of organization with org_owner role
{
  fromThingId: janeId,
  toThingId: acmeOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["read", "write", "admin", "billing"],
    joinedAt: Date.now(),
  },
}

// May also own the organization
{
  fromThingId: janeId,
  toThingId: acmeOrgId,
  relationshipType: "owns",
  metadata: { ownershipPercentage: 100 },
}
```

---

## Org User

**Role:** `"org_user"`
- Works within an organization
- Limited permissions (no billing access)
- Can create content and use tools
- Cannot invite other users or change org settings

### Properties

```typescript
{
  type: "creator",
  name: "Bob Smith",
  properties: {
    role: "org_user",
    email: "bob@acme.com",
    username: "bob",
    displayName: "Bob",
    bio: "Content creator at Acme",
    avatar: "https://...",

    // Organization context
    organizationId: acmeOrgId,
    permissions: ["read", "write"],  // Limited permissions

    // Creator-specific
    niche: ["fitness"],
    expertise: ["video-editing"],
  },
  status: "active",
}
```

### Org User Connections

```typescript
// Member of organization with org_user role
{
  fromThingId: bobId,
  toThingId: acmeOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_user",
    permissions: ["read", "write"],
    invitedBy: janeId,  // Who invited Bob
    invitedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    joinedAt: Date.now(),
  },
}
```

---

## Customer / Audience Member

**Type:** `"audience_member"`
- Consumes content created by creators
- Purchases products and services
- Interacts with AI clones
- Does not have org memberships

### Properties

```typescript
{
  type: "audience_member",
  name: "Alice Johnson",
  properties: {
    role: "customer",
    email: "alice@example.com",
    username: "alice",
    displayName: "Alice",
    avatar: "https://...",

    // Customer-specific
    interests: ["fitness", "nutrition"],
    purchaseHistory: [],
    favoriteCreators: [creatorId1, creatorId2],
    totalSpent: 299.00,
  },
  status: "active",
}
```

### Customer Connections

```typescript
// Follows creators
{
  fromThingId: aliceId,
  toThingId: creatorId,
  relationshipType: "following",
  createdAt: Date.now(),
}

// Purchased products
{
  fromThingId: aliceId,
  toThingId: productId,
  relationshipType: "purchased",
  metadata: {
    amount: 99.00,
    currency: "USD",
    purchasedAt: Date.now(),
  },
}

// Enrolled in courses
{
  fromThingId: aliceId,
  toThingId: courseId,
  relationshipType: "enrolled_in",
  metadata: {
    progress: 0.45,  // 45% complete
    enrolledAt: Date.now(),
  },
}
```

---

## Permission System

### Permission Levels

```typescript
type Permission =
  | "*"           // All permissions (platform_owner only)
  | "read"        // Read org resources
  | "write"       // Create/edit org resources
  | "admin"       // Manage org users
  | "billing"     // Manage org billing & subscription
  | "settings";   // Change org settings

// Role → Permissions mapping
const rolePermissions = {
  platform_owner: ["*"],
  org_owner: ["read", "write", "admin", "billing", "settings"],
  org_user: ["read", "write"],
  customer: [],  // No org permissions
};
```

### Permission Checks

```typescript
// Check if user has permission
export const hasPermission = async (
  userId: Id<"things">,
  organizationId: Id<"things">,
  required: Permission
) => {
  // Get user
  const user = await db.get(userId);

  // Platform owner has all permissions
  if (user.properties.role === "platform_owner") {
    return true;
  }

  // Get membership
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
  return permissions.includes("*") || permissions.includes(required);
};
```

---

## User Invitation Flow

### 1. Org Owner Invites User

```typescript
// Create invitation
const inviteToken = generateToken();

await db.insert("events", {
  type: "user_invited_to_org",
  actorId: orgOwnerId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    invitedEmail: "newuser@example.com",
    role: "org_user",
    permissions: ["read", "write"],
    inviteToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,  // 7 days
  },
});

// Send email invitation
await sendEmail({
  to: "newuser@example.com",
  subject: "You're invited to join Acme Corp on ONE",
  body: `Click here to join: https://one.ie/invite/${inviteToken}`,
});
```

### 2. User Accepts Invitation

```typescript
// Create user if not exists
const userId = await db.insert("things", {
  type: "creator",
  name: "New User",
  properties: {
    role: "org_user",
    email: "newuser@example.com",
    organizationId,
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create membership connection
await db.insert("connections", {
  fromThingId: userId,
  toThingId: organizationId,
  relationshipType: "member_of",
  metadata: {
    role: "org_user",
    permissions: ["read", "write"],
    invitedBy: orgOwnerId,
    invitedAt: inviteEvent.timestamp,
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
});

// Log event
await db.insert("events", {
  type: "user_joined_org",
  actorId: userId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    role: "org_user",
    invitedBy: orgOwnerId,
  },
});
```

---

## User Queries

**Get user's organizations:**
```typescript
const orgs = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", userId)
     .eq("relationshipType", "member_of")
  )
  .collect();

const orgEntities = await Promise.all(
  orgs.map(c => db.get(c.toThingId))
);
```

**Get organization members:**
```typescript
const members = await db
  .query("connections")
  .withIndex("to_type", q =>
    q.eq("toThingId", organizationId)
     .eq("relationshipType", "member_of")
  )
  .collect();

const memberEntities = await Promise.all(
  members.map(c => db.get(c.fromThingId))
);
```

**Get user's content:**
```typescript
const content = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", userId)
     .eq("relationshipType", "authored")
  )
  .collect();

const contentEntities = await Promise.all(
  content.map(c => db.get(c.toThingId))
);
```

**Check if user is org owner:**
```typescript
const membership = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", userId)
     .eq("toThingId", organizationId)
     .eq("relationshipType", "member_of")
  )
  .first();

const isOrgOwner = membership?.metadata?.role === "org_owner";
```

---

## Creator-to-AI Clone

Creators can have AI clones:

```typescript
// Create AI clone
const cloneId = await db.insert("things", {
  type: "ai_clone",
  name: `${creator.name}'s AI Clone`,
  properties: {
    voiceId: "elevenlabs_voice_123",
    voiceProvider: "elevenlabs",
    appearanceId: "d-id_avatar_456",
    appearanceProvider: "d-id",
    systemPrompt: "You are a helpful fitness coach...",
    temperature: 0.7,
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Creator owns clone
await db.insert("connections", {
  fromThingId: creatorId,
  toThingId: cloneId,
  relationshipType: "owns",
  createdAt: Date.now(),
});

// Clone is trained on creator's knowledge
await db.insert("connections", {
  fromThingId: cloneId,
  toThingId: knowledgeItemId,
  relationshipType: "trained_on",
  createdAt: Date.now(),
});
```

---

## Key Principles

- **Platform Owner** - Anthony owns 100% of ONE platform
- **Org Owners** - Manage their organizations independently
- **Org Users** - Work within organizations with limited permissions
- **Customers** - Consume content, no org memberships
- **Multi-tenant** - Users can be members of multiple organizations
- **Permission-based** - Every action checks permissions
- **Event-driven** - All user actions logged as events

**People customize AI generation. Organizations contain people.**
