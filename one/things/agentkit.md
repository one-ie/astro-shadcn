# AgentKit (OpenAI SDK)

Purpose: Define how we model and run OpenAI SDK–based agents (marketing, engineering, etc.) in the ONE ontology using the 4 primitives: things, connections, events, tags.

---

## Overview

- We use the official OpenAI Node SDK to instantiate role-specific agents (marketing_agent, engineering_agent, etc.).
- Each agent is a Thing with stable `type` and protocol details in `properties`.
- Actions, communications, and UI updates are Events; relationships (ownership, delegation, memberships) are Connections.
- Keep enums stable. Push variability to `properties`, connection/event `metadata`, and `tags`.

Protocol note: Set `properties.protocol: 'openai'` on agent things and `metadata.protocol: 'openai'` on related connections/events.

---

## Thing Definition

Thing type: One file can describe many role variants. Recommended types from ontology:

- Business agents: `strategy_agent`, `research_agent`, `marketing_agent`, `sales_agent`, `service_agent`, `design_agent`, `engineering_agent`, `finance_agent`, `legal_agent`, `intelligence_agent`
- External wrapper (optional): `external_agent` when mirroring an external runtime/host distinct from our platform runtime.

Example (marketing agent):

```typescript
type Thing = {
  _id: Id<'things'>;
  type: 'marketing_agent';
  name: string; // e.g., "Marketing Agent (OpenAI/GPT-4.1)"
  properties: {
    protocol: 'openai';
    model: string; // e.g., 'gpt-4.1' or 'o4-mini'
    systemPrompt?: string;
    tools?: Array<{ name: string; description?: string; schema?: any }>;
    memory?: {
      strategyNotes?: string;
      clientProfilesIndexId?: Id<'things'>; // link to knowledge index
    };
    runtime?: {
      temperature?: number;
      maxOutputTokens?: number;
      jsonMode?: boolean;
    };
  };
  status: 'active' | 'inactive' | 'archived' | 'draft';
  createdAt: number; updatedAt: number; deletedAt?: number;
}
```

Tags to apply:
- `protocol:openai`, `skill:marketing|engineering|…`, `topic:content|code`, `environment:production|staging`.

---

## Connections

Use consolidated types with metadata:

- Ownership: `creator -> agent owns { revenueShare? }`
- Membership: `agent -> organization member_of { role: 'automation' }`
- Delegation: `creator -> agent delegated { scope: ['marketing','content'], protocol: 'openai' }`
- Communication: `agent -> conversation communicated { channel: 'chat', protocol: 'openai' }`
- Knowledge: `agent -> knowledge_item uses { purpose: 'context' }`

Indexes to rely on:
- `connections.from_type` and `connections.to_type` for relationship+type filters
- Optionally a `bidirectional` index if commonly traversed from either side

---

## Events

Consolidated families with `metadata.protocol = 'openai'` when relevant:

- Lifecycle: `entity_created|updated|deleted`
- Communication: `communication_event { messageType: 'chat|ui|tool_call', stream?: boolean }`
- Content: `content_changed { action: 'generated|edited|approved' }`
- Tasking: `preferences_updated`, `insight_generated`, `metric_calculated`

Minimal structure:

```typescript
type Event = {
  _id: Id<'events'>;
  type: string;
  actorId?: Id<'things'>; // agentId when agent acts
  targetId?: Id<'things'>; // conversation/content/product/etc.
  timestamp: number;
  metadata?: Record<string, any>; // include { protocol: 'openai' }
}
```

Recommended indexes:
- `events.type_time`, `events.actor_time`, `events.thing_type_time`

---

## Validation

- Thing: valid agent `type` from ontology; non-empty `name`; `properties.protocol = 'openai'`; timestamps set.
- Connection: both things exist; `relationshipType` valid; no self-link unless justified; protocol in `metadata` for OpenAI actions.
- Event: valid `type`; `timestamp` required; include `actorId`/`targetId` when applicable; `metadata.protocol` set for OpenAI-generated events.

---

## Creation Pattern (Convex)

Create an agent thing:

```typescript
// convex/agents/createAgent.ts
import { v } from 'convex/values';
import { mutation } from 'convex/server';

export const createOpenAIAgent = mutation({
  args: {
    type: v.union(
      v.literal('marketing_agent'),
      v.literal('engineering_agent'),
      v.literal('research_agent'),
      v.literal('strategy_agent')
    ),
    name: v.string(),
    model: v.string(),
    systemPrompt: v.optional(v.string()),
    runtime: v.optional(v.any()),
    tools: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('things', {
      type: args.type,
      name: args.name,
      properties: {
        protocol: 'openai',
        model: args.model,
        systemPrompt: args.systemPrompt,
        tools: args.tools ?? [],
        runtime: args.runtime ?? {},
      },
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('events', {
      type: 'entity_created',
      actorId: id,
      targetId: id,
      timestamp: now,
      metadata: { protocol: 'openai' },
    });

    return id;
  },
});
```

