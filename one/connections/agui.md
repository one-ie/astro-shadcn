# AG-UI Protocol - Agent-Generated User Interface

**Version:** 1.0.0
**Purpose:** Define the AG-UI (Agent-Generated User Interface) protocol for agent-to-frontend communication in our system

---

## Overview

The **AG-UI Protocol** is a communication standard that allows AI agents to dynamically generate and control user interfaces. Instead of returning raw text or HTML, agents send structured component specifications that the frontend renders securely and type-safely.

**Key Principles:**
1. **Structured Data**: Agents send JSON, not HTML
2. **Type Safety**: All messages validated with Convex validators
3. **Security**: No XSS vulnerabilities from agent-generated content
4. **Composability**: Components combine cleanly with PromptKit
5. **Real-time**: Powered by Convex reactive queries

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Astro)                    │
├─────────────────────────────────────────────────────────────────┤
│  PromptKit Components (shadcn/ui based)                         │
│  ├─ <Message> - Chat messages with markdown                     │
│  ├─ <PromptInput> - Auto-resize textarea                        │
│  ├─ <ChatContainer> - Auto-scroll                               │
│  ├─ <Reasoning> - Show agent thinking                           │
│  ├─ <Tool> - Display function calls                             │
│  └─ <ResponseStream> - Streaming responses                      │
│                                                                  │
│  AG-UI Renderer (Our Implementation)                            │
│  ├─ <GenerativeUIRenderer> - Render agent UI messages           │
│  ├─ <DynamicChart> - Agent-generated charts                     │
│  ├─ <DynamicTable> - Agent-generated tables                     │
│  ├─ <DynamicForm> - Agent-generated forms                       │
│  ├─ <DynamicCard> - Agent-generated cards                       │
│  └─ <ActionButtons> - Agent-suggested actions                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ AG-UI Protocol Messages (Structured JSON)
         ┌──────────────────┐
         │  Convex Backend  │
         │  (Real-time DB)  │
         └────────┬─────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│              Effect.ts Service Layer (100% Ours)                │
├─────────────────────────────────────────────────────────────────┤
│  AgentUIService - Implements AG-UI protocol                     │
│  ├─ sendText(conversationId, text)                              │
│  ├─ sendUI(conversationId, component)                           │
│  ├─ sendActions(conversationId, actions)                        │
│  ├─ requestContext(conversationId, fields)                      │
│  ├─ sendReasoning(conversationId, steps)                        │
│  └─ sendToolCall(conversationId, tool)                          │
│                                                                  │
│  Agent Services - Use AG-UI to communicate                      │
│  ├─ IntelligenceAgent - Sends charts, tables, insights         │
│  ├─ StrategyAgent - Sends plans, timelines, actions            │
│  ├─ MarketingAgent - Sends content previews, campaigns         │
│  └─ Any agent can send structured UI via AG-UI protocol        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Message Types

The AG-UI Protocol defines 7 message types:

### 1. Text Message
Plain text with optional formatting and sentiment.

```typescript
{
  type: 'text',
  payload: {
    text: string,
    sentiment?: 'positive' | 'neutral' | 'negative',
    formatting?: {
      bold?: boolean,
      italic?: boolean,
      code?: boolean
    }
  }
}
```

**Example:**
```typescript
await agentUI.sendText({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  text: "I've analyzed your data and found interesting patterns.",
  sentiment: 'positive'
});
```

### 2. UI Component
Structured component data for dynamic rendering.

```typescript
{
  type: 'ui',
  payload: {
    component: 'chart' | 'table' | 'card' | 'form' | 'list' | 'timeline' | 'calendar' | 'kanban' | 'map' | 'custom',
    data: ComponentData,
    layout?: {
      width?: 'full' | 'half' | 'third',
      height?: string,
      position?: 'inline' | 'modal' | 'sidebar'
    }
  }
}
```

**Example - Chart:**
```typescript
await agentUI.sendUI({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  component: {
    component: 'chart',
    data: {
      title: 'Revenue Trend',
      chartType: 'line',
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Revenue',
        data: [10000, 12000, 15000],
        color: 'hsl(var(--chart-1))'
      }]
    },
    layout: { width: 'full' }
  }
});
```

