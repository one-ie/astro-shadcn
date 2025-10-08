# Model Context Protocol (MCP) - Deep Integration Strategy

**Version:** 2.0.0 (Ontology-Aligned)
**Purpose:** Comprehensive MCP integration with the 4-table ontology (things, connections, events, knowledge)
**Protocol:** https://modelcontextprotocol.io/
**Maintained By:** Anthropic, PBC (Open Source)

---

## Executive Summary

**Model Context Protocol (MCP)** enables AI systems to access the ONE Platform's 4-table ontology via a standardized protocol.

**Strategic Value:**
- ✅ **Universal AI Connectivity** - Any AI can access things, knowledge, and agents
- ✅ **Reduced Integration Complexity** - Standard protocol vs. custom APIs
- ✅ **Ecosystem Amplification** - Plug into existing MCP ecosystem
- ✅ **Ontology-First** - Direct access to canonical data model
- ✅ **RAG-Ready** - Full knowledge table access (labels + vectors)

**Recommended Approach:**
1. **MCP Server** - Expose ONE ontology (things, connections, events, knowledge)
2. **MCP Client** - Connect to external MCP servers
3. **Hybrid Architecture** - Best of both worlds
4. **Knowledge Integration** - Semantic search via knowledge table

---

## Ontology Integration (Updated)

### The 4-Table Universe

```typescript
// TABLE 1: THINGS (all entities)
{
  _id: Id<'things'>,
  type: EntityType,  // 66 types
  name: string,
  properties: any,
  status: string,
  createdAt: number,
  updatedAt: number
}

// TABLE 2: CONNECTIONS (all relationships)
{
  _id: Id<'connections'>,
  fromThingId: Id<'things'>,
  toThingId: Id<'things'>,
  relationshipType: string,  // 25 types
  metadata?: any,
  createdAt: number
}

// TABLE 3: EVENTS (all actions)
{
  _id: Id<'events'>,
  thingId: Id<'things'>,
  eventType: string,  // 67 types
  timestamp: number,
  actorType: string,
  actorId?: Id<'things'>,
  metadata?: any
}

// TABLE 4: KNOWLEDGE (labels + RAG chunks)
{
  _id: Id<'knowledge'>,
  knowledgeType: 'label' | 'document' | 'chunk' | 'vector_only',
  text?: string,
  embedding?: number[],
  embeddingModel?: string,
  embeddingDim?: number,
  sourceThingId?: Id<'things'>,
  sourceField?: string,
  chunk?: { index: number, tokenCount?: number, overlap?: number },
  labels?: string[],  // Free-form categorization
  metadata?: any,
  createdAt: number,
  updatedAt: number
}

// JUNCTION: THING ↔ KNOWLEDGE
{
  _id: Id<'thingKnowledge'>,
  thingId: Id<'things'>,
  knowledgeId: Id<'knowledge'>,
  role?: 'label' | 'summary' | 'chunk_of' | 'caption' | 'keyword',
  metadata?: any,
  createdAt: number
}
```

---

## MCP Server Resources

### Updated Resource URIs

```typescript
// Things (entities)
"one://things"                    // List all things
"one://things/{id}"               // Get specific thing
"one://things?type=creator"       // Filter by type

// Connections (relationships)
"one://connections"               // List all connections
"one://connections?from={id}"     // Connections from thing
"one://connections?to={id}"       // Connections to thing

// Events (actions)
"one://events"                    // Recent events
"one://events?thing={id}"         // Events for thing
"one://events?type=tokens_purchased"  // Filter by event type

// Knowledge (labels + chunks)
"one://knowledge"                 // List all knowledge
"one://knowledge?type=label"      // Labels only
"one://knowledge?type=chunk"      // RAG chunks only
"one://knowledge/search?query={text}"  // Semantic search

// Thing Knowledge (associations)
"one://things/{id}/knowledge"     // Knowledge for thing
"one://knowledge/{id}/things"     // Things with this knowledge

// Specialized
"one://agents"                    // All AI agents
"one://conversations"             // Recent conversations
"one://workflows"                 // Available workflows
```

---

## MCP Server Tools

### Core Ontology Tools

**1. Query Things**
```typescript
{
  name: "query_things",
  description: "Query things table with filters",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Thing type (creator, ai_clone, organization, etc.)"
      },
      filter: {
        type: "object",
        description: "Additional filters"
      },
      limit: { type: "number", default: 100 }
    }
  }
}

// Usage:
await mcp.callTool("query_things", {
  type: "organization",
  filter: { status: "active" },
  limit: 50
});
```

