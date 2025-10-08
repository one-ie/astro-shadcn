# ONE CLI - Ontology-Driven Project Bootstrap

**Version:** 1.0.0
**Package:** `npx oneie` (ONE Intelligent Environment)
**Purpose:** Bootstrap production-ready, AI-first projects with full ontology integration

---

## Core Concept

The ONE CLI creates **living, ontology-driven codebases** that AI agents can understand and extend:

```
npx oneie
    ↓
Downloads /one/ → Generates Frontend → Generates Backend → Configures AI → Ready!
```

**Result:** A complete Astro + Effect.ts + Convex + Hono project where:
- Every entity, connection, event, and tag maps to the 4-table ontology
- AI agents (Claude, GPT, MCPs) can generate features using the DSL
- Code is type-safe, tested, and production-ready

---

## Bootstrap Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  1. DOWNLOAD /one/ ONTOLOGY                                 │
│                                                              │
│  Downloads from GitHub:                                     │
│  • Ontology.md (4-table universe)                          │
│  • Rules.md, Patterns.md, Workflow.md                      │
│  • Protocol specs (A2A, ACP, AP2, X402, AGUI, ACPayments)  │
│  • DSL specs (ONE DSL.md, ONE DSL English.md)              │
│  • Architecture docs (Frontend, Middleware, Hono)           │
│  • All core specifications                                  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  2. GENERATE FRONTEND (Astro 5 + React 19 + Effect.ts)    │
│                                                              │
│  src/                                                        │
│  ├── pages/*.astro              # SSR pages                │
│  ├── components/ui/*            # shadcn/ui (50+)          │
│  ├── components/features/*      # Feature components        │
│  ├── styles/global.css          # Tailwind v4              │
│  └── layouts/Layout.astro       # Base layout              │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  3. GENERATE BACKEND (Convex + Hono + Effect.ts)          │
│                                                              │
│  convex/                                                     │
│  ├── schema.ts                  # 4-table ontology         │
│  ├── services/*                 # Effect.ts logic          │
│  ├── mutations/*                # Convex wrappers          │
│  ├── queries/*                  # Convex wrappers          │
│  ├── actions/*                  # Convex wrappers          │
│  └── providers/*                # External services        │
│                                                              │
│  api/                                                        │
│  ├── routes/*                   # Hono endpoints           │
│  └── middleware/*               # Auth, CORS, etc          │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  4. CONFIGURE AI INTEGRATION                                │
│                                                              │
│  • CLAUDE.md (instructions for Claude Code)                 │
│  • AGENTS.md (Convex patterns)                              │
│  • .claude/hooks/ (pre/post hooks)                          │
│  • .mcp.json (MCP server config)                            │
│  • scripts/mcp-ontology-server.js (ontology API)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Usage

### Bootstrap New Project

```bash
npx oneie create my-creator-platform
cd my-creator-platform
```

**Generated structure:** 

```
one/
├── one/                # ⭐ Canonical ontology (downloaded) update to show 
│   ├── people
│   ├── things
│   ├── connections
│   ├── events
│   └── knowledge
│
├── src/                # ⭐ Astro frontend
│   ├── pages/
│   ├── components/
│   └── styles/
│
├── convex/             # ⭐ Convex backend
│   ├── schema.ts
│   ├── services/
│   └── mutations/
│
├── api/                # ⭐ Hono API
│   └── routes/
│
├── .claude/            # ⭐ Claude Code config
│   └── hooks/
│
├── CLAUDE.md           # AI instructions
├── .mcp.json           # MCP config
└── package.json        # Bun, Effect.ts, Convex, Astro
```

---

## Feature Generation (DSL-Driven)

### Create Feature from Plain English

```bash
# Write feature spec
cat > features/token-purchase.english << 'EOF'
FEATURE: Let fans buy creator tokens

INPUT:
  - fan: who is buying
  - token: which token
  - amount: how many

OUTPUT:
  - payment ID: Stripe transaction
  - tx hash: blockchain confirmation

FLOW:

CHECK fan exists
CHECK token exists
CHECK amount is greater than 0

DO TOGETHER:
  - CALL Stripe to charge payment
  - CALL Blockchain to mint tokens

RECORD tokens_purchased
  BY fan
  WITH amount and payment ID

GIVE payment ID and tx hash
EOF

# Generate code
npx oneie generate features/token-purchase.english
```

**Generated files:**

```
convex/services/tokens/token-purchase.ts    # Effect.ts service
convex/mutations/tokens.ts                   # Convex wrapper
src/components/features/TokenPurchase.tsx    # React component
tests/unit/services/token-purchase.test.ts   # Tests
```

---

### Conversational Mode

```bash
npx oneie chat
```

**Interactive session:**

```
Welcome to ONE! 🎉

What would you like to build?
> Let fans chat with my AI clone

Great! A few questions:

1. Should fans need tokens? (yes/no)
> yes

2. Tokens per message?
> 10

3. Train AI on videos? (yes/no)
> yes

┌───────────────────────────────┐
│ Feature: Chat with AI Clone   │
├───────────────────────────────┤
│ ✓ Token-gated                 │
│ ✓ 10 tokens per message       │
│ ✓ AI trained on videos        │
│ ✓ Real-time chat              │
└───────────────────────────────┘

Sound good? (yes/edit/cancel)
> yes

Building...
✓ Training AI personality... (3s)
✓ Creating chat system... (2s)
✓ Building UI... (2s)
✓ Testing... (1s)

🎉 Done! Try it: https://localhost:4321/chat
```

---

## MCP Integration

The CLI generates `.mcp.json` with ontology server:

```json
{
  "mcpServers": {
    "ontology": {
      "command": "node",
      "args": ["scripts/mcp-ontology-server.js"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@shadowsu/mcp-shadcn"]
    },
    "convex": {
      "command": "npx",
      "args": ["@convex-dev/mcp-server"]
    }
  }
}
```

**MCP Tools:**

- `ontology.read` → Full Ontology.md
- `ontology.query` → Query entities/connections/events/tags
- `ontology.validate` → Validate feature specs
- `dsl.parse` → Plain English → Technical DSL
- `dsl.compile` → Technical DSL → TypeScript

**AI Usage:**

```typescript
// Claude Code can now:
await mcp.ontology.query("entities", { filter: "token" });
// → Returns: token entity type with properties

await mcp.dsl.parse(plainEnglishSpec);
// → Returns: Technical DSL structure

await mcp.ontology.validate(technicalDSL);
// → Returns: { valid: true, errors: [] }
```

---

## Command Reference

### `npx oneie create <name>`

Bootstrap new project.

**Options:**
- `--template <name>` - Template: `full-stack`, `frontend-only`, `backend-only`
- `--no-install` - Skip `bun install`
- `--ai <provider>` - AI provider: `claude`, `gpt`, `cursor`

```bash
npx oneie create my-platform --template full-stack --ai claude
```

---

### `npx oneie generate <feature>`

Generate feature from DSL.

**Options:**
- `--validate-only` - Only validate
- `--dry-run` - Show what would be generated
- `--output <dir>` - Custom output directory

```bash
npx oneie generate features/token-purchase.english --dry-run
```

---

### `npx oneie chat`

Interactive conversational mode.

```bash
npx oneie chat

> Let fans buy tokens
> $0.10 per token
> Accept crypto
> Building...
> ✓ Done!
```

---

### `npx oneie ontology`

Query/update ontology.

**Commands:**
- `npx oneie ontology show` - Show full ontology
- `npx oneie ontology query <type>` - Query types
- `npx oneie ontology sync` - Sync from GitHub
- `npx oneie ontology stats` - Statistics

```bash
npx oneie ontology query entities
# Returns: 66 entity types

npx oneie ontology sync
# ✓ Synced with one@latest (v1.0.0)
```

---

### `npx oneie add <component>`

Add shadcn/ui component.

```bash
npx oneie add button card dialog
npx oneie add --all
```

---

### `npx oneie validate`

Validate project against ontology.

```bash
npx oneie validate
npx oneie validate --fix
```

---

## Generated Files

### Convex Schema (4-Table Ontology)

```typescript
// convex/schema.ts
export default defineSchema({
  // TABLE 1: ENTITIES (all "things")
  entities: defineTable({
    type: v.union(
      v.literal("user"),
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("token"),
      v.literal("course"),
      // ... 66 total types
    ),
    name: v.string(),
    properties: v.any(), // JSON blob for type-specific fields
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),

  // TABLE 2: CONNECTIONS (all relationships)
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      v.literal("owns"),
      v.literal("following"),
      v.literal("member_of"),
      // ... 25 total types
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("from_type", ["fromEntityId", "relationshipType"]),

  // TABLE 3: EVENTS (all actions)
  events: defineTable({
    entityId: v.id("entities"),
    eventType: v.union(
      v.literal("created"),
      v.literal("tokens_purchased"),
      v.literal("chat_interaction"),
      // ... 67 total types
    ),
    timestamp: v.number(),
    actorType: v.string(),
    actorId: v.optional(v.id("entities")),
    metadata: v.optional(v.any()),
  }).index("by_entity", ["entityId"]),

  // TABLE 4: TAGS (all categories)
  tags: defineTable({
    category: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // Junction table for many-to-many
  entityTags: defineTable({
    entityId: v.id("entities"),
    tagId: v.id("tags"),
  }).index("by_entity", ["entityId"]),
});
```

---

### Effect.ts Service Pattern

```typescript
// convex/services/tokens/token-purchase.ts
import { Effect } from "effect";
import { ConvexDatabase } from "../core/database";
import { StripeProvider, BlockchainProvider } from "../providers";

export class TokenPurchaseService extends Effect.Service<TokenPurchaseService>()(
  "TokenPurchaseService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;
      const blockchain = yield* BlockchainProvider;

      return {
        execute: (fanId: Id<"entities">, tokenId: Id<"entities">, amount: number) =>
          Effect.gen(function* () {
            // Validation
            const fan = yield* Effect.tryPromise(() => db.get(fanId));
            if (!fan) return yield* Effect.fail({ _tag: "NotFound", entity: "fan" });

            const token = yield* Effect.tryPromise(() => db.get(tokenId));
            if (!token) return yield* Effect.fail({ _tag: "NotFound", entity: "token" });

            if (amount <= 0) return yield* Effect.fail({ _tag: "InvalidAmount" });

            // Parallel execution
            const [payment, mintTx] = yield* Effect.all([
              stripe.charge({ amount: amount * 100 }),
              blockchain.mint({ tokenId, toAddress: fanId, amount })
            ]);

            // Record event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                entityId: tokenId,
                eventType: "tokens_purchased",
                timestamp: Date.now(),
                actorType: "user",
                actorId: fanId,
                metadata: { amount, paymentId: payment.id, txHash: mintTx.hash }
              })
            );

            return { paymentId: payment.id, txHash: mintTx.hash };
          })
      };
    }),
    dependencies: [ConvexDatabase.Default, StripeProvider.Default, BlockchainProvider.Default]
  }
) {}
```

---

### Convex Mutation Wrapper

```typescript
// convex/mutations/tokens.ts
import { confect } from "confect";
import { v } from "convex/values";
import { TokenPurchaseService } from "../services/tokens/token-purchase";
import { MainLayer } from "../layers";

export const purchase = confect.mutation({
  args: {
    fanId: v.id("entities"),
    tokenId: v.id("entities"),
    amount: v.number(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* TokenPurchaseService;
      return yield* service.execute(args.fanId, args.tokenId, args.amount);
    }).pipe(Effect.provide(MainLayer))
});
```

---

### React Component

```typescript
// src/components/features/TokenPurchase.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function TokenPurchase({ tokenId }: { tokenId: Id<"entities"> }) {
  const [amount, setAmount] = useState(100);
  const purchase = useMutation(api.tokens.purchase);

  const handlePurchase = async () => {
    try {
      const result = await purchase({ tokenId, amount });
      alert(`Success! TX: ${result.txHash}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Button onClick={handlePurchase}>Buy {amount} Tokens</Button>
    </div>
  );
}
```

---

## Environment Variables

Generated `.env.example`:

```bash
# Convex
CONVEX_DEPLOYMENT=<your-deployment>
CONVEX_URL=https://<your-deployment>.convex.cloud

# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl>
BETTER_AUTH_URL=http://localhost:4321

# OAuth
GITHUB_CLIENT_ID=<your-github-oauth>
GITHUB_CLIENT_SECRET=<your-github-secret>
GOOGLE_CLIENT_ID=<your-google-oauth>
GOOGLE_CLIENT_SECRET=<your-google-secret>

# External Services (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
```

---

## Claude Code Integration

Generated `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/pre.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/post.sh"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(bun:*)",
      "Bash(bunx:*)",
      "Bash(git:*)",
      "mcp__*"
    ]
  }
}
```

**Hooks track ontology changes (inference score):**

```bash
# .claude/hooks/pre.sh
# Calculates hash of one/connections/ontology.md
# If changed → increment inference score
# Logs to one/things/inference_score.md
```

---

## Why This Works

**Traditional approach:**
1. Manual setup (hours)
2. Configure 10+ tools (days)
3. Learn patterns (weeks)
4. Write boilerplate (hours per feature)

**ONE CLI approach:**
1. `npx oneie create` (5 minutes)
2. Everything pre-configured ✅
3. AI learns from patterns ✅
4. `npx oneie generate` (1 minute)

**Result:** 100x faster, higher quality, AI-ready.

---

## Roadmap

### Phase 1: Core Bootstrap (Q1 2025)
- ✅ `npx oneie create` - Full scaffolding
- ✅ Ontology download from GitHub
- ✅ Astro + Convex + Hono setup
- ✅ shadcn/ui installation
- ✅ Better Auth configuration

### Phase 2: Feature Generation (Q2 2025)
- ⏳ `npx oneie generate` - DSL compilation
- ⏳ Plain English parser
- ⏳ Ontology validator
- ⏳ Claude Code SDK integration

### Phase 3: Conversational CLI (Q2 2025)
- ⏳ `npx oneie chat` - Interactive mode
- ⏳ Intent recognition
- ⏳ Smart questions
- ⏳ Progress feedback

### Phase 4: Advanced (Q3 2025)
- 📋 `npx oneie deploy` - One-command deployment
- 📋 `npx oneie upgrade` - Update ontology
- 📋 `npx oneie migrate` - Schema migrations

---

## Success Metrics

**For Developers:**
- ⏱️ 5 minutes → Project bootstrap to first feature
- 🎯 100% type-safe → Generated code passes strict TypeScript
- ✅ Tests included → Every feature has unit tests
- 📖 AI-ready → Claude, GPT, Cursor understand it

**For Non-Technical Users:**
- 💬 Conversational → No commands to memorize
- 🚀 1 minute → Feature idea to working code
- 📱 Browser preview → See it immediately
- ❌ No code shown → Never see TypeScript

---

## Related Documentation

- **[Ontology.md](./ontology.md)** - 4-table data model (source of truth)
- **[dsl.md](./dsl.md)** - Technical DSL specification
- **[dsl-english.md](./dsl-english.md)** - Plain English DSL
- **[Rules.md](./rules.md)** - Golden rules for AI agents
- **[Patterns.md](./patterns.md)** - Proven code patterns
- **[Workflow.md](./workflow.md)** - Ontology-driven development flow
- **[CLAUDE.md](../CLAUDE.md)** - Instructions for Claude Code
- **[one/things/cli.md](./cli.md)** - Implementation details

---

**Core Principle:** The CLI makes it **easier for AI agents to build features** than humans. When that's true, we've succeeded.
