# Agent Communications

This document defines how our agents communicate with external agents using standardized protocols.

## Overview

We implement agent-to-agent (A2A) communication using two complementary protocols:

1. **A2A Protocol** (https://a2a-protocol.org) - Google's open standard donated to Linux Foundation
2. **Agent Communication Protocol (ACP)** (https://agentcommunicationprotocol.dev) - REST-based interoperability standard

Both protocols enable our agents to communicate, delegate tasks, and coordinate with external agents without sharing internal memory, tools, or proprietary logic.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Our Agent System                         │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Agent A  │───▶│ Agent B  │───▶│ Agent C  │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │               │                │                    │
│       │               │                │                    │
└───────┼───────────────┼────────────────┼────────────────────┘
        │               │                │
        │               │                │ A2A/ACP Protocol
        ▼               ▼                ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │External │    │External │    │External │
   │Agent X  │    │Agent Y  │    │Agent Z  │
   └─────────┘    └─────────┘    └─────────┘
```

## Core Principles

### 1. Open Communication
- **No Silos**: Agents can interact across platforms and frameworks
- **Opaque Internals**: Agents don't share internal memory or tools
- **Secure Exchange**: Communication is secure and authenticated

### 2. Protocol Agnostic
- **REST/HTTP Based**: Standard web protocols (no custom transports)
- **MimeType Support**: All data modalities (text, images, audio, video, binary)
- **Framework Independent**: Works with any agent implementation

### 3. Async-First
- **Long-Running Tasks**: Supports tasks that take hours or days
- **Synchronous Option**: Available when needed
- **Streaming**: Supports real-time data streams

## Implementation Strategy

### Phase 1: Agent Discovery (Current)

Implement agent registry using our ontology:

```typescript
// convex/services/agents/discovery.ts
export class AgentDiscoveryService extends Effect.Service<AgentDiscoveryService>()("AgentDiscoveryService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    return {
      // Register agent with capabilities
      register: (agent: AgentRegistration) =>
        Effect.gen(function* () {
          // Create agent entity
          const agentId = yield* Effect.tryPromise(() =>
            db.insert("entities", {
              type: "agent",
              name: agent.name,
              properties: {
                capabilities: agent.capabilities,
                endpoint: agent.endpoint,
                protocol: agent.protocol, // "a2a" | "acp"
                status: "online",
              },
              status: "active",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          );

          // Log registration event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: agentId,
              eventType: "agent_registered",
              timestamp: Date.now(),
              metadata: { capabilities: agent.capabilities },
            })
          );

          return agentId;
        }),

      // Discover agents by capability
      discover: (capability: string) =>
        Effect.tryPromise(() =>
          db
            .query("entities")
            .filter(q =>
              q.and(
                q.eq(q.field("type"), "agent"),
                q.eq(q.field("status"), "active")
              )
            )
            .collect()
            .then(agents =>
              agents.filter(agent =>
                agent.properties.capabilities?.includes(capability)
              )
            )
        ),
    };
  }),
  dependencies: [ConvexDatabase.Default],
}) {}
```

### Phase 2: Message Protocol

Implement standardized messaging:

```typescript
// convex/services/agents/messaging.ts
export class AgentMessagingService extends Effect.Service<AgentMessagingService>()("AgentMessagingService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    return {
      // Send message to external agent
      send: (message: AgentMessage) =>
        Effect.gen(function* () {
          // Create event for outbound message
          const eventId = yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: message.toAgentId,
              eventType: "agent_message_sent",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: message.fromAgentId,
              metadata: {
                protocol: message.protocol,
                messageType: message.type,
                payload: message.payload,
                correlationId: message.correlationId,
              },
            })
          );

          // Send via HTTP (ACP REST pattern)
          const response = yield* Effect.tryPromise(() =>
            fetch(message.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": message.mimeType || "application/json",
                "X-Correlation-Id": message.correlationId,
                "X-Agent-Id": message.fromAgentId,
              },
              body: JSON.stringify(message.payload),
            })
          );

          // Log response event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: message.fromAgentId,
              eventType: "agent_message_response",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: message.toAgentId,
              metadata: {
                correlationId: message.correlationId,
                status: response.status,
                requestEventId: eventId,
              },
            })
          );

          return yield* Effect.promise(() => response.json());
        }),

      // Receive message from external agent
      receive: (message: IncomingMessage) =>
        Effect.gen(function* () {
          // Log incoming message
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: message.toAgentId,
              eventType: "agent_message_received",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: message.fromAgentId,
              metadata: {
                protocol: message.protocol,
                messageType: message.type,
                correlationId: message.correlationId,
              },
            })
          );

          // Route to appropriate handler
          return yield* routeMessage(message);
        }),
    };
  }),
  dependencies: [ConvexDatabase.Default],
}) {}
```

### Phase 3: Task Delegation

Enable agents to delegate work:

```typescript
// convex/services/agents/delegation.ts
export class AgentDelegationService extends Effect.Service<AgentDelegationService>()("AgentDelegationService", {
  effect: Effect.gen(function* () {
    const discovery = yield* AgentDiscoveryService;
    const messaging = yield* AgentMessagingService;
    const db = yield* ConvexDatabase;

    return {
      // Delegate task to external agent
      delegate: (task: DelegationTask) =>
        Effect.gen(function* () {
          // Find capable agent
          const agents = yield* discovery.discover(task.requiredCapability);

          if (agents.length === 0) {
            return yield* Effect.fail({
              _tag: "NoCapableAgentError" as const,
              capability: task.requiredCapability,
            });
          }

          // Select best agent (simple: first match)
          const selectedAgent = agents[0];

          // Create delegation connection
          const connectionId = yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromEntityId: task.delegatorId,
              toEntityId: selectedAgent._id,
              relationshipType: "delegated_to",
              metadata: {
                taskType: task.type,
                status: "pending",
                correlationId: task.correlationId,
              },
              createdAt: Date.now(),
            })
          );

          // Send delegation message
          const response = yield* messaging.send({
            fromAgentId: task.delegatorId,
            toAgentId: selectedAgent._id,
            endpoint: selectedAgent.properties.endpoint,
            protocol: selectedAgent.properties.protocol,
            type: "task_delegation",
            mimeType: "application/json",
            correlationId: task.correlationId,
            payload: {
              task: task.type,
              parameters: task.parameters,
              callbackUrl: task.callbackUrl,
            },
          });

          // Update connection with response
          yield* Effect.tryPromise(() =>
            db.patch(connectionId, {
              metadata: {
                taskType: task.type,
                status: "accepted",
                correlationId: task.correlationId,
                taskId: response.taskId,
              },
            })
          );

          return {
            delegationId: connectionId,
            taskId: response.taskId,
            agentId: selectedAgent._id,
          };
        }),
    };
  }),
  dependencies: [
    AgentDiscoveryService.Default,
    AgentMessagingService.Default,
    ConvexDatabase.Default,
  ],
}) {}
```

## Message Formats

### A2A Protocol Message

```typescript
interface A2AMessage {
  version: "1.0";
  correlationId: string;
  from: {
    agentId: string;
    endpoint: string;
  };
  to: {
    agentId: string;
    endpoint: string;
  };
  message: {
    type: "task" | "response" | "status" | "error";
    content: unknown;
    mimeType: string;
  };
  metadata?: Record<string, unknown>;
}
```

### ACP REST Endpoints

```typescript
// Our agent exposes these endpoints
POST /api/agents/:agentId/messages      // Receive message
GET  /api/agents/:agentId/status        // Agent status
POST /api/agents/:agentId/tasks         // Delegate task
GET  /api/agents/:agentId/tasks/:taskId // Task status
```

## Integration with Ontology

All agent communications are stored in our 4-table ontology:

### Entities
- Agent entities with capabilities and endpoints

### Connections
- `delegated_to` - Task delegation relationships
- `communicates_with` - Agent communication channels

### Events
- `agent_registered` - Agent joins network
- `agent_message_sent` - Outbound message
- `agent_message_received` - Inbound message
- `agent_message_response` - Response received
- `task_delegated` - Task delegated to external agent
- `task_completed` - External agent completed task

### Tags
- Agent capabilities (e.g., "nlp", "vision", "planning")
- Protocol types ("a2a", "acp")

## Security Considerations

1. **Authentication**
   - API keys for agent endpoints
   - Mutual TLS for sensitive communications
   - JWT tokens for session-based auth

2. **Authorization**
   - Capability-based access control
   - Rate limiting per agent
   - Audit logs in events table

3. **Data Privacy**
   - No sharing of internal memory
   - Encrypted payloads for sensitive data
   - GDPR-compliant data handling

## Example: Multi-Agent Workflow

```typescript
// Scenario: Content creation pipeline with external agents

