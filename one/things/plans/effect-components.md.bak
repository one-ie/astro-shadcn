# Production Integration Guide: Effect.ts + Confect + Convex Components for AI Agents

**Building sophisticated multi-agent systems with functional patterns, type safety, and durable workflows**

Effect.ts and Confect bring powerful functional programming patterns to Convex's already robust backend platform. While no official Effect integrations exist yet for Convex components, this guide provides production-ready patterns for combining these technologies to build reliable, type-safe AI agent systems.

## Integration Philosophy: Effect Wraps Components, Not Replaces

The key insight is that **Effect.ts enhances business logic composition while Convex components handle infrastructure concerns**. Components like Agent, Workflow, and RAG provide production-tested patterns that you wrap with Effect for better error handling, dependency injection, and testability.

```typescript
// WRONG: Trying to replace components with Effect
const myOwnAgentLogic = Effect.gen(function* () {...})

// RIGHT: Wrapping components with Effect for better composition
const agentWithEffect = (agent: Agent) => Effect.gen(function* () {
  const result = yield* Effect.tryPromise({
    try: () => agent.generateText(ctx, { threadId }, { prompt }),
    catch: (error) => new AgentExecutionError({ cause: error })
  })
  return result
})
```

## Integration Patterns by Component

### 1. @convex-dev/agent with Effect Integration

**Where Effect Adds Value**: Business logic orchestration, error handling, composing multiple agent calls, dependency injection for services used by tools.

**Where to Use Component Directly**: Thread/message management, streaming, built-in RAG, tool calling infrastructure.

#### Pattern: Effect-Wrapped Agent Execution

```typescript
import { Effect, Context } from "effect"
import { Agent } from "@convex-dev/agent"
import { openai } from "@ai-sdk/openai"
import { components } from "./_generated/api"

// Define errors as tagged classes
class AgentError extends Data.TaggedError("AgentError")<{
  agentName: string
  cause: unknown
}> {}

// Service definition for agent
class AgentService extends Context.Tag("AgentService")<
  AgentService,
  {
    readonly generateResponse: (
      ctx: ActionCtx,
      threadId: string,
      prompt: string
    ) => Effect.Effect<string, AgentError>
  }
>() {}

// Implementation with Effect
const AgentServiceLive = Layer.effect(
  AgentService,
  Effect.gen(function* () {
    // Agent component handles infrastructure
    const supportAgent = new Agent(components.agent, {
      name: "Support Agent",
      chat: openai.chat("gpt-4o-mini"),
      instructions: "You are a helpful assistant.",
      tools: { /* ... */ }
    })
    
    return {
      generateResponse: (ctx, threadId, prompt) =>
        Effect.tryPromise({
          try: async () => {
            const { thread } = await supportAgent.continueThread(ctx, { threadId })
            const result = await thread.generateText({ prompt })
            return result.text
          },
          catch: (error) => new AgentError({
            agentName: "Support Agent",
            cause: error
          })
        })
    }
  })
)
```

#### Pattern: Composing Multiple Agents with Effect

```typescript
// Multi-agent orchestration with Effect
export const multiAgentPipeline = action({
  args: { prompt: v.string(), userId: v.string() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const agentService = yield* AgentService
      const ragService = yield* RAGService
      
      // Sequential with automatic error propagation
      const context = yield* ragService.search(args.prompt)
      const classification = yield* agentService.classify(ctx, args.prompt)
      
      // Conditional routing
      const response = yield* classification.intent === "technical"
        ? agentService.technicalAgent(ctx, args.prompt, context)
        : agentService.generalAgent(ctx, args.prompt, context)
      
      // Parallel quality checks
      const [grammar, factuality] = yield* Effect.all([
        agentService.checkGrammar(response),
        agentService.checkFactuality(response, context)
      ], { concurrency: 2 })
      
      return { response, grammar, factuality }
    }).pipe(
      Effect.provide(Layer.merge(AgentServiceLive, RAGServiceLive)),
      Effect.catchAll((error) => {
        console.error("Multi-agent pipeline failed:", error)
        return Effect.succeed({ 
          response: "I'm having trouble processing that request.",
          error: true 
        })
      })
    )
})
```

#### Pattern: Effect-Based Tool Definitions

```typescript
import { createTool } from "@convex-dev/agent"
import { z } from "zod"

// Define service for external integrations
class EmailService extends Context.Tag("EmailService")<
  EmailService,
  {
    readonly send: (to: string, subject: string, body: string) 
      => Effect.Effect<void, EmailError>
  }
>() {}

const EmailServiceLive = Layer.succeed(EmailService, {
  send: (to, subject, body) =>
    Effect.tryPromise({
      try: () => sendgrid.send({ to, subject, body }),
      catch: (error) => new EmailError({ cause: error })
    })
})

// Tool that uses Effect internally
export const emailTool = createTool({
  description: "Send an email to a user",
  args: z.object({
    userEmail: z.string().email(),
    subject: z.string(),
    message: z.string()
  }),
  handler: async (toolCtx, args) => {
    // Convert Effect to Promise for tool handler
    const program = Effect.gen(function* () {
      const emailService = yield* EmailService
      yield* emailService.send(args.userEmail, args.subject, args.message)
      return "Email sent successfully"
    })
    
    return await Effect.runPromise(
      program.pipe(
        Effect.provide(EmailServiceLive),
        Effect.catchAll((error) => 
          Effect.succeed(`Failed to send email: ${error.message}`)
        )
      )
    )
  }
})

const agent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o"),
  tools: { sendEmail: emailTool }
})
```

**Type Safety Considerations**:

- Effect's error channel tracks all possible failures
- Tool context provides typed access to `userId`, `threadId`, `messageId`
- Convert Effects to Promises at the tool boundary using `Effect.runPromise`
- Use `Effect.tryPromise` to wrap agent component calls

