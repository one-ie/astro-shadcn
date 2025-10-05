# Model Context Protocol (MCP) - Deep Integration Strategy

**Version:** 1.0.0
**Purpose:** Comprehensive strategy for integrating Model Context Protocol across the ONE platform for seamless AI-to-system connectivity
**Protocol:** https://modelcontextprotocol.io/
**Maintained By:** Anthropic, PBC (Open Source)

---

## Executive Summary

**Model Context Protocol (MCP)** is an open-source standard that acts as a "USB-C port for AI applications" - enabling seamless connections between AI systems (Claude, ChatGPT, etc.) and external data sources, tools, and workflows.

**Strategic Value for ONE Platform:**
- ✅ **Universal AI Connectivity** - Any AI can access our agents, data, and tools
- ✅ **Reduced Integration Complexity** - Standard protocol vs. custom APIs
- ✅ **Ecosystem Amplification** - Plug into existing MCP server ecosystem
- ✅ **Future-Proof Architecture** - Industry-standard protocol by Anthropic
- ✅ **Multi-Agent Orchestration** - MCP as the universal coordination layer

**Recommended Approach:**
1. **Implement MCP Server** - Expose ONE agents and data via MCP
2. **Implement MCP Client** - Connect ONE to external MCP servers
3. **Hybrid Architecture** - MCP for external integrations + Effect.ts internally
4. **Progressive Rollout** - Start with read-only resources, add tools incrementally

---

## Part 1: Understanding MCP

### What is MCP?

**Model Context Protocol (MCP)** is a client-server protocol that standardizes how AI applications connect to:
- **Resources** - Data sources (files, databases, APIs)
- **Tools** - Executable functions (search, calculate, create)
- **Prompts** - Reusable prompt templates

**Core Architecture:**
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   AI Client     │ ←─MCP─→ │   MCP Server    │ ←─────→ │  Data Sources   │
│  (Claude, etc)  │         │  (Your System)  │         │  (DB, APIs)     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     │                             │
     │  JSON-RPC Messages          │  Native Integration
     │  (Resources, Tools)         │  (Effect.ts Services)
     │                             │
     └─────────────────────────────┘
```

### MCP Protocol Basics

**Transport Layers:**
1. **stdio** - Standard input/output (for local processes)
2. **HTTP with SSE** - Server-Sent Events for streaming (for remote servers)

**Message Format:**
- JSON-RPC 2.0 protocol
- Request/response pattern
- Notification support (one-way messages)

**Core Primitives:**

**1. Resources** - Read-only data:
```typescript
// Resource definition
{
  uri: "one://entities/user-123",
  name: "User Profile",
  description: "Complete user profile with connections",
  mimeType: "application/json"
}

// Resource contents
{
  contents: [{
    uri: "one://entities/user-123",
    mimeType: "application/json",
    text: JSON.stringify(userData)
  }]
}
```

**2. Tools** - Executable functions:
```typescript
// Tool definition
{
  name: "analyze_metrics",
  description: "Analyze user performance metrics",
  inputSchema: {
    type: "object",
    properties: {
      userId: { type: "string" },
      period: { type: "string", enum: ["day", "week", "month"] }
    },
    required: ["userId"]
  }
}

// Tool execution
{
  name: "analyze_metrics",
  arguments: {
    userId: "user-123",
    period: "month"
  }
}
```

**3. Prompts** - Reusable templates:
```typescript
// Prompt definition
{
  name: "create_campaign",
  description: "Create marketing campaign with strategy",
  arguments: [{
    name: "goal",
    description: "Campaign goal",
    required: true
  }]
}