// 1. Our content agent receives request
const contentRequest = {
  type: "blog_post",
  topic: "AI agent communication",
  length: 2000,
};

// 2. Delegate research to external research agent
const researchTask = await delegate({
  delegatorId: contentAgentId,
  requiredCapability: "research",
  type: "web_research",
  parameters: { topic: contentRequest.topic },
  correlationId: crypto.randomUUID(),
  callbackUrl: `${BASE_URL}/api/agents/${contentAgentId}/callbacks`,
});

// 3. Delegate image generation to external image agent
const imageTask = await delegate({
  delegatorId: contentAgentId,
  requiredCapability: "image_generation",
  type: "create_image",
  parameters: { description: "AI agents communicating", style: "technical" },
  correlationId: crypto.randomUUID(),
  callbackUrl: `${BASE_URL}/api/agents/${contentAgentId}/callbacks`,
});

// 4. Wait for responses (async callbacks)
// 5. Compose final content with research + image
// 6. Return to original requester
```

## Roadmap

### Q1 2025
- [x] Define agent communication architecture
- [ ] Implement agent discovery service
- [ ] Create message protocol handlers
- [ ] Build REST endpoints for ACP

### Q2 2025
- [ ] Implement task delegation
- [ ] Add authentication/authorization
- [ ] Create monitoring dashboard
- [ ] Write integration tests

### Q3 2025
- [ ] Multi-agent workflow orchestration
- [ ] Cross-organization agent federation
- [ ] Advanced routing algorithms
- [ ] Performance optimization

## References

- **A2A Protocol**: https://a2a-protocol.org/latest/
- **Agent Communication Protocol**: https://agentcommunicationprotocol.dev/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **Our Ontology**: See `Ontology.md`
- **Our Agents**: See `ElizaOS.md` and `AGENTS.md`

## Key Principles

1. **Interoperability First**: Use standard protocols (A2A/ACP)
2. **Ontology-Driven**: All communication mapped to 4 tables
3. **Async-First**: Long-running tasks are the norm
4. **Security**: Authentication, authorization, audit trails
5. **Observable**: All communications logged as events

This enables our agents to participate in a larger ecosystem of AI agents while maintaining our architectural principles and data integrity.
