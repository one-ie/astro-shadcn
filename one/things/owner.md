# Owner Role (Platform + Organization)

Purpose: Define owner roles and how they map to the ontology as the single source of truth.

## Platform Owner

**Owner:** Anthony O'Connell (Anthony, "toc")
- **Title:** Owner of ONE Platform
- **Ownership:** 100% of ONE smart contracts, IP, and platform infrastructure
- **URL:** https://one.ie
- **Entity:** `creator` with `properties.role = "platform_owner"`
- **Wallet Addresses:**
  - SUI: `[Anthony's SUI address]`
  - Solana: `[Anthony's Solana address]`
  - Base: `[Anthony's Base/Ethereum address]`

## Ownership Structure

**Smart Contracts (100% Anthony):**
- SUI Move contracts: Token, NFT, Inference Payment, Subscription
- Solana programs: Token, Staking (if deployed)
- Base contracts: Token wrapper, Bridge (if deployed)
- All protocol revenues flow to Anthony's treasury addresses

**Platform Infrastructure:**
- Convex database and backend
- Astro frontend deployment
- All AI models and inference infrastructure
- Intellectual property and source code

## Roles

- **`platform_owner`**: Owns the entire platform, all smart contracts, bootstraps organizations, sets global policies
- **`org_owner`**: Owns a specific organization within the platform, manages org users, billing, and org-scoped resources

## Ontology Mapping

**Thing Structure:**
```typescript
{
  type: "creator",
  name: "Anthony O'Connell",
  properties: {
    role: "platform_owner",
    email: "anthony@one.ie",
    username: "anthony",
    displayName: "Anthony",

    // Blockchain addresses (multi-chain)
    walletAddresses: {
      sui: "[SUI address]",
      solana: "[Solana address]",
      base: "[Base address]",
    },

    // Platform ownership
    platformOwnership: 100,  // %
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

    // Treasury addresses (revenue collection)
    treasuryAddresses: {
      sui: "[treasury address]",
      solana: "[treasury address]",
      base: "[treasury address]",
    },

    // Permissions (global)
    permissions: ["*"],  // All permissions
  },
  status: "active",
}
```

**Connections:**
- `creator (platform_owner)` → `organization` via `owns` (Anthony owns ONE organization)
- `creator (platform_owner)` → `token_contract` via `owns` (Anthony owns all deployed contracts)
- `creator (platform_owner)` → `token` via `owns` (Anthony owns token treasury/supply)
- `creator (platform_owner)` → any resource via `owns` (content, workflows, products, etc.)

**Events (Blockchain-Aware):**
- `organization_created` (when Anthony creates orgs)
- `token_contract_deployed` (when contracts deployed)
- `inference_revenue_collected` (daily revenue sweeps)
- `treasury_withdrawal` (when Anthony withdraws)
- `settings_updated`, `dashboard_viewed` (platform management)

## Code Examples

### Create Platform Owner (Anthony)

```typescript
// Create Anthony as platform owner
const anthonyId = await db.insert("entities", {
  type: "creator",
  name: "Anthony O'Connell",
  properties: {
    role: "platform_owner",
    email: "anthony@one.ie",
    username: "anthony",
    displayName: "Anthony",
    platformOwnership: 100,
    walletAddresses: {
      sui: process.env.ANTHONY_SUI_ADDRESS,
      solana: process.env.ANTHONY_SOLANA_ADDRESS,
      base: process.env.ANTHONY_BASE_ADDRESS,
    },
    treasuryAddresses: {
      sui: process.env.PLATFORM_TREASURY_SUI,
      solana: process.env.PLATFORM_TREASURY_SOLANA,
      base: process.env.PLATFORM_TREASURY_BASE,
    },
    permissions: ["*"],
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Register Smart Contract Ownership

```typescript
// After deploying SUI token contract
const tokenContractId = await db.insert("entities", {
  type: "token_contract",
  name: "ONE Token",
  properties: {
    network: "sui",
    packageId: deployResult.packageId,
    coinType: `${deployResult.packageId}::one_token::ONE`,
    treasuryCap: deployResult.treasuryCapId,
    deployedBy: anthonyId,
    deployTxDigest: deployResult.digest,
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Link ownership
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: tokenContractId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    ownershipPercentage: 100,
    deploymentRole: "deployer",
    upgradeCap: deployResult.upgradeCapId,
  },
  createdAt: Date.now(),
});

