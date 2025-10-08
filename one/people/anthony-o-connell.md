# Anthony O'Connell: Platform Owner

**Anthony O'Connell owns 100% of the ONE Platform.**

---

## Identity

- **Name:** Anthony O'Connell
- **Role:** Platform Owner (`platform_owner`)
- **Email:** anthony@one.ie
- **Username:** anthony
- **Display Name:** Anthony
- **URL:** https://one.ie
- **Organization:** ONE Platform

---

## The Platform Owner Entity

```typescript
{
  type: "creator",
  name: "Anthony O'Connell",
  properties: {
    role: "platform_owner",
    email: "anthony@one.ie",
    username: "anthony",
    displayName: "Anthony",
    bio: "Founder & Platform Owner of ONE",
    avatar: "https://one.ie/anthony.jpg",

    // Platform ownership
    platformOwnership: 100,  // 100% ownership of ONE Platform

    // Blockchain addresses
    walletAddresses: {
      sui: process.env.ANTHONY_WALLET_SUI,
      solana: process.env.ANTHONY_WALLET_SOLANA,
      base: process.env.ANTHONY_WALLET_BASE,
    },

    // Platform treasury addresses (revenue collection)
    treasuryAddresses: {
      sui: process.env.PLATFORM_TREASURY_SUI,
      solana: process.env.PLATFORM_TREASURY_SOLANA,
      base: process.env.PLATFORM_TREASURY_BASE,
    },

    // Smart contract ownership (100% of all platform contracts)
    contractOwnership: {
      sui: {
        inferencePayment: process.env.SUI_INFERENCE_PACKAGE_ID,
        tokenContract: process.env.SUI_TOKEN_PACKAGE_ID,
        nftContract: process.env.SUI_NFT_PACKAGE_ID,
        subscription: process.env.SUI_SUBSCRIPTION_PACKAGE_ID,
        revenueSharing: process.env.SUI_REVENUE_PACKAGE_ID,
      },
      solana: {
        tokenMint: process.env.SOLANA_TOKEN_MINT,
        stakingProgram: process.env.SOLANA_STAKING_PROGRAM_ID,
        nftCollection: process.env.SOLANA_NFT_COLLECTION,
      },
      base: {
        tokenContract: process.env.BASE_TOKEN_CONTRACT,
        bridge: process.env.BASE_BRIDGE_CONTRACT,
        payment: process.env.BASE_PAYMENT_CONTRACT,
      },
    },

    // Permissions
    permissions: ["*"],  // All permissions - platform owner has god mode

    // Organization context
    organizationId: oneOrgId,  // Member of ONE organization

    // Contact
    website: "https://one.ie",
    github: "https://github.com/anthony",
    twitter: "https://twitter.com/anthony",
    linkedin: "https://linkedin.com/in/anthony-oconnell",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### Owns ONE Organization
`anthony` → `one-org` via `owns`

```typescript
{
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "2024-01-01",
  },
  createdAt: Date.now(),
}
```

### Member of ONE Organization
`anthony` → `one-org` via `member_of`

```typescript
{
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions within ONE org
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
```

### Owns Smart Contracts
`anthony` → `smart-contract` via `owns`

```typescript
// Sui Inference Payment Contract
{
  fromThingId: anthonyId,
  toThingId: suiInferenceContractId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    contractType: "inference_payment",
    packageId: process.env.SUI_INFERENCE_PACKAGE_ID,
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
}

// Solana Token Contract
{
  fromThingId: anthonyId,
  toThingId: solanaTokenId,
  relationshipType: "owns",
  metadata: {
    network: "solana",
    contractType: "token",
    mintAddress: process.env.SOLANA_TOKEN_MINT,
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
}

// Base Bridge Contract
{
  fromThingId: anthonyId,
  toThingId: baseBridgeId,
  relationshipType: "owns",
  metadata: {
    network: "base",
    contractType: "bridge",
    contractAddress: process.env.BASE_BRIDGE_CONTRACT,
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
}
```

### Controls Platform Treasury
`anthony` → `treasury-wallet` via `controls`

```typescript
// Sui Treasury
{
  fromThingId: anthonyId,
  toThingId: suiTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "sui",
    address: process.env.PLATFORM_TREASURY_SUI,
    type: "platform_treasury",
  },
  createdAt: Date.now(),
}

// Solana Treasury
{
  fromThingId: anthonyId,
  toThingId: solanaTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "solana",
    address: process.env.PLATFORM_TREASURY_SOLANA,
    type: "platform_treasury",
  },
  createdAt: Date.now(),
}

// Base Treasury
{
  fromThingId: anthonyId,
  toThingId: baseTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "base",
    address: process.env.PLATFORM_TREASURY_BASE,
    type: "platform_treasury",
  },
  createdAt: Date.now(),
}
```

---

## Revenue Events

### Receives All Platform Revenue
Every inference, subscription, and transaction flows to Anthony:

```typescript
// Inference revenue collected
{
  type: "inference_revenue_collected",
  actorId: "system",
  targetId: anthonyId,
  timestamp: Date.now(),
  metadata: {
    inferenceId: inferenceId,
    customerId: customerId,
    organizationId: customerOrgId,
    amount: 0.10,        // Customer paid $0.10
    cost: 0.045,         // Provider cost $0.045
    profit: 0.055,       // Platform profit $0.055
    network: "sui",
    txDigest: "...",
  },
}

