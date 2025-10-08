# ElizaOS Integration - Multi-Agent Communication

**Version:** 1.0.0
**Purpose:** Enable ONE platform agents to communicate and collaborate with ElizaOS agents, creating a multi-agent ecosystem

---

## Overview

ElizaOS is an open-source multi-agent AI development framework that allows building, deploying, and managing autonomous AI agents. This integration enables:

1. **ONE Agents → ElizaOS Agents**: Our agents can message and collaborate with Eliza agents
2. **ElizaOS Agents → ONE Agents**: Eliza agents can trigger actions in our system
3. **Shared Memory**: Agents can share context and knowledge across platforms
4. **Plugin Ecosystem**: Access ElizaOS's 90+ plugins for extended capabilities

---

## ElizaOS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ElizaOS Framework                           │
├─────────────────────────────────────────────────────────────────┤
│  Core Components:                                               │
│  ├─ Agent Runtime (@elizaos/server)                            │
│  ├─ Character System (personality files)                        │
│  ├─ Memory System (persistent conversation history)            │
│  ├─ Plugin System (90+ plugins)                                 │
│  └─ Multi-platform Adapters (Discord, Telegram, Twitter, etc.) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  REST API        │
                    │  WebSocket/Socket.IO│
                    └──────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ONE Platform Integration                    │
├─────────────────────────────────────────────────────────────────┤
│  ElizaOSService (Effect.ts)                                     │
│  ├─ Send messages to Eliza agents                               │
│  ├─ Receive messages from Eliza agents                          │
│  ├─ Share memory/context                                        │
│  ├─ Trigger actions via plugins                                 │
│  └─ Subscribe to agent events                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key ElizaOS Concepts

**1. Agents**: Autonomous AI entities with personality, memory, and goals
**2. Character Files**: JSON definitions of agent personality and behavior
**3. Actions**: What agents can do (send message, execute code, call API)
**4. Providers**: Context aggregators (current time, user data, market data)
**5. Evaluators**: Assess interactions and trigger behaviors
**6. Plugins**: Modular capabilities (blockchain, social media, data analysis)

---

## Ontology Mapping

### Entity Types Used

Uses the unified external integration schema from `Ontology.md`:

```typescript
// EXTERNAL INTEGRATIONS (already in Ontology.md)
| 'external_agent'        // External AI agent (ElizaOS, AutoGen, CrewAI, etc.)
| 'external_workflow'     // External workflow (not used for ElizaOS)
| 'external_connection'   // Connection config to external service

// EXISTING TYPES (reused)
| 'conversation'          // For agent-to-agent conversations
| 'message'               // For individual messages
```

### Entity Properties

**external_agent Properties (for ElizaOS agents):**
```typescript
{
  platform: "elizaos",          // Platform identifier
  agentId: string,              // ElizaOS agent ID
  name: string,                 // Agent name
  description?: string,         // What the agent does
  capabilities: string[],       // Available actions/plugins
  apiEndpoint?: string,         // REST API endpoint
  websocketUrl?: string,        // WebSocket endpoint for real-time
  status: "online" | "offline" | "busy" | "unknown",
  lastSeen?: number,
  metadata: {                   // ElizaOS-specific data
    personality?: {
      traits: string[],
      goals: string[],
      bio: string,
      lore: string[],
      style: {
        all: string[],
        chat: string[],
        post: string[]
      }
    },
    characterFile?: string,     // Character definition URL/path
    platforms?: string[],       // Discord, Telegram, Twitter, etc.
    tools?: string[],           // Available ElizaOS tools
    model?: string              // LLM model used
  },
  conversationCount: number,    // Total conversations
  messageCount: number,         // Total messages exchanged
  createdAt: number,
  updatedAt: number
}
```

