# ACP - Agent Communication Protocol

**Official Specification**: https://agentcommunicationprotocol.dev/

## Overview

The Agent Communication Protocol (ACP) is an open, REST-based protocol for AI agent interoperability. Developed under the Linux Foundation, ACP enables standardized communication between agents across different frameworks and organizations.

## Key Characteristics

### Purpose
- Enable cross-framework agent integration
- Provide REST-based communication standard
- Support all data modalities (text, images, audio, video, binary)
- Enable synchronous and asynchronous agent interactions
- Facilitate agent discovery and capability matching

### Design Principles
1. **REST-Based**: Standard HTTP/HTTPS endpoints
2. **Async-First**: Optimized for long-running tasks
3. **Framework Agnostic**: No mandatory SDK required
4. **Multimodal**: Supports all MimeTypes
5. **Discoverable**: Online and offline agent discovery

## Protocol Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ACP REST Layer                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  POST   /agents/{id}/messages     - Send message         │
│  GET    /agents/{id}/messages     - Get messages         │
│  POST   /agents/{id}/tasks        - Create task          │
│  GET    /agents/{id}/tasks/{tid}  - Get task status      │
│  GET    /agents/{id}/capabilities - Get capabilities     │
│  GET    /agents                   - Discover agents       │
│                                                           │
└──────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Agent A  │          │Agent B  │          │Agent C  │
   │(Python) │          │(TypeScript)│       │(Go)     │
   └─────────┘          └─────────┘          └─────────┘
```

## Core Features

### 1. Multimodal Communication
Supports all data types via MimeTypes:

```typescript
// Text communication
{
  mimeType: "text/plain",
  content: "Hello, Agent!"
}

// Image data
{
  mimeType: "image/png",
  content: "<base64-encoded-image>",
  metadata: {
    width: 1024,
    height: 768
  }
}

// Audio data
{
  mimeType: "audio/wav",
  content: "<base64-encoded-audio>",
  metadata: {
    duration: 120,
    sampleRate: 44100
  }
}

// Custom binary format
{
  mimeType: "application/octet-stream",
  content: "<base64-encoded-binary>",
  metadata: {
    format: "custom-format-v1"
  }
}
```

### 2. Synchronous & Asynchronous Communication

**Synchronous (Request-Response)**:
```typescript
// Quick query with immediate response
POST /agents/agent-b/messages
{
  "from": "agent-a",
  "message": {
    "type": "query",
    "content": "What is the capital of France?",
    "mimeType": "text/plain"
  },
  "mode": "sync"
}

// Immediate response
{
  "messageId": "msg-123",
  "status": "completed",
  "response": {
    "content": "Paris",
    "mimeType": "text/plain"
  }
}
```

**Asynchronous (Task-Based)**:
```typescript
// Long-running task
POST /agents/agent-b/tasks
{
  "from": "agent-a",
  "task": {
    "type": "analyze_dataset",
    "parameters": {
      "datasetUrl": "https://...",
      "analysisType": "full"
    }
  },
  "callback": "https://agent-a.example.com/callbacks/task-456"
}

// Immediate task acknowledgment
{
  "taskId": "task-456",
  "status": "accepted",
  "estimatedCompletion": 1800000 // 30 minutes
}

// Later: callback to agent-a when complete
POST https://agent-a.example.com/callbacks/task-456
{
  "taskId": "task-456",
  "status": "completed",
  "result": { /* ... */ }
}
```

### 3. Agent Discovery

**Online Discovery**:
```typescript
// Discover available agents
GET /agents?capability=image_generation

Response:
{
  "agents": [
    {
      "agentId": "img-gen-1",
      "endpoint": "https://img-gen-1.example.com",
      "capabilities": ["image_generation", "image_editing"],
      "status": "online",
      "metadata": {
        "provider": "DALL-E",
        "version": "3.0"
      }
    },
    {
      "agentId": "img-gen-2",
      "endpoint": "https://img-gen-2.example.com",
      "capabilities": ["image_generation"],
      "status": "online",
      "metadata": {
        "provider": "Stable Diffusion",
        "version": "2.1"
      }
    }
  ]
}
```

**Offline Discovery** (via registry):
```typescript
// Query agent registry
GET /registry/agents?tag=nlp