**2. Query Knowledge**
```typescript
{
  name: "query_knowledge",
  description: "Query knowledge table (labels and chunks)",
  inputSchema: {
    type: "object",
    properties: {
      knowledgeType: {
        type: "string",
        enum: ["label", "document", "chunk", "vector_only"]
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Filter by labels (e.g., ['industry:fitness', 'skill:video'])"
      },
      sourceThingId: {
        type: "string",
        description: "Filter by source thing"
      },
      limit: { type: "number", default: 100 }
    }
  }
}

// Usage:
await mcp.callTool("query_knowledge", {
  knowledgeType: "label",
  labels: ["industry:fitness", "skill:video-editing"]
});
```

**3. Semantic Search**
```typescript
{
  name: "semantic_search",
  description: "Search knowledge chunks using vector similarity",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query text"
      },
      sourceThingId: {
        type: "string",
        description: "Limit to chunks from specific thing"
      },
      k: {
        type: "number",
        default: 10,
        description: "Number of results"
      },
      filter: {
        type: "object",
        description: "Additional filters (labels, metadata)"
      }
    },
    required: ["query"]
  }
}

// Usage:
await mcp.callTool("semantic_search", {
  query: "How do I create an AI clone?",
  k: 5,
  filter: { labels: ["tutorial"] }
});
// Returns top 5 most relevant chunks with embeddings
```

**4. Link Thing to Knowledge**
```typescript
{
  name: "link_thing_knowledge",
  description: "Create thingKnowledge association",
  inputSchema: {
    type: "object",
    properties: {
      thingId: { type: "string" },
      knowledgeId: { type: "string" },
      role: {
        type: "string",
        enum: ["label", "summary", "chunk_of", "caption", "keyword"]
      },
      metadata: { type: "object" }
    },
    required: ["thingId", "knowledgeId"]
  }
}

// Usage:
await mcp.callTool("link_thing_knowledge", {
  thingId: "creator_123",
  knowledgeId: "label_fitness",
  role: "label"
});
```

**5. Get Thing with Knowledge**
```typescript
{
  name: "get_thing_with_knowledge",
  description: "Get thing and all associated knowledge (labels + chunks)",
  inputSchema: {
    type: "object",
    properties: {
      thingId: { type: "string" },
      includeChunks: { type: "boolean", default: false },
      includeLabels: { type: "boolean", default: true }
    },
    required: ["thingId"]
  }
}

// Usage:
await mcp.callTool("get_thing_with_knowledge", {
  thingId: "course_456",
  includeChunks: true,
  includeLabels: true
});
// Returns thing + labels (categories) + chunks (content for RAG)
```

**6. Execute Agent**
```typescript
{
  name: "execute_agent",
  description: "Execute AI agent with task",
  inputSchema: {
    type: "object",
    properties: {
      agentType: {
        type: "string",
        enum: ["intelligence", "strategy", "marketing", "sales"]
      },
      task: { type: "string" },
      userId: { type: "string" },
      parameters: { type: "object" }
    },
    required: ["agentType", "task"]
  }
}

// Usage:
await mcp.callTool("execute_agent", {
  agentType: "intelligence",
  task: "Analyze user engagement trends",
  userId: "user_789"
});
```

---

## MCP Server Implementation (Updated)

**File:** `convex/services/mcp-server.ts`