**conversation Properties (for agent-to-agent chats):**
```typescript
{
  participants: Id<'entities'>[],  // Agent IDs in conversation
  type: "agent_to_agent" | "user_to_agent",
  platform: "elizaos",
  status: "active" | "ended" | "archived",
  messageCount: number,
  startedAt: number,
  endedAt?: number,
  lastMessageAt: number,
  metadata: {
    externalRoomId?: string,    // Socket.IO room ID
    topic?: string,
    summary?: string,
    sentiment?: "positive" | "neutral" | "negative"
  }
}
```

**message Properties (for conversation messages):**
```typescript
{
  conversationId: Id<'entities'>,
  senderId: Id<'entities'>,     // Entity ID (agent or user)
  senderType: "one_agent" | "external_agent" | "user",
  content: {
    text: string,
    action?: string,
    metadata?: any
  },
  platform: "elizaos",
  embedding?: number[],         // Vector embedding for RAG
  timestamp: number,
  deliveredAt?: number,
  readAt?: number
}
```

**external_connection Properties (for ElizaOS connection):**
```typescript
{
  platform: "elizaos",
  name: string,                 // Connection name
  baseUrl?: string,             // ElizaOS server URL
  apiKey?: string,              // Encrypted API key
  websocketUrl?: string,        // WebSocket endpoint
  webhookSecret?: string,       // Webhook signature secret
  connectionType: "rest" | "websocket" | "webhook",
  authentication: {
    type: "apiKey" | "bearer",
    credentials: any            // Encrypted credentials
  },
  status: "active" | "inactive" | "error",
  lastConnectedAt?: number,
  lastError?: string,
  linkedEntityIds: string[],    // Connected ElizaOS agent IDs
  rateLimits?: {
    requestsPerMinute: number,
    requestsPerDay: number
  },
  createdAt: number,
  updatedAt: number
}
```

### Connection Types

Use existing connection types:

```typescript
// ONE Agent → ElizaOS Agent (collaboration)
{
  fromEntityId: oneAgentId,
  toEntityId: externalAgentId,  // external_agent entity
  relationshipType: 'collaborates_with',  // Existing type
  metadata: {
    platform: 'elizaos',
    collaborationType: 'external_agent',
    permissions: ['message', 'read_memory', 'trigger_action'],
    establishedAt: Date.now()
  }
}

// User → ElizaOS Agent (following)
{
  fromEntityId: userId,
  toEntityId: externalAgentId,
  relationshipType: 'following',          // Existing type
  metadata: {
    platform: 'elizaos',
    followedEntityType: 'external_agent',
    notificationsEnabled: true
  }
}

// Message → Conversation
{
  fromEntityId: messageId,
  toEntityId: conversationId,
  relationshipType: 'part_of',            // Existing type
  metadata: {
    containerType: 'conversation',
    order: 42,
    platform: 'elizaos'
  }
}
```

### Event Types

Use existing consolidated event types:

```typescript
// Message sent to ElizaOS agent
{
  type: 'agent_executed',                 // Existing type
  actorId: oneAgentId,
  targetId: externalAgentId,              // external_agent entity
  timestamp: Date.now(),
  metadata: {
    action: 'message_sent',
    platform: 'elizaos',
    conversationId: conversationId,
    messageText: 'Hello ElizaOS agent!',
    transport: 'websocket'
  }
}

// Message received from ElizaOS agent
{
  type: 'agent_executed',                 // Existing type
  actorId: externalAgentId,               // external_agent entity
  targetId: oneAgentId,
  timestamp: Date.now(),
  metadata: {
    action: 'message_received',
    platform: 'elizaos',
    conversationId: conversationId,
    messageText: 'Hello ONE agent!',
    sentiment: 'positive'
  }
}

// Conversation started
{
  type: 'content_changed',                // Existing type
  actorId: userId,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    action: 'created',
    contentType: 'conversation',
    platform: 'elizaos',
    participants: [oneAgentId, externalAgentId]
  }
}

// Agent collaboration failed
{
  type: 'agent_failed',                   // Existing type
  actorId: oneAgentId,
  targetId: externalAgentId,
  timestamp: Date.now(),
  metadata: {
    action: 'collaboration_failed',
    platform: 'elizaos',
    error: 'Connection timeout',
    transport: 'websocket'
  }
}
```