Response:
{
  "agents": [
    {
      "agentId": "nlp-agent-1",
      "endpoint": "https://nlp-1.example.com",
      "capabilities": ["text_analysis", "sentiment_analysis"],
      "lastSeen": 1704067200000,
      "metadata": { /* ... */ }
    }
  ]
}
```

### 4. Streaming Support

Real-time data streaming for long-running tasks:

```typescript
// Request streaming response
POST /agents/agent-b/tasks
{
  "from": "agent-a",
  "task": {
    "type": "generate_content",
    "parameters": { "topic": "AI", "length": 5000 }
  },
  "streaming": true,
  "streamEndpoint": "https://agent-a.example.com/streams/stream-789"
}

// Server sends chunks via SSE or WebSocket
POST https://agent-a.example.com/streams/stream-789
{
  "chunk": "Artificial Intelligence is...",
  "position": 0,
  "complete": false
}

POST https://agent-a.example.com/streams/stream-789
{
  "chunk": "the simulation of human intelligence...",
  "position": 1,
  "complete": false
}

POST https://agent-a.example.com/streams/stream-789
{
  "chunk": "by machines.",
  "position": 2,
  "complete": true
}
```

## REST API Specification

### Endpoints

#### POST /agents/{agentId}/messages
Send a message to an agent.

**Request**:
```typescript
{
  "from": string,              // Sender agent ID
  "messageId": string,         // Unique message ID
  "correlationId"?: string,    // For related messages
  "message": {
    "type": string,            // Message type
    "content": unknown,        // Message payload
    "mimeType": string         // Content MIME type
  },
  "mode"?: "sync" | "async",   // Default: async
  "metadata"?: Record<string, unknown>
}
```

**Response**:
```typescript
{
  "messageId": string,
  "status": "received" | "processing" | "completed" | "error",
  "response"?: unknown,        // If mode=sync
  "error"?: {
    "code": string,
    "message": string
  }
}
```

#### GET /agents/{agentId}/messages
Get messages for an agent (inbox).

**Response**:
```typescript
{
  "messages": Array<{
    "messageId": string,
    "from": string,
    "timestamp": number,
    "message": {
      "type": string,
      "content": unknown,
      "mimeType": string
    },
    "status": string
  }>,
  "pagination": {
    "offset": number,
    "limit": number,
    "total": number
  }
}
```

#### POST /agents/{agentId}/tasks
Create a new task for an agent.

**Request**:
```typescript
{
  "from": string,
  "taskId"?: string,           // Optional client-provided ID
  "task": {
    "type": string,
    "parameters": Record<string, unknown>
  },
  "callback"?: string,         // Callback URL when complete
  "streaming"?: boolean,       // Enable streaming
  "streamEndpoint"?: string,   // Stream callback URL
  "priority"?: "low" | "medium" | "high" | "critical",
  "timeout"?: number,          // milliseconds
  "metadata"?: Record<string, unknown>
}
```

**Response**:
```typescript
{
  "taskId": string,
  "status": "accepted" | "rejected",
  "estimatedCompletion"?: number,
  "error"?: {
    "code": string,
    "message": string,
    "retryable": boolean
  }
}
```

#### GET /agents/{agentId}/tasks/{taskId}
Get task status and result.

**Response**:
```typescript
{
  "taskId": string,
  "status": "pending" | "processing" | "completed" | "failed" | "cancelled",
  "progress"?: number,         // 0-100
  "result"?: unknown,          // If completed
  "error"?: {
    "code": string,
    "message": string
  },
  "createdAt": number,
  "updatedAt": number,
  "completedAt"?: number
}
```

#### GET /agents/{agentId}/capabilities
Get agent capabilities and metadata.

**Response**:
```typescript
{
  "agentId": string,
  "capabilities": string[],
  "status": "online" | "offline" | "busy",
  "metadata": {
    "version": string,
    "provider": string,
    "supportedMimeTypes": string[],
    "maxConcurrentTasks": number,
    "averageResponseTime": number,
    "pricing"?: {
      "model": "per_request" | "per_minute" | "subscription",
      "rate": number,
      "currency": string
    }
  }
}
```

#### GET /agents
Discover agents by capability.

**Query Parameters**:
- `capability`: Filter by capability
- `status`: Filter by status
- `provider`: Filter by provider
- `offset`: Pagination offset
- `limit`: Pagination limit

**Response**:
```typescript
{
  "agents": Array<{
    "agentId": string,
    "endpoint": string,
    "capabilities": string[],
    "status": string,
    "metadata": Record<string, unknown>
  }>,
  "pagination": {
    "offset": number,
    "limit": number,
    "total": number
  }
}
```

## SDK
```bash
npm install acp-sdk
```

```typescript
import { Agent, Message, Task } from "acp-sdk";

