# External Integrations - Unified Schema (Non-Breaking)

**Date:** 2025-01-XX
**Purpose:** Verify that the unified external integration schema enables ElizaOS, n8n, and future integrations without breaking changes

---

## Summary: 100% Non-Breaking ✅

All external integrations (ElizaOS, n8n, Zapier, Make, AutoGen, etc.) can be implemented using a **unified schema** with **ZERO breaking changes**.

**Why?**
1. Uses 3 unified entity types for ALL external integrations
2. Uses existing connection types (no new types needed)
3. Uses existing event types (no new types needed)
4. Platform discrimination via `metadata.platform`
5. Eliminates future entity type proliferation

---

## Unified External Integration Schema

### Entity Types (3 types - Non-Breaking)

```typescript
// EXTERNAL INTEGRATIONS (added to docs/Ontology.md)
| 'external_agent'        // External AI agent (ElizaOS, AutoGen, CrewAI, LangChain, etc.)
| 'external_workflow'     // External workflow (n8n, Zapier, Make, Pipedream, etc.)
| 'external_connection'   // Connection config to external service

// EXISTING TYPES (reused for conversations/messages)
| 'conversation'          // Agent-to-agent conversations
| 'message'               // Individual messages
```

**Impact:** ✅ **Non-Breaking**
- Only 3 new entity types (append-only, safe)
- Existing `conversation` and `message` types reused
- All future integrations use same 3 types

### How Platforms Are Distinguished

**Via metadata.platform field:**
```typescript
// ElizaOS agent
{
  type: 'external_agent',
  properties: {
    platform: 'elizaos',      // Platform discriminator
    agentId: 'eliza-123',
    metadata: {
      personality: {...},     // ElizaOS-specific
      characterFile: '...'
    }
  }
}

// AutoGen agent
{
  type: 'external_agent',
  properties: {
    platform: 'autogen',      // Different platform
    agentId: 'autogen-456',
    metadata: {
      systemMessage: '...',   // AutoGen-specific
      llmConfig: {...}
    }
  }
}

// n8n workflow
{
  type: 'external_workflow',
  properties: {
    platform: 'n8n',          // Platform discriminator
    workflowId: 'wf-789',
    webhookUrl: '...'
  }
}

// Zapier zap
{
  type: 'external_workflow',
  properties: {
    platform: 'zapier',       // Different platform
    workflowId: 'zap-012',
    webhookUrl: '...'
  }
}
```

---

## ElizaOS Integration

### Entity Types Used: 3

```typescript
| 'external_agent'        // ElizaOS agents
| 'conversation'          // Agent conversations
| 'message'               // Messages
| 'external_connection'   // ElizaOS server connection
```

### Connection Types Needed: 0

Uses existing types:
- `collaborates_with` + `{ platform: 'elizaos' }`
- `following` + `{ platform: 'elizaos' }`
- `part_of` + `{ platform: 'elizaos' }`

### Event Types Needed: 0

Uses existing types:
- `agent_executed` + `{ action: 'message_sent', platform: 'elizaos' }`
- `agent_executed` + `{ action: 'message_received', platform: 'elizaos' }`
- `content_changed` + `{ action: 'created', platform: 'elizaos' }`
- `agent_failed` + `{ platform: 'elizaos' }`

---

## n8n Integration

### Entity Types Used: 2

```typescript
| 'external_workflow'     // n8n workflows
| 'external_connection'   // n8n instance connection
```

**Note:** Executions tracked as events, not entities

### Connection Types Needed: 0

Uses existing types:
- `integrated_with` + `{ platform: 'n8n' }`

### Event Types Needed: 0

Uses existing types:
- `agent_executed` + `{ action: 'workflow_executed', platform: 'n8n' }`
- `agent_failed` + `{ action: 'workflow_failed', platform: 'n8n' }`

---

## Future Integrations (Non-Breaking Examples)

### Zapier Integration

```typescript
// Entity
{
  type: 'external_workflow',
  properties: {
    platform: 'zapier',       // NEW platform value (non-breaking!)
    workflowId: 'zap-123',
    webhookUrl: '...'
  }
}

// Connection (existing type)
{
  relationshipType: 'integrated_with',
  metadata: {
    platform: 'zapier'        // NEW platform value (non-breaking!)
  }
}

// Event (existing type)
{
  type: 'agent_executed',
  metadata: {
    action: 'workflow_executed',
    platform: 'zapier'        // NEW platform value (non-breaking!)
  }
}
```