---

### 2. @convex-dev/persistent-text-streaming with Effect

**Where Effect Adds Value**: Error recovery during streaming, composing stream generation with other services, handling stream lifecycle.

**Where to Use Component Directly**: WebSocket delivery, delta storage, client subscription.

#### Pattern: Effect-Managed Streaming Lifecycle

```typescript
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming"
import { Effect, Stream } from "effect"

class StreamingService extends Context.Tag("StreamingService")<
  StreamingService,
  {
    readonly generateStream: (
      ctx: ActionCtx,
      prompt: string,
      streamId: string
    ) => Effect.Effect<void, StreamingError>
  }
>() {}

const StreamingServiceLive = Layer.effect(
  StreamingService,
  Effect.gen(function* () {
    const persistentTextStreaming = new PersistentTextStreaming(
      components.persistentTextStreaming
    )
    
    const llmService = yield* LLMService
    
    return {
      generateStream: (ctx, prompt, streamId) =>
        Effect.gen(function* () {
          // Fetch context with Effect error handling
          const context = yield* Effect.tryPromise({
            try: () => ctx.runQuery(api.chat.getContext, { streamId }),
            catch: () => new ContextFetchError()
          })
          
          // Stream with Effect composition
          const stream = yield* llmService.streamCompletion(prompt, context)
          
          // Handle chunks with backpressure
          yield* Stream.fromAsyncIterable(stream, () => 
            new StreamProcessingError()
          ).pipe(
            Stream.mapEffect((chunk) =>
              Effect.tryPromise({
                try: async () => {
                  await persistentTextStreaming.appendChunk(ctx, streamId, chunk)
                },
                catch: () => new ChunkAppendError({ chunk })
              })
            ),
            Stream.runDrain
          )
          
          // Mark complete
          yield* Effect.tryPromise({
            try: () => 
              ctx.runMutation(api.chat.markComplete, { streamId }),
            catch: () => new StreamCompletionError()
          })
        }).pipe(
          Effect.retry(Schedule.exponential("100 millis").pipe(
            Schedule.compose(Schedule.recurs(3))
          ))
        )
    }
  })
)
```

**Recommendation**: Use Agent component's built-in streaming (`saveStreamDeltas: true`) for most use cases. Only use persistent-text-streaming if you need HTTP streaming for the initiating client specifically.

---

### 3. @convex-dev/rate-limiter with Effect

**Where Effect Adds Value**: Composing rate limiting with business logic, handling rate limit errors functionally, coordinating multiple rate limits.

**Where to Use Component Directly**: Token bucket/fixed window algorithms, per-user isolation, capacity reservation.

#### Pattern: Effect Service Layer with Rate Limiting

```typescript
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter"
import { Effect, Schedule } from "effect"

class RateLimitedLLMService extends Context.Tag("RateLimitedLLMService")<
  RateLimitedLLMService,
  {
    readonly generateCompletion: (
      ctx: ActionCtx,
      userId: string,
      prompt: string
    ) => Effect.Effect<string, RateLimitError | LLMError>
  }
>() {}

const RateLimitedLLMServiceLive = Layer.effect(
  RateLimitedLLMService,
  Effect.gen(function* () {
    const rateLimiter = new RateLimiter(components.rateLimiter, {
      llmRequests: { 
        kind: "token bucket", 
        rate: 20, 
        period: MINUTE,
        capacity: 30
      },
      llmTokens: { 
        kind: "token bucket", 
        rate: 40000, 
        period: MINUTE,
        shards: 10
      }
    })
    
    return {
      generateCompletion: (ctx, userId, prompt) =>
        Effect.gen(function* () {
          // Check request limit
          const requestLimit = yield* Effect.tryPromise({
            try: () => rateLimiter.limit(ctx, "llmRequests", { 
              key: userId,
              reserve: true 
            }),
            catch: () => new RateLimiterError()
          })
          
          if (!requestLimit.ok) {
            return yield* Effect.fail(new RateLimitError({
              type: "requests",
              retryAfter: requestLimit.retryAfter
            }))
          }
          
          // Estimate token usage
          const estimatedTokens = Math.ceil(prompt.length / 4)
          
          const tokenLimit = yield* Effect.tryPromise({
            try: () => rateLimiter.limit(ctx, "llmTokens", {
              key: userId,
              count: estimatedTokens
            }),
            catch: () => new RateLimiterError()
          })
          
          if (!tokenLimit.ok) {
            return yield* Effect.fail(new RateLimitError({
              type: "tokens",
              retryAfter: tokenLimit.retryAfter
            }))
          }
          
          // Make LLM call
          const result = yield* Effect.tryPromise({
            try: () => openai.chat.completions.create({
              model: "gpt-4",
              messages: [{ role: "user", content: prompt }]
            }),
            catch: (error) => new LLMError({ cause: error })
          })
          
          return result.choices[0].message.content
        }).pipe(
          // Automatic retry with exponential backoff on rate limits
          Effect.retry(
            Schedule.exponential("1 second").pipe(
              Schedule.whileInput((error: RateLimitError | LLMError) =>
                error._tag === "RateLimitError"
              ),
              Schedule.recurs(5)
            )
          )
        )
    }
  })
)
```

#### Pattern: Multi-Level Rate Limiting with Effect