Delegate scope to the agent:

```typescript
// convex/agents/delegate.ts
import { mutation } from 'convex/server';
import { v } from 'convex/values';

export const delegateToAgent = mutation({
  args: {
    creatorId: v.id('things'),
    agentId: v.id('things'),
    scope: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert('connections', {
      fromThingId: args.creatorId,
      toThingId: args.agentId,
      relationshipType: 'delegated',
      metadata: { scope: args.scope, protocol: 'openai' },
      createdAt: now,
    });
    await ctx.db.insert('events', {
      type: 'communication_event',
      actorId: args.creatorId,
      targetId: args.agentId,
      timestamp: now,
      metadata: { protocol: 'openai', messageType: 'delegation_created' },
    });
  },
});
```

---

## Running Agents (OpenAI SDK)

Install: `openai`

```typescript
// convex/agents/run.ts
import OpenAI from 'openai';
import { action } from 'convex/server';
import { v } from 'convex/values';

export const runAgentTask = action({
  args: {
    agentId: v.id('things'),
    conversationId: v.id('things'), // conversation thing
    input: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error('Agent not found');

    const model = agent.properties?.model ?? 'gpt-4.1-mini';
    const system = agent.properties?.systemPrompt ?? 'You are a helpful agent.';

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Basic text response. Use tools / JSON mode as needed.
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: args.input },
      ],
      temperature: agent.properties?.runtime?.temperature ?? 0.3,
    });

    const text = res.choices?.[0]?.message?.content ?? '';

    const now = Date.now();
    await ctx.db.insert('events', {
      type: 'communication_event',
      actorId: args.agentId,
      targetId: args.conversationId,
      timestamp: now,
      metadata: {
        protocol: 'openai',
        messageType: 'chat',
        response: text,
      },
    });

    return { text };
  },
});
```

Tools (function calling) example:

```typescript
// Example tool spec stored in agent.properties.tools
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_campaign_brief',
      description: 'Create a campaign brief for a product',
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          audience: { type: 'string' },
          tone: { type: 'string' },
        },
        required: ['product', 'audience'],
      },
    },
  },
];
```

Ingestion of tool calls should be reflected as `communication_event { messageType: 'tool_call' }` with the request and result echoed in `metadata`.

---

## AG-UI Integration

- Use the AG-UI protocol (see `one/things/CopilotKit.md`) to stream agent outputs into the UI.
- Represent UI payloads as events with `type: 'communication_event'` and `metadata.messageType = 'ui'`.
- Frontend renders structured payloads (charts, tables, previews) via PromptKit components.

Event example for a generated UI card:

```typescript
await ctx.db.insert('events', {
  type: 'communication_event',
  actorId: agentId,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    protocol: 'openai',
    messageType: 'ui',
    component: 'Card',
    data: { title: 'Campaign Outline', items: ['Hook', 'CTA', 'Channels'] },
  },
});
```

---

## Queries (Convex)

List all OpenAI agents by role:

```typescript
const items = await ctx.db
  .query('things')
  .withIndex('by_type', (q) => q.eq('type', 'marketing_agent'))
  .collect();
```

Get agent communications:

```typescript
const history = await ctx.db
  .query('events')
  .withIndex('actor_time', (q) => q.eq('actorId', agentId))
  .order('desc')
  .collect();
```

---

## Governance & Safety

- All execution should be human-in-the-loop for high-impact actions; use `delegated` with explicit `metadata.scope`.
- Log key actions as events; never silently mutate critical data.
- For payments or off-platform actions, mirror them as `payment_event` or `communication_event` with explicit protocol metadata.

---

## Minimal Checklist

- Agent thing created with `properties.protocol = 'openai'` and `model`.
- Delegation connection created (`delegated`) with scope.
- Events logged for messages, tool calls, and UI outputs with `metadata.protocol = 'openai'`.
- Indexes used for all non-id lookups.
- Inputs validated with `v` validators; prefer `.unique()` where appropriate.

---

## Notes

- Prefer stable thing types from the ontology and manage specialization via `properties`, `tags`, and delegation scopes.
- When switching providers, do not change `type`—only protocol details in `properties` and event `metadata.protocol`.