### AutoGen Integration

```typescript
// Entity
{
  type: 'external_agent',
  properties: {
    platform: 'autogen',      // NEW platform value (non-breaking!)
    agentId: 'autogen-456',
    metadata: {
      systemMessage: '...',   // AutoGen-specific
      llmConfig: {...}
    }
  }
}

// Connection (existing type)
{
  relationshipType: 'collaborates_with',
  metadata: {
    platform: 'autogen'       // NEW platform value (non-breaking!)
  }
}

// Event (existing type)
{
  type: 'agent_executed',
  metadata: {
    action: 'message_sent',
    platform: 'autogen'       // NEW platform value (non-breaking!)
  }
}
```

### CrewAI Integration

```typescript
// Entity
{
  type: 'external_agent',
  properties: {
    platform: 'crewai',       // NEW platform value (non-breaking!)
    agentId: 'crew-789',
    metadata: {
      role: '...',            // CrewAI-specific
      goal: '...',
      backstory: '...'
    }
  }
}
```

### Make.com Integration

```typescript
// Entity
{
  type: 'external_workflow',
  properties: {
    platform: 'make',         // NEW platform value (non-breaking!)
    workflowId: 'scenario-012'
  }
}
```

---

## Total Type Count

### Before Unified Schema (Old Approach)

If we used platform-specific types:
```typescript
// ElizaOS
| 'eliza_agent'
| 'eliza_conversation'
| 'eliza_message'
| 'eliza_connection'

// n8n
| 'n8n_workflow'
| 'n8n_execution'
| 'n8n_credential'

// Zapier
| 'zapier_zap'
| 'zapier_execution'
| 'zapier_connection'

// AutoGen
| 'autogen_agent'
| 'autogen_conversation'
| 'autogen_message'
| 'autogen_connection'

// CrewAI
| 'crewai_agent'
| 'crewai_crew'
| 'crewai_task'
| 'crewai_connection'

// Make
| 'make_scenario'
| 'make_execution'
| 'make_connection'

// Total: 24 new entity types!
```

### With Unified Schema (New Approach)

```typescript
// ALL INTEGRATIONS
| 'external_agent'        // For ALL agent platforms
| 'external_workflow'     // For ALL workflow platforms
| 'external_connection'   // For ALL connection configs

// Total: 3 entity types (reuses conversation/message)
```

**Reduction:** From 24+ types to 3 types = **87.5% fewer types**

---

## Benefits of Unified Schema

### 1. No Type Proliferation

**Problem (without unified schema):**
- Each platform = 3-4 new entity types
- 10 platforms = 30-40 entity types
- AI agents must learn all types
- Query complexity explodes

**Solution (with unified schema):**
- All platforms use same 3 types
- Platform differentiation via metadata
- AI agents learn once, apply everywhere
- Consistent query patterns

### 2. Non-Breaking Additions

**Adding new platform:**
```typescript
// NO schema changes needed!
// Just use existing types with new platform value

{
  type: 'external_agent',     // Existing type
  properties: {
    platform: 'new_platform',  // New value (non-breaking!)
    agentId: '...',
    metadata: {
      // Platform-specific fields
    }
  }
}
```

### 3. Consistent Query Patterns

**Query all external agents (regardless of platform):**
```typescript
const externalAgents = await ctx.db
  .query('entities')
  .withIndex('by_type', (q) => q.eq('type', 'external_agent'))
  .collect();

// Filter by platform (optional)
const elizaAgents = externalAgents.filter(
  (agent) => agent.properties.platform === 'elizaos'
);
```

**Query all workflows (regardless of platform):**
```typescript
const workflows = await ctx.db
  .query('entities')
  .withIndex('by_type', (q) => q.eq('type', 'external_workflow'))
  .collect();

// Filter by platform (optional)
const n8nWorkflows = workflows.filter(
  (wf) => wf.properties.platform === 'n8n'
);
```

### 4. Future-Proof

**New integration types:**
- `external_database` (Airtable, Notion, Google Sheets)
- `external_api` (REST APIs, GraphQL endpoints)
- `external_bot` (Telegram bots, Discord bots)