**Example - Table:**
```typescript
await agentUI.sendUI({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  component: {
    component: 'table',
    data: {
      title: 'Performance Summary',
      headers: ['Month', 'Revenue', 'Users'],
      rows: [
        ['Jan', '$10,000', 100],
        ['Feb', '$12,000', 120],
        ['Mar', '$15,000', 150]
      ],
      sortable: true,
      filterable: true
    }
  }
});
```

### 3. Action Suggestions
Human-in-the-loop actions for user approval.

```typescript
{
  type: 'action',
  payload: {
    actions: Array<{
      id: string,
      label: string,
      description?: string,
      icon?: string,
      params?: Record<string, any>,
      confirmationRequired?: boolean,
      confirmationMessage?: string
    }>
  }
}
```

**Example:**
```typescript
await agentUI.sendActions({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  actions: [
    {
      id: 'export_report',
      label: 'Export Report',
      description: 'Download PDF with detailed analysis',
      icon: 'download',
      params: { format: 'pdf' },
      confirmationRequired: false
    },
    {
      id: 'schedule_review',
      label: 'Schedule Review',
      description: 'Set up monthly performance review',
      icon: 'calendar',
      params: { frequency: 'monthly' },
      confirmationRequired: true,
      confirmationMessage: 'This will create recurring calendar events. Continue?'
    }
  ]
});
```

### 4. Context Request
Request application state from frontend.

```typescript
{
  type: 'context_request',
  payload: {
    fields: string[],
    reason: string,
    optional?: boolean
  }
}
```

**Example:**
```typescript
await agentUI.requestContext({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  fields: ['user.cart', 'user.preferences', 'app.currentPage'],
  reason: 'To provide personalized recommendations'
});
```

### 5. Reasoning Steps
Show agent thinking process.

```typescript
{
  type: 'reasoning',
  payload: {
    steps: Array<{
      step: number,
      title: string,
      description: string,
      completed: boolean,
      result?: any
    }>,
    currentStep?: number,
    streaming?: boolean
  }
}
```

**Example:**
```typescript
await agentUI.sendReasoning({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  steps: [
    {
      step: 1,
      title: 'Fetching user data',
      description: 'Retrieving performance metrics from database',
      completed: true
    },
    {
      step: 2,
      title: 'Analyzing trends',
      description: 'Identifying patterns and insights',
      completed: true
    },
    {
      step: 3,
      title: 'Generating visualizations',
      description: 'Creating charts and tables',
      completed: false
    }
  ]
});
```

### 6. Tool Call
Show function/tool execution.

```typescript
{
  type: 'tool_call',
  payload: {
    toolName: string,
    arguments: Record<string, any>,
    result?: any,
    status: 'pending' | 'running' | 'completed' | 'failed',
    error?: string
  }
}
```

**Example:**
```typescript
await agentUI.sendToolCall({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  toolName: 'fetch_analytics',
  arguments: { userId: 'user-123', dateRange: '30d' },
  status: 'completed',
  result: { totalRevenue: 45000, totalUsers: 450 }
});
```

### 7. Error Message
Communicate errors to user.

```typescript
{
  type: 'error',
  payload: {
    message: string,
    code?: string,
    recoverable?: boolean,
    retryable?: boolean,
    details?: any
  }
}
```

**Example:**
```typescript
await agentUI.sendError({
  agentId: 'agent-1',
  conversationId: 'conv-1',
  message: 'Failed to fetch analytics data',
  code: 'ANALYTICS_API_ERROR',
  recoverable: true
});
```

---

## Component Data Specifications

### Chart Component

```typescript
interface ChartComponentData {
  component: 'chart';
  data: {
    title: string;
    description?: string;
    chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar';
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color?: string;
      fill?: boolean;
    }>;
    options?: any; // Recharts options
  };
}
```

### Table Component

```typescript
interface TableComponentData {
  component: 'table';
  data: {
    title: string;
    description?: string;
    headers: string[];
    rows: Array<Array<string | number | boolean>>;
    sortable?: boolean;
    filterable?: boolean;
    pagination?: {
      pageSize: number;
      currentPage: number;
      totalPages: number;
    };
  };
}
```

### Card Component

```typescript
interface CardComponentData {
  component: 'card';
  data: {
    title: string;
    description?: string;
    content: string | any;
    footer?: string;
    actions?: Array<{
      label: string;
      actionId: string;
      variant?: 'default' | 'destructive' | 'outline';
    }>;
  };
}
```