// Prompt with messages
{
  messages: [{
    role: "user",
    content: {
      type: "text",
      text: "Create a campaign to {{goal}} targeting {{audience}}"
    }
  }]
}
```

---

## Part 2: MCP Integration Strategy

### Option 1: Full MCP Server (Recommended)

**Description:** Expose all ONE platform capabilities via MCP server

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    External AI Clients                          │
│  (Claude Desktop, ChatGPT, Custom AI Apps)                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ MCP Protocol (stdio/SSE)
         ┌──────────────────┐
         │   MCP Server     │
         │  (TypeScript)    │
         └────────┬─────────┘
                  │
                  ↓ Maps to Effect.ts services
┌─────────────────────────────────────────────────────────────────┐
│              ONE Platform (Effect.ts + Convex)                  │
├─────────────────────────────────────────────────────────────────┤
│  MCP Resource Handlers                                          │
│  ├─ GET one://entities/{id} → ConvexDatabase.get()             │
│  ├─ GET one://conversations/{id} → Conversation data           │
│  ├─ LIST one://agents → All available agents                   │
│  └─ GET one://workflows/{id} → Workflow definition             │
│                                                                  │
│  MCP Tool Handlers                                              │
│  ├─ execute_agent(agentId, task) → AgentService.execute()      │
│  ├─ search_entities(query) → SearchService.search()            │
│  ├─ create_workflow(params) → WorkflowService.create()         │
│  └─ analyze_metrics(userId) → IntelligenceAgent.analyze()      │
│                                                                  │
│  MCP Prompt Handlers                                            │
│  ├─ agent_collaboration → Multi-agent workflow template        │
│  ├─ data_analysis → Analysis prompt template                   │
│  └─ content_creation → Content generation template             │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Universal AI access to ONE platform
- ✅ Leverage existing MCP ecosystem
- ✅ Industry-standard integration
- ✅ Future-proof (Anthropic-backed)
- ✅ Reduced custom API development

**Cons:**
- ⚠️ Additional protocol layer overhead
- ⚠️ MCP spec limitations (less flexible than custom API)
- ⚠️ Need to maintain MCP mappings to Effect.ts

**Best For:**
- External AI access to ONE platform
- Third-party integrations
- AI tool marketplaces
- Multi-AI support (Claude, ChatGPT, Gemini)

### Option 2: MCP Client (Connect to External Servers)

**Description:** ONE platform connects to external MCP servers as a client

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│              ONE Platform (Effect.ts + Convex)                  │
├─────────────────────────────────────────────────────────────────┤
│  MCP Client Service (Effect.ts)                                 │
│  ├─ Connects to external MCP servers                            │
│  ├─ Discovers available resources/tools                         │
│  ├─ Executes external tools                                     │
│  └─ Caches resources locally                                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ MCP Protocol
┌──────────────────────────────────────────────────────────────────┐
│                    External MCP Servers                          │
├──────────────────────────────────────────────────────────────────┤
│  Cloudflare Docs MCP        (docs.mcp.cloudflare.com)          │
│  Cloudflare Builds MCP      (builds.mcp.cloudflare.com)        │
│  GitHub MCP                 (github.com/modelcontextprotocol)   │
│  Filesystem MCP             (Local file access)                 │
│  PostgreSQL MCP             (Database access)                   │
│  Google Drive MCP           (Cloud storage)                     │
│  Custom Enterprise MCP      (Internal tools)                    │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Access massive MCP server ecosystem
- ✅ Extend ONE capabilities instantly
- ✅ Reuse community-built servers
- ✅ No custom integration needed

**Cons:**
- ⚠️ Dependency on external servers
- ⚠️ Network reliability concerns
- ⚠️ Security trust boundaries

**Best For:**
- Accessing external data sources
- Leveraging community tools
- Rapid capability expansion
- Testing new integrations

### Option 3: Hybrid (Recommended ⭐)

**Description:** Implement both MCP server and client for maximum flexibility

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    External AI Clients                          │
│  (Claude, ChatGPT, etc.) ←─ Access ONE via MCP Server           │
└─────────────────────────────────────────────────────────────────┘
                   ↓ MCP Protocol
┌─────────────────────────────────────────────────────────────────┐
│                    ONE Platform Core                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐              ┌────────────────┐            │
│  │  MCP Server    │              │  MCP Client    │            │
│  │  (Expose ONE)  │              │ (Access Others)│            │
│  └────────┬───────┘              └────────┬───────┘            │
│           │                               │                     │
│           └───────────┬───────────────────┘                     │
│                       │                                         │
│           ┌───────────▼─────────────┐                          │
│           │  Effect.ts Services     │                          │
│           │  (Internal Logic)       │                          │
│           └─────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                   ↓ MCP Client
┌─────────────────────────────────────────────────────────────────┐
│                 External MCP Servers                            │
│  (Cloudflare, GitHub, Custom Enterprise Servers)                │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Universal connectivity (both directions)
- ✅ Best of both worlds
- ✅ Maximum ecosystem leverage
- ✅ Future-proof architecture

**Cons:**
- ⚠️ More complexity to maintain
- ⚠️ Two protocol implementations

**Best For:**
- Production ONE platform
- Maximum AI ecosystem integration
- Long-term strategic position

---

## Part 3: Implementation Architecture

### MCP Server Implementation

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
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConvexDatabase } from './convex-database';
import { IntelligenceAgent } from './intelligence-agent';
import { StrategyAgent } from './strategy-agent';
import type { Id } from '../_generated/dataModel';

/**
 * MCPServerService - Exposes ONE platform via MCP protocol
 */
export class MCPServerService extends Effect.Service<MCPServerService>()(
  'MCPServerService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const intelligenceAgent = yield* IntelligenceAgent;
      const strategyAgent = yield* StrategyAgent;

      // Create MCP server
      const server = new Server(
        {
          name: 'one-platform',
          version: '1.0.0',
        },
        {
          capabilities: {
            resources: {},
            tools: {},
            prompts: {},
          },
        }
      );

      // ========================================
      // RESOURCES (Read-only data)
      // ========================================

      /**
       * List available resources
       */
      server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
          resources: [
            {
              uri: 'one://entities',
              name: 'All Entities',
              description: 'Browse all entities in the platform',
              mimeType: 'application/json',
            },
            {
              uri: 'one://agents',
              name: 'Available Agents',
              description: 'List of all AI agents',
              mimeType: 'application/json',
            },
            {
              uri: 'one://conversations',
              name: 'Recent Conversations',
              description: 'Recent agent conversations',
              mimeType: 'application/json',
            },
            {
              uri: 'one://workflows',
              name: 'Workflows',
              description: 'Available agent workflows',
              mimeType: 'application/json',
            },
          ],
        };
      });

      /**
       * Read resource contents
       */
      server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uri = request.params.uri;

        // Parse URI
        const match = uri.match(/^one:\/\/([^\/]+)(?:\/(.+))?$/);
        if (!match) {
          throw new Error(`Invalid URI format: ${uri}`);
        }

        const [, resourceType, resourceId] = match;

        switch (resourceType) {
          case 'entities':
            if (resourceId) {
              // Get specific entity
              const entity = await db.get(resourceId as Id<'entities'>);
              return {
                contents: [
                  {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(entity, null, 2),
                  },
                ],
              };
            } else {
              // List all entities (limited)
              const entities = await db.query('entities', { limit: 100 });
              return {
                contents: [
                  {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(entities, null, 2),
                  },
                ],
              };
            }

          case 'agents':
            const agents = await db.query('entities', {
              filter: (q) =>
                q.or(
                  q.eq(q.field('type'), 'intelligence_agent'),
                  q.eq(q.field('type'), 'strategy_agent'),
                  q.eq(q.field('type'), 'marketing_agent'),
                  q.eq(q.field('type'), 'sales_agent')
                ),
            });
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(agents, null, 2),
                },
              ],
            };

          case 'conversations':
            const conversations = await db.query('entities', {
              filter: (q) => q.eq(q.field('type'), 'conversation'),
              limit: 50,
            });
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(conversations, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown resource type: ${resourceType}`);
        }
      });

      // ========================================
      // TOOLS (Executable functions)
      // ========================================

      /**
       * List available tools
       */
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'execute_agent',
              description: 'Execute an AI agent with a specific task',
              inputSchema: {
                type: 'object',
                properties: {
                  agentType: {
                    type: 'string',
                    enum: ['intelligence', 'strategy', 'marketing', 'sales'],
                    description: 'Type of agent to execute',
                  },
                  task: {
                    type: 'string',
                    description: 'Task description for the agent',
                  },
                  userId: {
                    type: 'string',
                    description: 'User ID for context',
                  },
                  parameters: {
                    type: 'object',
                    description: 'Additional parameters for the task',
                  },
                },
                required: ['agentType', 'task'],
              },
            },
            {
              name: 'search_entities',
              description: 'Search for entities by type or properties',
              inputSchema: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Entity type to search for',
                  },
                  query: {
                    type: 'string',
                    description: 'Search query',
                  },
                  limit: {
                    type: 'number',
                    description: 'Maximum results',
                    default: 10,
                  },
                },
              },
            },
            {
              name: 'create_workflow',
              description: 'Create a multi-agent workflow',
              inputSchema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Workflow name',
                  },
                  agents: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Agent types to include',
                  },
                  goal: {
                    type: 'string',
                    description: 'Workflow goal',
                  },
                },
                required: ['name', 'agents', 'goal'],
              },
            },
            {
              name: 'analyze_metrics',
              description: 'Analyze user performance metrics',
              inputSchema: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                    description: 'User ID',
                  },
                  period: {
                    type: 'string',
                    enum: ['day', 'week', 'month', 'year'],
                    description: 'Analysis period',
                  },
                },
                required: ['userId'],
              },
            },
          ],
        };
      });

      /**
       * Execute tool
       */
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'execute_agent': {
            const { agentType, task, userId, parameters } = args as {
              agentType: string;
              task: string;
              userId?: string;
              parameters?: any;
            };

            let result;
            switch (agentType) {
              case 'intelligence':
                result = await intelligenceAgent.executeTask({
                  task,
                  userId: userId as Id<'entities'>,
                  parameters,
                });
                break;
              case 'strategy':
                result = await strategyAgent.executeTask({
                  task,
                  userId: userId as Id<'entities'>,
                  parameters,
                });
                break;
              default:
                throw new Error(`Unknown agent type: ${agentType}`);
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'search_entities': {
            const { type, query, limit } = args as {
              type?: string;
              query?: string;
              limit?: number;
            };

            const entities = await db.query('entities', {
              filter: type ? (q) => q.eq(q.field('type'), type) : undefined,
              limit: limit || 10,
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(entities, null, 2),
                },
              ],
            };
          }

          case 'analyze_metrics': {
            const { userId, period } = args as {
              userId: string;
              period?: string;
            };

            const result = await intelligenceAgent.analyzeMetrics({
              userId: userId as Id<'entities'>,
              period: (period || 'month') as 'day' | 'week' | 'month' | 'year',
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      });

      // ========================================
      // PROMPTS (Reusable templates)
      // ========================================

      /**
       * List available prompts
       */
      server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
          prompts: [
            {
              name: 'agent_collaboration',
              description: 'Multi-agent collaboration workflow template',
              arguments: [
                {
                  name: 'goal',
                  description: 'Collaboration goal',
                  required: true,
                },
                {
                  name: 'agents',
                  description: 'Comma-separated agent types',
                  required: true,
                },
              ],
            },
            {
              name: 'data_analysis',
              description: 'Comprehensive data analysis template',
              arguments: [
                {
                  name: 'dataset',
                  description: 'Dataset to analyze',
                  required: true,
                },
                {
                  name: 'metrics',
                  description: 'Metrics to focus on',
                  required: false,
                },
              ],
            },
          ],
        };
      });

      /**
       * Get prompt
       */
      server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'agent_collaboration':
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `You are coordinating multiple AI agents to achieve the following goal: ${args?.goal}

Agents available: ${args?.agents}

Please create a step-by-step plan that:
1. Assigns specific tasks to each agent
2. Defines the workflow sequence
3. Specifies how agents should collaborate
4. Identifies success criteria

Return the plan as a structured workflow.`,
                  },
                },
              ],
            };

          case 'data_analysis':
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Analyze the following dataset: ${args?.dataset}