All use same 3-type pattern.

---

## Implementation Checklist

### Phase 1: Update Ontology ✅

- [x] Add 3 entity types to Ontology.md
- [x] Define properties for each type
- [x] Document platform values

### Phase 2: ElizaOS Integration

- [ ] Implement ElizaOSProvider (Effect.ts)
- [ ] Implement ElizaOSService using `external_agent`
- [ ] Create Convex wrappers
- [ ] Build frontend UI
- [ ] Test with ElizaOS instance

**Breaking Changes:** ZERO
**New Entity Types:** 0 (uses unified schema)
**New Connection Types:** 0
**New Event Types:** 0

### Phase 3: n8n Integration

- [ ] Implement N8NProvider (Effect.ts)
- [ ] Implement N8NService using `external_workflow`
- [ ] Create Convex wrappers
- [ ] Build workflow management UI
- [ ] Test with n8n instance

**Breaking Changes:** ZERO
**New Entity Types:** 0 (uses unified schema)
**New Connection Types:** 0
**New Event Types:** 0

### Phase 4: Future Integrations

For each new integration:
1. Set `platform` field to new value
2. Add platform-specific metadata
3. Use existing connection/event types
4. No schema changes needed

---

## Query Examples

### Get All External Collaborators (Any Platform)

```typescript
const collaborations = await ctx.db
  .query('connections')
  .withIndex('by_relationship', (q) =>
    q.eq('relationshipType', 'collaborates_with')
  )
  .filter((q) => q.eq(q.field('fromEntityId'), agentId))
  .collect();

// Works for ElizaOS, AutoGen, CrewAI, any external agent!
```

### Get ElizaOS Agents Specifically

```typescript
const elizaAgents = await ctx.db
  .query('entities')
  .filter((q) =>
    q.and(
      q.eq(q.field('type'), 'external_agent'),
      q.eq(q.field('properties.platform'), 'elizaos')
    )
  )
  .collect();
```

### Get All Workflow Executions (Any Platform)

```typescript
const executions = await ctx.db
  .query('events')
  .withIndex('by_type', (q) => q.eq('type', 'agent_executed'))
  .filter((q) => q.eq(q.field('metadata.action'), 'workflow_executed'))
  .collect();

// Works for n8n, Zapier, Make, any workflow platform!
```

### Get n8n Workflows Specifically

```typescript
const n8nWorkflows = await ctx.db
  .query('entities')
  .filter((q) =>
    q.and(
      q.eq(q.field('type'), 'external_workflow'),
      q.eq(q.field('properties.platform'), 'n8n')
    )
  )
  .collect();
```

---

## Final Verdict: 100% Non-Breaking ✅

### Unified External Integration Schema

**Entity Types Added:** 3 (works for ALL platforms)
- `external_agent`
- `external_workflow`
- `external_connection`

**Connection Types Added:** 0 (reuse existing)
**Event Types Added:** 0 (reuse existing)
**Breaking Changes:** **ZERO**

### ElizaOS Integration
- Uses: `external_agent`, `conversation`, `message`, `external_connection`
- Platform: `"elizaos"`
- Breaking Changes: ZERO

### n8n Integration
- Uses: `external_workflow`, `external_connection`
- Platform: `"n8n"`
- Breaking Changes: ZERO

### Future Integrations
- Zapier: Uses `external_workflow` with `platform: "zapier"`
- AutoGen: Uses `external_agent` with `platform: "autogen"`
- CrewAI: Uses `external_agent` with `platform: "crewai"`
- Make: Uses `external_workflow` with `platform: "make"`
- Any future platform: Same pattern, ZERO breaking changes

---

## Key Insight

**The unified external integration schema eliminates entity type proliferation while maintaining full type safety and platform differentiation.**

- **Before:** Each integration = 3-4 new entity types
- **After:** All integrations = 3 shared entity types
- **Result:** 87.5% reduction in type count + 100% non-breaking

This is exactly what the optimized ontology was designed for:
- Generic types + metadata = flexibility + type safety
- Platform discrimination via metadata.platform
- Consistent query patterns across all platforms
- Infinite non-breaking growth

**All external integrations can be deployed immediately with zero breaking changes.**
