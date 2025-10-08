# AGENTS.md

ONE Ontology quick reference for coding agents. Concise, protocol‑agnostic, and optimized for minimal context.

## Core Model (4 Tables)

- `things` — entities you can point at (creator, organization, content, product, token, external_agent, mandate, payment, ui_preferences, etc.).
- `connections` — stateful relationships between things (`owns`, `member_of`, `authored`, `holds_tokens`, plus consolidated types like `transacted`, `notified`, `referred`, `communicated`, `delegated`, `approved`, `fulfilled`).
- `events` — time‑stamped actions (entity/content/payment/comm/task/mandate families; use consolidated types with `metadata`).
- `knowledge` — labels and semantic chunks with vectors, linked via `thingKnowledge`.

Golden rule: All features map to these four primitives. If they don’t, rethink the design.

## Thing Essentials

```typescript
type Thing = {
  _id: Id<'things'>;
  type: ThingType;           // e.g. 'creator' | 'organization' | 'video' | 'token' | 'external_agent' | 'mandate' | 'payment' | 'ui_preferences'
  name: string;
  properties: Record<string, any>; // Type‑specific JSON (protocol details live here)
  status: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
  createdAt: number; updatedAt: number; deletedAt?: number;
}
```

- Roles/tenancy: `creator` has role `platform_owner | org_owner | org_user | customer`. Organizations are things; membership is a connection with `metadata.role`.
- Protocols: Keep `type` stable; store protocol details in `properties` and event/connection `metadata.protocol`.

## Connection Essentials

```typescript
type Connection = {
  _id: Id<'connections'>;
  fromThingId: Id<'things'>; toThingId: Id<'things'>;
  relationshipType: ConnectionType; // specific or consolidated
  metadata?: Record<string, any>;   // e.g. revenueShare, balance, protocol
  createdAt: number; updatedAt?: number; validFrom?: number; validTo?: number; strength?: number;
}
```

Common patterns:
- Ownership: creator → asset `owns` { revenueShare? }
- Membership: user → organization `member_of` { role, permissions[] }
- Token holding: user → token `holds_tokens` { balance }
- Enrollment: user → course `enrolled_in` { progress }
- Commerce (consolidated): user → product/subscription `transacted` { amount, currency, status, protocol }

## Event Essentials

Consolidated event families with rich `metadata` (always include `protocol` when relevant):
- Entity lifecycle: `entity_created|updated|deleted`.
- Content: `content_changed` { action }, `content_interacted` { interactionType }.
- Commerce: `payment_event` { status }, `subscription_updated` { action }.
- Communication: `communication_event` { messageType }.
- Livestream: `livestream_status_changed` { status }, `livestream_interaction` { type }.
- Authentication: `password_reset_requested`, `email_verified`, `two_factor_enabled`, `user_invited_to_org`, `user_joined_org`.
- Dashboard/UI: `dashboard_viewed`, `theme_changed`, `preferences_updated`.
- Metrics/Insights: `metric_calculated`, `insight_generated`.

Minimal structure:
```typescript
type Event = {
  _id: Id<'events'>;
  type: string; actorId?: Id<'things'>; targetId?: Id<'things'>;
  timestamp: number; metadata?: Record<string, any>;
}
```

## Knowledge Labels

- Use `knowledge` items with `knowledgeType: 'label'` and link via `thingKnowledge`.
- Prefer adding labels over changing enums; dedupe periodically; mark deprecated instead of deleting.

## Protocol Mapping (Agnostic)

- Identity: store protocol name in `metadata.protocol` on events/connections and in `properties.protocol` on things.
- AP2 mandates: a single `mandate` thing with `properties.mandateType: 'intent' | 'cart'` plus details.
- Payments (X402/AP2/ACP): `payment` thing with `properties` (scheme/network/amount/status/txHash/etc.) and `payment_event` metadata echoing key fields.
- Cross‑agent/UI comms: `communication_event` and optional `communicated` connection; AG‑UI messages live in event metadata.

## Validation Rules

