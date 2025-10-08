# Connection-Driven Inference Workflow

Purpose: Show how every integration in `one/connections/*` maps to ontology connections and how to use those connections to drive retrieval and tool routing for inference.

## 1) Scope via Connections

- Seed: `actorId` (creator/user/agent) + `orgId` via `member_of`.
- Expand content scope by traversing connections:
  - Ownership: `owns`, `created_by`
  - Content graph: `authored`, `part_of`, `references`, `published_to`
  - Teams/org assets: org → resources via `owns`

Convex query (scope):
```typescript
const owned = await ctx.db
  .query('connections')
  .withIndex('from_type', q => q.eq('fromEntityId', actorId).eq('relationshipType', 'owns'))
  .collect();
const scopeThingIds = new Set(owned.map(c => c.toEntityId));
```

## 2) Retrieve Knowledge (Vectors)

- Filter knowledge by scope and type: `knowledgeType='chunk'`, `sourceThingId in scope`.
- Vector search (ANN) on `knowledge.embedding` with k=10–20.
- Hybrid rank by knowledge labels (industry/topic/format) and connection `strength`.

## 3) Determine Capabilities via Connections

- External agents/workflows are things; connect via:
  - `communicated` (A2A/ACP/AG‑UI)
  - `delegated` (n8n/MCP/tasks)
- Read connection `metadata` for protocol, endpoint, allowed tools, quotas.

## 4) Act and Log Events

- When sending/receiving: `communication_event` with `metadata.protocol` and `messageType`.
- When delegating: `task_event` with `metadata.action` and protocol.
- When paying/fulfilling: `payment_event`, `commerce_event`, `fulfilled`, `approved`.

## 5) Learn Back into Knowledge

- Upsert outputs as `knowledge` items (labels/chunks) and link via `thingKnowledge`.
- Update `strength` or add new `references` connections if content cites other things.

## 6) Governance & Permissions

- Always enforce org scoping through connections; only traverse/return items reachable by permitted relationships in the org.
- Approvals are represented as `approved` connections or `notification_event` + `approved` edge to the resource.

## Canonical Mappings by File

- A2A / ACP / AG‑UI: `communicated` connections + `communication_event`.
- X402 / ACPayments / AP2: `transacted` connections + `payment_event`/`commerce_event`; `fulfilled` + `approved` as needed.
- N8N / MCP / Service Layer: `delegated` connections + `task_event`.
- Multitenant / KYC: `member_of`, `owns`, `created_by`.
- Vectors: knowledge chunks linked via `thingKnowledge`; retrieval guided by connections.