---

## Effect.ts Service Implementation

### ElizaOSProvider

```typescript
import { Effect, Layer, Schedule } from 'effect';
import { HttpProvider } from './http';
import { io, Socket } from 'socket.io-client';

export class ElizaOSError extends Error {
  readonly _tag = 'ElizaOSError';
  constructor(
    public readonly message: string,
    public readonly agentId?: string,
    public readonly statusCode?: number
  ) {
    super(message);
  }
}

export class ElizaOSProvider extends Effect.Service<ElizaOSProvider>()(
  'ElizaOSProvider',
  {
    effect: Effect.gen(function* () {
      const http = yield* HttpProvider;
      let socket: Socket | null = null;

      return {
        /**
         * Connect to ElizaOS WebSocket server
         */
        connect: (args: { websocketUrl: string; apiKey?: string }) =>
          Effect.gen(function* () {
            yield* Effect.sync(() => {
              socket = io(args.websocketUrl, {
                auth: args.apiKey ? { token: args.apiKey } : undefined,
                transports: ['websocket'],
              });
            });

            yield* Effect.async<void, ElizaOSError>((resume) => {
              if (!socket) {
                resume(Effect.fail(new ElizaOSError('Socket not initialized')));
                return;
              }

              socket.on('connect', () => {
                resume(Effect.succeed(undefined));
              });

              socket.on('connect_error', (error) => {
                resume(Effect.fail(new ElizaOSError(`Connection failed: ${error.message}`)));
              });
            });
          }),

        /**
         * Disconnect from WebSocket server
         */
        disconnect: () =>
          Effect.sync(() => {
            if (socket) {
              socket.disconnect();
              socket = null;
            }
          }),

        /**
         * Send message to Eliza agent via WebSocket
         */
        sendMessage: (args: {
          agentId: string;
          userId: string;
          text: string;
          roomId?: string;
        }) =>
          Effect.gen(function* () {
            if (!socket || !socket.connected) {
              yield* Effect.fail(new ElizaOSError('Not connected to ElizaOS'));
            }

            const messageData = {
              agentId: args.agentId,
              userId: args.userId,
              text: args.text,
              roomId: args.roomId,
            };

            yield* Effect.async<any, ElizaOSError>((resume) => {
              if (!socket) {
                resume(Effect.fail(new ElizaOSError('Socket not initialized')));
                return;
              }

              socket.emit('message', messageData, (response: any) => {
                if (response.error) {
                  resume(Effect.fail(new ElizaOSError(response.error)));
                } else {
                  resume(Effect.succeed(response));
                }
              });
            });
          }),

        /**
         * Subscribe to messages from Eliza agent
         */
        subscribeToMessages: (args: {
          agentId: string;
          roomId?: string;
          onMessage: (message: any) => void;
        }) =>
          Effect.sync(() => {
            if (!socket) {
              throw new Error('Socket not initialized');
            }

            if (args.roomId) {
              socket.emit('join', { roomId: args.roomId });
            }

            socket.on('message', (message: any) => {
              if (message.agentId === args.agentId) {
                args.onMessage(message);
              }
            });

            // Return cleanup function
            return () => {
              if (args.roomId && socket) {
                socket.emit('leave', { roomId: args.roomId });
              }
              if (socket) {
                socket.off('message');
              }
            };
          }),

        /**
         * Get agent details via REST API
         */
        getAgent: (args: { baseUrl: string; agentId: string; apiKey?: string }) =>
          Effect.gen(function* () {
            const result = yield* http
              .get({
                url: `${args.baseUrl}/api/agents/${args.agentId}`,
                headers: args.apiKey
                  ? {
                      Authorization: `Bearer ${args.apiKey}`,
                    }
                  : undefined,
              })
              .pipe(
                Effect.catchAll((error) =>
                  Effect.fail(
                    new ElizaOSError(
                      `Failed to get agent: ${error.message}`,
                      args.agentId,
                      error.statusCode
                    )
                  )
                )
              );

            return result.data as {
              id: string;
              name: string;
              character?: any;
              status: string;
              platforms: string[];
            };
          }),

        /**
         * List available agents
         */
        listAgents: (args: { baseUrl: string; apiKey?: string }) =>
          Effect.gen(function* () {
            const result = yield* http
              .get({
                url: `${args.baseUrl}/api/agents`,
                headers: args.apiKey
                  ? {
                      Authorization: `Bearer ${args.apiKey}`,
                    }
                  : undefined,
              })
              .pipe(
                Effect.catchAll((error) =>
                  Effect.fail(new ElizaOSError(`Failed to list agents: ${error.message}`))
                )
              );

            return result.data as Array<{
              id: string;
              name: string;
              status: string;
            }>;
          }),

        /**
         * Get conversation history with Eliza agent
         */
        getConversationHistory: (args: {
          baseUrl: string;
          agentId: string;
          userId: string;
          roomId?: string;
          apiKey?: string;
        }) =>
          Effect.gen(function* () {
            const result = yield* http
              .get({
                url: `${args.baseUrl}/api/agents/${args.agentId}/conversations`,
                params: {
                  userId: args.userId,
                  roomId: args.roomId,
                },
                headers: args.apiKey
                  ? {
                      Authorization: `Bearer ${args.apiKey}`,
                    }
                  : undefined,
              })
              .pipe(
                Effect.catchAll((error) =>
                  Effect.fail(
                    new ElizaOSError(`Failed to get conversation: ${error.message}`)
                  )
                )
              );

            return result.data as {
              messages: Array<{
                userId: string;
                text: string;
                timestamp: number;
              }>;
            };
          }),

        /**
         * Trigger action on Eliza agent via plugin
         */
        triggerAction: (args: {
          baseUrl: string;
          agentId: string;
          action: string;
          params: Record<string, any>;
          apiKey?: string;
        }) =>
          Effect.gen(function* () {
            const result = yield* http
              .post({
                url: `${args.baseUrl}/api/agents/${args.agentId}/actions`,
                body: {
                  action: args.action,
                  params: args.params,
                },
                headers: {
                  'Content-Type': 'application/json',
                  ...(args.apiKey
                    ? {
                        Authorization: `Bearer ${args.apiKey}`,
                      }
                    : {}),
                },
              })
              .pipe(
                Effect.catchAll((error) =>
                  Effect.fail(
                    new ElizaOSError(
                      `Failed to trigger action: ${error.message}`,
                      args.agentId
                    )
                  )
                )
              );

            return result.data;
          }),
      };
    }),
    dependencies: [HttpProvider.Default],
  }
) {}
```

