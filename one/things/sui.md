# SUI Move - Smart Contract Integration

**Version:** 1.0.0
**Status:** Active
**Purpose:** Map SUI Move smart contracts to the ONE Platform 4-table ontology

---

## Overview

SUI Move is our smart contract layer for blockchain operations. It integrates seamlessly with the ONE Platform ontology using protocol-agnostic patterns where SUI-specific details live in `metadata.network` and entity `properties`.

**Key Principle:** SUI Move is just another protocol. It maps TO the ontology via metadata, never the other way around.

---

## SUI Move in the 4-Table Universe

### 1. THINGS (Entities)

**SUI-Related Thing Types:**

```typescript
// Core blockchain entities
| 'token_contract'    // SUI Move smart contract
| 'token'             // SUI token instance (Coin<T>)
| 'nft'               // SUI NFT (kiosk objects)
| 'payment'           // SUI payment transaction
| 'external_connection' // Connection to SUI network/RPC
| 'creator_token'     // Fan/creator social token (CreatorOS package)

// Creator economy
| 'creator'           // Creator with SUI wallet
| 'digital_product'   // Product with SUI payment option
```

**Token Contract Properties (SUI Move):**

```typescript
{
  type: "token_contract",
  name: "Creator Token Contract",
  properties: {
    // SUI-specific fields
    network: "sui",                    // or "sui-testnet", "sui-devnet"
    packageId: string,                  // SUI package object ID
    moduleNames: string[],              // Move modules in package
    coinType: string,                   // Full coin type (e.g., "0x123::token::TOKEN")
    treasuryCap: string,                // Treasury cap object ID
    metadata: string,                   // CoinMetadata object ID

    // Token economics
    totalSupply: number,
    decimals: number,
    symbol: string,
    description: string,
    iconUrl?: string,

    // Utility & governance
    utility: string[],                  // ["staking", "governance", "access"]
    stakingEnabled: boolean,
    governanceEnabled: boolean,

    // Deployment info
    deployedBy: Id<"entities">,         // Creator who deployed
    deployTxDigest: string,             // SUI transaction digest
    deployedAt: number,
    upgradeCapability: "immutable" | "owner" | "multisig",
  },
  status: "active",
  createdAt: number,
  updatedAt: number,
}
```

**Token Instance Properties (SUI Coin):**

```typescript
{
  type: "token",
  name: "Creator Token",
  properties: {
    blockchain: "sui",
    network: "sui",                     // mainnet
    standard: "COIN",                   // SUI Coin standard
    coinType: string,                   // Full type
    contractAddress: string,            // Package ID

    // Supply & economics
    totalSupply: number,
    circulatingSupply: number,
    price: number,                      // USD per token
    marketCap: number,

    // On-chain metrics
    holders: number,
    transactions24h: number,
    volume24h: number,

    // SUI-specific
    epochSupply: number,                // Supply at current epoch
    lastEpochUpdate: number,
  },
  status: "active",
}
```

**Creator Token Properties (CreatorOS Coin)**

```typescript
{
  type: "creator_token",
  name: "CreatorOS Fan Token",
  properties: {
    blockchain: "sui",
    network: "sui",
    standard: "COIN",
    coinType: string,                 // e.g. "0xcreatoros::token::ALIYAH"
    packageId: string,                // CreatorOS package
    treasuryCap: string,              // TreasuryCap object ID
    launchpadModule: string,          // Module handling mint/vesting

    creatorThingId: Id<"things">,
    totalSupply: number,
    circulatingSupply: number,
    priceUsd?: number,
    rewardPrograms: [
      {
        type: "airdrop" | "course_reward" | "community_reward" | "purchase_bonus",
        metadata: Record<string, any>,
      }
    ],
    gatedUtilities: [
      {
        targetThingId: Id<"things">,  // e.g., digital_product, community space
        requirement: "hold" | "stake" | "burn",
        threshold: number,
      }
    ],
    vestingSchedules: [
      {
        beneficiaryThingId: Id<"things">,
        allocation: number,
        cliffAt: number,
        unlockFrequencyDays: number,
      }
    ],
    createdBy: Id<"things">,
    launchTxDigest: string,
    createdAt: number,
    updatedAt: number,
  },
  status: "active",
}
```

**NFT Properties (SUI Kiosk):**