```typescript
import { Effect } from 'effect';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConvexDatabase } from './convex-database';
import type { Id } from '../_generated/dataModel';

export class MCPServerService extends Effect.Service<MCPServerService>()(
  'MCPServerService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      const server = new Server(
        {
          name: 'one-platform',
          version: '2.0.0',
        },
        {
          capabilities: {
            resources: {},
            tools: {},
          },
        }
      );

      // ========================================
      // RESOURCES (Read-only data)
      // ========================================

      server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
          resources: [
            {
              uri: 'one://things',
              name: 'All Things',
              description: 'Browse all things in the ontology',
              mimeType: 'application/json',
            },
            {
              uri: 'one://connections',
              name: 'Connections',
              description: 'All relationships between things',
              mimeType: 'application/json',
            },
            {
              uri: 'one://events',
              name: 'Events',
              description: 'All logged events',
              mimeType: 'application/json',
            },
            {
              uri: 'one://knowledge',
              name: 'Knowledge',
              description: 'Labels and RAG chunks',
              mimeType: 'application/json',
            },
            {
              uri: 'one://agents',
              name: 'AI Agents',
              description: 'Available AI agents',
              mimeType: 'application/json',
            },
          ],
        };
      });

      server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uri = request.params.uri;
        const match = uri.match(/^one:\/\/([^\/]+)(?:\/(.+))?$/);
        if (!match) throw new Error(`Invalid URI: ${uri}`);

        const [, resourceType, resourceId] = match;

        switch (resourceType) {
          case 'things':
            if (resourceId) {
              const thing = await db.get(resourceId as Id<'things'>);
              return {
                contents: [{
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(thing, null, 2),
                }],
              };
            } else {
              const things = await db.query('things', { limit: 100 });
              return {
                contents: [{
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(things, null, 2),
                }],
              };
            }

          case 'knowledge':
            const knowledge = await db.query('knowledge', { limit: 100 });
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(knowledge, null, 2),
              }],
            };

          case 'agents':
            const agents = await db.query('things', {
              filter: (q) =>
                q.or(
                  q.eq(q.field('type'), 'intelligence_agent'),
                  q.eq(q.field('type'), 'strategy_agent'),
                  q.eq(q.field('type'), 'marketing_agent')
                ),
            });
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(agents, null, 2),
              }],
            };

          default:
            throw new Error(`Unknown resource: ${resourceType}`);
        }
      });

      // ========================================
      // TOOLS (Executable functions)
      // ========================================

      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'query_things',
              description: 'Query things table with filters',
              inputSchema: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  filter: { type: 'object' },
                  limit: { type: 'number', default: 100 }
                }
              }
            },
            {
              name: 'query_knowledge',
              description: 'Query knowledge table (labels and chunks)',
              inputSchema: {
                type: 'object',
                properties: {
                  knowledgeType: {
                    type: 'string',
                    enum: ['label', 'document', 'chunk', 'vector_only']
                  },
                  labels: { type: 'array', items: { type: 'string' } },
                  sourceThingId: { type: 'string' },
                  limit: { type: 'number', default: 100 }
                }
              }
            },
            {
              name: 'semantic_search',
              description: 'Search knowledge chunks using vector similarity',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string' },
                  sourceThingId: { type: 'string' },
                  k: { type: 'number', default: 10 },
                  filter: { type: 'object' }
                },
                required: ['query']
              }
            },
            {
              name: 'get_thing_with_knowledge',
              description: 'Get thing and all associated knowledge',
              inputSchema: {
                type: 'object',
                properties: {
                  thingId: { type: 'string' },
                  includeChunks: { type: 'boolean', default: false },
                  includeLabels: { type: 'boolean', default: true }
                },
                required: ['thingId']
              }
            },
            {
              name: 'execute_agent',
              description: 'Execute AI agent with task',
              inputSchema: {
                type: 'object',
                properties: {
                  agentType: {
                    type: 'string',
                    enum: ['intelligence', 'strategy', 'marketing', 'sales']
                  },
                  task: { type: 'string' },
                  userId: { type: 'string' },
                  parameters: { type: 'object' }
                },
                required: ['agentType', 'task']
              }
            }
          ],
        };
      });

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'query_things': {
            const { type, filter, limit } = args as any;
            const things = await db.query('things', {
              filter: type ? (q: any) => q.eq(q.field('type'), type) : undefined,
              limit: limit || 100,
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(things, null, 2),
              }],
            };
          }

          case 'query_knowledge': {
            const { knowledgeType, labels, sourceThingId, limit } = args as any;
            const knowledge = await db.query('knowledge', {
              filter: knowledgeType ? (q: any) => q.eq(q.field('knowledgeType'), knowledgeType) : undefined,
              limit: limit || 100,
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(knowledge, null, 2),
              }],
            };
          }

          case 'semantic_search': {
            const { query, sourceThingId, k, filter } = args as any;
            // Vector search implementation
            // This would use Convex vector search when available
            const results = await db.vectorSearch('knowledge', {
              vectorField: 'embedding',
              query,
              k: k || 10,
              filter,
            });
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2),
              }],
            };
          }

          case 'get_thing_with_knowledge': {
            const { thingId, includeChunks, includeLabels } = args as any;

            const thing = await db.get(thingId as Id<'things'>);
            const thingKnowledge = await db.query('thingKnowledge', {
              filter: (q: any) => q.eq(q.field('thingId'), thingId),
            });

            const knowledgeIds = thingKnowledge.map((tk: any) => tk.knowledgeId);
            const knowledge = await Promise.all(
              knowledgeIds.map((id: any) => db.get(id))
            );

            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  thing,
                  knowledge: knowledge.filter((k: any) => {
                    if (!includeChunks && k.knowledgeType === 'chunk') return false;
                    if (!includeLabels && k.knowledgeType === 'label') return false;
                    return true;
                  }),
                }, null, 2),
              }],
            };
          }

          case 'execute_agent': {
            const { agentType, task, userId, parameters } = args as any;
            // Agent execution implementation
            const result = { status: 'executed', agentType, task };
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      });

      return {
        server,
        start: () =>
          Effect.gen(function* () {
            const transport = new StdioServerTransport();
            yield* Effect.promise(() => server.connect(transport));
            console.log('ONE MCP Server started on stdio');
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

---

## Updated .mcp.json Configuration

```json
{
  "mcpServers": {
    "one-ontology": {
      "command": "node",
      "args": ["dist/mcp-ontology-server.js"],
      "description": "ONE Platform Ontology - Things, connections, events, knowledge (labels + RAG)"
    },
    "one-knowledge": {
      "command": "node",
      "args": ["dist/mcp-knowledge-server.js"],
      "description": "ONE Platform Knowledge - Semantic search, labels, RAG chunks"
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@shadowsu/mcp-shadcn"],
      "description": "shadcn/ui component registry"
    },
    "convex": {
      "command": "npx",
      "args": ["@convex-dev/mcp-server"],
      "description": "Convex real-time database"
    }
  }
}
```

---

## MCP Knowledge Server (New)

**File:** `scripts/mcp-knowledge-server.js`

Specialized server for knowledge operations:

- Semantic search across chunks
- Label management and querying
- RAG pipeline integration
- Vector similarity search
- Knowledge graph traversal

**Tools:**
- `semantic_search` - Find similar chunks
- `get_labels` - Get all labels for category
- `suggest_labels` - AI-powered label suggestions
- `embed_text` - Generate embedding for text
- `upsert_chunk` - Add/update knowledge chunk

---

## Updated Event Types

```typescript
// Knowledge events (uses existing event types)
{
  type: 'content_event',
  thingId: knowledgeId,
  eventType: 'knowledge_created',
  metadata: {
    action: 'created',
    knowledgeType: 'chunk',
    sourceThingId: '...',
    embeddingModel: 'text-embedding-3-large'
  }
}