### ElizaOSService (Business Logic)

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import { ElizaOSProvider } from './elizaos-provider';

export class ElizaOSService extends Effect.Service<ElizaOSService>()(
  'ElizaOSService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const eliza = yield* ElizaOSProvider;

      return {
        /**
         * Send message from ONE agent to Eliza agent
         */
        sendMessageToElizaAgent: (args: {
          oneAgentId: Id<'entities'>;
          elizaAgentId: Id<'entities'>;
          text: string;
          conversationId?: Id<'entities'>;
        }) =>
          Effect.gen(function* () {
            // 1. Get Eliza agent entity
            const elizaAgent = yield* db.get(args.elizaAgentId).pipe(
              Effect.flatMap((agent) =>
                agent?.type === 'eliza_agent'
                  ? Effect.succeed(agent)
                  : Effect.fail(new Error('Invalid Eliza agent'))
              )
            );

            // 2. Get connection config
            const connection = yield* db
              .query('entities')
              .filter((q) => q.eq(q.field('type'), 'eliza_connection'))
              .collect()
              .pipe(Effect.map((conns) => conns[0]));

            if (!connection) {
              yield* Effect.fail(new Error('No ElizaOS connection configured'));
            }

            // 3. Get or create conversation
            let conversationId = args.conversationId;
            if (!conversationId) {
              conversationId = yield* db.insert('entities', {
                type: 'eliza_conversation',
                name: `Conversation with ${elizaAgent.name}`,
                properties: {
                  elizaAgentId: elizaAgent.properties.agentId,
                  oneAgentId: args.oneAgentId,
                  platform: 'websocket',
                  status: 'active',
                  messageCount: 0,
                  startedAt: Date.now(),
                  lastMessageAt: Date.now(),
                  metadata: {},
                },
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });

              // Create connection
              yield* db.insert('connections', {
                fromEntityId: args.oneAgentId,
                toEntityId: args.elizaAgentId,
                relationshipType: 'collaborates_with',
                metadata: {
                  collaborationType: 'eliza_agent',
                  conversationId,
                },
                createdAt: Date.now(),
              });
            }

            // 4. Send message via ElizaOS
            const response = yield* eliza
              .sendMessage({
                agentId: elizaAgent.properties.agentId,
                userId: args.oneAgentId,
                text: args.text,
              })
              .pipe(
                Effect.retry({
                  times: 2,
                  schedule: Schedule.exponential('1 second'),
                })
              );

            // 5. Store outgoing message
            const messageId = yield* db.insert('entities', {
              type: 'eliza_message',
              name: 'Message',
              properties: {
                conversationId,
                senderId: args.oneAgentId,
                senderType: 'one_agent',
                content: {
                  text: args.text,
                },
                timestamp: Date.now(),
                deliveredAt: Date.now(),
              },
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // 6. Create message connection
            yield* db.insert('connections', {
              fromEntityId: messageId,
              toEntityId: conversationId,
              relationshipType: 'part_of',
              metadata: {
                containerType: 'conversation',
              },
              createdAt: Date.now(),
            });

            // 7. Log event
            yield* db.insert('events', {
              type: 'agent_executed',
              actorId: args.oneAgentId,
              targetId: args.elizaAgentId,
              timestamp: Date.now(),
              metadata: {
                action: 'message_sent',
                conversationId,
                messageText: args.text,
                platform: 'websocket',
              },
            });

            // 8. Update conversation
            const conversation = yield* db.get(conversationId);
            yield* db.patch(conversationId, {
              properties: {
                ...conversation!.properties,
                messageCount: (conversation!.properties.messageCount || 0) + 1,
                lastMessageAt: Date.now(),
              },
            });

            return {
              conversationId,
              messageId,
              response,
            };
          }),

        /**
         * Sync Eliza agents from ElizaOS instance
         */
        syncElizaAgents: (args: { connectionId: Id<'entities'>; userId: Id<'entities'> }) =>
          Effect.gen(function* () {
            // 1. Get connection
            const connection = yield* db.get(args.connectionId).pipe(
              Effect.flatMap((conn) =>
                conn?.type === 'eliza_connection'
                  ? Effect.succeed(conn)
                  : Effect.fail(new Error('Invalid connection'))
              )
            );

            // 2. List agents from ElizaOS
            const agents = yield* eliza.listAgents({
              baseUrl: connection.properties.baseUrl,
              apiKey: connection.properties.apiKey,
            });

            // 3. Create/update agent entities
            const results = yield* Effect.all(
              agents.map((agent) =>
                Effect.gen(function* () {
                  // Get agent details
                  const agentDetails = yield* eliza.getAgent({
                    baseUrl: connection.properties.baseUrl,
                    agentId: agent.id,
                    apiKey: connection.properties.apiKey,
                  });

                  // Check if exists
                  const existing = yield* db
                    .query('entities')
                    .filter((q) =>
                      q.and(
                        q.eq(q.field('type'), 'eliza_agent'),
                        q.eq(q.field('properties.agentId'), agent.id)
                      )
                    )
                    .collect()
                    .pipe(Effect.map((results) => results[0]));

                  if (existing) {
                    // Update
                    yield* db.patch(existing._id, {
                      properties: {
                        ...existing.properties,
                        name: agentDetails.name,
                        status: agentDetails.status,
                        platforms: agentDetails.platforms || [],
                        updatedAt: Date.now(),
                      },
                    });
                    return existing._id;
                  } else {
                    // Create
                    const agentId = yield* db.insert('entities', {
                      type: 'eliza_agent',
                      name: agentDetails.name,
                      properties: {
                        agentId: agent.id,
                        name: agentDetails.name,
                        personality: agentDetails.character || {},
                        platforms: agentDetails.platforms || [],
                        capabilities: [],
                        status: agentDetails.status,
                        conversationCount: 0,
                        messageCount: 0,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      },
                      status: 'active',
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });

                    return agentId;
                  }
                })
              ),
              { concurrency: 5 }
            );

            return {
              synced: results.length,
              agentIds: results,
            };
          }),

        /**
         * Subscribe to messages from Eliza agent (WebSocket)
         */
        subscribeToElizaAgent: (args: {
          connectionId: Id<'entities'>;
          elizaAgentId: Id<'entities'>;
          onMessage: (message: {
            conversationId: Id<'entities'>;
            messageId: Id<'entities'>;
            text: string;
          }) => void;
        }) =>
          Effect.gen(function* () {
            // 1. Get connection
            const connection = yield* db.get(args.connectionId).pipe(
              Effect.flatMap((conn) =>
                conn?.type === 'eliza_connection'
                  ? Effect.succeed(conn)
                  : Effect.fail(new Error('Invalid connection'))
              )
            );

            // 2. Get Eliza agent
            const elizaAgent = yield* db.get(args.elizaAgentId).pipe(
              Effect.flatMap((agent) =>
                agent?.type === 'eliza_agent'
                  ? Effect.succeed(agent)
                  : Effect.fail(new Error('Invalid Eliza agent'))
              )
            );

            // 3. Connect to WebSocket
            if (connection.properties.websocketUrl) {
              yield* eliza.connect({
                websocketUrl: connection.properties.websocketUrl,
                apiKey: connection.properties.apiKey,
              });
            }

            // 4. Subscribe to messages
            const cleanup = yield* eliza.subscribeToMessages({
              agentId: elizaAgent.properties.agentId,
              onMessage: async (message: any) => {
                // Store incoming message
                try {
                  // Find conversation
                  const conversations = await db
                    .query('entities')
                    .filter((q) =>
                      q.and(
                        q.eq(q.field('type'), 'eliza_conversation'),
                        q.eq(q.field('properties.elizaAgentId'), elizaAgent.properties.agentId),
                        q.eq(q.field('properties.status'), 'active')
                      )
                    )
                    .collect();

                  const conversation = conversations[0];
                  if (!conversation) return;

                  // Store message
                  const messageId = await db.insert('entities', {
                    type: 'eliza_message',
                    name: 'Message',
                    properties: {
                      conversationId: conversation._id,
                      senderId: elizaAgent.properties.agentId,
                      senderType: 'eliza_agent',
                      content: {
                        text: message.text,
                      },
                      timestamp: Date.now(),
                    },
                    status: 'active',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  });

                  // Log event
                  await db.insert('events', {
                    type: 'agent_executed',
                    actorId: args.elizaAgentId,
                    targetId: conversation.properties.oneAgentId,
                    timestamp: Date.now(),
                    metadata: {
                      action: 'message_received',
                      conversationId: conversation._id,
                      messageText: message.text,
                    },
                  });

                  // Callback
                  args.onMessage({
                    conversationId: conversation._id,
                    messageId,
                    text: message.text,
                  });
                } catch (error) {
                  console.error('Failed to process Eliza message:', error);
                }
              },
            });

            return cleanup;
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, ElizaOSProvider.Default],
  }
) {}
```

---

## Convex Function Wrappers

```typescript
// convex/elizaos.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { confect } from './confect';
import { ElizaOSService } from './services/elizaos';
import { MainLayer } from './layers';

/**
 * Send message to Eliza agent
 */
export const sendMessageToElizaAgent = confect.mutation({
  args: {
    oneAgentId: v.id('entities'),
    elizaAgentId: v.id('entities'),
    text: v.string(),
    conversationId: v.optional(v.id('entities')),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* ElizaOSService;
      return yield* service.sendMessageToElizaAgent(args);
    }).pipe(Effect.provide(MainLayer)),
});

/**
 * Sync Eliza agents from instance
 */
export const syncElizaAgents = confect.mutation({
  args: {
    connectionId: v.id('entities'),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);
      const service = yield* ElizaOSService;

      return yield* service.syncElizaAgents({
        connectionId: args.connectionId,
        userId,
      });
    }).pipe(Effect.provide(MainLayer)),
});