```typescript
{
  type: "nft",
  name: "Creator NFT #123",
  properties: {
    blockchain: "sui",
    network: "sui",
    standard: "KIOSK",                  // SUI Kiosk standard

    // Object details
    objectId: string,                   // Unique object ID
    packageId: string,                  // NFT package
    moduleType: string,                 // Full type (e.g., "0x123::nft::CreatorNFT")
    version: number,                    // Object version
    digest: string,                     // Object digest

    // Kiosk details
    kioskId?: string,                   // If listed in kiosk
    transferPolicy?: string,            // Transfer policy object

    // Metadata
    name: string,
    description: string,
    imageUrl: string,
    attributes: Record<string, any>,

    // Ownership & transfer
    owner: string,                      // SUI address
    transferrable: boolean,

    // Creator economy
    royaltyBps: number,                 // Royalty in basis points
    creatorAddress: string,
  },
  status: "active",
}
```

**External Connection Properties (SUI RPC):**

```typescript
{
  type: "external_connection",
  name: "SUI Mainnet RPC",
  properties: {
    platform: "sui",
    connectionType: "rpc",
    baseUrl: "https://fullnode.mainnet.sui.io:443",
    websocketUrl: "wss://fullnode.mainnet.sui.io:443",

    // Authentication
    authentication: {
      type: "apiKey",        // or "none" for public RPC
      credentials: any,      // Encrypted
    },

    // Network
    network: "mainnet",      // or "testnet", "devnet"
    chainId: string,

    // Health
    status: "active",
    lastConnectedAt: number,
    rateLimits: {
      requestsPerMinute: number,
      requestsPerDay: number,
    },
  },
}
```

### 2. CONNECTIONS (Relationships)

**SUI-Related Connections:**

```typescript
// User holds SUI tokens
{
  fromThingId: userId,
  toThingId: tokenId,
  relationshipType: "holds_tokens",
  metadata: {
    network: "sui",
    balance: number,              // Token balance
    balanceObjectId: string,      // SUI Coin object ID
    walletAddress: string,        // SUI wallet address
    acquiredAt: number,
    lastUpdatedAt: number,
  },
}

// User owns NFT
{
  fromThingId: userId,
  toThingId: nftId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    objectId: string,             // NFT object ID
    kioskId?: string,             // If in kiosk
    acquiredTxDigest: string,     // Purchase transaction
    acquiredAt: number,
  },
}

// Creator owns token contract
{
  fromThingId: creatorId,
  toThingId: contractId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    deploymentRole: "deployer",
    upgradeCap?: string,          // Upgrade capability object
    adminCap?: string,            // Admin capability object
  },
}

// Creator treasury allocation of creator token supply
{
  fromThingId: creatorId,
  toThingId: creatorTokenId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    allocation: number,           // Amount allocated to creator
    vestingScheduleId?: string,
    cliffAt?: number,
    unlockFrequencyDays?: number,
    notes?: string,
  },
}

// Fan holds creator tokens (airdrop, rewards, purchases)
{
  fromThingId: fanId,
  toThingId: creatorTokenId,
  relationshipType: "holds_tokens",
  metadata: {
    network: "sui",
    balance: number,
    walletAddress: string,
    acquisitionSource: "airdrop" | "purchase" | "course_reward" | "community_reward",
    acquiredAt: number,
    lastUpdatedAt: number,
  },
}

// Product accepts SUI payment
{
  fromThingId: productId,
  toThingId: paymentMethodId,
  relationshipType: "accepts_payment",
  metadata: {
    network: "sui",
    paymentType: "coin",
    coinTypes: string[],          // Accepted coin types
    recipientAddress: string,     // Creator's SUI address
  },
}

// Token staked in protocol
{
  fromThingId: userId,
  toThingId: stakingPoolId,
  relationshipType: "staked_in",
  metadata: {
    network: "sui",
    stakedAmount: number,
    stakedObjectId: string,       // Staking position object
    stakedAt: number,
    unlockAt?: number,
    rewards: number,
  },
}
```

### 3. EVENTS (Actions)

**SUI-Related Events:**

All SUI events include `metadata.network: "sui"` for network identity.

