# ONE: The Platform Organization

**ONE is the platform organization owned by Anthony O'Connell.**

---

## Identity

- **Name:** ONE Platform
- **Slug:** `one`
- **Domain:** `one.ie`
- **Owner:** Anthony O'Connell (100%)
- **Status:** Active
- **Plan:** Enterprise (unlimited)

---

## The ONE Organization Entity

```typescript
{
  type: "organization",
  name: "ONE Platform",
  properties: {
    // Identity
    slug: "one",
    domain: "one.ie",
    logo: "https://one.ie/logo.svg",
    description: "AI-powered multi-tenant platform for creators and businesses",

    // Status & Plan
    status: "active",
    plan: "enterprise",

    // Limits & Usage (unlimited for platform)
    limits: {
      users: 1000000,      // 1M users
      storage: 1000000,    // 1 PB
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },

    // Billing (platform uses blockchain)
    billing: {
      cryptoEnabled: true,
      treasuryAddress: {
        sui: process.env.PLATFORM_TREASURY_SUI,
        solana: process.env.PLATFORM_TREASURY_SOLANA,
        base: process.env.PLATFORM_TREASURY_BASE,
      },
      // No Stripe - platform collects via smart contracts
      customerId: null,
      subscriptionId: null,
      currentPeriodEnd: null,
    },

    // Settings
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      allowedDomains: ["one.ie"],

      // Inference settings
      inferenceEnabled: true,
      inferenceModels: [
        "gpt-4-turbo",
        "gpt-4",
        "claude-3.5-sonnet",
        "claude-3-opus",
        "llama-3-70b",
        "mistral-large",
      ],
    },

    // Revenue share (platform owner keeps 100%)
    revenueShare: 0,  // 0% revenue share - Anthony keeps all

    // Platform metadata
    features: [
      "inference",
      "ai_clones",
      "content_creation",
      "token_economy",
      "nft_minting",
      "blockchain_payments",
      "revenue_sharing",
      "multi_tenant",
    ],

    // Public info
    website: "https://one.ie",
    github: "https://github.com/oneplatform",
    twitter: "https://twitter.com/oneplatform",
    discord: "https://discord.gg/oneplatform",

    createdAt: Date.now(),
    trialEndsAt: null,  // No trial - platform org
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### Anthony Owns ONE
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

### Anthony is Member of ONE
`anthony` → `one-org` via `member_of`

```typescript
{
  fromThingId: anthonyId,
  toThingId: oneOrgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
```

---

## Platform Resources

### ONE Owns Smart Contracts
`one-org` → `smart-contract` via `owns`

```typescript
// Sui Inference Payment Contract
{
  fromThingId: oneOrgId,
  toThingId: suiInferenceContractId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    contractType: "inference_payment",
    packageId: process.env.SUI_INFERENCE_PACKAGE_ID,
    deployedBy: anthonyId,
  },
  createdAt: Date.now(),
}

// Solana Token Contract
{
  fromThingId: oneOrgId,
  toThingId: solanaTokenId,
  relationshipType: "owns",
  metadata: {
    network: "solana",
    contractType: "token",
    mintAddress: process.env.SOLANA_TOKEN_MINT,
    deployedBy: anthonyId,
  },
  createdAt: Date.now(),
}

// Base Bridge Contract
{
  fromThingId: oneOrgId,
  toThingId: baseBridgeId,
  relationshipType: "owns",
  metadata: {
    network: "base",
    contractType: "bridge",
    contractAddress: process.env.BASE_BRIDGE_CONTRACT,
    deployedBy: anthonyId,
  },
  createdAt: Date.now(),
}
```

### ONE Owns Platform Tokens
`one-org` → `token` via `owns`

```typescript
{
  fromThingId: oneOrgId,
  toThingId: oneTokenId,
  relationshipType: "owns",
  metadata: {
    tokenName: "ONE",
    tokenSymbol: "ONE",
    totalSupply: 1000000000,  // 1B tokens
    networks: ["sui", "solana", "base"],
  },
  createdAt: Date.now(),
}
```

---

## Platform Treasury

### Treasury Addresses

```typescript
const treasuryAddresses = {
  sui: process.env.PLATFORM_TREASURY_SUI,
  solana: process.env.PLATFORM_TREASURY_SOLANA,
  base: process.env.PLATFORM_TREASURY_BASE,
};
```

### Treasury Connections
`one-org` → `treasury-wallet` via `controls`

```typescript
// Sui Treasury
{
  fromThingId: oneOrgId,
  toThingId: suiTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "sui",
    address: process.env.PLATFORM_TREASURY_SUI,
    type: "platform_treasury",
    purpose: "Collect all inference and subscription revenue",
  },
  createdAt: Date.now(),
}