```typescript
// Service that coordinates user and global rate limits
export const protectedAgentCall = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const rateLimitService = yield* RateLimitService
      
      // Check multiple limits in parallel
      const [userLimit, globalLimit] = yield* Effect.all([
        rateLimitService.checkUserLimit(ctx, args.userId),
        rateLimitService.checkGlobalLimit(ctx)
      ], { concurrency: 2 })
      
      // Fail fast if any limit exceeded
      if (!userLimit.ok) {
        return yield* Effect.fail(new UserRateLimitExceeded({
          retryAfter: userLimit.retryAfter
        }))
      }
      
      if (!globalLimit.ok) {
        return yield* Effect.fail(new GlobalRateLimitExceeded({
          retryAfter: globalLimit.retryAfter
        }))
      }
      
      // Execute with agent
      const agentService = yield* AgentService
      const result = yield* agentService.generateResponse(
        ctx, 
        args.userId, 
        args.prompt
      )
      
      return result
    }).pipe(
      Effect.provide(Layer.merge(RateLimitServiceLive, AgentServiceLive)),
      Effect.catchTag("UserRateLimitExceeded", (error) =>
        Effect.succeed({
          error: "You've reached your request limit. Please try again later.",
          retryAfter: error.retryAfter
        })
      )
    )
})
```

**Type Safety Considerations**:

- Effect's error channel explicitly tracks rate limit vs other errors
- Use `Effect.retry` with `Schedule.whileInput` for smart retry logic
- `Effect.all` enables parallel rate limit checks
- Convert Promise-based rate limiter to Effect with `Effect.tryPromise`

---

### 4. @convex-dev/retrier with Effect

**Where Effect Adds Value**: Coordinating retries across multiple operations, custom retry policies, composing retry logic with other effects.

**Where to Use Component Directly**: Action retries with persistent state, status tracking, completion callbacks.

#### Pattern: Effect-Based Retry Orchestration

```typescript
import { ActionRetrier } from "@convex-dev/action-retrier"
import { Effect, Schedule } from "effect"

class ResilientExecutionService extends Context.Tag("ResilientExecutionService")<
  ResilientExecutionService,
  {
    readonly executeWithRetry: <A>(
      ctx: MutationCtx,
      action: FunctionReference<"action">,
      args: any
    ) => Effect.Effect<A, ExecutionError>
  }
>() {}

const ResilientExecutionServiceLive = Layer.effect(
  ResilientExecutionService,
  Effect.gen(function* () {
    const retrier = new ActionRetrier(components.actionRetrier, {
      initialBackoffMs: 250,
      base: 2,
      maxFailures: 4
    })
    
    return {
      executeWithRetry: (ctx, action, args) =>
        Effect.gen(function* () {
          // Start retry execution
          const runId = yield* Effect.tryPromise({
            try: () => retrier.run(ctx, action, args),
            catch: () => new RetrierStartError()
          })
          
          // Poll for completion with Effect
          const result = yield* Effect.repeat(
            Effect.gen(function* () {
              const status = yield* Effect.tryPromise({
                try: () => retrier.status(ctx, runId),
                catch: () => new StatusCheckError()
              })
              
              if (status.type === "inProgress") {
                return yield* Effect.fail(Option.none()) // Continue polling
              }
              
              return status.result
            }),
            Schedule.spaced("500 millis").pipe(
              Schedule.compose(Schedule.recurs(60)) // Max 30 seconds
            )
          ).pipe(
            Effect.catchAll((error) =>
              Effect.fail(new ExecutionTimeout({ runId }))
            )
          )
          
          // Handle result
          if (result.type === "success") {
            return result.returnValue
          } else if (result.type === "failed") {
            return yield* Effect.fail(new ExecutionFailed({ 
              error: result.error 
            }))
          } else {
            return yield* Effect.fail(new ExecutionCanceled())
          }
        })
    }
  })
)
```

#### Pattern: Combining Retrier with Custom Effect Retry

```typescript
// Use retrier for infrastructure-level retries,
// Effect for application-level retries
export const reliableWorkflow = mutation({
  args: { userId: v.string(), data: v.any() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const resilientService = yield* ResilientExecutionService
      
      // Effect-level retry for transient errors
      const validated = yield* Effect.retry(
        validateUserData(args.data),
        Schedule.exponential("100 millis").pipe(
          Schedule.compose(Schedule.recurs(3))
        )
      )
      
      // Retrier-level retry for action execution
      const processed = yield* resilientService.executeWithRetry(
        ctx,
        internal.processing.processData,
        { userId: args.userId, data: validated }
      )
      
      return processed
    }).pipe(
      Effect.provide(ResilientExecutionServiceLive),
      Effect.catchAll((error) => {
        console.error("Workflow failed:", error)
        return Effect.fail(new ConvexError("Workflow execution failed"))
      })
    )
})
```

**Recommendation**: Use component's retrier for long-running actions with persistent state. Use Effect's `Effect.retry` for in-memory retries of short operations.

---

### 5. @convex-dev/workpool with Effect

**Where Effect Adds Value**: Composing work queue operations, error handling for enqueued tasks, coordinating multiple workpools.

**Where to Use Component Directly**: Task queuing, parallelism control, completion callbacks.

#### Pattern: Effect Service Layer for Workpool

