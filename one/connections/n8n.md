# N8N Integration - AI Agent Tool Integration

**Version:** 1.0.0
**Purpose:** Enable AI agents to execute n8n workflows as tools, allowing seamless integration between ONE platform and n8n automation workflows

---

## Overview

n8n is an extensible workflow automation tool that allows users to create complex automations connecting 400+ services. This integration enables:

1. **AI Agents → n8n**: Agents can trigger n8n workflows as tools
2. **n8n → AI Agents**: n8n workflows can call agent actions via webhooks
3. **Workflow as Tool**: Each n8n workflow becomes a callable tool for agents

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ONE Platform Agents                         │
│  (Strategy, Marketing, Sales, Service, etc.)                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Execute workflow as tool
                 ↓
         ┌───────────────┐
         │ N8NService    │  ← Effect.ts service
         │ (Layer)       │
         └───────┬───────┘
                 │
                 │ HTTP API call
                 ↓
         ┌───────────────────────┐
         │   n8n Instance        │
         │   (Self-hosted/Cloud) │
         └───────┬───────────────┘
                 │
                 │ Executes workflow
                 ↓
         ┌─────────────────────────────────────┐
         │  External Services (400+ integrations)│
         │  ├─ Google Sheets                    │
         │  ├─ Airtable                         │
         │  ├─ Slack                            │
         │  ├─ Notion                           │
         │  ├─ Zapier                           │
         │  ├─ GitHub                           │
         │  └─ Any HTTP API                     │
         └─────────────────────────────────────┘