// Organization revenue generated
{
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: anthonyId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,
    orgShare: 100.00,        // 10% to org (if rev share enabled)
    platformShare: 900.00,   // 90% to Anthony
    revenueSharePercentage: 0.1,
  },
}

// Revenue share distributed (if org has revenue share)
{
  type: "revenue_share_distributed",
  actorId: anthonyId,
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

## Smart Contract Events

### Contract Deployed
When Anthony deploys new contracts:

```typescript
{
  type: "contract_deployed",
  actorId: anthonyId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    contractType: "inference_payment",
    packageId: process.env.SUI_INFERENCE_PACKAGE_ID,
    deployedBy: anthonyId,
  },
}
```

### Treasury Withdrawal
When Anthony withdraws from platform treasury:

```typescript
{
  type: "treasury_withdrawal",
  actorId: anthonyId,
  targetId: treasuryId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: 10000.00,  // $10K withdrawn
    reason: "operational_expenses",
    toAddress: process.env.ANTHONY_WALLET_SUI,
    txDigest: "...",
  },
}
```

---

## Permission System

### Platform Owner Permissions

```typescript
// Check platform owner permissions
export const isPlatformOwner = async (userId: Id<"things">) => {
  const user = await db.get(userId);
  return user?.properties?.role === "platform_owner";
};

// Platform owner has ALL permissions
export const hasPermission = async (
  userId: Id<"things">,
  permission: string
) => {
  const user = await db.get(userId);

  // Platform owner bypasses all checks
  if (user?.properties?.role === "platform_owner") {
    return true;
  }

  // Check specific permissions for other users
  const permissions = user?.properties?.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
};
```

**Platform Owner Can:**
- Create/delete/modify ANY organization
- Access ANY user's data (with audit trail)
- Modify ANY smart contract
- Withdraw from platform treasury
- Deploy new contracts
- Change platform settings
- Access admin dashboard
- Override any permission check

---

## Queries

**Get Anthony's Organizations:**
```typescript
const orgs = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", anthonyId)
     .eq("relationshipType", "owns")
  )
  .collect();
```

**Get Anthony's Smart Contracts:**
```typescript
const contracts = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", anthonyId)
     .eq("relationshipType", "owns")
  )
  .filter(q =>
    q.or(
      q.eq(q.field("metadata.contractType"), "inference_payment"),
      q.eq(q.field("metadata.contractType"), "token"),
      q.eq(q.field("metadata.contractType"), "bridge")
    )
  )
  .collect();
```

**Get Platform Revenue:**
```typescript
// Total platform revenue
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

// Revenue by network
const revenueByNetwork = revenueEvents.reduce((acc, e) => {
  const network = e.metadata.network || "unknown";
  acc[network] = (acc[network] || 0) + (e.metadata.profit || 0);
  return acc;
}, {} as Record<string, number>);
```

**Get Treasury Balances:**
```typescript
const treasuryBalances = {
  sui: await getSuiBalance(process.env.PLATFORM_TREASURY_SUI),
  solana: await getSolanaBalance(process.env.PLATFORM_TREASURY_SOLANA),
  base: await getBaseBalance(process.env.PLATFORM_TREASURY_BASE),
};
```

---

## Key Principles

- **100% Ownership** - Anthony owns ALL platform assets, contracts, and IP
- **God Mode** - `permissions: ["*"]` bypasses all checks
- **Revenue Recipient** - ALL platform revenue flows to Anthony's treasury
- **Smart Contract Owner** - Deploys and controls all blockchain contracts
- **Audit Trail** - Every action logged as event (transparency)
- **Multi-Chain** - Controls treasuries on Sui, Solana, and Base
- **Org Owner** - Also manages ONE organization as org_owner

**Anthony is the platform. The platform is Anthony.**

---

## See Also

- [Owner Role Documentation](./owner.md)
- [ONE Organization](./one.md)
- [People Roles](./people.md)
- [Organization Structure](./organisation.md)
