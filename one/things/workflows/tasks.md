# Task Organization System

**Version:** 1.0.0
**Purpose:** Define how the director agent assigns, tracks, and completes tasks using the 4-table ontology

---

## Overview

The task organization system enables the director agent to break down strategic goals (OKRs) into actionable tasks, delegate them to business agents, track progress, and ensure completion. Every task is a **thing** with **delegated** connections and **task_event** logging.

**Key Principle:** Tasks are entities in the ontology, not custom tables. This ensures consistency, auditability, and alignment with the 4-table universe.

---

## Task Thing Structure

### Thing Type: `task`

```typescript
{
  _id: Id<"things">,
  type: "task",
  name: string,                    // Task title (e.g., "Research quantum computing trends")
  properties: {
    taskType: "research" | "strategy" | "marketing" | "sales" | "service" | "design" | "engineering" | "finance" | "legal" | "intelligence",
    description: string,           // Detailed task description
    priority: "low" | "medium" | "high" | "critical",
    status: "pending" | "assigned" | "in_progress" | "blocked" | "completed" | "failed",
    deadline?: number,             // Unix timestamp
    estimatedDuration?: number,    // Minutes
    actualDuration?: number,       // Minutes (completed tasks)
    parameters: Record<string, any>, // Task-specific parameters
    result?: {                     // Task result (when completed)
      status: "success" | "partial" | "failed",
      data: any,
      summary: string,
      confidence?: number,
    },
    blockers?: {                   // If status is "blocked"
      reason: string,
      blockedBy?: Id<"things">,  // Blocking task ID
      unblockEstimate?: number,
    },
    parentTaskId?: Id<"things">,  // Parent task (for subtasks)
    organizationId: Id<"things">, // Organization this task belongs to
    creatorId: Id<"things">,      // User who created/requested this task
  },
  status: "active" | "archived",
  createdAt: number,
  updatedAt: number,
}
```

### Task Types Match Agent Types

The 10 business agent types determine task types:

1. **strategy** - Strategic planning, OKR creation, vision
2. **research** - Market research, competitive analysis, trends
3. **marketing** - Content strategy, SEO, campaigns
4. **sales** - Lead generation, funnel optimization, conversions
5. **service** - Customer support, onboarding, success
6. **design** - Brand identity, UI/UX, creative assets
7. **engineering** - Technical implementation, automation, integrations
8. **finance** - Revenue tracking, forecasting, budgeting
9. **legal** - Compliance, contracts, IP protection
10. **intelligence** - Analytics, insights, predictions

---

## Connections: Task Delegation

### Connection Type: `delegated`

Links director/user to agent via task:

```typescript
{
  _id: Id<"connections">,
  fromThingId: Id<"things">,      // Director agent or user
  toThingId: Id<"things">,        // Business agent (assignee)
  relationshipType: "delegated",
  metadata: {
    protocol: "a2a",              // Agent-to-Agent protocol
    taskId: Id<"things">,         // Task entity ID
    taskType: string,             // research, marketing, etc.
    assignedAt: number,
    deadline?: number,
    priority: string,
    status: "pending" | "accepted" | "rejected" | "in_progress" | "completed",
    acceptedAt?: number,
    rejectedReason?: string,
    completedAt?: number,
  },
  createdAt: number,
  updatedAt: number,
}
```

**Key Points:**
- Director creates task → assigns to agent via `delegated` connection
- Agent accepts/rejects via connection metadata update
- Progress tracked through connection status updates
- A2A protocol metadata enables cross-agent communication

---

## Events: Task Lifecycle

### Event Types

All task events use the consolidated `task_event` type with `metadata.action`:

```typescript
type TaskAction =
  | "created"       // Task created
  | "assigned"      // Task delegated to agent
  | "accepted"      // Agent accepted task
  | "rejected"      // Agent rejected task
  | "started"       // Agent started working
  | "progressed"    // Progress update
  | "blocked"       // Task blocked
  | "unblocked"     // Blocker resolved
  | "completed"     // Task completed successfully
  | "failed"        // Task failed
  | "archived";     // Task archived
```