```typescript
import { Workpool } from "@convex-dev/workpool"
import { Effect, Queue } from "effect"

class TaskQueueService extends Context.Tag("TaskQueueService")<
  TaskQueueService,
  {
    readonly enqueueTask: <A>(
      ctx: MutationCtx,
      priority: "high" | "low",
      action: FunctionReference<"action">,
      args: any
    ) => Effect.Effect<string, EnqueueError>
    
    readonly getTaskStatus: (
      ctx: QueryCtx,
      taskId: string
    ) => Effect.Effect<TaskStatus, StatusError>
  }
>() {}

const TaskQueueServiceLive = Layer.effect(
  TaskQueueService,
  Effect.gen(function* () {
    const highPriorityPool = new Workpool(components.highPriorityWorkpool, {
      maxParallelism: 20,
      retryActionsByDefault: true
    })
    
    const lowPriorityPool = new Workpool(components.lowPriorityWorkpool, {
      maxParallelism: 5,
      retryActionsByDefault: true
    })
    
    return {
      enqueueTask: (ctx, priority, action, args) =>
        Effect.gen(function* () {
          const pool = priority === "high" ? highPriorityPool : lowPriorityPool
          
          const taskId = yield* Effect.tryPromise({
            try: () => pool.enqueueAction(ctx, action, args, {
              onComplete: internal.tasks.handleCompletion,
              context: { priority }
            }),
            catch: (error) => new EnqueueError({ cause: error })
          })
          
          return taskId
        }),
      
      getTaskStatus: (ctx, taskId) =>
        Effect.tryPromise({
          try: () => highPriorityPool.status(taskId).then(status =>
            status ?? lowPriorityPool.status(taskId)
          ),
          catch: () => new StatusError({ taskId })
        })
    }
  })
)
```

#### Pattern: Batch Task Enqueuing with Effect

```typescript
export const processBatch = mutation({
  args: { items: v.array(v.any()) },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const taskQueue = yield* TaskQueueService
      
      // Enqueue all tasks in parallel
      const taskIds = yield* Effect.all(
        args.items.map(item =>
          taskQueue.enqueueTask(ctx, "low", internal.tasks.processItem, item)
        ),
        { concurrency: 10 }
      )
      
      return { taskIds, count: taskIds.length }
    }).pipe(
      Effect.provide(TaskQueueServiceLive),
      Effect.catchAll((error) => {
        console.error("Batch processing failed:", error)
        return Effect.succeed({ taskIds: [], count: 0, error: true })
      })
    )
})
```

---

### 6. @convex-dev/workflow with Effect

**Where Effect Adds Value**: Business logic in workflow steps, error handling across steps, service composition in workflows.

**Where to Use Component Directly**: Durable execution, journaling, long-running operations, retry policies.

#### Pattern: Effect Services in Workflow Steps

```typescript
import { WorkflowManager } from "@convex-dev/workflow"
import { Effect } from "effect"

const workflow = new WorkflowManager(components.workflow, {
  defaultRetryBehavior: {
    maxAttempts: 3,
    initialBackoffMs: 1000,
    base: 2
  }
})

export const aiAgentWorkflow = workflow.define({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (step, args): Promise<WorkflowResult> => {
    // Step 1: Fetch user context (query)
    const userContext = await step.runQuery(
      internal.workflows.getUserContext,
      { userId: args.userId }
    )
    
    // Step 2: Generate initial response with Effect composition (action)
    const initialResponse = await step.runAction(
      internal.workflows.generateResponseWithEffect,
      { prompt: args.prompt, context: userContext }
    )
    
    // Step 3: Quality check in parallel (actions)
    const [grammarScore, factualityScore] = await Promise.all([
      step.runAction(internal.workflows.checkGrammar, { text: initialResponse }),
      step.runAction(internal.workflows.checkFactuality, { text: initialResponse })
    ])
    
    // Step 4: Refine if needed (action with conditional logic)
    const finalResponse = grammarScore < 0.8 || factualityScore < 0.8
      ? await step.runAction(
          internal.workflows.refineResponse,
          { original: initialResponse, context: userContext },
          { retry: { maxAttempts: 2 } }
        )
      : initialResponse
    
    // Step 5: Save result (mutation)
    await step.runMutation(
      internal.workflows.saveResult,
      { userId: args.userId, response: finalResponse }
    )
    
    return { response: finalResponse, refined: finalResponse !== initialResponse }
  }
})

// The action called by the workflow uses Effect internally
export const generateResponseWithEffect = internalAction({
  args: { prompt: v.string(), context: v.any() },
  handler: async (ctx, args) => {
    // Use Effect for business logic composition
    const program = Effect.gen(function* () {
      const agentService = yield* AgentService
      const ragService = yield* RAGService
      
      // Enrich context with RAG
      const enrichedContext = yield* ragService.search(args.prompt)
      
      // Generate with agent
      const response = yield* agentService.generateResponse(
        ctx,
        args.prompt,
        { ...args.context, rag: enrichedContext }
      )
      
      return response
    })
    
    return await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.merge(AgentServiceLive, RAGServiceLive)),
        Effect.catchAll((error) => {
          console.error("Generation failed:", error)
          return Effect.succeed("I apologize, but I'm having trouble generating a response.")
        })
      )
    )
  }
})
```

**Key Pattern**: Workflow component handles durability and retry at the step level. Use Effect within actions for business logic composition and error handling.

---

### 7. @convex-dev/rag with Effect

**Where Effect Adds Value**: Composing RAG with other services, custom embedding generation, error handling for vector operations.

**Where to Use Component Directly**: Vector storage, semantic search, chunking, filtering.

#### Pattern: Effect Service Layer for RAG