// Create agent
const agent = new Agent({
  agentId: "my-agent",
  endpoint: "https://my-agent.example.com",
  capabilities: ["text_analysis", "summarization"],
});

// Send message
const response = await agent.sendMessage({
  to: "agent-b",
  message: {
    type: "query",
    content: "Analyze this text",
    mimeType: "text/plain",
  },
});

// Create task
const taskId = await agent.createTask({
  to: "agent-b",
  task: {
    type: "analyze_dataset",
    parameters: { datasetUrl: "https://..." },
  },
  callback: "https://my-agent.example.com/callbacks/task-1",
});
```

## Implementation in Our System

### Integration with Ontology

Map ACP concepts to our 4-table ontology:

**Entities**:
- Agent entities with ACP endpoint and capabilities
- Task entities for long-running operations

**Connections**:
- `communicates_via_acp` - Active ACP channel
- `task_assigned_to` - Task delegation

**Events**:
- `acp_message_sent` - Outbound ACP message
- `acp_message_received` - Inbound ACP message
- `acp_task_created` - Task created via ACP
- `acp_task_completed` - Task completed via ACP
- `acp_stream_chunk` - Streaming data chunk

**Tags**:
- ACP capabilities
- Supported MIME types

### Service Implementation

```typescript
// convex/services/agents/acp.ts
export class ACPService extends Effect.Service<ACPService>()("ACPService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    return {
      // Send ACP message
      sendMessage: (request: ACPMessageRequest) =>
        Effect.gen(function* () {
          const messageId = crypto.randomUUID();

          // Log outbound event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: request.from,
              eventType: "acp_message_sent",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: request.to,
              metadata: {
                messageId,
                messageType: request.message.type,
                mimeType: request.message.mimeType,
              },
            })
          );

          // Send via REST
          const response = yield* Effect.tryPromise(() =>
            fetch(`${request.endpoint}/agents/${request.to}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-ACP-Version": "1.0",
              },
              body: JSON.stringify({
                from: request.from,
                messageId,
                message: request.message,
                mode: request.mode || "async",
              }),
            })
          );

          return yield* Effect.promise(() => response.json());
        }),

      // Create ACP task
      createTask: (request: ACPTaskRequest) =>
        Effect.gen(function* () {
          const taskId = request.taskId || crypto.randomUUID();

          // Create task entity
          const taskEntityId = yield* Effect.tryPromise(() =>
            db.insert("entities", {
              type: "task",
              name: request.task.type,
              properties: {
                taskId,
                status: "pending",
                parameters: request.task.parameters,
              },
              status: "active",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          );

          // Create delegation connection
          yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromEntityId: request.from,
              toEntityId: request.to,
              relationshipType: "task_assigned_to",
              metadata: { taskId, taskEntityId },
              createdAt: Date.now(),
            })
          );

          // Log task creation
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: taskEntityId,
              eventType: "acp_task_created",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: request.from,
              metadata: {
                taskId,
                taskType: request.task.type,
              },
            })
          );

          // Send via REST
          const response = yield* Effect.tryPromise(() =>
            fetch(`${request.endpoint}/agents/${request.to}/tasks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-ACP-Version": "1.0",
              },
              body: JSON.stringify({
                from: request.from,
                taskId,
                task: request.task,
                callback: request.callback,
                streaming: request.streaming,
                streamEndpoint: request.streamEndpoint,
              }),
            })
          );

          const result = yield* Effect.promise(() => response.json());

          // Update task entity with response
          yield* Effect.tryPromise(() =>
            db.patch(taskEntityId, {
              properties: {
                taskId,
                status: result.status,
                parameters: request.task.parameters,
                estimatedCompletion: result.estimatedCompletion,
              },
            })
          );

          return result;
        }),

      // Discover agents
      discoverAgents: (capability?: string) =>
        Effect.tryPromise(() =>
          db
            .query("entities")
            .filter(q =>
              capability
                ? q.and(
                    q.eq(q.field("type"), "agent"),
                    q.eq(q.field("status"), "active")
                  )
                : q.and(
                    q.eq(q.field("type"), "agent"),
                    q.eq(q.field("status"), "active")
                  )
            )
            .collect()
            .then(agents =>
              capability
                ? agents.filter(a =>
                    a.properties.capabilities?.includes(capability)
                  )
                : agents
            )
        ),
    };
  }),
  dependencies: [ConvexDatabase.Default],
}) {}
```

### Astro API Routes

```typescript
// src/pages/api/agents/[agentId]/messages.ts
import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";