### Form Component

```typescript
interface FormComponentData {
  component: 'form';
  data: {
    title: string;
    description?: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'date';
      required?: boolean;
      options?: string[]; // For select fields
      defaultValue?: any;
      validation?: any;
    }>;
    submitLabel?: string;
    onSubmitActionId: string;
  };
}
```

---

## Integration with Ontology

All AG-UI messages are stored in our 4-table ontology:

### Entities
- Message entities with AG-UI protocol content
- Agent entities that send AG-UI messages
- Conversation entities containing message threads

### Connections
- `sent_by` - Message → Agent relationship
- `belongs_to` - Message → Conversation relationship

### Events
- `agent_message_sent` - Logged when AG-UI message sent
- `user_action_executed` - When user clicks action button
- `context_shared` - When frontend shares context with agent

### Tags
- Message types (`text`, `ui`, `action`, etc.)
- Component types (`chart`, `table`, `card`, etc.)

---

## Implementation

### 1. Protocol Schema

**File:** `convex/protocols/agent-ui.ts`

```typescript
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';

export const AgentUIMessageType = {
  TEXT: 'text',
  UI: 'ui',
  ACTION: 'action',
  CONTEXT_REQUEST: 'context_request',
  REASONING: 'reasoning',
  TOOL_CALL: 'tool_call',
  ERROR: 'error',
} as const;

export interface AgentUIMessage {
  type: AgentUIMessageType;
  agentId: Id<'entities'>;
  conversationId: Id<'entities'>;
  timestamp: number;
  payload: AgentUIPayload;
  metadata?: {
    correlationId?: string;
    replyTo?: Id<'entities'>;
    [key: string]: any;
  };
}

// See full schema in CopilotKit.md
```

### 2. AgentUIService

**File:** `convex/services/agent-ui.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';

export class AgentUIService extends Effect.Service<AgentUIService>()('AgentUIService', {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;

    return {
      sendText: (args) => Effect.gen(function* () {
        // Create message entity
        const messageId = yield* db.insert('entities', {
          type: 'message',
          properties: {
            protocol: 'ag-ui',
            message: {
              type: 'text',
              payload: { text: args.text, sentiment: args.sentiment }
            }
          }
        });

        return messageId;
      }),

      sendUI: (args) => Effect.gen(function* () {
        // Store UI component message
      }),

      sendActions: (args) => Effect.gen(function* () {
        // Store action suggestions
      }),

      // ... other methods
    };
  }),
  dependencies: [ConvexDatabase.Default]
}) {}
```

### 3. GenerativeUIRenderer

**File:** `src/components/agent-ui/GenerativeUIRenderer.tsx`

```tsx
import React from 'react';
import type { UIPayload } from '@/convex/protocols/agent-ui';
import { Card } from '@/components/ui/card';
import { LineChart, BarChart } from 'recharts';
import { Table } from '@/components/ui/table';

export function GenerativeUIRenderer({ payload }: { payload: UIPayload }) {
  const { component, data, layout } = payload;

  switch (component) {
    case 'chart':
      return <DynamicChart data={data} layout={layout} />;
    case 'table':
      return <DynamicTable data={data} layout={layout} />;
    case 'card':
      return <DynamicCard data={data} layout={layout} />;
    case 'form':
      return <DynamicForm data={data} layout={layout} />;
    default:
      return <div>Unknown component: {component}</div>;
  }
}

// Component implementations in CopilotKit.md
```

### 4. Context Sharing Hook

**File:** `src/hooks/useAgentContext.ts`

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';