/**
 * Get conversation history
 */
export const getConversationHistory = query({
  args: {
    conversationId: v.id('entities'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.type !== 'eliza_conversation') {
      throw new Error('Invalid conversation');
    }

    const messages = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'eliza_message'),
          q.eq(q.field('properties.conversationId'), args.conversationId)
        )
      )
      .order('desc')
      .take(args.limit ?? 100);

    return {
      conversation,
      messages,
    };
  },
});

/**
 * List Eliza agents
 */
export const listElizaAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query('entities')
      .filter((q) => q.eq(q.field('type'), 'eliza_agent'))
      .collect();

    return agents;
  },
});
```

---

## Usage Examples

### 1. Strategy Agent Consulting with Eliza Marketing Expert

```typescript
export class StrategyAgent extends Effect.Service<StrategyAgent>()(
  'StrategyAgent',
  {
    effect: Effect.gen(function* () {
      const elizaService = yield* ElizaOSService;

      return {
        consultMarketingExpert: (args: { campaignIdea: string }) =>
          Effect.gen(function* () {
            // Send question to Eliza marketing agent
            const result = yield* elizaService.sendMessageToElizaAgent({
              oneAgentId: 'agent-strategy',
              elizaAgentId: 'eliza-marketing-expert',
              text: `I'm planning a campaign: "${args.campaignIdea}". What do you think about the market fit and messaging strategy?`,
            });

            // Wait for response (handled via WebSocket subscription)
            return result;
          }),
      };
    }),
  }
) {}
```

### 2. Multi-Agent Brainstorming Session

```typescript
export const startBrainstormingSession = confect.mutation({
  args: {
    topic: v.string(),
    elizaAgentIds: v.array(v.id('entities')),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* ElizaOSService;
      const userId = yield* getUserId(ctx);

      // Send topic to all Eliza agents
      const responses = yield* Effect.all(
        args.elizaAgentIds.map((agentId) =>
          service.sendMessageToElizaAgent({
            oneAgentId: userId,
            elizaAgentId: agentId,
            text: `Brainstorming session on: "${args.topic}". Share your ideas and insights.`,
          })
        ),
        { concurrency: 3 }
      );

      return {
        conversationIds: responses.map((r) => r.conversationId),
      };
    }).pipe(Effect.provide(MainLayer)),
});
```

### 3. Real-time Message Subscription

```typescript
// Long-running action that subscribes to Eliza agent
export const subscribeToElizaMessages = confect.action({
  args: {
    connectionId: v.id('entities'),
    elizaAgentId: v.id('entities'),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* ElizaOSService;

      const cleanup = yield* service.subscribeToElizaAgent({
        connectionId: args.connectionId,
        elizaAgentId: args.elizaAgentId,
        onMessage: (message) => {
          console.log('Received message from Eliza:', message);
          // Process message, trigger workflows, notify users, etc.
        },
      });

      // Keep subscription alive
      yield* Effect.sleep('24 hours');

      // Cleanup
      cleanup();
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Frontend Integration

### React Component for Eliza Chat

```tsx
// src/components/elizaos/ElizaChat.tsx
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function ElizaChat({
  oneAgentId,
  elizaAgentId,
}: {
  oneAgentId: Id<'entities'>;
  elizaAgentId: Id<'entities'>;
}) {
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<Id<'entities'> | undefined>();

  const sendMessage = useMutation(api.elizaos.sendMessageToElizaAgent);
  const conversation = useQuery(
    api.elizaos.getConversationHistory,
    conversationId ? { conversationId } : 'skip'
  );

  const handleSend = async () => {
    const result = await sendMessage({
      oneAgentId,
      elizaAgentId,
      text: message,
      conversationId,
    });
    setConversationId(result.conversationId);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversation?.messages.map((msg) => (
          <div
            key={msg._id}
            className={
              msg.properties.senderType === 'one_agent' ? 'text-right' : 'text-left'
            }
          >
            <div
              className={`inline-block p-2 rounded ${
                msg.properties.senderType === 'one_agent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.properties.content.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message Eliza agent..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
```

---

## Benefits

### For AI Agents
1. **Cross-Platform Collaboration**: ONE agents work with Eliza agents across platforms
2. **Specialized Expertise**: Access Eliza agents trained in specific domains
3. **Plugin Ecosystem**: Use ElizaOS's 90+ plugins for extended capabilities
4. **Multi-Agent Workflows**: Orchestrate complex tasks across agent platforms

### For Users
1. **Extended Capabilities**: Combine ONE platform features with ElizaOS plugins
2. **Choice of Agents**: Use best agent for each task (ONE or Eliza)
3. **Unified Interface**: Manage all agent interactions in ONE platform
4. **Community Agents**: Access community-built Eliza agents

### For Platform
1. **Ecosystem Integration**: Connect with ElizaOS developer community
2. **Reduced Development**: Leverage existing Eliza agents and plugins
3. **Interoperability**: Position as multi-agent platform hub
4. **Innovation**: Enable novel multi-agent use cases

---

## Security Considerations

1. **API Key Storage**: Encrypt ElizaOS API keys in database
2. **Message Validation**: Sanitize all messages before sending
3. **Rate Limiting**: Prevent message spam to Eliza agents
4. **Permission Checks**: Verify user has permission to contact agents
5. **WebSocket Security**: Validate WebSocket connections and messages
6. **Agent Verification**: Verify Eliza agent identity before trusting responses

---

## Testing

```typescript
// tests/elizaos.test.ts
import { Effect, Layer } from 'effect';
import { ElizaOSService } from '@/convex/services/elizaos';

describe('ElizaOSService', () => {
  it('should send message to Eliza agent', async () => {
    const MockEliza = Layer.succeed(ElizaOSProvider, {
      sendMessage: () =>
        Effect.succeed({
          messageId: 'msg-123',
          response: 'Hello from Eliza!',
        }),
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* ElizaOSService;
        return yield* service.sendMessageToElizaAgent({
          oneAgentId: 'agent-123',
          elizaAgentId: 'eliza-456',
          text: 'Hello Eliza!',
        });
      }).pipe(Effect.provide(Layer.merge(MockEliza, MockDB)))
    );

    expect(result.response).toBeDefined();
  });
});
```

---

## Summary

This integration enables:
- ✅ **ONE Agents → ElizaOS**: Agents collaborate with Eliza agents
- ✅ **Real-time Communication**: WebSocket-based messaging
- ✅ **Conversation Persistence**: Store all agent-to-agent conversations
- ✅ **100% Effect.ts**: Typed errors, automatic retry, composable
- ✅ **Non-Breaking**: Uses existing connection/event types
- ✅ **Minimal Entities**: Only 4 new entity types needed

**Next Steps**:
1. Add 4 entity types to Ontology.md
2. Implement ElizaOSProvider and ElizaOSService
3. Create Convex function wrappers
4. Build frontend chat UI for Eliza agents
5. Test with ElizaOS instance
6. Enable plugin integration