// Solana Treasury
{
  fromThingId: oneOrgId,
  toThingId: solanaTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "solana",
    address: process.env.PLATFORM_TREASURY_SOLANA,
    type: "platform_treasury",
    purpose: "Collect token sales and NFT revenue",
  },
  createdAt: Date.now(),
}

// Base Treasury
{
  fromThingId: oneOrgId,
  toThingId: baseTreasuryId,
  relationshipType: "controls",
  metadata: {
    network: "base",
    address: process.env.PLATFORM_TREASURY_BASE,
    type: "platform_treasury",
    purpose: "Collect cross-chain bridge fees",
  },
  createdAt: Date.now(),
}
```

---

## Organization Events

### Platform Lifecycle

```typescript
// ONE organization created
{
  type: "organization_created",
  actorId: anthonyId,
  targetId: oneOrgId,
  timestamp: Date.now(),
  metadata: {
    name: "ONE Platform",
    slug: "one",
    plan: "enterprise",
    createdBy: anthonyId,
  },
}

// ONE organization updated
{
  type: "organization_updated",
  actorId: anthonyId,
  targetId: oneOrgId,
  timestamp: Date.now(),
  metadata: {
    updatedFields: ["settings.inferenceModels"],
    previousValues: { inferenceModels: ["gpt-4"] },
    newValues: { inferenceModels: ["gpt-4", "claude-3.5-sonnet"] },
  },
}
```

### Revenue Events

```typescript
// Platform collects inference revenue
{
  type: "inference_revenue_collected",
  actorId: "system",
  targetId: anthonyId,
  timestamp: Date.now(),
  metadata: {
    organizationId: oneOrgId,
    amount: 0.10,
    cost: 0.045,
    profit: 0.055,
    network: "sui",
    txDigest: "...",
  },
}