```typescript
// Token minted on SUI
{
  type: "token_minted",
  actorId: creatorId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: number,
    txDigest: string,             // SUI transaction digest
    coinObjectId: string,         // Created coin object
    epoch: number,                // SUI epoch
    gasUsed: number,              // MIST used
  },
}

// Tokens purchased with SUI
{
  type: "tokens_purchased",
  actorId: buyerId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: number,               // Tokens purchased
    paidAmount: number,           // SUI paid
    paidCoinType: string,         // Payment coin type
    txDigest: string,
    seller?: Id<"entities">,
    marketplaceContract?: string,
  },
}

// NFT minted
{
  type: "nft_minted",
  actorId: creatorId,
  targetId: nftId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    objectId: string,
    packageId: string,
    txDigest: string,
    recipient: string,            // SUI address
    mintPrice?: number,
    kioskId?: string,
  },
}

// NFT transferred
{
  type: "nft_transferred",
  actorId: senderId,
  targetId: nftId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    objectId: string,
    from: string,                 // SUI address
    to: string,                   // SUI address
    txDigest: string,
    transferType: "direct" | "kiosk_purchase" | "kiosk_transfer",
    price?: number,               // If sale
  },
}

// Payment processed (SUI)
{
  type: "payment_event",
  actorId: buyerId,
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    status: "completed",
    amount: number,
    coinType: string,
    txDigest: string,
    sender: string,               // SUI address
    recipient: string,            // SUI address
    productId?: Id<"entities">,
  },
}

// Token staked
{
  type: "tokens_staked",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: number,
    poolId: string,               // Staking pool object
    stakingObjectId: string,
    txDigest: string,
    lockPeriod?: number,          // seconds
    expectedApy: number,
  },
}

// Tokens unstaked
{
  type: "tokens_unstaked",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount: number,
    rewards: number,
    stakingObjectId: string,
    txDigest: string,
    stakedDuration: number,       // seconds
  },
}

// Smart contract deployed
{
  type: "entity_created",
  actorId: creatorId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    entityType: "token_contract",
    packageId: string,
    txDigest: string,
    modules: string[],
    upgradeCapability: string,
    gasUsed: number,
  },
}
```

### 4. TAGS (Categories)

**SUI-Related Tags:**

```typescript
// Network tags
{ name: "sui", category: "network" }
{ name: "sui-testnet", category: "network" }
{ name: "sui-devnet", category: "network" }

// Protocol tags
{ name: "sui-move", category: "protocol" }
{ name: "sui-kiosk", category: "protocol" }

// Payment method tags
{ name: "sui-coin", category: "payment_method" }
{ name: "sui-nft", category: "payment_method" }

// Capability tags
{ name: "staking", category: "capability" }
{ name: "governance", category: "capability" }
{ name: "nft-minting", category: "capability" }
```

---

## SUI Move Smart Contract Patterns

### Pattern 1: Deploy Token Contract

```typescript
// 1. Create token_contract entity
const contractId = await db.insert("entities", {
  type: "token_contract",
  name: "Creator Token",
  properties: {
    network: "sui",
    packageId: "0x123...",
    coinType: "0x123::creator_token::CREATOR_TOKEN",
    treasuryCap: "0xabc...",
    metadata: "0xdef...",
    totalSupply: 1_000_000,
    decimals: 9,
    symbol: "CREATOR",
    description: "Creator economy token",
    deployedBy: creatorId,
    deployTxDigest: "9mKG...",
    deployedAt: Date.now(),
    upgradeCapability: "immutable",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 2. Create ownership connection
await db.insert("connections", {
  fromThingId: creatorId,
  toThingId: contractId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    deploymentRole: "deployer",
  },
  createdAt: Date.now(),
});

// 3. Log deployment event
await db.insert("events", {
  type: "entity_created",
  actorId: creatorId,
  targetId: contractId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    entityType: "token_contract",
    packageId: "0x123...",
    txDigest: "9mKG...",
  },
});
```

### Pattern 2: Purchase Tokens with SUI

```typescript
// 1. Process blockchain transaction (Effect.ts service)
const txResult = await suiClient.executeTransaction({
  sender: buyerAddress,
  // ... transaction details
});

// 2. Create/update holds_tokens connection
const existing = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", buyerId)
     .eq("toThingId", tokenId)
     .eq("relationshipType", "holds_tokens")
  )
  .first();

if (existing) {
  await db.patch(existing._id, {
    metadata: {
      ...existing.metadata,
      balance: existing.metadata.balance + amount,
      lastUpdatedAt: Date.now(),
    },
  });
} else {
  await db.insert("connections", {
    fromThingId: buyerId,
    toThingId: tokenId,
    relationshipType: "holds_tokens",
    metadata: {
      network: "sui",
      balance: amount,
      balanceObjectId: txResult.objectId,
      walletAddress: buyerAddress,
      acquiredAt: Date.now(),
    },
    createdAt: Date.now(),
  });
}

// 3. Log purchase event
await db.insert("events", {
  type: "tokens_purchased",
  actorId: buyerId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount,
    paidAmount: suiPaid,
    paidCoinType: "0x2::sui::SUI",
    txDigest: txResult.digest,
  },
});
```