### Event Structure

```typescript
{
  _id: Id<"events">,
  type: "task_event",
  actorId: Id<"things">,           // Director or agent
  targetId: Id<"things">,          // Task entity ID
  timestamp: number,
  metadata: {
    action: TaskAction,
    protocol: "a2a",               // For agent communication
    taskType: string,
    priority: string,
    status: string,
    progress?: number,             // 0-100
    message?: string,              // Status message
    result?: any,                  // Completion result
    error?: {
      code: string,
      message: string,
    },
    estimatedCompletion?: number,  // Timestamp
  }
}
```

---

## Task Creation Pattern

### From Director Agent

**Scenario:** Director breaks down an OKR into tasks for business agents.

```typescript
// convex/services/agents/director.ts
export class DirectorService extends Effect.Service<DirectorService>()(
  "DirectorService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const a2a = yield* A2AService;

      return {
        createTask: (args: CreateTaskArgs) =>
          Effect.gen(function* () {
            // 1. Create task entity
            const taskId = yield* Effect.tryPromise(() =>
              db.insert("things", {
                type: "task",
                name: args.title,
                properties: {
                  taskType: args.taskType,
                  description: args.description,
                  priority: args.priority,
                  status: "pending",
                  deadline: args.deadline,
                  parameters: args.parameters,
                  organizationId: args.organizationId,
                  creatorId: args.creatorId,
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // 2. Log task_event (created)
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "task_event",
                actorId: args.directorId,
                targetId: taskId,
                timestamp: Date.now(),
                metadata: {
                  action: "created",
                  protocol: "a2a",
                  taskType: args.taskType,
                  priority: args.priority,
                  status: "pending",
                },
              })
            );

            // 3. Find appropriate agent for taskType
            const agent = yield* findAgentForTask(args.taskType, args.organizationId);

            // 4. Delegate to agent via A2A
            yield* a2a.delegateTask({
              fromAgentId: args.directorId,
              toAgentId: agent._id,
              taskId,
              taskType: args.taskType,
              deadline: args.deadline,
            });

            return { success: true, taskId };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, A2AService.Default],
  }
) {}
```

---

## Task Delegation Pattern

### A2A Protocol Integration