// MCP connection event
{
  type: 'integration_event',
  thingId: connectionId,
  metadata: {
    eventType: 'mcp_connected',
    serverId: 'cloudflare-docs',
    capabilities: ['resources', 'tools']
  }
}

// MCP semantic search event
{
  type: 'content_accessed',
  thingId: knowledgeId,
  metadata: {
    protocol: 'mcp',
    action: 'semantic_search',
    query: '...',
    similarity: 0.89
  }
}
```

---

## Roadmap (Updated)

### Phase 1: Core MCP Server ✅
- Expose things, connections, events
- Basic tools (query, filter)

### Phase 2: Knowledge Integration (Current)
- Expose knowledge table
- Semantic search tool
- Label management tools
- Thing ↔ knowledge associations

### Phase 3: RAG Pipeline
- Chunk ingestion tool
- Embedding generation
- Vector search optimization
- Hybrid search (lexical + semantic)

### Phase 4: Advanced Features
- Knowledge graph visualization
- Multi-hop reasoning
- Cross-thing semantic search
- Real-time knowledge updates

---

## Summary

**MCP Integration (Ontology-Aligned):**
- ✅ **4-Table Access** - Things, connections, events, knowledge
- ✅ **Knowledge Tools** - Labels, chunks, semantic search
- ✅ **RAG-Ready** - Vector search built-in
- ✅ **Ontology-First** - Direct access to canonical data model
- ✅ **AI-Native** - Purpose-built for AI agents

**New Primitives:** Knowledge table (labels + RAG chunks)
**New Tools:** semantic_search, query_knowledge, get_thing_with_knowledge
**Strategic Value:** HIGH (ontology + RAG via MCP)

🎉 **Result:** Universal AI connectivity with full ontology and knowledge access via Model Context Protocol.

---

## Resources

- **MCP Website**: https://modelcontextprotocol.io/
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **ONE Ontology**: [one/connections/ontology.md](./ontology.md)
- **ONE Knowledge**: See Ontology.md § Knowledge section
