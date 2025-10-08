# Owner: Platform Owner Role

**The platform_owner role represents 100% ownership of the ONE Platform.**

---

## Role Definition

```typescript
type PlatformOwner = {
  role: "platform_owner",
  permissions: ["*"],  // All permissions
  platformOwnership: 100,  // 100% ownership
};
```

---

## What is a Platform Owner?

The platform owner is the **supreme administrator** of the ONE Platform with:

1. **100% Ownership** - Owns all platform assets, IP, smart contracts
2. **God Mode Permissions** - `["*"]` bypasses all checks
3. **Revenue Rights** - Receives 100% of platform revenue (unless revenue share)
4. **Contract Control** - Deploys and manages all smart contracts
5. **Treasury Access** - Controls all platform treasury wallets
6. **Organization Control** - Can create/modify ANY organization

**Current Platform Owner:** [Anthony O'Connell](./anthony-o-connell.md)

---

## Platform Owner Entity

```typescript
{
  type: "creator",
  name: string,
  properties: {
    role: "platform_owner",
    email: string,
    username: string,
    displayName: string,

    // Ownership
    platformOwnership: 100,

    // Blockchain
    walletAddresses: {
      sui: string,
      solana: string,
      base: string,
    },
    treasuryAddresses: {
      sui: string,
      solana: string,
      base: string,
    },
    contractOwnership: {
      sui: { [contractName: string]: string },
      solana: { [contractName: string]: string },
      base: { [contractName: string]: string },
    },

    // Permissions
    permissions: ["*"],

    // Organization
    organizationId: Id<"things">,  // ONE organization
  },
  status: "active",
}
```

---

## Ownership Connections

### Owns Platform Organization
`platform_owner` → `organization` via `owns`

```typescript
{
  fromThingId: platformOwnerId,
  toThingId: oneOrgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
}
```

### Member of Platform Organization
`platform_owner` → `organization` via `member_of`

```typescript
{
  fromThingId: platformOwnerId,
  toThingId: oneOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
```

### Owns Smart Contracts
`platform_owner` → `smart_contract` via `owns`

```typescript
{
  fromThingId: platformOwnerId,
  toThingId: contractId,
  relationshipType: "owns",
  metadata: {
    network: "sui" | "solana" | "base",
    contractType: "inference_payment" | "token" | "nft" | "bridge",
    packageId: string,  // or contractAddress/mintAddress
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
}
```

### Controls Treasury Wallets
`platform_owner` → `treasury_wallet` via `controls`

```typescript
{
  fromThingId: platformOwnerId,
  toThingId: treasuryId,
  relationshipType: "controls",
  metadata: {
    network: "sui" | "solana" | "base",
    address: string,
    type: "platform_treasury",
  },
  createdAt: Date.now(),
}
```

---

## Revenue Flow

### Platform Owner Receives ALL Revenue

```
┌─────────────────────────────────────────────┐
│  Customer pays for inference                │
│  $0.10                                      │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  Platform processes payment                 │
│  Cost: $0.045 (OpenAI)                     │
│  Profit: $0.055                            │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  Revenue flows to Platform Owner            │
│  inference_revenue_collected event          │
│  Recipient: Anthony O'Connell               │
└─────────────────────────────────────────────┘
```

**Revenue Events:**
```typescript
// Platform owner receives all inference revenue
{
  type: "inference_revenue_collected",
  actorId: "system",
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    amount: 0.10,
    cost: 0.045,
    profit: 0.055,
    network: "sui",
    txDigest: "...",
  },
}

// Organization generates platform revenue (customer subscription)
{
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,
    platformShare: 1000.00,  // 100% to platform owner (no rev share)
    revenueSharePercentage: 0,  // 0% rev share
  },
}
```

---

## Permission System

### God Mode: `permissions: ["*"]`

```typescript
export const hasPermission = async (
  userId: Id<"things">,
  permission: string
) => {
  const user = await db.get(userId);

  // Platform owner bypasses ALL checks
  if (user?.properties?.role === "platform_owner") {
    return true;
  }

  // Check specific permissions for other users
  const permissions = user?.properties?.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
};
```

**Platform Owner Can:**

✅ **Organizations:**
- Create/delete/modify ANY organization
- Access ANY organization's data
- Change ANY organization's plan/limits
- Suspend/reactivate organizations

✅ **Users:**
- Access ANY user's data (with audit trail)
- Modify user permissions
- Suspend/delete users
- Impersonate users (for support)

✅ **Smart Contracts:**
- Deploy new contracts
- Upgrade existing contracts
- Transfer contract ownership
- Execute admin functions

✅ **Treasury:**
- Withdraw from platform treasury
- Transfer funds between networks
- Bridge tokens
- Manage revenue splits

✅ **Platform Settings:**
- Change inference pricing
- Modify subscription plans
- Update feature flags
- Configure integrations

---

## Smart Contract Management

### Contract Deployment

```typescript
// Deploy new contract
{
  type: "contract_deployed",
  actorId: platformOwnerId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    contractType: "inference_payment",
    packageId: "0x...",
    deployedBy: platformOwnerId,
  },
}
```

### Contract Ownership Transfer

```typescript
// Transfer contract ownership (if needed)
{
  type: "ownership_transferred",
  actorId: platformOwnerId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    fromOwner: platformOwnerId,
    toOwner: newOwnerId,
    network: "sui",
    contractType: "token",
  },
}
```

---

## Treasury Management

### Withdraw from Treasury

```typescript
// Platform owner withdraws funds
{
  type: "treasury_withdrawal",
  actorId: platformOwnerId,
  targetId: treasuryId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: 10000.00,
    reason: "operational_expenses",
    toAddress: "0x...",
    txDigest: "...",
  },
}
```

### Bridge Tokens Between Networks

```typescript
// Bridge tokens from Sui to Base
{
  type: "tokens_bridged",
  actorId: platformOwnerId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    fromNetwork: "sui",
    toNetwork: "base",
    amount: 1000000,  // 1M tokens
    fromTxDigest: "...",
    toTxDigest: "...",
  },
}
```

---

## Queries

**Check if user is platform owner:**
```typescript
export const isPlatformOwner = async (userId: Id<"things">) => {
  const user = await db.get(userId);
  return user?.properties?.role === "platform_owner";
};
```

**Get platform owner:**
```typescript
export const getPlatformOwner = async () => {
  const owner = await db
    .query("things")
    .withIndex("type", q => q.eq("type", "creator"))
    .filter(q => q.eq(q.field("properties.role"), "platform_owner"))
    .first();

  return owner;
};
```

**Get platform owner's organizations:**
```typescript
const orgs = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", platformOwnerId)
     .eq("relationshipType", "owns")
  )
  .collect();
```

**Get platform owner's contracts:**
```typescript
const contracts = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", platformOwnerId)
     .eq("relationshipType", "owns")
  )
  .filter(q =>
    q.neq(q.field("metadata.contractType"), undefined)
  )
  .collect();
```

**Calculate total platform revenue:**
```typescript
const revenueEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "inference_revenue_collected")
  )
  .collect();

const totalRevenue = revenueEvents.reduce(
  (sum, e) => sum + (e.metadata.profit || 0),
  0
);
```

---

## Revenue Sharing (Optional)

Platform owner can configure revenue sharing with organizations:

```typescript
// Organization properties
{
  revenueShare: 0.1,  // 10% of revenue goes to org owner
}

// When org generates revenue
{
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,
    orgShare: 100.00,        // 10% to org
    platformShare: 900.00,   // 90% to platform owner
    revenueSharePercentage: 0.1,
  },
}

// Platform owner distributes share to org owner
{
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
}
```

---

## Audit Trail

Every platform owner action is logged:

```typescript
// Admin action template
{
  type: "admin_action",
  actorId: platformOwnerId,
  targetId: affectedEntityId,
  timestamp: Date.now(),
  metadata: {
    action: "user_suspended" | "org_created" | "contract_deployed" | "treasury_withdrawal",
    reason: string,
    details: any,
  },
}
```

**Examples:**
- `user_suspended` - When platform owner suspends a user
- `org_created` - When platform owner creates organization
- `contract_deployed` - When platform owner deploys contract
- `treasury_withdrawal` - When platform owner withdraws funds

---

## Key Principles

- **Single Platform Owner** - ONE platform, ONE owner (Anthony O'Connell)
- **God Mode** - `permissions: ["*"]` means NO restrictions
- **100% Revenue** - All revenue flows to platform owner (unless rev share)
- **Full Control** - Smart contracts, treasury, organizations, users
- **Transparency** - Every action logged with audit trail
- **Multi-Chain** - Controls assets on Sui, Solana, and Base
- **Org Owner Too** - Also manages ONE organization as org_owner

**Platform owner is not a user. Platform owner IS the platform.**

---

## See Also

- [Anthony O'Connell Profile](./anthony-o-connell.md)
- [ONE Organization](./one.md)
- [People Roles](./people.md)
- [Organization Structure](./organisation.md)