```typescript
import { RAG } from "@convex-dev/rag"
import { openai } from "@ai-sdk/openai"
import { Effect } from "effect"

class RAGService extends Context.Tag("RAGService")<
  RAGService,
  {
    readonly addDocument: (
      ctx: ActionCtx,
      namespace: string,
      content: string,
      metadata: Record<string, any>
    ) => Effect.Effect<string, RAGError>
    
    readonly search: (
      ctx: ActionCtx,
      namespace: string,
      query: string,
      limit?: number
    ) => Effect.Effect<SearchResults, RAGError>
  }
>() {}

const RAGServiceLive = Layer.effect(
  RAGService,
  Effect.gen(function* () {
    const rag = new RAG(components.rag, {
      textEmbeddingModel: openai.embedding("text-embedding-3-small"),
      embeddingDimension: 1536
    })
    
    return {
      addDocument: (ctx, namespace, content, metadata) =>
        Effect.gen(function* () {
          // Pre-process content with Effect
          const processed = yield* preprocessContent(content)
          
          // Add to RAG
          const entryId = yield* Effect.tryPromise({
            try: () => rag.add(ctx, {
              namespace,
              text: processed,
              filterValues: Object.entries(metadata).map(([name, value]) => ({
                name,
                value
              })),
              onComplete: internal.rag.handleComplete
            }),
            catch: (error) => new RAGAddError({ cause: error })
          })
          
          return entryId.entryId
        }),
      
      search: (ctx, namespace, query, limit = 10) =>
        Effect.tryPromise({
          try: () => rag.search(ctx, {
            namespace,
            query,
            limit,
            chunkContext: { before: 1, after: 1 },
            vectorScoreThreshold: 0.6
          }),
          catch: (error) => new RAGSearchError({ cause: error })
        })
    }
  })
)
```

#### Pattern: Composing RAG with Agent Using Effect

```typescript
// Agent tool that uses RAG service
export const contextualAnswerAgent = action({
  args: { userId: v.string(), question: v.string() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const ragService = yield* RAGService
      const agentService = yield* AgentService
      
      // Fetch relevant context
      const searchResults = yield* ragService.search(
        ctx,
        args.userId, // User-specific namespace
        args.question,
        8
      )
      
      // Generate answer with context
      const answer = yield* agentService.generateWithContext(
        ctx,
        args.question,
        searchResults.text
      )
      
      return {
        answer,
        sources: searchResults.entries.map(e => ({
          id: e.entryId,
          title: e.title,
          relevance: e.score
        }))
      }
    }).pipe(
      Effect.provide(Layer.merge(RAGServiceLive, AgentServiceLive)),
      Effect.catchAll((error) => {
        console.error("Contextual answer failed:", error)
        return Effect.succeed({
          answer: "I'm having trouble finding relevant information.",
          sources: [],
          error: true
        })
      })
    )
})
```

---

### 8. @convex-dev/crons with Effect

**Where Effect Adds Value**: Scheduled job logic composition, error handling in cron jobs, service orchestration.

**Where to Use Component Directly**: Dynamic cron registration, schedule management.

#### Pattern: Effect-Based Cron Job Logic

```typescript
import { Crons } from "@convex-dev/crons"
import { Effect } from "effect"

// Register cron that executes Effect-based business logic
export const setupDailyCron = internalMutation({
  handler: async (ctx) => {
    const crons = new Crons(components.crons)
    
    await crons.register(
      ctx,
      { kind: "cron", cronspec: "0 0 * * *" }, // Daily at midnight
      internal.crons.dailyMaintenanceWithEffect,
      {},
      "daily-maintenance"
    )
  }
})

// Cron job uses Effect for composition
export const dailyMaintenanceWithEffect = internalAction({
  handler: async (ctx) => {
    const program = Effect.gen(function* () {
      const ragService = yield* RAGService
      const monitoringService = yield* MonitoringService
      
      // Clean up old content
      yield* Effect.tryPromise({
        try: () => ctx.runMutation(internal.rag.cleanupOldContent, {}),
        catch: () => new CleanupError()
      })
      
      // Generate daily report
      const report = yield* monitoringService.generateDailyReport(ctx)
      
      // Send to admin
      yield* Effect.tryPromise({
        try: () => ctx.runAction(internal.email.sendReport, { report }),
        catch: () => new EmailError()
      })
      
      return { success: true, report }
    })
    
    await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.merge(RAGServiceLive, MonitoringServiceLive)),
        Effect.catchAll((error) => {
          console.error("Daily maintenance failed:", error)
          return Effect.succeed({ success: false, error })
        })
      )
    )
  }
})
```

---

## Confect Integration: Full Effect.ts Integration for Convex

**Confect** (by rjdellecese) provides comprehensive Effect.ts integration with Convex, enabling Effect-native function definitions and database operations.

### When to Use Confect

**Use Confect if:**

- Your team is already invested in Effect.ts patterns
- You want Effect schemas instead of Convex validators
- You need deep Effect integration throughout your codebase
- You want `Option<A>` instead of `A | null` everywhere
- You're building a new project from scratch

**Use manual Effect integration (patterns above) if:**

- You have an existing Convex project
- You want to adopt Effect gradually
- Your team is learning Effect.ts
- You need to maintain compatibility with existing Convex patterns

### Confect Architecture

```typescript
// convex/schema.ts - Define schema with Effect Schema
import { Id, defineSchema, defineTable } from "@rjdellecese/confect/server"
import { Schema } from "effect"

export const confectSchema = defineSchema({
  users: defineTable(
    Schema.Struct({
      username: Schema.String,
      email: Schema.String.pipe(Schema.maxLength(100)),
      role: Schema.Literal("admin", "user")
    })
  ),
  
  threads: defineTable(
    Schema.Struct({
      userId: Id.Id("users"),
      title: Schema.String,
      messages: Schema.Array(
        Schema.Struct({
          role: Schema.Literal("user", "assistant"),
          content: Schema.String
        })
      )
    })
  ).index("by_user", ["userId"])
})

export default confectSchema.convexSchemaDefinition
```