// Log deployment event
await db.insert("events", {
  type: "entity_created",
  actorId: anthonyId,
  targetId: tokenContractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    entityType: "token_contract",
    packageId: deployResult.packageId,
    txDigest: deployResult.digest,
  },
});
```

### Track Inference Revenue

```typescript
// Daily revenue collection event
await db.insert("events", {
  type: "inference_revenue_collected",
  actorId: "system",
  targetId: anthonyId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    totalInferences: 100000,
    totalRevenue: 10000.00,  // $10K
    totalCosts: 450.50,       // inference + gas
    netProfit: 9549.50,
    profitMargin: 95.5,
    treasuryAddress: process.env.PLATFORM_TREASURY_SUI,
    txDigest: "...",          // Treasury sweep transaction
  },
});
```

### Owner Creates Organization

```typescript
// Anthony creates an organization
const orgId = await db.insert("entities", {
  type: "organization",
  name: "ONE Platform",
  properties: {
    slug: "one",
    domain: "one.ie",
    plan: "enterprise",
    status: "active",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Anthony owns the organization
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: orgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
});

// Anthony is member with org_owner role
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: orgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],
  },
  createdAt: Date.now(),
});
```

## Queries

**Get Anthony's platform ownership:**
```typescript
const anthony = await db
  .query("entities")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .filter(q => q.eq(q.field("properties.role"), "platform_owner"))
  .first();
```

**Get all smart contracts owned by Anthony:**
```typescript
const contracts = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", anthonyId)
     .eq("relationshipType", "owns")
  )
  .collect();

const contractEntities = await Promise.all(
  contracts
    .filter(c => ["token_contract", "nft"].includes(c.toThingId.type))
    .map(c => db.get(c.toThingId))
);
```

**Get Anthony's total inference revenue:**
```typescript
const revenueEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "inference_revenue_collected")
  )
  .filter(q => q.eq(q.field("targetId"), anthonyId))
  .collect();

const totalRevenue = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.totalRevenue,
  0
);
const totalProfit = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.netProfit,
  0
);
```

**Get all organizations Anthony controls:**
```typescript
const orgs = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", anthonyId)
     .eq("relationshipType", "member_of")
  )
  .filter(q => q.eq(q.field("metadata.role"), "org_owner"))
  .collect();

const orgEntities = await Promise.all(
  orgs.map(c => db.get(c.toThingId))
);
```

**Get all blockchain balances:**
```typescript
const balances = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", anthonyId)
     .eq("relationshipType", "holds_tokens")
  )
  .collect();

const balancesByNetwork = balances.reduce((acc, b) => {
  acc[b.metadata.network] = (acc[b.metadata.network] || 0) + b.metadata.balance;
  return acc;
}, {});
```

## Revenue Flow

**Inference Revenue (Daily):**
1. Users pay for inferences → Platform treasury addresses
2. System emits `inference_revenue_collected` event
3. Anthony can withdraw from treasuries at any time
4. All events tracked in ontology

**Token Revenue (If launched):**
1. Token sales → Anthony's treasury
2. NFT sales → Anthony's treasury (minus royalties)
3. Subscription stakes → Yield farming (revenue to Anthony)
4. All on-chain, fully transparent

## Notes

- **Anthony = Platform Owner** - 100% ownership of all smart contracts and IP
- **Owners are `creator` entities** - with elevated `role` and `permissions`
- **Protocol-agnostic** - Multi-chain via `metadata.network` on connections/events
- **Revenue tracking** - All inference/token revenue flows to Anthony's treasuries
- **Transparent** - All ownership and revenue tracked in ontology events
- **Multi-chain** - SUI primary, Solana secondary, Base bridge