### Pattern 3: Mint NFT to Kiosk

```typescript
// 1. Mint NFT on-chain
const mintResult = await suiClient.executeTransaction({
  // ... mint transaction
});

// 2. Create NFT entity
const nftId = await db.insert("entities", {
  type: "nft",
  name: `Creator NFT #${tokenNumber}`,
  properties: {
    blockchain: "sui",
    network: "sui",
    standard: "KIOSK",
    objectId: mintResult.objectId,
    packageId: nftPackageId,
    moduleType: `${nftPackageId}::creator_nft::CreatorNFT`,
    kioskId: kioskObjectId,
    name: metadata.name,
    description: metadata.description,
    imageUrl: metadata.imageUrl,
    attributes: metadata.attributes,
    owner: recipientAddress,
    transferrable: true,
    royaltyBps: 500, // 5% royalty
    creatorAddress: creatorWallet,
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 3. Create ownership connection
await db.insert("connections", {
  fromThingId: recipientId,
  toThingId: nftId,
  relationshipType: "owns",
  metadata: {
    network: "sui",
    objectId: mintResult.objectId,
    kioskId: kioskObjectId,
    acquiredTxDigest: mintResult.digest,
    acquiredAt: Date.now(),
  },
  createdAt: Date.now(),
});

// 4. Log mint event
await db.insert("events", {
  type: "nft_minted",
  actorId: creatorId,
  targetId: nftId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    objectId: mintResult.objectId,
    packageId: nftPackageId,
    txDigest: mintResult.digest,
    recipient: recipientAddress,
    kioskId: kioskObjectId,
  },
});
```

### Pattern 4: Stake Tokens

```typescript
// 1. Execute staking transaction
const stakeResult = await suiClient.executeTransaction({
  // ... staking transaction
});

// 2. Create staking connection
await db.insert("connections", {
  fromThingId: userId,
  toThingId: stakingPoolId,
  relationshipType: "staked_in",
  metadata: {
    network: "sui",
    stakedAmount: amount,
    stakedObjectId: stakeResult.stakingObject,
    stakedAt: Date.now(),
    unlockAt: lockPeriod ? Date.now() + lockPeriod * 1000 : undefined,
    rewards: 0,
  },
  createdAt: Date.now(),
});

// 3. Update user's token balance connection
const balance = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", userId)
     .eq("toThingId", tokenId)
     .eq("relationshipType", "holds_tokens")
  )
  .first();

await db.patch(balance._id, {
  metadata: {
    ...balance.metadata,
    balance: balance.metadata.balance - amount,
    lastUpdatedAt: Date.now(),
  },
});

// 4. Log staking event
await db.insert("events", {
  type: "tokens_staked",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    network: "sui",
    amount,
    poolId: stakingPoolId,
    stakingObjectId: stakeResult.stakingObject,
    txDigest: stakeResult.digest,
    lockPeriod,
    expectedApy: 12.5,
  },
});
```

---

## Effect.ts Service Layer

**SUI Provider Pattern:**

```typescript
// convex/services/providers/sui.ts
import { Effect, Layer } from "effect";
import { SuiClient } from "@mysten/sui/client";

export class SuiProvider extends Effect.Service<SuiProvider>()("SuiProvider", {
  effect: Effect.gen(function* () {
    const client = new SuiClient({ url: process.env.SUI_RPC_URL });

    return {
      // Query methods
      getObject: (objectId: string) =>
        Effect.tryPromise({
          try: () => client.getObject({ id: objectId }),
          catch: (error) => new SuiError({ message: String(error) }),
        }),

      getCoinBalance: (owner: string, coinType: string) =>
        Effect.tryPromise({
          try: () => client.getBalance({ owner, coinType }),
          catch: (error) => new SuiError({ message: String(error) }),
        }),

      // Transaction methods
      executeTransaction: (transaction: Transaction) =>
        Effect.tryPromise({
          try: async () => {
            const result = await client.signAndExecuteTransaction({
              transaction,
              signer: keypair,
            });
            return result;
          },
          catch: (error) => new SuiError({ message: String(error) }),
        }),

      // Event subscription
      subscribeEvent: (filter: EventFilter) =>
        Effect.tryPromise({
          try: () => client.subscribeEvent({ filter }),
          catch: (error) => new SuiError({ message: String(error) }),
        }),
    };
  }),
  dependencies: [],
}) {}