```typescript
// convex/confect.ts - Generate function constructors
import {
  ConfectActionCtx as ConfectActionCtxService,
  type ConfectActionCtx as ConfectActionCtxType,
  ConfectMutationCtx as ConfectMutationCtxService,
  type ConfectMutationCtx as ConfectMutationCtxType,
  ConfectQueryCtx as ConfectQueryCtxService,
  type ConfectQueryCtx as ConfectQueryCtxType,
  makeFunctions
} from "@rjdellecese/confect/server"

import { confectSchema } from "./schema"

export const { query, mutation, action, internalQuery, internalMutation, internalAction } = 
  makeFunctions(confectSchema)

type ConfectDataModel = ConfectDataModelFromConfectSchemaDefinition<typeof confectSchema>

export const ConfectQueryCtx = ConfectQueryCtxService<ConfectDataModel>()
export type ConfectQueryCtx = ConfectQueryCtxType<ConfectDataModel>

export const ConfectMutationCtx = ConfectMutationCtxService<ConfectDataModel>()
export type ConfectMutationCtx = ConfectMutationCtxType<ConfectDataModel>

export const ConfectActionCtx = ConfectActionCtxService<ConfectDataModel>()
export type ConfectActionCtx = ConfectActionCtxType<ConfectDataModel>
```

```typescript
// convex/users.ts - Write functions with Effect
import { Effect, Option } from "effect"
import { ConfectMutationCtx, ConfectQueryCtx, mutation, query } from "./confect"
import { Schema } from "effect"

// Define args and returns with Effect Schema
const CreateUserArgs = Schema.Struct({
  username: Schema.String,
  email: Schema.String
})

const CreateUserResult = Schema.Struct({
  userId: Schema.String
})

export const createUser = mutation({
  args: CreateUserArgs,
  returns: CreateUserResult,
  handler: ({ username, email }) =>
    Effect.gen(function* () {
      // Inject Convex context via Effect
      const { db } = yield* ConfectMutationCtx
      
      // Database operations return Effects, not Promises
      const existing = yield* db
        .query("users")
        .withIndex("by_username", q => q.eq("username", username))
        .first()
      
      // Option<Doc<"users">> instead of Doc<"users"> | null
      if (Option.isSome(existing)) {
        return yield* Effect.fail(new UserAlreadyExistsError({ username }))
      }
      
      const userId = yield* db.insert("users", { username, email, role: "user" })
      
      return { userId }
    })
})
```

### Confect + Convex Components Pattern

```typescript
// Combine Confect with Convex components using custom services
import { Effect, Context, Layer } from "effect"
import { Agent } from "@convex-dev/agent"

class ConvexAgentService extends Context.Tag("ConvexAgentService")<
  ConvexAgentService,
  {
    readonly createThread: (
      ctx: ConfectActionCtx,
      userId: string
    ) => Effect.Effect<string, AgentError>
  }
>() {}

const ConvexAgentServiceLive = Layer.effect(
  ConvexAgentService,
  Effect.gen(function* () {
    const agent = new Agent(components.agent, {
      chat: openai.chat("gpt-4o"),
      instructions: "You are a helpful assistant."
    })
    
    return {
      createThread: (ctx, userId) =>
        Effect.gen(function* () {
          // Convert ConfectActionCtx to native Convex context
          const nativeCtx = ctx // Confect provides compatible context
          
          const result = yield* Effect.tryPromise({
            try: async () => {
              const { threadId } = await agent.createThread(nativeCtx, { userId })
              return threadId
            },
            catch: (error) => new AgentError({ cause: error })
          })
          
          return result
        })
    }
  })
)

// Confect action using agent service
export const createAgentThread = action({
  args: CreateThreadArgs,
  returns: CreateThreadResult,
  handler: ({ userId }) =>
    Effect.gen(function* () {
      const agentService = yield* ConvexAgentService
      const threadId = yield* agentService.createThread(/* ... */, userId)
      return { threadId }
    }).pipe(
      Effect.provide(ConvexAgentServiceLive)
    )
})
```

---

## Complete Production Architecture

### Recommended Service Layer Structure

```
convex/
├── schema.ts                      # Database schema
├── confect.ts                     # Confect setup (if using)
│
├── services/
│   ├── agent.service.ts          # AgentService layer
│   ├── rag.service.ts            # RAGService layer
│   ├── rate-limit.service.ts     # RateLimitService layer
│   ├── workflow.service.ts       # WorkflowService layer
│   └── layers.ts                 # Combined layers
│
├── domain/
│   ├── users/
│   │   ├── types.ts              # Domain types
│   │   ├── errors.ts             # Domain errors
│   │   └── logic.ts              # Business logic (Effect)
│   │
│   └── agents/
│       ├── types.ts
│       ├── errors.ts
│       └── orchestration.ts      # Multi-agent logic
│
└── api/
    ├── users.ts                  # User queries/mutations
    ├── agents.ts                 # Agent endpoints
    └── workflows.ts              # Workflow triggers
```

### Complete Example: Customer Support Agent System