- Thing: valid `type`, non‑empty `name`, matching `properties`, valid `status`, timestamps set.
- Connection: both things exist; no self‑links (unless justified); valid `relationshipType`; semantic sanity.
- Event: valid `type`, `timestamp` required; include `actorId`/`targetId` when applicable; metadata matches family.

## Query Snippets (Convex)

```typescript
// Get a thing
const thing = await ctx.db.get(id);

// List by type (index: by_type)
const items = await ctx.db
  .query('things')
  .withIndex('by_type', (q) => q.eq('type', 'creator'))
  .collect();

// Connections from an entity (index: from_type)
const owns = await ctx.db
  .query('connections')
  .withIndex('from_type', (q) => q.eq('fromThingId', thingId).eq('relationshipType', 'owns'))
  .collect();

// Events for an entity (index: thing_type_time)
const history = await ctx.db
  .query('events')
  .withIndex('thing_type_time', (q) => q.eq('thingId', thingId))
  .order('desc')
  .collect();
```

Indexes (typical):
- `things`: `by_type`, `by_status`, `by_created` (+ optional search)
- `connections`: `from_type`, `to_type`, `bidirectional`
- `events`: `type_time`, `actor_time`, `thing_type_time`
- `knowledge`: `by_type`, `by_source`, `by_created` (+ vector index)
- `thingKnowledge`: `by_thing`, `by_knowledge`

## Auth & Tenancy

- Better Auth remains the auth source (users, sessions, verification, resets, 2FA).
- Link auth users to ontology via a `creator`/`audience_member` thing; org membership is a `member_of` connection with role metadata.
- UI prefs stored as a `ui_preferences` thing per user; log `theme_changed` and `preferences_updated` events on change.

## Vectors & RAG

- Table: `knowledge` stores both taxonomy labels and semantic chunks. Chunks include `text`, `embedding`, `embeddingModel`, `embeddingDim`, `sourceThingId`, and `chunk` metadata.
- Link: use `thingKnowledge` to associate knowledge with things; set `role` to `label` or `chunk_of`.
- Embedder: implement an internal action `embedText` to call the vector provider; schedule from a mutation.
- Strategy: on content creation/update (`content_changed`), enqueue chunking + embedding for affected fields; de‑dupe via `metadata.hash`.
- Retrieval: vector search across `knowledge` filtered by org/creator/type; combine with labels and metadata for hybrid ranking.

Example skeleton

```typescript
export const embedText = internalAction({
  args: { text: v.string(), model: v.optional(v.string()) },
  handler: async (ctx, a) => ({ embedding: await embed(a.text), model: a.model ?? 'text-embedding-3-large' })
});

export const scheduleEmbeddingForThing = mutation({
  args: { id: v.id('things'), fields: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => ctx.scheduler.runAfter(0, internal.rag.ingestThing, args),
});
```

## Common Implementation Patterns

```typescript
// Create a thing
const id = await ctx.db.insert('things', { type: 'course', name: 'Intro', properties: {...}, status: 'draft', createdAt: now, updatedAt: now });

// Connect entities
await ctx.db.insert('connections', { fromThingId: userId, toThingId: id, relationshipType: 'owns', createdAt: now });

// Log an event
await ctx.db.insert('events', { type: 'content_changed', actorId: userId, targetId: id, timestamp: now, metadata: { action: 'created' } });
```

## Critical Rules for Agents

- Always model with the 4 primitives; keep enums stable, push variance into `properties`/`metadata`/knowledge labels.
- Use consolidated event/connection types; set `metadata.protocol` for protocol‑specific actions.
- Define and use indexes for any non‑`_id` lookups.
- For emails: use internal actions; schedule via a mutation with `ctx.scheduler.runAfter(0, ...)`.
- Validate inputs with `v` validators; prefer `.unique()` when expecting a single match.
- After schema/index changes, regenerate types (`npx convex dev`).

## References

- Full ontology: `one/connections/ontology.md`
- Better Auth: https://www.better-auth.com
- Convex Docs: https://docs.convex.dev