```

---

## Ontology Mapping

### Entity Types Used

Uses the unified external integration schema from `Ontology.md`:

```typescript
// EXTERNAL INTEGRATIONS (already in Ontology.md)
| 'external_agent'        // External AI agent (not used for n8n)
| 'external_workflow'     // External workflow (n8n, Zapier, Make, etc.)
| 'external_connection'   // Connection config to external service
```

### Entity Properties

**external_workflow Properties (for n8n workflows):**
```typescript
{
  platform: "n8n",              // Platform identifier
  workflowId: string,           // n8n workflow ID
  name: string,                 // Workflow name
  description: string,          // What the workflow does
  webhookUrl?: string,          // Trigger URL
  active: boolean,              // Is workflow active?
  tags: string[],               // n8n tags/categories
  inputSchema: {                // Expected input parameters
    [key: string]: {
      type: "string" | "number" | "boolean" | "object" | "array",
      required: boolean,
      description: string,
      default?: any
    }
  },
  outputSchema: {               // Expected output structure
    [key: string]: {
      type: "string" | "number" | "boolean" | "object" | "array",
      description: string
    }
  },
  executionCount: number,       // Total executions
  successRate: number,          // 0.0 to 1.0
  averageExecutionTime: number, // milliseconds
  lastExecutedAt?: number,
  createdAt: number,
  updatedAt: number
}
```

**Workflow Execution Tracking:**

Use events (not a separate entity type) to track executions:

```typescript
// Execution as event
{
  type: 'agent_executed',
  actorId: agentId,
  targetId: workflowId,         // external_workflow entity
  timestamp: Date.now(),
  metadata: {
    action: 'workflow_executed',
    platform: 'n8n',
    executionId: 'exec-123',    // n8n execution ID
    status: 'success',
    startedAt: number,
    finishedAt: number,
    executionTime: number,
    input: any,
    output: any,
    triggeredBy: {
      source: 'agent' | 'user' | 'cron' | 'webhook'
    }
  }
}
```

**external_connection Properties (for n8n connection):**
```typescript
{
  platform: "n8n",
  name: string,                 // Connection name
  baseUrl?: string,             // n8n instance URL
  apiKey?: string,              // Encrypted n8n API key
  websocketUrl?: string,        // WebSocket endpoint (if supported)
  webhookSecret?: string,       // Webhook signature secret
  connectionType: "rest" | "webhook",
  authentication: {
    type: "apiKey",
    credentials: any            // Encrypted credentials
  },
  status: "active" | "inactive" | "error",
  lastConnectedAt?: number,
  lastError?: string,
  linkedEntityIds: string[],    // Connected workflow IDs
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
// Agent → n8n workflow
{
  fromEntityId: agentId,
  toEntityId: workflowId,               // external_workflow entity
  relationshipType: 'integrated_with',  // Existing type
  metadata: {
    platform: 'n8n',
    integrationType: 'workflow',
    permissions: ['execute', 'view'],
    configuredAt: Date.now()
  }
}
```

**Note:** Workflow executions are tracked as events, not as separate entities or connections.

### Event Types

Use existing consolidated event types:

```typescript
// Workflow executed successfully
{
  type: 'agent_executed',               // Existing type
  actorId: agentId,
  targetId: workflowId,                 // external_workflow entity
  timestamp: Date.now(),
  metadata: {
    action: 'workflow_executed',
    platform: 'n8n',
    executionId: 'exec-123',
    status: 'success',
    startedAt: 1234567890,
    finishedAt: 1234568890,
    executionTime: 1000,
    input: {...},
    output: {...},
    triggeredBy: {
      source: 'agent'
    }
  }
}

// Workflow failed
{
  type: 'agent_failed',                 // Existing type
  actorId: agentId,
  targetId: workflowId,
  timestamp: Date.now(),
  metadata: {
    action: 'workflow_failed',
    platform: 'n8n',
    executionId: 'exec-124',
    error: 'Connection timeout',
    node: 'HTTP Request',
    triggeredBy: {
      source: 'agent'
    }
  }
}
```

---

## Effect.ts Service Implementation

### N8NProvider

```typescript
import { Effect, Layer, Context } from 'effect';
import { HttpProvider } from './http';

export class N8NError extends Error {
  readonly _tag = 'N8NError';
  constructor(
    public readonly message: string,
    public readonly workflowId?: string,
    public readonly statusCode?: number
  ) {
    super(message);
  }
}

export class N8NProvider extends Effect.Service<N8NProvider>()('N8NProvider', {
  effect: Effect.gen(function* () {
    const http = yield* HttpProvider;

    return {
      /**
       * Execute n8n workflow via webhook
       */
      executeWorkflow: (args: {
        webhookUrl: string;
        input: Record<string, any>;
        timeout?: number;
      }) =>
        Effect.gen(function* () {
          const result = yield* http.post({
            url: args.webhookUrl,
            body: args.input,
            headers: {
              'Content-Type': 'application/json',
            },
          }).pipe(
            Effect.timeout(args.timeout ?? '30 seconds'),
            Effect.catchAll((error) =>
              Effect.fail(
                new N8NError(
                  `Workflow execution failed: ${error.message}`,
                  undefined,
                  error.statusCode
                )
              )
            )
          );

          return result.data;
        }),

      /**
       * Get workflow execution status via n8n API
       */
      getExecutionStatus: (args: {
        baseUrl: string;
        apiKey: string;
        executionId: string;
      }) =>
        Effect.gen(function* () {
          const result = yield* http.get({
            url: `${args.baseUrl}/api/v1/executions/${args.executionId}`,
            headers: {
              'X-N8N-API-KEY': args.apiKey,
            },
          }).pipe(
            Effect.catchAll((error) =>
              Effect.fail(
                new N8NError(
                  `Failed to get execution status: ${error.message}`,
                  undefined,
                  error.statusCode
                )
              )
            )
          );

          return result.data as {
            id: string;
            finished: boolean;
            mode: string;
            startedAt: string;
            stoppedAt?: string;
            workflowData: any;
            data?: any;
          };
        }),

      /**
       * List workflows from n8n instance
       */
      listWorkflows: (args: { baseUrl: string; apiKey: string }) =>
        Effect.gen(function* () {
          const result = yield* http.get({
            url: `${args.baseUrl}/api/v1/workflows`,
            headers: {
              'X-N8N-API-KEY': args.apiKey,
            },
          }).pipe(
            Effect.catchAll((error) =>
              Effect.fail(
                new N8NError(
                  `Failed to list workflows: ${error.message}`,
                  undefined,
                  error.statusCode
                )
              )
            )
          );

          return result.data as Array<{
            id: string;
            name: string;
            active: boolean;
            tags: Array<{ id: string; name: string }>;
            createdAt: string;
            updatedAt: string;
          }>;
        }),

      /**
       * Activate/deactivate workflow
       */
      toggleWorkflow: (args: {
        baseUrl: string;
        apiKey: string;
        workflowId: string;
        active: boolean;
      }) =>
        Effect.gen(function* () {
          yield* http.patch({
            url: `${args.baseUrl}/api/v1/workflows/${args.workflowId}`,
            headers: {
              'X-N8N-API-KEY': args.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              active: args.active,
            },
          }).pipe(
            Effect.catchAll((error) =>
              Effect.fail(
                new N8NError(
                  `Failed to toggle workflow: ${error.message}`,
                  args.workflowId,
                  error.statusCode
                )
              )
            )
          );
        }),
    };
  }),
  dependencies: [HttpProvider.Default],
}) {}
```

### N8NService (Business Logic)

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import { N8NProvider } from './n8n-provider';

export class N8NService extends Effect.Service<N8NService>()('N8NService', {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const n8n = yield* N8NProvider;

    return {
      /**
       * Execute workflow as tool for AI agent
       */
      executeWorkflowTool: (args: {
        agentId: Id<'entities'>;
        workflowId: Id<'entities'>;
        input: Record<string, any>;
      }) =>
        Effect.gen(function* () {
          // 1. Get workflow entity
          const workflow = yield* db.get(args.workflowId).pipe(
            Effect.flatMap((w) =>
              w?.type === 'n8n_workflow'
                ? Effect.succeed(w)
                : Effect.fail(new Error('Invalid workflow'))
            )
          );

          // 2. Validate input against schema
          yield* validateInput(args.input, workflow.properties.inputSchema);

          // 3. Create execution record
          const executionId = yield* db.insert('entities', {
            type: 'n8n_execution',
            name: `Execution ${Date.now()}`,
            properties: {
              workflowId: workflow.properties.workflowId,
              executionId: '', // Will be filled after n8n responds
              status: 'running',
              startedAt: Date.now(),
              input: args.input,
              triggeredBy: {
                agentId: args.agentId,
                source: 'agent',
              },
            },
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // 4. Execute workflow via webhook
          const result = yield* n8n
            .executeWorkflow({
              webhookUrl: workflow.properties.webhookUrl,
              input: args.input,
              timeout: 60000, // 1 minute
            })
            .pipe(
              Effect.retry({ times: 2, schedule: Schedule.exponential('1 second') }),
              Effect.catchAll((error) =>
                Effect.gen(function* () {
                  // Update execution with error
                  yield* db.patch(executionId, {
                    properties: {
                      ...workflow.properties,
                      status: 'error',
                      finishedAt: Date.now(),
                      error: {
                        message: error.message,
                      },
                    },
                  });

                  // Log failure event
                  yield* db.insert('events', {
                    type: 'agent_failed',
                    actorId: args.agentId,
                    targetId: args.workflowId,
                    timestamp: Date.now(),
                    metadata: {
                      action: 'workflow_failed',
                      executionId,
                      error: error.message,
                    },
                  });

                  return Effect.fail(error);
                })
              )
            );

          // 5. Update execution with success
          const finishedAt = Date.now();
          yield* db.patch(executionId, {
            properties: {
              status: 'success',
              finishedAt,
              executionTime: finishedAt - workflow.properties.startedAt,
              output: result,
            },
          });

          // 6. Log success event
          yield* db.insert('events', {
            type: 'agent_executed',
            actorId: args.agentId,
            targetId: args.workflowId,
            timestamp: Date.now(),
            metadata: {
              action: 'workflow_executed',
              executionId,
              status: 'success',
              executionTime: finishedAt - workflow.properties.startedAt,
              input: args.input,
              output: result,
            },
          });

          // 7. Update workflow stats
          yield* db.patch(args.workflowId, {
            properties: {
              ...workflow.properties,
              executionCount: workflow.properties.executionCount + 1,
              lastExecutedAt: Date.now(),
            },
          });

          return {
            executionId,
            status: 'success' as const,
            output: result,
          };
        }),

      /**
       * Sync workflows from n8n instance
       */
      syncWorkflows: (args: { credentialId: Id<'entities'>; userId: Id<'entities'> }) =>
        Effect.gen(function* () {
          // 1. Get credentials
          const credential = yield* db.get(args.credentialId).pipe(
            Effect.flatMap((c) =>
              c?.type === 'n8n_credential'
                ? Effect.succeed(c)
                : Effect.fail(new Error('Invalid credential'))
            )
          );

          // 2. List workflows from n8n
          const workflows = yield* n8n.listWorkflows({
            baseUrl: credential.properties.baseUrl,
            apiKey: credential.properties.apiKey,
          });

          // 3. Create/update workflow entities
          const results = yield* Effect.all(
            workflows.map((w) =>
              Effect.gen(function* () {
                // Check if workflow already exists
                const existing = yield* db
                  .query('entities')
                  .filter((q) =>
                    q.and(
                      q.eq(q.field('type'), 'n8n_workflow'),
                      q.eq(q.field('properties.workflowId'), w.id)
                    )
                  )
                  .collect()
                  .pipe(Effect.map((results) => results[0]));

                if (existing) {
                  // Update existing
                  yield* db.patch(existing._id, {
                    properties: {
                      ...existing.properties,
                      name: w.name,
                      active: w.active,
                      tags: w.tags.map((t) => t.name),
                      updatedAt: Date.now(),
                    },
                  });
                  return existing._id;
                } else {
                  // Create new
                  const workflowId = yield* db.insert('entities', {
                    type: 'n8n_workflow',
                    name: w.name,
                    properties: {
                      workflowId: w.id,
                      name: w.name,
                      description: `n8n workflow: ${w.name}`,
                      webhookUrl: `${credential.properties.baseUrl}/webhook/${w.id}`,
                      active: w.active,
                      tags: w.tags.map((t) => t.name),
                      inputSchema: {}, // To be filled manually
                      outputSchema: {},
                      executionCount: 0,
                      successRate: 1.0,
                      averageExecutionTime: 0,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    },
                    status: w.active ? 'active' : 'inactive',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  });

                  // Create connection
                  yield* db.insert('connections', {
                    fromEntityId: args.userId,
                    toEntityId: workflowId,
                    relationshipType: 'integrated_with',
                    metadata: {
                      integrationType: 'n8n_workflow',
                      permissions: ['execute', 'view'],
                      configuredAt: Date.now(),
                    },
                    createdAt: Date.now(),
                  });

                  return workflowId;
                }
              })
            ),
            { concurrency: 5 }
          );

          return {
            synced: results.length,
            workflowIds: results,
          };
        }),
    };
  }),
  dependencies: [ConvexDatabase.Default, N8NProvider.Default],
}) {}

// Helper: Validate input against schema
function validateInput(
  input: Record<string, any>,
  schema: Record<string, any>
): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    for (const [key, fieldSchema] of Object.entries(schema)) {
      if (fieldSchema.required && !(key in input)) {
        yield* Effect.fail(new Error(`Missing required field: ${key}`));
      }

      if (key in input && typeof input[key] !== fieldSchema.type) {
        yield* Effect.fail(
          new Error(`Invalid type for field ${key}: expected ${fieldSchema.type}`)
        );
      }
    }
  });
}
```

---

## Convex Function Wrappers

```typescript
// convex/n8n.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { confect } from './confect';
import { N8NService } from './services/n8n';
import { MainLayer } from './layers';

/**
 * Execute n8n workflow
 */
export const executeWorkflow = confect.mutation({
  args: {
    workflowId: v.id('entities'),
    input: v.any(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);
      const service = yield* N8NService;

      return yield* service.executeWorkflowTool({
        agentId: userId, // Or actual agent ID
        workflowId: args.workflowId,
        input: args.input,
      });
    }).pipe(Effect.provide(MainLayer)),
});

/**
 * Sync workflows from n8n instance
 */
export const syncWorkflows = confect.mutation({
  args: {
    credentialId: v.id('entities'),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);
      const service = yield* N8NService;

      return yield* service.syncWorkflows({
        credentialId: args.credentialId,
        userId,
      });
    }).pipe(Effect.provide(MainLayer)),
});

/**
 * Get workflow executions
 */
export const getWorkflowExecutions = query({
  args: {
    workflowId: v.id('entities'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query('entities')
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), 'n8n_execution'),
          q.eq(q.field('properties.workflowId'), args.workflowId)
        )
      )
      .order('desc')
      .take(args.limit ?? 50);

    return executions;
  },
});
```

---

## Usage Examples

### 1. Agent Using n8n Workflow as Tool

```typescript
// Agent executes "Send Weekly Report" workflow
export class ReportingAgent extends Effect.Service<ReportingAgent>()(
  'ReportingAgent',
  {
    effect: Effect.gen(function* () {
      const n8n = yield* N8NService;

      return {
        sendWeeklyReport: (userId: Id<'entities'>) =>
          Effect.gen(function* () {
            // Get user data
            const userData = yield* getUserMetrics(userId);

            // Execute n8n workflow
            const result = yield* n8n.executeWorkflowTool({
              agentId: 'agent-reporting',
              workflowId: 'workflow-weekly-report',
              input: {
                userId,
                metrics: userData.metrics,
                period: 'week',
              },
            });

            return result;
          }),
      };
    }),
  }
) {}
```

### 2. Marketing Agent Using n8n for Email Campaign

```typescript
export class MarketingAgent extends Effect.Service<MarketingAgent>()(
  'MarketingAgent',
  {
    effect: Effect.gen(function* () {
      const n8n = yield* N8NService;

      return {
        launchEmailCampaign: (args: { campaignId: Id<'entities'> }) =>
          Effect.gen(function* () {
            // Get campaign data
            const campaign = yield* db.get(args.campaignId);

            // Execute n8n "Email Campaign" workflow
            const result = yield* n8n.executeWorkflowTool({
              agentId: 'agent-marketing',
              workflowId: 'workflow-email-campaign',
              input: {
                subject: campaign.properties.subject,
                recipientSegment: campaign.properties.segment,
                emailTemplate: campaign.properties.template,
                scheduledAt: campaign.properties.scheduledAt,
              },
            });

            return result;
          }),
      };
    }),
  }
) {}
```

### 3. Sync n8n Workflows on Onboarding

```typescript
export const onboardN8N = confect.mutation({
  args: {
    apiKey: v.string(),
    baseUrl: v.string(),
    instanceType: v.union(v.literal('cloud'), v.literal('self-hosted')),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);

      // 1. Create credential entity
      const credentialId = yield* db.insert('entities', {
        type: 'n8n_credential',
        name: 'n8n Credentials',
        properties: {
          apiKey: args.apiKey,
          baseUrl: args.baseUrl,
          instanceType: args.instanceType,
          active: true,
          createdAt: Date.now(),
        },
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 2. Sync workflows
      const n8nService = yield* N8NService;
      const syncResult = yield* n8nService.syncWorkflows({
        credentialId,
        userId,
      });

      return {
        credentialId,
        ...syncResult,
      };
    }).pipe(Effect.provide(MainLayer)),
});
```

---

## Frontend Integration

### React Component for Workflow Execution

```tsx
// src/components/n8n/WorkflowExecutor.tsx
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function WorkflowExecutor({ workflowId }: { workflowId: Id<'entities'> }) {
  const [input, setInput] = useState({});
  const executeWorkflow = useMutation(api.n8n.executeWorkflow);
  const executions = useQuery(api.n8n.getWorkflowExecutions, { workflowId, limit: 10 });

  return (
    <div>
      <h2>Execute Workflow</h2>
      <textarea
        value={JSON.stringify(input, null, 2)}
        onChange={(e) => setInput(JSON.parse(e.target.value))}
        placeholder='{"key": "value"}'
      />
      <Button
        onClick={() =>
          executeWorkflow({
            workflowId,
            input,
          })
        }
      >
        Execute
      </Button>

      <h3>Recent Executions</h3>
      <ul>
        {executions?.map((exec) => (
          <li key={exec._id}>
            {exec.properties.status} - {new Date(exec.properties.startedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Benefits

### For AI Agents
1. **400+ Service Integrations**: Agents can interact with any service n8n supports
2. **No-Code Workflows**: Users can create complex workflows without code
3. **Visual Debugging**: n8n's UI shows workflow execution visually
4. **Composability**: Agents combine multiple n8n workflows as tools

### For Users
1. **Familiar Interface**: n8n's drag-and-drop workflow builder
2. **Extensive Library**: Pre-built templates for common tasks
3. **Self-Hosted Option**: Full control over data and workflows
4. **Bi-Directional Integration**: n8n can trigger agents AND agents can trigger n8n

### For Platform
1. **Extensibility**: Add integrations without building custom connectors
2. **User Empowerment**: Users extend platform capabilities themselves
3. **Ecosystem Growth**: Leverage n8n's 400+ integrations immediately
4. **Reduced Development**: Don't build integrations that n8n already has

---

## Common n8n Workflow Patterns

### 1. Data Sync Workflow
**Purpose**: Sync data from Google Sheets to Convex
```
Trigger (Webhook) → Google Sheets (Read) → Convex Mutation → Response
```

### 2. Notification Workflow
**Purpose**: Send multi-channel notifications
```
Trigger (Webhook) → Split (Email/SMS/Slack) → Send Notifications → Aggregate Results
```

### 3. Content Publishing Workflow
**Purpose**: Publish content to multiple platforms
```
Trigger (Webhook) → Twitter API → LinkedIn API → Instagram API → Log Results
```

### 4. Analytics Workflow
**Purpose**: Aggregate analytics from multiple sources
```
Cron Trigger → [Google Analytics, Stripe, Convex] → Aggregate → Store in DB
```

### 5. Lead Enrichment Workflow
**Purpose**: Enrich lead data from multiple sources
```
Trigger (New Lead) → Clearbit API → Hunter.io → LinkedIn → Update Convex
```

---

## Testing

```typescript
// tests/n8n.test.ts
import { Effect, Layer } from 'effect';
import { N8NService } from '@/convex/services/n8n';

describe('N8NService', () => {
  it('should execute workflow successfully', async () => {
    const MockN8N = Layer.succeed(N8NProvider, {
      executeWorkflow: () =>
        Effect.succeed({
          success: true,
          data: { message: 'Workflow executed' },
        }),
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* N8NService;
        return yield* service.executeWorkflowTool({
          agentId: 'agent-123',
          workflowId: 'workflow-456',
          input: { test: true },
        });
      }).pipe(Effect.provide(Layer.merge(MockN8N, MockDB)))
    );

    expect(result.status).toBe('success');
  });
});
```

---

## Security Considerations

1. **API Key Storage**: Encrypt n8n API keys in database
2. **Webhook Validation**: Validate webhook signatures from n8n
3. **Rate Limiting**: Prevent workflow execution abuse
4. **Input Sanitization**: Validate all inputs before sending to n8n
5. **Permission Checks**: Ensure user has permission to execute workflow
6. **Execution Limits**: Set timeout and retry limits

---

## Summary

This integration enables:
- ✅ **AI Agents → n8n**: Agents execute workflows as tools
- ✅ **n8n → AI Agents**: Workflows trigger agent actions
- ✅ **100% Effect.ts**: Typed errors, automatic retry, composable
- ✅ **Non-Breaking**: Uses existing connection/event types
- ✅ **Minimal Entities**: Only 3 new entity types needed
- ✅ **Extensible**: Easy to add more n8n features later

**Next Steps**:
1. Add 3 entity types to Ontology.md
2. Implement N8NProvider and N8NService
3. Create Convex function wrappers
4. Build frontend workflow management UI
5. Test with common workflows
