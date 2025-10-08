# KYC (Know Your Customer) - Connection Type

**Version:** 1.0.0
**Status:** Active
**Purpose:** Define KYC verification as a connection in the 4-table ontology with SUI blockchain identity

---

## Overview

KYC (Know Your Customer) is implemented as a **connection** between a creator/organization owner and the platform. It uses SUI blockchain wallets for decentralized identity verification, eliminating traditional document uploads while maintaining compliance.

**Key Principle:** KYC is a **relationship** (connection), not a thing. It represents the verified status between a user and the platform/organization.

---

## Connection Type: `verified`

### Structure

```typescript
{
  _id: Id<"connections">,
  fromThingId: Id<"things">,      // Creator or org_owner
  toThingId: Id<"things">,        // Platform or organization
  relationshipType: "verified",
  metadata: {
    verificationType: "kyc",

    // SUI Blockchain Identity
    suiAddress: string,           // Primary SUI wallet address
    suiAddressVerified: boolean,  // Wallet ownership verified
    verificationTxDigest?: string, // SUI transaction proving ownership

    // Identity Data (minimal, privacy-preserving)
    fullName?: string,             // Optional: legal name
    country: string,               // ISO country code (required)
    jurisdiction: string,          // Legal jurisdiction

    // Verification Level
    level: "basic" | "standard" | "enhanced",

    // Compliance Status
    status: "pending" | "verified" | "rejected" | "expired",
    verifiedAt?: number,
    expiresAt?: number,            // KYC expiration (annual renewal)

    // Risk Assessment
    riskScore?: number,            // 0-100 (AI-generated)
    riskFactors?: string[],        // Flags identified

    // Verification Method
    method: "sui_wallet" | "sui_zklogin" | "sui_multisig",
    zkProof?: string,              // Zero-knowledge proof (if zkLogin)

    // Documents (optional, encrypted)
    documentsRequired: boolean,
    documentsHash?: string,        // IPFS/Arweave hash of encrypted docs

    // Verifier
    verifiedBy: "system" | "manual_review" | "third_party",
    verifierId?: Id<"things">,    // Platform owner or KYC agent

    // Notes
    notes?: string,                // Admin notes (encrypted)
  },
  createdAt: number,
  updatedAt?: number,
}
```

---

## Core Workflow

### Step 1: Organization Owner Registration

When a user creates an organization, they become an `org_owner` and must complete KYC:

```typescript
// User creates organization
const orgId = await db.insert("entities", {
  type: "organization",
  name: "Acme Corp",
  properties: {
    slug: "acme",
    status: "trial",
    plan: "pro",
    // ... org properties
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// User becomes org_owner (member_of connection)
await db.insert("connections", {
  fromThingId: userId,
  toThingId: orgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["read", "write", "admin", "billing"],
  },
  createdAt: Date.now(),
});

// Trigger KYC requirement
await db.insert("events", {
  type: "user_joined_org",
  actorId: userId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: {
    role: "org_owner",
    kycRequired: true,
    kycStatus: "pending",
  },
});
```

### Step 2: SUI Wallet Verification (Primary Method)

The user proves ownership of their SUI wallet by signing a message:

```typescript
// Frontend: User connects SUI wallet
import { useWallet } from "@mysten/dapp-kit";

const { address, signMessage } = useWallet();

// Generate challenge message
const challenge = await convex.mutation(api.kyc.generateChallenge, {
  userId,
  suiAddress: address,
});

// User signs challenge with their SUI wallet
const signature = await signMessage({
  message: challenge.message,
});

// Verify signature and create KYC connection
await convex.mutation(api.kyc.verifySuiWallet, {
  userId,
  suiAddress: address,
  signature: signature.signature,
  challengeId: challenge.id,
});
```

**Backend: KYC Service (Effect.ts)**

