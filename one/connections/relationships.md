# Relationships

This folder contains documentation about specific **connection types** in the ONE Platform ontology.

## What Goes Here

Documentation about relationship types - how thing X relates to thing Y.

**Examples to Create:**
- `Ownership.md` - owns, created_by relationships
- `Membership.md` - member_of relationships (org membership with roles)
- `TokenHoldings.md` - holds_tokens, staked_in relationships
- `Content.md` - authored, generated_by, published_to relationships
- `Collaboration.md` - collaborates_with, manages, reports_to relationships

## The 25 Relationship Types

From the ontology:

**Ownership (2):**
- owns
- created_by

**AI Relationships (3):**
- clone_of
- trained_on
- powers

**Content Relationships (5):**
- authored
- generated_by
- published_to
- part_of
- references

**Community Relationships (4):**
- member_of
- following
- moderates
- participated_in

**Business Relationships (3):**
- manages
- reports_to
- collaborates_with

**Token Relationships (3):**
- holds_tokens
- staked_in
- earned_from

**Product Relationships (4):**
- purchased
- enrolled_in
- completed
- teaching

**Consolidated Types (7):**
- transacted (payments/subscriptions with metadata.transactionType)
- notified (notifications with metadata.channel)
- referred (referrals with metadata.referralType)
- communicated (agent communication with metadata.protocol)
- delegated (task delegation with metadata.protocol)
- approved (approvals with metadata.approvalType)
- fulfilled (fulfillment with metadata.fulfillmentType)

## Connection Structure

Every connection has:

```typescript
{
  _id: Id<"connections">,
  fromThingId: Id<"entities">,
  toThingId: Id<"entities">,
  relationshipType: ConnectionType,
  metadata?: {              // Optional relationship data
    // Network (blockchain)
    network?: "sui" | "solana" | "base",
    // Protocol (A2A, ACP, etc.)
    protocol?: string,
    // Type-specific metadata
    revenueShare?: number,
    balance?: number,
    role?: string,
    permissions?: string[],
    // etc...
  },
  strength?: number,        // 0-1
  validFrom?: number,
  validTo?: number,
  createdAt: number,
  updatedAt?: number,
}
```

## Rules

- **Directional** - fromThingId → toThingId has meaning
- **Metadata for variants** - Use metadata instead of new types
- **Protocol-agnostic** - Protocol in metadata, not type name
- **Network-aware** - Blockchain connections include metadata.network
- **Temporal** - Can have validFrom/validTo for time-bound relationships

## Reference

See `../ontology.md` for the complete canonical specification.