// Error types
export class SuiError extends Data.TaggedError("SuiError")<{
  message: string;
}> {}
```

**Token Service with SUI:**

```typescript
// convex/services/blockchain/token.ts
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const sui = yield* SuiProvider;

      return {
        purchase: (args: PurchaseTokenArgs) =>
          Effect.gen(function* () {
            // 1. Validate user and token
            const user = yield* Effect.tryPromise(() => db.get(args.userId));
            const token = yield* Effect.tryPromise(() => db.get(args.tokenId));

            // 2. Execute SUI transaction
            const tx = new Transaction();
            // ... build transaction
            const result = yield* sui.executeTransaction(tx);

            // 3. Update connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromThingId: args.userId,
                toThingId: args.tokenId,
                relationshipType: "holds_tokens",
                metadata: {
                  network: "sui",
                  balance: args.amount,
                  balanceObjectId: result.objectChanges[0].objectId,
                  walletAddress: user.properties.walletAddress,
                  acquiredAt: Date.now(),
                },
                createdAt: Date.now(),
              })
            );

            // 4. Log event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "tokens_purchased",
                actorId: args.userId,
                targetId: args.tokenId,
                timestamp: Date.now(),
                metadata: {
                  network: "sui",
                  amount: args.amount,
                  txDigest: result.digest,
                },
              })
            );

            return { success: true, txDigest: result.digest };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, SuiProvider.Default],
  }
) {}
```

---

## Integration Checklist

When integrating SUI Move smart contracts:

- [ ] Map contract entities to `token_contract` or `nft` types
- [ ] Store SUI-specific fields in entity `properties`
- [ ] Use `metadata.network: "sui"` in all events
- [ ] Create `external_connection` for RPC endpoints
- [ ] Tag entities with `network:sui`
- [ ] Use typed errors in Effect.ts services
- [ ] Log all on-chain transactions as events
- [ ] Store object IDs and transaction digests
- [ ] Handle SUI-specific types (Coin, Object, TransferPolicy)
- [ ] Subscribe to on-chain events for real-time updates

---

## Frontend Integration

**React Component:**

```typescript
// src/components/features/tokens/SuiTokenPurchase.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useWallet } from "@mysten/dapp-kit";

export function SuiTokenPurchase({ tokenId }: Props) {
  const { address } = useWallet();
  const purchase = useMutation(api.tokens.purchase);
  const balance = useQuery(api.tokens.getBalance, {
    userId: address,
    tokenId
  });

  return (
    <div>
      <p>Your balance: {balance?.metadata.balance || 0}</p>
      <Button onClick={() => purchase({ tokenId, amount: 100 })}>
        Buy 100 Tokens
      </Button>
    </div>
  );
}
```

**Astro Page:**

```astro
---
// src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import SuiTokenPurchase from "@/components/features/tokens/SuiTokenPurchase";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(api.tokens.get, { id: Astro.params.id });
---

<Layout>
  <h1>{token.name}</h1>
  <p>Network: {token.properties.network}</p>
  <p>Contract: {token.properties.packageId}</p>

  <SuiTokenPurchase client:load tokenId={token._id} />
</Layout>
```

---

## Summary

SUI Move integrates with ONE Platform through:

1. **Entities**: `token_contract`, `token`, `nft` with SUI-specific properties
2. **Connections**: `holds_tokens`, `owns`, `staked_in` with network metadata
3. **Events**: All token/NFT events with `metadata.network: "sui"`
4. **Tags**: `network:sui`, `protocol:sui-move`

**Key Benefits:**
- Protocol-agnostic ontology (SUI is just metadata)
- Cross-chain analytics (query all networks via same schema)
- Future-proof (add new networks without schema changes)
- Type-safe (Effect.ts + TypeScript)
- Real-time (Convex subscriptions + SUI event subscriptions)

**This is how blockchain becomes just another data layer in the 4-table universe.**