${args?.metrics ? `Focus on these metrics: ${args.metrics}` : ''}

Provide:
1. Summary statistics
2. Key trends and patterns
3. Anomalies or outliers
4. Actionable insights
5. Recommendations

Format the analysis as a comprehensive report.`,
                  },
                },
              ],
            };

          default:
            throw new Error(`Unknown prompt: ${name}`);
        }
      });

      return {
        server,

        /**
         * Start MCP server with stdio transport
         */
        start: () =>
          Effect.gen(function* () {
            const transport = new StdioServerTransport();
            yield* Effect.promise(() => server.connect(transport));
            console.log('ONE MCP Server started on stdio');
          }),
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      IntelligenceAgent.Default,
      StrategyAgent.Default,
    ],
  }
) {}
```

### MCP Client Implementation

**File:** `convex/services/mcp-client.ts`

```typescript
import { Effect } from 'effect';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { ConvexDatabase } from './convex-database';

/**
 * MCPClientService - Connect to external MCP servers
 */
export class MCPClientService extends Effect.Service<MCPClientService>()(
  'MCPClientService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const clients = new Map<string, Client>();

      return {
        /**
         * Connect to external MCP server
         */
        connect: (args: {
          serverId: string;
          transport: 'stdio' | 'sse';
          config: {
            command?: string;
            args?: string[];
            url?: string;
          };
        }) =>
          Effect.gen(function* () {
            let transport;

            if (args.transport === 'stdio') {
              if (!args.config.command) {
                yield* Effect.fail(new Error('stdio requires command'));
              }
              transport = new StdioClientTransport({
                command: args.config.command,
                args: args.config.args || [],
              });
            } else {
              if (!args.config.url) {
                yield* Effect.fail(new Error('SSE requires URL'));
              }
              transport = new SSEClientTransport(new URL(args.config.url));
            }

            const client = new Client(
              {
                name: 'one-platform-client',
                version: '1.0.0',
              },
              {
                capabilities: {},
              }
            );

            yield* Effect.promise(() => client.connect(transport));
            clients.set(args.serverId, client);

            // Store connection in database
            yield* db.insert('entities', {
              type: 'mcp_connection',
              name: `MCP: ${args.serverId}`,
              properties: {
                serverId: args.serverId,
                transport: args.transport,
                config: args.config,
                status: 'connected',
                connectedAt: Date.now(),
              },
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            return { client, serverId: args.serverId };
          }),

        /**
         * List resources from external server
         */
        listResources: (serverId: string) =>
          Effect.gen(function* () {
            const client = clients.get(serverId);
            if (!client) {
              yield* Effect.fail(new Error(`Not connected to ${serverId}`));
            }

            const result = yield* Effect.promise(() =>
              client!.request({ method: 'resources/list' }, {})
            );

            return result.resources;
          }),

        /**
         * Read resource from external server
         */
        readResource: (serverId: string, uri: string) =>
          Effect.gen(function* () {
            const client = clients.get(serverId);
            if (!client) {
              yield* Effect.fail(new Error(`Not connected to ${serverId}`));
            }

            const result = yield* Effect.promise(() =>
              client!.request(
                { method: 'resources/read' },
                { uri }
              )
            );

            return result.contents;
          }),

        /**
         * Call tool on external server
         */
        callTool: (serverId: string, name: string, args: any) =>
          Effect.gen(function* () {
            const client = clients.get(serverId);
            if (!client) {
              yield* Effect.fail(new Error(`Not connected to ${serverId}`));
            }

            const result = yield* Effect.promise(() =>
              client!.request(
                { method: 'tools/call' },
                { name, arguments: args }
              )
            );

            return result.content;
          }),

        /**
         * Disconnect from server
         */
        disconnect: (serverId: string) =>
          Effect.gen(function* () {
            const client = clients.get(serverId);
            if (client) {
              yield* Effect.promise(() => client.close());
              clients.delete(serverId);

              // Update database
              const connections = yield* db.query('entities', {
                filter: (q) =>
                  q.and(
                    q.eq(q.field('type'), 'mcp_connection'),
                    q.eq(q.field('properties.serverId'), serverId)
                  ),
              });

              if (connections.length > 0) {
                yield* db.patch(connections[0]._id, {
                  'properties.status': 'disconnected',
                  'properties.disconnectedAt': Date.now(),
                  status: 'inactive',
                  updatedAt: Date.now(),
                });
              }
            }
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

---

## Part 4: Configuration & Deployment

### Update .mcp.json

**File:** `.mcp.json`

```json
{
  "mcpServers": {
    "one-platform": {
      "command": "node",
      "args": ["dist/mcp-server.js"],
      "description": "ONE Platform MCP Server - Access agents, data, and workflows"
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"],
      "description": "shadcn/ui component registry"
    },
    "cloudflare-builds": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://builds.mcp.cloudflare.com/sse"],
      "description": "Cloudflare build information"
    },
    "cloudflare-docs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://docs.mcp.cloudflare.com/sse"],
      "description": "Cloudflare documentation"
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      },
      "description": "GitHub repository access"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/toc/Server/ONE"],
      "description": "Local filesystem access"
    }
  }
}
```

### Convex Component Configuration

**File:** `convex/convex.config.ts`

```typescript
import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
// Future: MCP component when available
// import mcp from "@convex-dev/mcp/convex.config";