```typescript
// convex/services/agent.service.ts
import { Effect, Context, Layer } from "effect"
import { Agent } from "@convex-dev/agent"
import { openai } from "@ai-sdk/openai"

class SupportAgentService extends Context.Tag("SupportAgentService")<
  SupportAgentService,
  {
    readonly createSupportThread: (
      ctx: ActionCtx,
      userId: string,
      issue: string
    ) => Effect.Effect<ThreadResult, AgentError>
    
    readonly continueSupportThread: (
      ctx: ActionCtx,
      threadId: string,
      message: string
    ) => Effect.Effect<AgentResponse, AgentError>
  }
>() {}

const SupportAgentServiceLive = Layer.effect(
  SupportAgentService,
  Effect.gen(function* () {
    const ragService = yield* RAGService
    const rateLimitService = yield* RateLimitService
    
    const agent = new Agent(components.agent, {
      name: "Support Agent",
      chat: openai.chat("gpt-4o-mini"),
      textEmbedding: openai.embedding("text-embedding-3-small"),
      instructions: "You are a helpful customer support agent.",
      tools: {
        searchKnowledgeBase: createTool({
          description: "Search the knowledge base for relevant articles",
          args: z.object({ query: z.string() }),
          handler: async (toolCtx, { query }) => {
            const program = ragService.search(/* ... */, query)
            return await Effect.runPromise(program)
          }
        })
      },
      usageHandler: async (ctx, args) => {
        await ctx.runMutation(internal.billing.trackUsage, args)
      }
    })
    
    return {
      createSupportThread: (ctx, userId, issue) =>
        Effect.gen(function* () {
          // Check rate limit
          const rateLimitOk = yield* rateLimitService.checkUserLimit(ctx, userId)
          if (!rateLimitOk) {
            return yield* Effect.fail(new RateLimitError())
          }
          
          // Fetch user context
          const userContext = yield* Effect.tryPromise({
            try: () => ctx.runQuery(api.users.getContext, { userId }),
            catch: () => new ContextFetchError()
          })
          
          // Create thread
          const result = yield* Effect.tryPromise({
            try: async () => {
              const { threadId, thread } = await agent.createThread(ctx, { userId })
              const response = await thread.generateText({
                prompt: `User issue: ${issue}\n\nUser context: ${JSON.stringify(userContext)}`
              })
              return { threadId, text: response.text }
            },
            catch: (error) => new AgentError({ cause: error })
          })
          
          return result
        }),
      
      continueSupportThread: (ctx, threadId, message) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: async () => {
              const { thread } = await agent.continueThread(ctx, { threadId })
              const response = await thread.generateText({ prompt: message })
              return { text: response.text, usage: response.usage }
            },
            catch: (error) => new AgentError({ cause: error })
          })
          
          return result
        })
    }
  })
)

// convex/api/support.ts
export const createSupportTicket = action({
  args: { userId: v.string(), issue: v.string() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const supportAgent = yield* SupportAgentService
      
      // Create thread with agent
      const threadResult = yield* supportAgent.createSupportThread(
        ctx,
        args.userId,
        args.issue
      )
      
      // Save to database
      yield* Effect.tryPromise({
        try: () => ctx.runMutation(internal.tickets.create, {
          userId: args.userId,
          threadId: threadResult.threadId,
          initialResponse: threadResult.text
        }),
        catch: () => new DatabaseError()
      })
      
      return threadResult
    }).pipe(
      Effect.provide(Layer.merge(
        SupportAgentServiceLive,
        RAGServiceLive,
        RateLimitServiceLive
      )),
      Effect.catchAll((error) => {
        console.error("Support ticket creation failed:", error)
        return Effect.succeed({
          error: true,
          message: "Failed to create support ticket. Please try again."
        })
      }),
      Effect.runPromise
    )
})
```

### Multi-Agent Research System

```typescript
// convex/domain/agents/research-orchestration.ts
export const researchWorkflow = workflow.define({
  args: { query: v.string(), userId: v.string() },
  handler: async (step, args): Promise<ResearchResult> => {
    // Step 1: Classify query type
    const classification = await step.runAction(
      internal.research.classifyQueryWithEffect,
      { query: args.query }
    )
    
    // Step 2: Parallel research with multiple agents
    const [webResults, academicResults, newsResults] = await Promise.all([
      step.runAction(internal.research.webSearchAgent, { query: args.query }),
      step.runAction(internal.research.academicAgent, { query: args.query }),
      step.runAction(internal.research.newsAgent, { query: args.query })
    ])
    
    // Step 3: Synthesize findings
    const synthesis = await step.runAction(
      internal.research.synthesisAgentWithEffect,
      {
        query: args.query,
        webResults,
        academicResults,
        newsResults
      }
    )
    
    // Step 4: Generate final report
    const report = await step.runAction(
      internal.research.reportGeneratorWithEffect,
      { synthesis, classification }
    )
    
    // Step 5: Save and notify
    await step.runMutation(internal.research.saveReport, {
      userId: args.userId,
      query: args.query,
      report
    })
    
    return report
  }
})

export const synthesisAgentWithEffect = internalAction({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const program = Effect.gen(function* () {
      const agentService = yield* AgentService
      const ragService = yield* RAGService
      
      // Fetch relevant background context
      const background = yield* ragService.search(ctx, "global", args.query, 5)
      
      // Synthesize with agent
      const synthesis = yield* agentService.generateResponse(
        ctx,
        `Synthesize these research findings:\n\n${formatResults(args)}\n\nBackground: ${background.text}`
      )
      
      return synthesis
    })
    
    return await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.merge(AgentServiceLive, RAGServiceLive)),
        Effect.retry(
          Schedule.exponential("1 second").pipe(
            Schedule.compose(Schedule.recurs(3))
          )
        )
      )
    )
  }
})
```

---

## Production Patterns Summary

### Error Handling

**Pattern: Layered Error Handling**

```typescript
// Domain errors (typed)
class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  userId: string
}> {}

// Infrastructure errors (typed)
class AgentError extends Data.TaggedError("AgentError")<{
  agentName: string
  cause: unknown
}> {}

// Handle at appropriate layer
Effect.gen(function* () {
  const result = yield* agentService.generateResponse(/* ... */)
  return result
}).pipe(
  // Handle domain errors specifically
  Effect.catchTag("UserNotFoundError", (error) =>
    Effect.succeed({ error: "User not found" })
  ),
  // Handle infrastructure errors with retry
  Effect.catchTag("AgentError", (error) =>
    Effect.retry(
      Effect.fail(error),
      Schedule.exponential("1 second").pipe(Schedule.recurs(2))
    )
  ),
  // Catch-all for unexpected errors
  Effect.catchAll((error) => {
    console.error("Unexpected error:", error)
    return Effect.succeed({ error: "Something went wrong" })
  })
)
```

### Monitoring and Observability

**Pattern: Usage Tracking with Effect**