export const POST: APIRoute = async ({ request, params }) => {
  const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);
  const body = await request.json();

  const result = await convex.mutation(api.agents.receiveMessage, {
    agentId: params.agentId,
    message: body,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

## Security Considerations

### Authentication
- API keys in headers (`X-API-Key`)
- OAuth 2.0 for agent-to-agent auth
- JWT tokens for session management

### Authorization
- Capability-based access control
- Rate limiting per agent
- IP allowlisting for sensitive agents

### Data Privacy
- TLS 1.3 for all communications
- Optional end-to-end encryption for payloads
- GDPR-compliant data handling

## Best Practices

1. **Use Async Mode for Long Tasks**: Default to async for tasks > 5 seconds
2. **Implement Callbacks**: Always provide callback URLs for async tasks
3. **Handle All MIME Types**: Support multimodal data
4. **Log All Communications**: Store in events table
5. **Implement Retries**: Use exponential backoff for failures
6. **Monitor Performance**: Track response times and success rates
7. **Version Your API**: Use semantic versioning

## Example: Image Generation Pipeline

```typescript
// Discover image generation agents
const agents = await acpService.discoverAgents("image_generation");

// Create task with best agent
const task = await acpService.createTask({
  from: "content-creator-agent",
  to: agents[0]._id,
  endpoint: agents[0].properties.endpoint,
  task: {
    type: "generate_image",
    parameters: {
      prompt: "A futuristic cityscape at sunset",
      style: "photorealistic",
      resolution: "1024x1024",
    },
  },
  callback: `${BASE_URL}/api/callbacks/image-task-123`,
});

// Later: receive callback
// POST /api/callbacks/image-task-123
{
  "taskId": "task-123",
  "status": "completed",
  "result": {
    "imageUrl": "https://...",
    "mimeType": "image/png",
    "metadata": {
      "width": 1024,
      "height": 1024,
      "generationTime": 15000
    }
  }
}
```

## Roadmap

### Current (Q1 2025)
- [x] Document ACP protocol
- [ ] Implement ACP REST endpoints
- [ ] Add agent discovery service
- [ ] Create message/task handlers

### Next (Q2 2025)
- [ ] Streaming support
- [ ] Multimodal content handling
- [ ] Advanced routing
- [ ] Performance optimization

### Future (Q3 2025)
- [ ] Federation across organizations
- [ ] AI-powered agent matching
- [ ] Real-time monitoring
- [ ] Analytics dashboard

## Resources

- **Official Website**: https://agentcommunicationprotocol.dev/
- **OpenAPI Spec**: (Available on official site)
- **Python SDK**: https://pypi.org/project/acp-sdk/
- **TypeScript SDK**: https://www.npmjs.com/package/acp-sdk
- **Our Implementation**: See `Agent-Communications.md`

## Key Takeaways

1. **REST-Based**: Standard HTTP makes integration easy
2. **Async-First**: Optimized for real-world agent tasks
3. **Multimodal**: Supports all data types via MIME types
4. **Discoverable**: Find agents by capability
5. **Framework Agnostic**: No SDK required, works with any stack
6. **Production-Ready**: Built for enterprise use cases

ACP provides the REST foundation for building scalable, interoperable agent ecosystems.