const app = defineApp();
app.use(resend);
app.use(betterAuth);
app.use(rateLimiter);
// app.use(mcp); // When available

export default app;
```

---

## Part 5: Ontology Integration

### Entity Types

**New Types:**
```typescript
| 'mcp_connection'    // Connection to external MCP server
| 'mcp_resource'      // Cached resource from MCP server
```

**Properties:**

**mcp_connection:**
```typescript
{
  serverId: string,
  transport: 'stdio' | 'sse',
  config: {
    command?: string,
    args?: string[],
    url?: string
  },
  status: 'connected' | 'disconnected' | 'error',
  capabilities: {
    resources?: boolean,
    tools?: boolean,
    prompts?: boolean
  },
  connectedAt: number,
  disconnectedAt?: number,
  lastError?: string
}
```

**mcp_resource:**
```typescript
{
  serverId: string,
  uri: string,
  name: string,
  description: string,
  mimeType: string,
  contents: string,
  cachedAt: number,
  expiresAt?: number
}
```

### Event Types

Uses existing types:

```typescript
// MCP server connected
{
  type: 'integration_event',
  actorId: systemId,
  targetId: connectionId,
  timestamp: Date.now(),
  metadata: {
    eventType: 'mcp_connected',
    serverId: 'cloudflare-docs',
    capabilities: ['resources', 'tools']
  }
}