```typescript
// convex/services/kyc/verification.ts
export class KYCService extends Effect.Service<KYCService>()("KYCService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const sui = yield* SuiProvider;

    return {
      verifySuiWallet: (args: VerifyWalletArgs) =>
        Effect.gen(function* () {
          // 1. Validate signature
          const isValid = yield* sui.verifySignature({
            message: args.challenge,
            signature: args.signature,
            publicKey: args.suiAddress,
          });

          if (!isValid) {
            return yield* Effect.fail(
              new KYCError({ message: "Invalid signature" })
            );
          }

          // 2. Get user and determine verification target
          const user = yield* Effect.tryPromise(() => db.get(args.userId));

          // Check if user is org_owner
          const orgMembership = yield* Effect.tryPromise(() =>
            db
              .query("connections")
              .withIndex("from_type", q =>
                q.eq("fromThingId", args.userId)
                 .eq("relationshipType", "member_of")
              )
              .filter(q => q.eq(q.field("metadata.role"), "org_owner"))
              .first()
          );

          const targetId = orgMembership?.toThingId || platformOrgId;

          // 3. Perform risk assessment (AI-based)
          const riskScore = yield* assessRisk({
            suiAddress: args.suiAddress,
            userId: args.userId,
            country: args.country,
          });

          // 4. Create KYC verification connection
          const kycId = yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromThingId: args.userId,
              toThingId: targetId,
              relationshipType: "verified",
              metadata: {
                verificationType: "kyc",
                suiAddress: args.suiAddress,
                suiAddressVerified: true,
                verificationTxDigest: args.txDigest,
                country: args.country,
                jurisdiction: args.jurisdiction || args.country,
                level: riskScore < 30 ? "enhanced" : "standard",
                status: riskScore < 50 ? "verified" : "pending",
                verifiedAt: Date.now(),
                expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
                riskScore,
                method: "sui_wallet",
                verifiedBy: riskScore < 50 ? "system" : "manual_review",
                documentsRequired: riskScore >= 50,
              },
              createdAt: Date.now(),
            })
          );

          // 5. Log verification event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              type: "entity_updated",
              actorId: args.userId,
              targetId: targetId,
              timestamp: Date.now(),
              metadata: {
                updateType: "kyc_verification",
                status: riskScore < 50 ? "verified" : "pending_review",
                suiAddress: args.suiAddress,
                riskScore,
                level: riskScore < 30 ? "enhanced" : "standard",
              },
            })
          );

          return {
            success: true,
            status: riskScore < 50 ? "verified" : "pending_review",
            kycId,
          };
        }),
    };
  }),
  dependencies: [ConvexDatabase.Default, SuiProvider.Default],
}) {}
```

### Step 3: Risk Assessment

The system automatically assesses risk based on:

```typescript
const assessRisk = async (data: RiskAssessmentInput) => {
  const factors = [];
  let score = 0;

  // 1. Check SUI wallet history
  const walletAge = await sui.getWalletAge(data.suiAddress);
  if (walletAge < 30 * 24 * 60 * 60 * 1000) {
    // Less than 30 days
    score += 20;
    factors.push("new_wallet");
  }

  const txCount = await sui.getTransactionCount(data.suiAddress);
  if (txCount < 5) {
    score += 15;
    factors.push("low_activity");
  }

  // 2. Check jurisdiction
  const highRiskCountries = ["XX", "YY", "ZZ"];
  if (highRiskCountries.includes(data.country)) {
    score += 30;
    factors.push("high_risk_jurisdiction");
  }

  // 3. Check for suspicious patterns
  const linkedAddresses = await sui.getLinkedAddresses(data.suiAddress);
  if (linkedAddresses.some((addr) => isBlacklisted(addr))) {
    score += 50;
    factors.push("linked_to_blacklisted_address");
  }

  // 4. On-chain reputation score
  const reputation = await sui.getReputationScore(data.suiAddress);
  if (reputation < 50) {
    score += 10;
    factors.push("low_reputation");
  }

  return { score, factors };
};
```

### Step 4: Status Determination

Based on risk score:

- **score < 30**: Auto-approved (enhanced verification)
- **score 30-49**: Auto-approved (standard verification)
- **score 50-79**: Manual review required
- **score >= 80**: Rejected or require documents

---

## KYC Verification Levels

### Basic (Default for org_user)

- SUI wallet ownership verified
- Country declared
- No document upload required
- Limited to org_user role

### Standard (Default for org_owner)

- SUI wallet ownership verified
- Country + jurisdiction declared
- Risk score < 50
- No documents required
- Suitable for most org_owners

### Enhanced (High-value accounts)

- SUI wallet ownership verified
- Risk score < 30
- Additional on-chain reputation checks
- Optional: zkLogin integration
- For platform revenue share, large orgs

---

## Events

**KYC Lifecycle Events:**

```typescript
// KYC verification completed
{
  type: "entity_updated",
  actorId: userId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    updateType: "kyc_verification",
    status: "verified",
    level: "standard",
    method: "sui_wallet",
    suiAddress: "0x...",
  },
}

// KYC requires manual review
{
  type: "entity_updated",
  actorId: userId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    updateType: "kyc_pending_review",
    riskScore: 65,
    riskFactors: ["new_wallet", "high_risk_jurisdiction"],
  },
}

// KYC expired (annual renewal)
{
  type: "entity_updated",
  actorId: "system",
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    updateType: "kyc_expired",
    expiresAt: Date.now(),
    renewalRequired: true,
  },
}

// KYC rejected
{
  type: "entity_updated",
  actorId: adminId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    updateType: "kyc_rejected",
    reason: "Unable to verify identity",
    appealAvailable: true,
  },
}
```

---

## Queries

**Check if user is KYC verified:**

```typescript
const isKYCVerified = async (userId: Id<"entities">) => {
  const kyc = await db
    .query("connections")
    .withIndex("from_type", (q) =>
      q
        .eq("fromThingId", userId)
        .eq("relationshipType", "verified")
    )
    .filter((q) =>
      q.and(
        q.eq(q.field("metadata.verificationType"), "kyc"),
        q.eq(q.field("metadata.status"), "verified"),
        q.gt(q.field("metadata.expiresAt"), Date.now())
      )
    )
    .first();

  return !!kyc;
};
```

**Get KYC status for org_owner:**