export function useAgentContext(conversationId) {
  const [context, setContext] = useState({});
  const updateContext = useMutation(api.conversations.updateContext);

  useEffect(() => {
    updateContext({ conversationId, context });
  }, [context]);

  return {
    shareContext: (key, value) => {
      setContext(prev => ({ ...prev, [key]: value }));
    },
    removeContext: (key) => {
      setContext(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };
}
```

---

## Example: Agent Using AG-UI

```typescript
// convex/services/intelligence-agent.ts
export class IntelligenceAgent extends Effect.Service<IntelligenceAgent>()('IntelligenceAgent', {
  effect: Effect.gen(function* () {
    const agentUI = yield* AgentUIService;

    return {
      analyzePerformance: (args) => Effect.gen(function* () {
        // 1. Send reasoning steps
        yield* agentUI.sendReasoning({
          agentId: 'agent-intelligence',
          conversationId: args.conversationId,
          steps: [
            { step: 1, title: 'Fetching data', description: '...', completed: true },
            { step: 2, title: 'Analyzing trends', description: '...', completed: false }
          ]
        });

        // 2. Send text intro
        yield* agentUI.sendText({
          agentId: 'agent-intelligence',
          conversationId: args.conversationId,
          text: "I've analyzed your performance. Here's what I found:",
          sentiment: 'positive'
        });

        // 3. Send revenue chart
        yield* agentUI.sendUI({
          agentId: 'agent-intelligence',
          conversationId: args.conversationId,
          component: {
            component: 'chart',
            data: {
              title: 'Revenue Trend',
              chartType: 'line',
              labels: ['Jan', 'Feb', 'Mar'],
              datasets: [{ label: 'Revenue', data: [10000, 12000, 15000] }]
            }
          }
        });

        // 4. Send action suggestions
        yield* agentUI.sendActions({
          agentId: 'agent-intelligence',
          conversationId: args.conversationId,
          actions: [
            { id: 'export_report', label: 'Export Report' },
            { id: 'deep_dive', label: 'Deep Dive Analysis' }
          ]
        });
      })
    };
  }),
  dependencies: [AgentUIService.Default]
}) {}
```

---

## Security Considerations

### 1. No HTML Injection
- Agents send JSON, not HTML strings
- Components are React-rendered, preventing XSS
- All data sanitized before rendering

### 2. Action Confirmation
- Sensitive actions require user confirmation
- Confirmation messages shown before execution
- Actions logged in events table

### 3. Context Privacy
- Agents request context explicitly
- User controls what context is shared
- Context requests show reason to user

---

## Best Practices

1. **Always Use Structured Data**: Never return HTML strings
2. **Validate Message Types**: Use Convex validators
3. **Log All Messages**: Store in entities/events tables
4. **Show Reasoning**: Use reasoning messages for transparency
5. **Request Context Explicitly**: Don't assume frontend state
6. **Provide Actions**: Enable human-in-the-loop approvals
7. **Handle Errors Gracefully**: Use error message type

---

## Comparison: Traditional vs AG-UI

### Traditional Approach (Bad)
```typescript
// Agent returns HTML string (security risk, no type safety)
return "<div class='chart'>...</div>";
```

**Problems:**
- XSS vulnerabilities
- No type safety
- Hard to style consistently
- Can't compose with other components

### AG-UI Approach (Good)
```typescript
// Agent returns structured component data
return {
  component: 'chart',
  data: {
    chartType: 'line',
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{ label: 'Revenue', data: [10, 20, 30] }]
  }
};
```

**Benefits:**
- Type-safe
- Secure (no XSS)
- Composable
- Consistent styling
- Easy to test

---

## Roadmap

### Current (Q1 2025)
- [x] Define AG-UI protocol
- [x] Implement AgentUIService
- [x] Create GenerativeUIRenderer
- [ ] Add more component types (calendar, kanban, map)

### Next (Q2 2025)
- [ ] Streaming UI updates
- [ ] Component composition (nested components)
- [ ] Custom component registry
- [ ] AG-UI SDK for external agents

### Future (Q3 2025)
- [ ] AG-UI protocol versioning
- [ ] Cross-platform AG-UI renderers (mobile)
- [ ] AG-UI analytics and monitoring
- [ ] Visual AG-UI builder

---

## Resources

- **Full Implementation**: See `CopilotKit.md`
- **PromptKit Components**: See `PromptKit.md`
- **Agent Services**: See `AGENTS.md`
- **Ontology**: See `Ontology.md`

---

## Key Takeaways

1. **Structured Over String**: JSON > HTML
2. **Type Safety**: All messages validated
3. **Security**: No XSS vulnerabilities
4. **Composability**: Works with PromptKit
5. **Real-time**: Powered by Convex
6. **Human-in-the-Loop**: Action approval system
7. **Transparency**: Reasoning and tool call visibility

The AG-UI Protocol enables agents to build rich, interactive interfaces while maintaining security, type safety, and composability with our existing stack.