```typescript
// convex/services/protocols/a2a.ts
export class A2AService extends Effect.Service<A2AService>()(
  "A2AService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        delegateTask: (args: DelegateTaskArgs) =>
          Effect.gen(function* () {
            // 1. Create delegated connection
            const connectionId = yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromThingId: args.fromAgentId,
                toThingId: args.toAgentId,
                relationshipType: "delegated",
                metadata: {
                  protocol: "a2a",
                  taskId: args.taskId,
                  taskType: args.taskType,
                  assignedAt: Date.now(),
                  deadline: args.deadline,
                  priority: args.priority,
                  status: "pending",
                },
                createdAt: Date.now(),
              })
            );

            // 2. Log task_event (assigned)
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "task_event",
                actorId: args.fromAgentId,
                targetId: args.taskId,
                timestamp: Date.now(),
                metadata: {
                  action: "assigned",
                  protocol: "a2a",
                  taskType: args.taskType,
                  assigneeId: args.toAgentId,
                  message: `Task delegated to ${args.taskType} agent`,
                },
              })
            );

            // 3. Send A2A message to agent
            yield* sendA2AMessage({
              from: args.fromAgentId,
              to: args.toAgentId,
              messageType: "task_delegation",
              payload: {
                taskId: args.taskId,
                taskType: args.taskType,
                deadline: args.deadline,
              },
            });

            return { success: true, connectionId };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

---

## Task Acceptance/Rejection

### Agent Accepts Task

```typescript
// Agent accepts task
export const acceptTask = confect.mutation({
  args: {
    taskId: v.id("things"),
    agentId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // 1. Find delegation connection
      const connection = yield* Effect.tryPromise(() =>
        ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", args.agentId)
              .eq("relationshipType", "delegated")
          )
          .filter((q) => q.eq(q.field("metadata.taskId"), args.taskId))
          .first()
      );

      if (!connection) {
        return yield* Effect.fail(new TaskNotFoundError());
      }

      // 2. Update connection status
      yield* Effect.tryPromise(() =>
        ctx.db.patch(connection._id, {
          metadata: {
            ...connection.metadata,
            status: "accepted",
            acceptedAt: Date.now(),
          },
          updatedAt: Date.now(),
        })
      );

      // 3. Update task status
      yield* Effect.tryPromise(() =>
        ctx.db.patch(args.taskId, {
          properties: {
            ...task.properties,
            status: "in_progress",
          },
          updatedAt: Date.now(),
        })
      );

      // 4. Log task_event (accepted)
      yield* Effect.tryPromise(() =>
        ctx.db.insert("events", {
          type: "task_event",
          actorId: args.agentId,
          targetId: args.taskId,
          timestamp: Date.now(),
          metadata: {
            action: "accepted",
            protocol: "a2a",
            status: "in_progress",
            message: "Agent accepted task and started work",
          },
        })
      );

      return { success: true };
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Task Completion Pattern

```typescript
// Agent completes task
export const completeTask = confect.mutation({
  args: {
    taskId: v.id("things"),
    agentId: v.id("things"),
    result: v.object({
      status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed")),
      data: v.any(),
      summary: v.string(),
      confidence: v.optional(v.number()),
    }),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      // 1. Update task with result
      const task = yield* Effect.tryPromise(() => ctx.db.get(args.taskId));

      yield* Effect.tryPromise(() =>
        ctx.db.patch(args.taskId, {
          properties: {
            ...task.properties,
            status: "completed",
            result: args.result,
            actualDuration: Date.now() - task.createdAt,
          },
          updatedAt: Date.now(),
        })
      );

      // 2. Update delegation connection
      const connection = yield* Effect.tryPromise(() =>
        ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", args.agentId)
              .eq("relationshipType", "delegated")
          )
          .filter((q) => q.eq(q.field("metadata.taskId"), args.taskId))
          .first()
      );

      yield* Effect.tryPromise(() =>
        ctx.db.patch(connection._id, {
          metadata: {
            ...connection.metadata,
            status: "completed",
            completedAt: Date.now(),
          },
          updatedAt: Date.now(),
        })
      );

      // 3. Log task_event (completed)
      yield* Effect.tryPromise(() =>
        ctx.db.insert("events", {
          type: "task_event",
          actorId: args.agentId,
          targetId: args.taskId,
          timestamp: Date.now(),
          metadata: {
            action: "completed",
            protocol: "a2a",
            status: "completed",
            result: args.result,
            message: args.result.summary,
          },
        })
      );

      return { success: true };
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Querying Tasks

### Get All Tasks for Organization

```typescript
export const getOrganizationTasks = confect.query({
  args: {
    organizationId: v.id("things"),
    status: v.optional(v.string()),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      let query = ctx.db
        .query("things")
        .withIndex("by_type", (q) => q.eq("type", "task"))
        .filter((q) =>
          q.eq(q.field("properties.organizationId"), args.organizationId)
        );

      if (args.status) {
        query = query.filter((q) =>
          q.eq(q.field("properties.status"), args.status)
        );
      }

      const tasks = yield* Effect.tryPromise(() => query.collect());

      return tasks;
    }).pipe(Effect.provide(MainLayer)),
});
```

### Get Tasks by Agent

```typescript
export const getAgentTasks = confect.query({
  args: {
    agentId: v.id("things"),
    status: v.optional(v.string()),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      // Find delegated connections
      const connections = yield* Effect.tryPromise(() =>
        ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", args.agentId)
              .eq("relationshipType", "delegated")
          )
          .collect()
      );

      // Get task IDs
      const taskIds = connections.map((c) => c.metadata.taskId);

      // Fetch tasks
      const tasks = yield* Effect.tryPromise(() =>
        Promise.all(taskIds.map((id) => ctx.db.get(id)))
      );

      // Filter by status if provided
      const filtered = args.status
        ? tasks.filter((t) => t?.properties.status === args.status)
        : tasks;

      return filtered.filter(Boolean);
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Task Analytics

### Get Task Statistics

```typescript
export const getTaskStats = confect.query({
  args: {
    organizationId: v.id("things"),
    period: v.optional(v.number()), // Days
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const since = args.period
        ? Date.now() - args.period * 24 * 60 * 60 * 1000
        : 0;

      // Get all tasks
      const tasks = yield* Effect.tryPromise(() =>
        ctx.db
          .query("things")
          .withIndex("by_type", (q) => q.eq("type", "task"))
          .filter((q) =>
            q
              .eq(q.field("properties.organizationId"), args.organizationId)
              .gte(q.field("createdAt"), since)
          )
          .collect()
      );

      // Calculate stats
      const stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.properties.status === "pending").length,
        inProgress: tasks.filter((t) => t.properties.status === "in_progress")
          .length,
        completed: tasks.filter((t) => t.properties.status === "completed")
          .length,
        failed: tasks.filter((t) => t.properties.status === "failed").length,
        blocked: tasks.filter((t) => t.properties.status === "blocked").length,
        byType: tasks.reduce((acc, t) => {
          const type = t.properties.taskType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageCompletionTime:
          tasks
            .filter((t) => t.properties.actualDuration)
            .reduce((sum, t) => sum + t.properties.actualDuration, 0) /
          tasks.filter((t) => t.properties.actualDuration).length,
      };

      return stats;
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Best Practices

### 1. Always Use Ontology
- Tasks are things, not custom tables
- Use `delegated` connections for assignment
- Log all lifecycle events with `task_event`

### 2. Protocol Metadata
- Always include `metadata.protocol: "a2a"` for agent communication
- Store task-specific data in connection metadata

### 3. Status Transitions
- Track status changes through events
- Update both task and connection when status changes
- Include timestamps for audit trails

### 4. Error Handling
- Log `task_event` with `action: "failed"` on errors
- Store error details in event metadata
- Update task status to "failed" or "blocked"

### 5. Subtask Hierarchy
- Use `properties.parentTaskId` for task breakdown
- Maintain parent-child relationships
- Complete parent only when all subtasks complete

---

## Example: Complete Task Flow

```typescript
// Director creates task
const { taskId } = await directorService.createTask({
  title: "Research quantum computing trends",
  taskType: "research",
  description: "Analyze current trends in quantum computing",
  priority: "high",
  deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  parameters: {
    topics: ["quantum algorithms", "error correction", "hardware"],
    depth: "detailed",
    sources: ["academic", "industry"],
  },
  organizationId: "org_123",
  creatorId: "user_456",
  directorId: "director_789",
});

// A2A service delegates to research agent
// Research agent receives task via A2A protocol
// Agent accepts task
await acceptTask({
  taskId,
  agentId: "research_agent_001",
});

// Agent works on task
// ... performs research ...

// Agent completes task
await completeTask({
  taskId,
  agentId: "research_agent_001",
  result: {
    status: "success",
    data: {
      findings: [...],
      sources: [...],
      trends: [...],
    },
    summary: "Identified 5 key trends in quantum computing...",
    confidence: 0.92,
  },
});

// Query completed tasks
const completed = await getOrganizationTasks({
  organizationId: "org_123",
  status: "completed",
});
```

---

## Summary

The task organization system provides:

1. **Ontology-aligned** - Tasks are things, delegation is connections, lifecycle is events
2. **A2A protocol** - Cross-agent communication via standard protocol
3. **Complete auditability** - Every action logged as event
4. **Flexible** - Supports all 10 agent types
5. **Scalable** - Efficient queries, proper indexes

**This system enables the director to orchestrate complex workflows across business agents while maintaining complete transparency and traceability.**