```typescript
const getKYCStatus = async (userId: Id<"entities">, orgId: Id<"entities">) => {
  const kyc = await db
    .query("connections")
    .withIndex("from_type", (q) =>
      q
        .eq("fromThingId", userId)
        .eq("toThingId", orgId)
        .eq("relationshipType", "verified")
    )
    .first();

  if (!kyc) return { status: "not_started" };

  return {
    status: kyc.metadata.status,
    level: kyc.metadata.level,
    expiresAt: kyc.metadata.expiresAt,
    suiAddress: kyc.metadata.suiAddress,
    verifiedAt: kyc.metadata.verifiedAt,
  };
};
```

**List all pending KYC reviews:**

```typescript
const pendingReviews = await db
  .query("connections")
  .withIndex("by_type", (q) => q.eq("relationshipType", "verified"))
  .filter((q) =>
    q.and(
      q.eq(q.field("metadata.verificationType"), "kyc"),
      q.eq(q.field("metadata.status"), "pending")
    )
  )
  .collect();
```

---

## Frontend Integration

**React Component:**

```tsx
// src/components/kyc/SuiKYCVerification.tsx
import { useMutation } from "convex/react";
import { useWallet, ConnectButton } from "@mysten/dapp-kit";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function SuiKYCVerification({ userId, orgId }: Props) {
  const { address, signMessage } = useWallet();
  const verify = useMutation(api.kyc.verifySuiWallet);

  const handleVerify = async () => {
    if (!address) return;

    // 1. Generate challenge
    const challenge = await convex.mutation(api.kyc.generateChallenge, {
      userId,
      suiAddress: address,
    });

    // 2. Sign with SUI wallet
    const { signature } = await signMessage({
      message: challenge.message,
    });

    // 3. Submit verification
    const result = await verify({
      userId,
      suiAddress: address,
      signature,
      challengeId: challenge.id,
      country: "US", // From form
      jurisdiction: "US",
    });

    if (result.status === "verified") {
      // KYC complete!
    } else {
      // Manual review required
    }
  };

  return (
    <div>
      <h2>Verify Your Identity with SUI</h2>
      <p>Connect your SUI wallet to complete KYC verification</p>

      {!address ? (
        <ConnectButton />
      ) : (
        <Button onClick={handleVerify}>Verify Wallet Ownership</Button>
      )}
    </div>
  );
}
```

**Astro Page:**

```astro
---
// src/pages/kyc.astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import SuiKYCVerification from "@/components/kyc/SuiKYCVerification";

const user = Astro.locals.user;
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

// Check KYC status
const kycStatus = await convex.query(api.kyc.getStatus, {
  userId: user._id,
});
---

<Layout>
  <h1>KYC Verification</h1>

  {kycStatus.status === "verified" ? (
    <div>
      <p>✅ Verified on {new Date(kycStatus.verifiedAt).toLocaleDateString()}</p>
      <p>Level: {kycStatus.level}</p>
    </div>
  ) : (
    <SuiKYCVerification client:load userId={user._id} />
  )}
</Layout>
```

---

## Security & Privacy

**Privacy-Preserving Approach:**

1. **No Document Upload** - SUI wallet ownership = identity proof
2. **Minimal Data** - Only country, jurisdiction, wallet address stored
3. **Zero-Knowledge** - Optional zkLogin for enhanced privacy
4. **Encrypted Storage** - All PII encrypted at rest
5. **Decentralized** - SUI blockchain as source of truth
6. **Time-Limited** - KYC expires after 1 year (GDPR compliance)

**Compliance:**

- **GDPR**: Right to erasure (delete connection)
- **AML**: Risk-based approach with AI scoring
- **KYC**: Wallet ownership + jurisdiction = compliance
- **Audit Trail**: All events logged in ontology

---

## Advanced: zkLogin Integration

For maximum privacy, use SUI zkLogin:

```typescript
// Zero-knowledge proof of identity without revealing personal data
{
  fromThingId: userId,
  toThingId: organizationId,
  relationshipType: "verified",
  metadata: {
    verificationType: "kyc",
    method: "sui_zklogin",
    zkProof: "...",              // Zero-knowledge proof
    suiAddress: "0x...",         // Derived from proof
    suiAddressVerified: true,
    country: "US",
    level: "enhanced",
    status: "verified",
    // NO personal data stored
  },
}
```

---

## Notes

- **SUI Blockchain = Identity Layer** - Wallet ownership proves identity
- **Connection Type** - KYC is a `verified` connection, not a thing
- **Risk-Based** - AI assesses risk, low-risk = auto-approve
- **Privacy-First** - No document uploads, minimal data collection
- **Decentralized** - Verifiable on-chain via SUI
- **Renewable** - Annual KYC renewal required
- **Multi-Level** - Basic, Standard, Enhanced verification tiers
- **Compliant** - GDPR, AML, KYC regulations met

---

## See Also

- **[Owner.md](../things/owner.md)** - Platform owner and org_owner roles
- **[Organisation.md](../things/organisation.md)** - Organization structure
- **[SUI.md](../things/sui.md)** - SUI blockchain integration
- **[Ontology.md](../ontology.md)** - 4-table universe reference