// MCP tool executed
{
  type: 'agent_executed',
  actorId: agentId,
  targetId: null,
  timestamp: Date.now(),
  metadata: {
    action: 'mcp_tool_call',
    serverId: 'github',
    toolName: 'search_repositories',
    arguments: {...},
    result: {...}
  }
}

// MCP resource accessed
{
  type: 'content_accessed',
  actorId: userId,
  targetId: resourceId,
  timestamp: Date.now(),
  metadata: {
    protocol: 'mcp',
    serverId: 'filesystem',
    uri: 'file:///path/to/file.txt'
  }
}
```

---

## Part 6: Recommendations

### Phase 1: MCP Client (Immediate - Week 1-2)

**Goal:** Connect ONE to external MCP servers

**Tasks:**
- ✅ Install @modelcontextprotocol/sdk
- ✅ Implement MCPClientService (Effect.ts)
- ✅ Connect to Cloudflare Docs MCP
- ✅ Connect to Cloudflare Builds MCP
- ✅ Test resource access
- ✅ Cache resources in Convex

**Value:**
- Immediate access to Cloudflare docs/builds
- Validate MCP integration approach
- Low risk (read-only access)

### Phase 2: MCP Server (Core - Week 3-6)

**Goal:** Expose ONE platform via MCP

**Tasks:**
- ✅ Implement MCPServerService (Effect.ts)
- ✅ Expose resources (entities, agents, conversations)
- ✅ Expose tools (execute_agent, search, analyze)
- ✅ Expose prompts (collaboration, analysis templates)
- ✅ Test with Claude Desktop
- ✅ Document API for external developers

**Value:**
- Universal AI access to ONE
- Position as MCP-first platform
- Enable third-party integrations

### Phase 3: Advanced Features (Enhancement - Week 7-10)

**Goal:** Advanced MCP capabilities

**Tasks:**
- ✅ SSE transport for remote access
- ✅ Authentication & authorization
- ✅ Rate limiting per client
- ✅ Resource subscriptions (real-time updates)
- ✅ Tool result streaming
- ✅ Multi-server orchestration

**Value:**
- Production-ready MCP server
- Enterprise features
- Scale to thousands of clients

### Phase 4: Ecosystem (Strategic - Ongoing)

**Goal:** Build MCP ecosystem

**Tasks:**
- ✅ Publish ONE MCP server to registry
- ✅ Create MCP server examples
- ✅ Integrate with more MCP servers
- ✅ Community contribution guides
- ✅ MCP marketplace for agents

**Value:**
- Network effects
- Community growth
- Strategic positioning

---

## Part 7: Decision Matrix

| Criterion | MCP Server Only | MCP Client Only | Hybrid (Recommended) |
|-----------|----------------|-----------------|---------------------|
| **External AI Access** | ✅ High | ❌ None | ✅ High |
| **Access External Data** | ❌ None | ✅ High | ✅ High |
| **Ecosystem Integration** | ⚠️ Medium | ⚠️ Medium | ✅ High |
| **Development Effort** | ⚠️ Medium | ⚠️ Low | ⚠️ High |
| **Maintenance** | ⚠️ Medium | ⚠️ Low | ⚠️ High |
| **Strategic Value** | ⚠️ Medium | ⚠️ Low | ✅ High |
| **Time to Value** | ⚠️ 3-6 weeks | ✅ 1-2 weeks | ⚠️ 6-10 weeks |
| **Future-Proof** | ⚠️ Medium | ⚠️ Low | ✅ High |

**Recommendation:** Implement **Hybrid approach** with phased rollout (Client first, then Server)

---

## Summary

**MCP Integration Strategy:**
- ✅ **Phase 1:** MCP Client (access external servers)
- ✅ **Phase 2:** MCP Server (expose ONE platform)
- ✅ **Phase 3:** Advanced features (SSE, auth, streaming)
- ✅ **Phase 4:** Ecosystem building

**New Entity Types:** 2 (mcp_connection, mcp_resource)
**Breaking Changes:** ZERO
**Strategic Value:** HIGH (industry-standard AI connectivity)

🎉 **Result:** Universal AI connectivity with Model Context Protocol - "USB-C port for AI" integrated deeply into ONE platform.

## Resources

- **MCP Website**: https://modelcontextprotocol.io/
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **MCP Servers**: https://github.com/modelcontextprotocol/servers
- **Anthropic MCP Docs**: https://docs.anthropic.com/en/docs/build-with-claude/mcp
