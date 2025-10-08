# A2A Protocol (Agent-to-Agent)

**Official Specification**: https://a2a-protocol.org/latest/

## Overview

The A2A (Agent2Agent) Protocol is an open standard developed by Google and donated to the Linux Foundation. It provides a universal communication language for AI agents to collaborate across different frameworks and platforms.

## Key Characteristics

### Purpose
- Break down communication silos between AI agents
- Enable interoperability across diverse agent frameworks
- Provide secure, standardized agent interactions
- Allow agents to preserve intellectual property during interactions

### Design Principles
1. **Framework Agnostic**: Works with any agent framework
2. **Secure Communication**: Agents interact without sharing internal details
3. **Task Delegation**: Agents can delegate sub-tasks to other agents
4. **Information Exchange**: Standardized format for data exchange
5. **Complex Coordination**: Enable multi-agent workflows

## Protocol Architecture

```
┌─────────────┐                           ┌─────────────┐
│  Agent A    │                           │  Agent B    │
│ (LangGraph) │                           │ (CrewAI)    │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │         A2A Protocol Messages           │
       │◄───────────────────────────────────────►│
       │                                         │
       │  - Task delegation                      │
       │  - Status updates                       │
       │  - Results exchange                     │
       │  - Error handling                       │
       │                                         │
```

## Compatible Frameworks

The A2A Protocol integrates with major agent frameworks:

- **LangGraph** - Graph-based agent workflows
- **CrewAI** - Multi-agent orchestration
- **Semantic Kernel** - Microsoft's agent framework
- **Cisco agntcy** - Enterprise agent platform
- **Custom Frameworks** - Any framework implementing the protocol

## Complementary Standards

### Model Context Protocol (MCP)
A2A works alongside MCP:
- **MCP**: Agent ↔ Tool/Resource communication
- **A2A**: Agent ↔ Agent communication

```
Agent A ──[MCP]──► Tools/Resources
   │
   └──[A2A]──► Agent B ──[MCP]──► Tools/Resources
```

## Core Capabilities

### 1. Task Delegation
Agents can delegate sub-tasks to other agents:

```typescript
// Agent A delegates research task to Agent B
const delegation = {
  type: "task_delegation",
  from: "agent-a",
  to: "agent-b",
  task: {
    type: "research",
    parameters: {
      topic: "quantum computing",
      depth: "detailed",
      sources: ["academic", "industry"],
    },
    callback: "https://agent-a.example.com/callbacks/task-123",
  },
};
```

### 2. Information Exchange
Standardized data exchange between agents:

```typescript
// Agent B sends results back to Agent A
const response = {
  type: "task_result",
  from: "agent-b",
  to: "agent-a",
  correlationId: "task-123",
  result: {
    status: "completed",
    data: {
      findings: [...],
      sources: [...],
      confidence: 0.95,
    },
  },
};
```

### 3. Coordination
Complex multi-agent workflows:

```typescript
// Agent orchestrating multiple sub-agents
const workflow = {
  type: "coordination",
  coordinator: "agent-orchestrator",
  participants: ["agent-a", "agent-b", "agent-c"],
  workflow: {
    steps: [
      { agent: "agent-a", task: "gather_data" },
      { agent: "agent-b", task: "analyze_data", depends: ["agent-a"] },
      { agent: "agent-c", task: "generate_report", depends: ["agent-b"] },
    ],
  },
};
```

## Message Structure

### Standard A2A Message Format

```typescript
interface A2AMessage {
  // Protocol version
  version: "1.0";

  // Message metadata
  messageId: string;
  correlationId?: string; // Links related messages
  timestamp: number;

  // Sender and receiver
  from: {
    agentId: string;
    endpoint: string;
    capabilities?: string[];
  };
  to: {
    agentId: string;
    endpoint: string;
  };

  // Message content
  message: {
    type:
      | "task_delegation"
      | "task_acceptance"
      | "task_rejection"
      | "task_result"
      | "status_update"
      | "error"
      | "query"
      | "response";
    content: unknown;
    mimeType: string;
  };

  // Optional metadata
  metadata?: {
    priority?: "low" | "medium" | "high" | "critical";
    timeout?: number; // milliseconds
    retryPolicy?: {
      maxRetries: number;
      backoff: "linear" | "exponential";
    };
    security?: {
      encrypted: boolean;
      signature?: string;
    };
  };
}
```