```typescript
class MonitoringService extends Context.Tag("MonitoringService")<
  MonitoringService,
  {
    readonly trackAgentUsage: (data: UsageData) => Effect.Effect<void>
    readonly trackError: (error: unknown) => Effect.Effect<void>
  }
>() {}

const MonitoringServiceLive = Layer.succeed(MonitoringService, {
  trackAgentUsage: (data) =>
    Effect.sync(() => {
      console.log("Agent usage:", data)
      // Send to analytics service
    }),
  
  trackError: (error) =>
    Effect.sync(() => {
      console.error("Error tracked:", error)
      // Send to error tracking service
    })
})

// Wrap service calls with monitoring
const monitoredAgentCall = (
  agentService: AgentService,
  ctx: ActionCtx,
  prompt: string
) =>
  Effect.gen(function* () {
    const monitoring = yield* MonitoringService
    
    const startTime = Date.now()
    
    const result = yield* agentService.generateResponse(ctx, prompt).pipe(
      Effect.tap((response) =>
        monitoring.trackAgentUsage({
          duration: Date.now() - startTime,
          tokenCount: response.usage.totalTokens,
          model: "gpt-4o-mini"
        })
      ),
      Effect.tapError((error) =>
        monitoring.trackError(error)
      )
    )
    
    return result
  })
```

### Testing Strategies

**Pattern: Test Layers for Components**

```typescript
// Test implementation of AgentService
const TestAgentServiceLive = Layer.succeed(AgentService, {
  generateResponse: (ctx, prompt) =>
    Effect.succeed({
      text: "Mock response",
      usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 }
    }),
  
  createThread: (ctx, userId) =>
    Effect.succeed({ threadId: "test-thread-id" })
})

// Test with mock
describe("Support Agent", () => {
  it("should create support ticket", async () => {
    const program = createSupportTicket({ userId: "123", issue: "Help!" })
    
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(Layer.merge(
          TestAgentServiceLive,
          TestRAGServiceLive,
          TestRateLimitServiceLive
        ))
      )
    )
    
    expect(result.threadId).toBe("test-thread-id")
  })
})
```

### Resource Management

**Pattern: Scoped Resources with Components**

```typescript
// Use Effect.Scope for resource lifecycle
const withAgentPool = <A, E>(
  program: Effect.Effect<A, E, AgentService>
): Effect.Effect<A, E> =>
  Effect.scoped(
    Effect.gen(function* () {
      // Acquire agents
      const agentPool = yield* Effect.acquireRelease(
        Effect.sync(() => createAgentPool(10)),
        (pool) => Effect.sync(() => pool.shutdown())
      )
      
      // Provide service
      const service = yield* AgentService
      
      // Run program
      return yield* program
    })
  )
```

### Performance Optimization

**Pattern: Parallel Execution with Concurrency Control**

```typescript
// Process multiple items with controlled parallelism
export const processBatchWithEffect = action({
  args: { items: v.array(v.any()) },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const results = yield* Effect.all(
        args.items.map(item =>
          processItemWithEffect(ctx, item)
        ),
        { 
          concurrency: 5,           // Limit concurrent operations
          mode: "default"            // Fail fast on first error
        }
      )
      
      return { results, count: results.length }
    }).pipe(
      Effect.provide(/* ... */),
      Effect.runPromise
    )
})
```

---

## Key Recommendations for ONE Network

### Architecture Decisions

1. **Start with Manual Effect Integration**: Don't adopt Confect initially. Use the wrapper patterns shown above to integrate Effect gradually.
    
2. **Use Components for Infrastructure**: Let Convex components handle durability, retries, and rate limiting. Use Effect for business logic.
    
3. **Service Layer with Effect**: Build a service layer using Effect's Context and Layer patterns for testability and composition.
    
4. **Agent Component + Workflow**: Use @convex-dev/agent for AI capabilities and @convex-dev/workflow for long-running operations.
    
5. **RAG with Effect Services**: Wrap @convex-dev/rag in an Effect service for composable context retrieval.
    

### Astro Integration

```typescript
// src/lib/convex-provider.tsx
import { ConvexReactClient, ConvexProvider } from "convex/react"
import { type FunctionComponent } from "react"

const convexClient = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL)

export function withConvexProvider<Props>(
  Component: FunctionComponent<Props>
) {
  return function WithConvexProvider(props: Props) {
    return (
      <ConvexProvider client={convexClient}>
        <Component {...props} />
      </ConvexProvider>
    )
  }
}

// Use in components
export default withConvexProvider(function ChatInterface() {
  const messages = useQuery(api.chat.listMessages, { threadId })
  const sendMessage = useMutation(api.chat.sendMessage)
  
  // Your UI code
})
```

### Deployment

1. **Convex Deploy**: `npx convex deploy` for backend
2. **Vercel**: Use Vercel for Astro frontend with automatic Convex integration
3. **Environment Variables**: Manage through Convex Dashboard
4. **Monitoring**: Use Convex Dashboard + custom monitoring service

---

## Conclusion

Effect.ts and Confect enhance Convex's already powerful platform for building AI agents:

**Effect.ts provides**:

- Type-safe error handling
- Powerful composition primitives
- Dependency injection
- Resource management
- Testability

**Convex components provide**:

- Durable workflows
- Rate limiting
- Retries with backoff
- Vector search (RAG)
- Real-time streaming
- Transactional guarantees

**Together they enable**:

- Production-ready AI agent systems
- Type-safe, testable business logic
- Reliable long-running workflows
- Sophisticated error recovery
- Composable multi-agent orchestration

Start by wrapping components with Effect services for key business logic, then gradually expand Effect usage as your team becomes comfortable with the patterns. The combination provides an excellent foundation for building sophisticated AI agents at scale.