// Customer org generates revenue for platform
{
  type: "org_revenue_generated",
  actorId: customerOrgId,
  targetId: anthonyId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,
    platformShare: 1000.00,  // Anthony gets 100% (no rev share)
    revenueSharePercentage: 0,
  },
}
```

---

## Customer Organizations

ONE Platform hosts customer organizations:

```typescript
// Customer creates org on ONE Platform
const customerOrgId = await db.insert("things", {
  type: "organization",
  name: "Acme Corp",
  properties: {
    slug: "acme",
    domain: "acme.one.ie",  // Subdomain of ONE
    plan: "pro",
    limits: {
      users: 50,
      storage: 100,
      apiCalls: 100000,
      inferences: 10000,
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
      inferenceModels: ["gpt-4", "claude-3.5-sonnet"],
    },
    revenueShare: 0.1,  // 10% rev share if they refer users
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Customer org is hosted by ONE
{
  fromThingId: customerOrgId,
  toThingId: oneOrgId,
  relationshipType: "hosted_by",
  metadata: {
    plan: "pro",
    monthlyFee: 99.00,
  },
  createdAt: Date.now(),
}
```

---

## Multi-Tenant Isolation

Every customer org is isolated:

```typescript
// Query user's organizations
export const getUserOrganizations = async (userId: Id<"things">) => {
  const memberships = await db
    .query("connections")
    .withIndex("from_type", q =>
      q.eq("fromThingId", userId)
       .eq("relationshipType", "member_of")
    )
    .collect();

  const orgs = await Promise.all(
    memberships.map(m => db.get(m.toThingId))
  );

  return orgs;
};

// Check if user can access org
export const canAccessOrg = async (
  userId: Id<"things">,
  organizationId: Id<"things">
) => {
  const membership = await db
    .query("connections")
    .withIndex("from_type", q =>
      q.eq("fromThingId", userId)
       .eq("toThingId", organizationId)
       .eq("relationshipType", "member_of")
    )
    .first();

  return !!membership;
};
```

---

## Queries

**Get ONE organization:**
```typescript
export const getOneOrg = async () => {
  const oneOrg = await db
    .query("things")
    .withIndex("type", q => q.eq("type", "organization"))
    .filter(q => q.eq(q.field("properties.slug"), "one"))
    .first();

  return oneOrg;
};
```

**Get ONE's smart contracts:**
```typescript
const contracts = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", oneOrgId)
     .eq("relationshipType", "owns")
  )
  .filter(q =>
    q.neq(q.field("metadata.contractType"), undefined)
  )
  .collect();
```

**Get ONE's customer organizations:**
```typescript
const customerOrgs = await db
  .query("connections")
  .withIndex("to_type", q =>
    q.eq("toThingId", oneOrgId)
     .eq("relationshipType", "hosted_by")
  )
  .collect();

const orgEntities = await Promise.all(
  customerOrgs.map(c => db.get(c.fromThingId))
);
```

**Get ONE's total revenue:**
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

**Get ONE's treasury balances:**
```typescript
const treasuryBalances = {
  sui: await getSuiBalance(process.env.PLATFORM_TREASURY_SUI),
  solana: await getSolanaBalance(process.env.PLATFORM_TREASURY_SOLANA),
  base: await getBaseBalance(process.env.PLATFORM_TREASURY_BASE),
};
```

---

## Platform Features

### 8 Core Features

1. **Inference API** - Pay-per-use AI inference
2. **AI Clones** - Voice & video clones of creators
3. **Content Creation** - AI-powered content generation
4. **Token Economy** - Creator tokens & NFTs
5. **Blockchain Payments** - Multi-chain (Sui, Solana, Base)
6. **Revenue Sharing** - Optional rev share with orgs
7. **Multi-Tenant** - Isolated organizations
8. **Knowledge Integration** - RAG & vector search

### Supported Inference Models

```typescript
const inferenceModels = [
  // OpenAI
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",

  // Anthropic
  "claude-3.5-sonnet",
  "claude-3-opus",
  "claude-3-sonnet",

  // Meta
  "llama-3-70b",
  "llama-3-8b",

  // Mistral
  "mistral-large",
  "mixtral-8x7b",
];
```

### Supported Blockchains

```typescript
const supportedNetworks = [
  {
    name: "Sui",
    chainId: "sui:mainnet",
    nativeToken: "SUI",
    features: ["inference_payment", "token", "nft", "subscription"],
  },
  {
    name: "Solana",
    chainId: "solana:mainnet",
    nativeToken: "SOL",
    features: ["token", "nft", "staking"],
  },
  {
    name: "Base",
    chainId: "base:mainnet",
    nativeToken: "ETH",
    features: ["token", "bridge", "payment"],
  },
];
```

---

## Key Principles

- **Platform Organization** - ONE is the parent org for all customer orgs
- **100% Ownership** - Anthony owns 100% of ONE organization
- **Unlimited Resources** - No limits on users, storage, API calls, inferences
- **Blockchain-First** - All revenue collected via smart contracts
- **Multi-Chain** - Supports Sui, Solana, and Base
- **Multi-Tenant** - Hosts customer organizations with isolation
- **Revenue Flow** - All customer payments flow to platform treasury
- **Enterprise Plan** - ONE runs on unlimited enterprise plan

**ONE is not just an organization. ONE is THE platform.**

---

## See Also

- [Anthony O'Connell Profile](./anthony-o-connell.md)
- [Platform Owner Role](./owner.md)
- [Organization Structure](./organisation.md)
- [People Roles](./people.md)