### Message Types

#### Task Delegation
```typescript
{
  type: "task_delegation",
  content: {
    task: string,
    parameters: Record<string, unknown>,
    callback: string,
    deadline?: number,
  }
}
```

#### Task Acceptance
```typescript
{
  type: "task_acceptance",
  content: {
    taskId: string,
    estimatedCompletion: number,
    capabilities: string[],
  }
}
```

#### Task Result
```typescript
{
  type: "task_result",
  content: {
    taskId: string,
    status: "completed" | "failed" | "partial",
    result: unknown,
    error?: {
      code: string,
      message: string,
    },
  }
}
```

#### Status Update
```typescript
{
  type: "status_update",
  content: {
    taskId: string,
    progress: number, // 0-100
    message: string,
    estimatedCompletion: number,
  }
}
```

## SDK Availability

Official SDKs are available in multiple languages:

### Python
```bash
pip install a2a-protocol
```

```python
from a2a import Agent, Message, TaskDelegation

# Create agent
agent = Agent(
    agent_id="my-agent",
    endpoint="https://my-agent.example.com",
    capabilities=["research", "analysis"]
)

# Send task delegation
message = TaskDelegation(
    to="agent-b",
    task="research",
    parameters={"topic": "AI agents"}
)

response = await agent.send(message)
```

### JavaScript/TypeScript
```bash
npm install @a2a-protocol/sdk
```

```typescript
import { Agent, TaskDelegation } from "@a2a-protocol/sdk";

// Create agent
const agent = new Agent({
  agentId: "my-agent",
  endpoint: "https://my-agent.example.com",
  capabilities: ["research", "analysis"],
});

// Send task delegation
const response = await agent.send(
  new TaskDelegation({
    to: "agent-b",
    task: "research",
    parameters: { topic: "AI agents" },
  })
);
```

### Java
```xml
<dependency>
    <groupId>org.a2a-protocol</groupId>
    <artifactId>a2a-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### C#/.NET
```bash
dotnet add package A2A.Protocol
```

### Golang
```bash
go get github.com/a2a-protocol/go-sdk
```

## Implementation in Our System

### Integration with Ontology

Map A2A concepts to our 4-table ontology:

**Entities**:
- Agent entities with A2A endpoint and capabilities

**Connections**:
- `communicates_with` - Active A2A communication channel
- `delegated_to` - Task delegation relationship

**Events**:
- `a2a_message_sent` - Outbound A2A message
- `a2a_message_received` - Inbound A2A message
- `a2a_task_delegated` - Task delegated via A2A
- `a2a_task_completed` - Task completed via A2A

**Tags**:
- A2A capabilities ("research", "analysis", "generation")

### Service Implementation

```typescript
// convex/services/agents/a2a.ts
export class A2AService extends Effect.Service<A2AService>()("A2AService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    return {
      // Send A2A message
      send: (message: A2AMessage) =>
        Effect.gen(function* () {
          // Log outbound message event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: message.from.agentId,
              eventType: "a2a_message_sent",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: message.to.agentId,
              metadata: {
                messageId: message.messageId,
                messageType: message.message.type,
                correlationId: message.correlationId,
              },
            })
          );

          // Send via HTTP
          const response = yield* Effect.tryPromise(() =>
            fetch(message.to.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-A2A-Version": message.version,
                "X-Message-Id": message.messageId,
              },
              body: JSON.stringify(message),
            })
          );

          return yield* Effect.promise(() => response.json());
        }),

      // Receive A2A message
      receive: (message: A2AMessage) =>
        Effect.gen(function* () {
          // Log inbound message event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              entityId: message.to.agentId,
              eventType: "a2a_message_received",
              timestamp: Date.now(),
              actorType: "agent",
              actorId: message.from.agentId,
              metadata: {
                messageId: message.messageId,
                messageType: message.message.type,
                correlationId: message.correlationId,
              },
            })
          );

          // Route to handler based on message type
          return yield* routeA2AMessage(message);
        }),
    };
  }),
  dependencies: [ConvexDatabase.Default],
}) {}
```

## Security Considerations

### Authentication
- Agent API keys
- Mutual TLS for sensitive communications
- JWT tokens for session management

### Authorization
- Capability-based access control
- Rate limiting per agent
- Audit logging in events table

### Data Privacy
- End-to-end encryption for sensitive payloads
- No sharing of internal agent memory
- GDPR-compliant data handling

## Best Practices

1. **Always Use Correlation IDs**: Link related messages for tracing
2. **Implement Timeouts**: Set reasonable timeouts for task delegation
3. **Handle Failures Gracefully**: Implement retry logic with backoff
4. **Log All Messages**: Store all A2A communications in events table
5. **Validate Capabilities**: Check agent capabilities before delegation
6. **Monitor Performance**: Track response times and success rates

## Error Handling

```typescript
interface A2AError {
  type: "error";
  content: {
    code:
      | "agent_not_found"
      | "task_rejected"
      | "timeout"
      | "invalid_message"
      | "capability_mismatch"
      | "internal_error";
    message: string;
    details?: unknown;
    retryable: boolean;
  };
}
```

## Example: Multi-Agent Research Pipeline

```typescript
// Agent A delegates research to Agent B (LangGraph)
const researchTask = await a2aService.send({
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "agent-a",
    endpoint: "https://agent-a.example.com",
    capabilities: ["orchestration"],
  },
  to: {
    agentId: "agent-b",
    endpoint: "https://agent-b.example.com",
  },
  message: {
    type: "task_delegation",
    content: {
      task: "research",
      parameters: { topic: "quantum computing", depth: "detailed" },
      callback: "https://agent-a.example.com/callbacks/task-123",
    },
    mimeType: "application/json",
  },
  metadata: {
    priority: "high",
    timeout: 300000, // 5 minutes
  },
});

// Agent B accepts task
// ... performs research ...

// Agent B sends results back
await a2aService.send({
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "agent-b",
    endpoint: "https://agent-b.example.com",
  },
  to: {
    agentId: "agent-a",
    endpoint: "https://agent-a.example.com",
  },
  message: {
    type: "task_result",
    content: {
      taskId: "task-123",
      status: "completed",
      result: {
        findings: [...],
        sources: [...],
      },
    },
    mimeType: "application/json",
  },
});
```

## Roadmap

### Current (Q1 2025)
- [x] Document A2A protocol
- [ ] Implement A2A service layer
- [ ] Add agent discovery
- [ ] Create message handlers

### Next (Q2 2025)
- [ ] Multi-agent orchestration
- [ ] Advanced error handling
- [ ] Performance monitoring
- [ ] Integration tests

### Future (Q3 2025)
- [ ] Cross-organization federation
- [ ] Advanced routing algorithms
- [ ] AI-powered agent matching
- [ ] Real-time monitoring dashboard

## Resources

- **Official Website**: https://a2a-protocol.org/latest/
- **GitHub**: (Check official site for repository)
- **Community**: Linux Foundation AI & Data
- **Our Implementation**: See `Agent-Communications.md`

## Key Takeaways

1. **Open Standard**: Backed by Linux Foundation, industry-wide adoption
2. **Framework Agnostic**: Works with any agent framework
3. **Secure**: Agents interact without exposing internals
4. **Scalable**: Supports complex multi-agent workflows
5. **Interoperable**: Enables cross-platform agent collaboration

The A2A Protocol is the foundation for building an "open internet" for AI agents to collaborate securely and efficiently.
