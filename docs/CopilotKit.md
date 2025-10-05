# Generative UI and AG-UI Protocol - Building on PromptKit

**Version:** 2.0.0
**Purpose:** Extract generative UI and AG-UI protocol patterns from CopilotKit to build advanced AI agent interfaces on top of PromptKit + Effect.ts + Convex

---

## Overview

This document extracts the key architectural patterns from **CopilotKit** (an MIT-licensed AI copilot framework) and shows how to implement them using our existing stack:

- **UI Layer:** PromptKit (shadcn-based components)
- **AI Layer:** Vercel AI SDK 5
- **Backend:** Convex + Effect.ts
- **Patterns:** CopilotKit-inspired AG-UI protocol and generative UI

**What We Learn from CopilotKit:**
1. ✅ **AG-UI Protocol** - Agent-to-frontend communication protocol
2. ✅ **Generative UI** - Agents dynamically rendering UI components
3. ✅ **Context Sharing** - Bidirectional state between app and agents
4. ✅ **Action Patterns** - Human-in-the-loop agent actions
5. ✅ **Multi-Agent Orchestration** - Coordinating multiple agents

**What We Build Ourselves:**
- AG-UI protocol implementation (Effect.ts services)
- Generative UI renderer (PromptKit + shadcn components)
- Context management (Convex real-time queries)
- Action system (Convex mutations)
- Agent coordination (Effect.ts composition)

---

## Architecture: PromptKit + AG-UI Protocol

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
│  Generative UI Renderer (Our Implementation)                    │
│  ├─ <GenerativeUIRenderer> - Render agent UI messages           │
│  ├─ <DynamicChart> - Agent-generated charts                     │
│  ├─ <DynamicTable> - Agent-generated tables                     │
│  ├─ <DynamicForm> - Agent-generated forms                       │
│  └─ <ActionButtons> - Agent-suggested actions                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓ AG-UI Protocol Messages
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
│  ├─ sendTextMessage(conversationId, text)                       │
│  ├─ sendUIComponent(conversationId, component)                  │
│  ├─ sendActionSuggestion(conversationId, actions)               │
│  └─ requestContext(conversationId, fields)                      │
│                                                                  │
│  Agent Services - Use AG-UI to communicate                      │
│  ├─ IntelligenceAgent - Sends charts, tables, insights         │
│  ├─ StrategyAgent - Sends plans, timelines, actions            │
│  ├─ MarketingAgent - Sends content previews, campaigns         │
│  └─ Any agent can send structured UI via AG-UI protocol        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** Agents return structured UI data (not HTML), frontend renders it with PromptKit components.

---

## Part 1: AG-UI Protocol Implementation

### What is AG-UI Protocol?

**AG-UI (Agent-Generated User Interface)** is a communication protocol that allows AI agents to:
- Send structured UI data to the frontend
- Request context from the application
- Suggest actions for user approval
- Stream thinking/reasoning process

**CopilotKit's AG-UI Concept:**
```typescript
// Agent sends structured UI messages
{
  type: 'ui',
  component: 'Chart',
  data: { /* chart configuration */ }
}

// Agent requests context
{
  type: 'context_request',
  fields: ['user.cart', 'user.preferences']
}

// Agent suggests actions
{
  type: 'action',
  actions: [{ id: 'update_cart', params: {...} }]
}
```

### Our AG-UI Protocol Schema

**File:** `convex/protocols/agent-ui.ts`

```typescript
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';

/**
 * AG-UI Protocol Message Types
 * Based on CopilotKit's AG-UI concept, implemented for our stack
 */
export const AgentUIMessageType = {
  TEXT: 'text',              // Plain text message
  UI: 'ui',                  // Structured UI component
  ACTION: 'action',          // Action suggestions
  CONTEXT_REQUEST: 'context_request', // Request app context
  REASONING: 'reasoning',    // Agent thinking process
  TOOL_CALL: 'tool_call',    // Function/tool execution
  ERROR: 'error',            // Error message
} as const;

export type AgentUIMessageType =
  (typeof AgentUIMessageType)[keyof typeof AgentUIMessageType];

/**
 * Base AG-UI Message
 */
export interface AgentUIMessage {
  type: AgentUIMessageType;
  agentId: Id<'entities'>;
  conversationId: Id<'entities'>;
  timestamp: number;
  payload: AgentUIPayload;
  metadata?: {
    correlationId?: string;  // Link related messages
    replyTo?: Id<'entities'>; // Reply to specific message
    [key: string]: any;
  };
}

/**
 * AG-UI Payload Types
 */
export type AgentUIPayload =
  | TextPayload
  | UIPayload
  | ActionPayload
  | ContextRequestPayload
  | ReasoningPayload
  | ToolCallPayload
  | ErrorPayload;

/**
 * Text Message Payload
 */
export interface TextPayload {
  type: 'text';
  text: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
  };
}

/**
 * UI Component Payload
 * Agents send structured component data, frontend renders it
 */
export interface UIPayload {
  type: 'ui';
  component: UIComponentType;
  data: any;
  layout?: {
    width?: 'full' | 'half' | 'third';
    height?: string;
    position?: 'inline' | 'modal' | 'sidebar';
  };
}

export type UIComponentType =
  | 'chart'
  | 'table'
  | 'card'
  | 'form'
  | 'list'
  | 'timeline'
  | 'calendar'
  | 'kanban'
  | 'map'
  | 'custom';

/**
 * Chart Component Data
 */
export interface ChartComponentData {
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

/**
 * Table Component Data
 */
export interface TableComponentData {
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

/**
 * Card Component Data
 */
export interface CardComponentData {
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

/**
 * Form Component Data
 */
export interface FormComponentData {
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

/**
 * Action Suggestion Payload
 */
export interface ActionPayload {
  type: 'action';
  actions: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: string;
    params?: Record<string, any>;
    confirmationRequired?: boolean;
    confirmationMessage?: string;
  }>;
}

/**
 * Context Request Payload
 */
export interface ContextRequestPayload {
  type: 'context_request';
  fields: string[]; // e.g., ['user.cart', 'user.preferences', 'app.currentPage']
  reason: string;   // Why agent needs this context
  optional?: boolean;
}

/**
 * Reasoning/Thinking Payload
 */
export interface ReasoningPayload {
  type: 'reasoning';
  steps: Array<{
    step: number;
    title: string;
    description: string;
    completed: boolean;
    result?: any;
  }>;
  currentStep?: number;
  streaming?: boolean;
}

/**
 * Tool Call Payload
 */
export interface ToolCallPayload {
  type: 'tool_call';
  toolName: string;
  arguments: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

/**
 * Error Payload
 */
export interface ErrorPayload {
  type: 'error';
  message: string;
  code?: string;
  recoverable?: boolean;
  retryable?: boolean;
  details?: any;
}

/**
 * Convex validators for AG-UI messages
 */
export const agentUIMessageValidator = {
  type: v.union(
    v.literal('text'),
    v.literal('ui'),
    v.literal('action'),
    v.literal('context_request'),
    v.literal('reasoning'),
    v.literal('tool_call'),
    v.literal('error')
  ),
  agentId: v.id('entities'),
  conversationId: v.id('entities'),
  timestamp: v.number(),
  payload: v.any(), // Typed in TypeScript, flexible in Convex
  metadata: v.optional(v.any()),
};
```

### AgentUIService - Effect.ts Implementation

**File:** `convex/services/agent-ui.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import type { Id } from '../_generated/dataModel';
import type {
  AgentUIMessage,
  TextPayload,
  UIPayload,
  ActionPayload,
  ContextRequestPayload,
  ReasoningPayload,
  ToolCallPayload,
  ErrorPayload,
} from '../protocols/agent-ui';

/**
 * AgentUIService - Implements AG-UI Protocol
 * Allows agents to send structured UI updates to the frontend
 */
export class AgentUIService extends Effect.Service<AgentUIService>()(
  'AgentUIService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        /**
         * Send text message
         */
        sendText: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          text: string;
          sentiment?: 'positive' | 'neutral' | 'negative';
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'text',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'text',
                text: args.text,
                sentiment: args.sentiment,
              } as TextPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Send UI component
         */
        sendUI: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          component: any; // ChartComponentData | TableComponentData | etc.
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'ui',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'ui',
                component: args.component.component,
                data: args.component.data,
                layout: args.component.layout,
              } as UIPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Send action suggestions
         */
        sendActions: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          actions: Array<{
            id: string;
            label: string;
            description?: string;
            params?: any;
          }>;
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'action',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'action',
                actions: args.actions,
              } as ActionPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Request context from frontend
         */
        requestContext: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          fields: string[];
          reason: string;
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'context_request',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'context_request',
                fields: args.fields,
                reason: args.reason,
              } as ContextRequestPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Send reasoning/thinking steps
         */
        sendReasoning: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          steps: Array<{
            step: number;
            title: string;
            description: string;
            completed: boolean;
          }>;
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'reasoning',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'reasoning',
                steps: args.steps,
              } as ReasoningPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Send tool call update
         */
        sendToolCall: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          toolName: string;
          arguments: any;
          status: 'pending' | 'running' | 'completed' | 'failed';
          result?: any;
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'tool_call',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'tool_call',
                toolName: args.toolName,
                arguments: args.arguments,
                status: args.status,
                result: args.result,
              } as ToolCallPayload,
            };

            return yield* storeMessage(db, message);
          }),

        /**
         * Send error message
         */
        sendError: (args: {
          agentId: Id<'entities'>;
          conversationId: Id<'entities'>;
          message: string;
          code?: string;
          recoverable?: boolean;
        }) =>
          Effect.gen(function* () {
            const message: AgentUIMessage = {
              type: 'error',
              agentId: args.agentId,
              conversationId: args.conversationId,
              timestamp: Date.now(),
              payload: {
                type: 'error',
                message: args.message,
                code: args.code,
                recoverable: args.recoverable,
              } as ErrorPayload,
            };

            return yield* storeMessage(db, message);
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}

/**
 * Helper: Store AG-UI message in database
 */
const storeMessage = (
  db: ConvexDatabase,
  message: AgentUIMessage
) =>
  Effect.gen(function* () {
    // Store message entity
    const messageId = yield* db.insert('entities', {
      type: 'message',
      name: `AG-UI ${message.type}`,
      properties: {
        conversationId: message.conversationId,
        senderId: message.agentId,
        senderType: 'one_agent',
        content: {
          protocol: 'ag-ui',
          version: '1.0.0',
          message: message,
        },
        timestamp: message.timestamp,
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    yield* db.insert('events', {
      type: 'agent_executed',
      actorId: message.agentId,
      targetId: message.conversationId,
      timestamp: Date.now(),
      metadata: {
        action: 'ag_ui_message_sent',
        messageType: message.type,
        messageId: messageId,
      },
    });

    return messageId;
  });
```

---

## Part 2: Generative UI Implementation

### Generative UI Concept

**Generative UI** allows AI agents to dynamically create UI components based on data. Instead of returning HTML strings, agents return structured component specifications that the frontend renders.

**Traditional Approach (Bad):**
```typescript
// Agent returns HTML string (security risk, no type safety)
return "<div class='chart'>...</div>";
```

**Generative UI Approach (Good):**
```typescript
// Agent returns structured component data
return {
  component: 'chart',
  data: {
    chartType: 'line',
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{ label: 'Revenue', data: [10, 20, 30] }],
  },
};
```

### GenerativeUIRenderer Component

**File:** `src/components/agent-ui/GenerativeUIRenderer.tsx`

```tsx
import React from 'react';
import type { UIPayload, ChartComponentData, TableComponentData, CardComponentData, FormComponentData } from '@/convex/protocols/agent-ui';

// PromptKit components
import { Message, MessageContent } from '@/components/ui/message';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Recharts for data visualization
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Data table
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

/**
 * GenerativeUIRenderer
 * Renders agent-generated UI components from AG-UI protocol messages
 */
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
    case 'list':
      return <DynamicList data={data} layout={layout} />;
    case 'timeline':
      return <DynamicTimeline data={data} layout={layout} />;
    default:
      return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Unknown component type: {component}
          </p>
        </div>
      );
  }
}

/**
 * DynamicChart - Render agent-generated charts
 */
function DynamicChart({ data, layout }: { data: ChartComponentData['data']; layout?: any }) {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    ...data.datasets.reduce((acc, dataset) => ({
      ...acc,
      [dataset.label]: dataset.data[i],
    }), {}),
  }));

  const renderChart = () => {
    switch (data.chartType) {
      case 'line':
        return (
          <LineChart data={chartData} width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.color || `hsl(var(--chart-${i + 1}))`}
                fill={dataset.fill ? dataset.color : undefined}
              />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData} width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.datasets.map((dataset, i) => (
              <Bar
                key={i}
                dataKey={dataset.label}
                fill={dataset.color || `hsl(var(--chart-${i + 1}))`}
              />
            ))}
          </BarChart>
        );
      default:
        return <p>Unsupported chart type: {data.chartType}</p>;
    }
  };

  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

/**
 * DynamicTable - Render agent-generated tables
 */
function DynamicTable({ data, layout }: { data: TableComponentData['data']; layout?: any }) {
  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {data.headers.map((header, i) => (
                <TableHead key={i}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{String(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * DynamicCard - Render agent-generated cards
 */
function DynamicCard({ data, layout }: { data: CardComponentData['data']; layout?: any }) {
  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {typeof data.content === 'string' ? (
          <p className="text-sm">{data.content}</p>
        ) : (
          <pre className="text-xs">{JSON.stringify(data.content, null, 2)}</pre>
        )}
      </CardContent>
      {(data.footer || data.actions) && (
        <CardFooter className="flex justify-between">
          {data.footer && <p className="text-sm text-muted-foreground">{data.footer}</p>}
          {data.actions && (
            <div className="flex gap-2">
              {data.actions.map((action, i) => (
                <Button key={i} variant={action.variant || 'default'} size="sm">
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * DynamicForm - Render agent-generated forms
 */
function DynamicForm({ data, layout }: { data: FormComponentData['data']; layout?: any }) {
  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {data.fields.map((field, i) => (
            <div key={i} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </label>
              {/* Render input based on field type */}
              {field.type === 'text' && (
                <input
                  type="text"
                  name={field.name}
                  defaultValue={field.defaultValue}
                  required={field.required}
                  className="w-full rounded-md border px-3 py-2"
                />
              )}
              {/* Add other field types... */}
            </div>
          ))}
          <Button type="submit">{data.submitLabel || 'Submit'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * DynamicList - Render agent-generated lists
 */
function DynamicList({ data, layout }: { data: any; layout?: any }) {
  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.items.map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * DynamicTimeline - Render agent-generated timelines
 */
function DynamicTimeline({ data, layout }: { data: any; layout?: any }) {
  return (
    <Card className={layout?.width === 'full' ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.events.map((event: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary" />
                {i < data.events.length - 1 && <div className="h-full w-px bg-border" />}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                {event.description && <p className="mt-1 text-sm">{event.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### AgentMessage Component with AG-UI Support

**File:** `src/components/agent-ui/AgentMessage.tsx`

```tsx
import React from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import type { AgentUIMessage } from '@/convex/protocols/agent-ui';

// PromptKit components
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/components/ui/message';
import { Reasoning } from '@/components/ui/reasoning';
import { Tool } from '@/components/ui/tool';
import { ResponseStream } from '@/components/ui/response-stream';

// Our generative UI renderer
import { GenerativeUIRenderer } from './GenerativeUIRenderer';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { AlertCircle, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AgentMessageProps {
  message: {
    _id: Id<'entities'>;
    properties: {
      content: {
        protocol: 'ag-ui';
        version: string;
        message: AgentUIMessage;
      };
      senderId: Id<'entities'>;
      timestamp: number;
    };
  };
}

/**
 * AgentMessage - Render AG-UI protocol messages with PromptKit components
 */
export function AgentMessage({ message }: AgentMessageProps) {
  const agMessage = message.properties.content.message;

  const renderMessageContent = () => {
    switch (agMessage.type) {
      case 'text':
        return (
          <MessageContent markdown>
            {agMessage.payload.text}
          </MessageContent>
        );

      case 'ui':
        return <GenerativeUIRenderer payload={agMessage.payload} />;

      case 'action':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested actions:</p>
            <div className="flex flex-wrap gap-2">
              {agMessage.payload.actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(action.id, action.params)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'reasoning':
        return (
          <Reasoning>
            <div className="space-y-2">
              {agMessage.payload.steps.map((step) => (
                <div key={step.step} className="flex items-start gap-2">
                  <div
                    className={`mt-1 h-4 w-4 rounded-full ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reasoning>
        );

      case 'tool_call':
        return (
          <Tool
            name={agMessage.payload.toolName}
            arguments={agMessage.payload.arguments}
            result={agMessage.payload.result}
          />
        );

      case 'context_request':
        return (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm font-medium">Context request:</p>
            <p className="mt-1 text-sm text-muted-foreground">{agMessage.payload.reason}</p>
            <ul className="mt-2 list-inside list-disc text-sm">
              {agMessage.payload.fields.map((field, i) => (
                <li key={i}>{field}</li>
              ))}
            </ul>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Error</p>
              <p className="mt-1 text-sm">{agMessage.payload.message}</p>
              {agMessage.payload.recoverable && (
                <Button variant="outline" size="sm" className="mt-2">
                  Retry
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return <MessageContent>Unknown message type</MessageContent>;
    }
  };

  return (
    <Message>
      <MessageAvatar
        src="/ai-avatar.png"
        alt="AI Agent"
        fallback="AI"
      />
      {renderMessageContent()}
      <MessageActions>
        <MessageAction tooltip="Copy message">
          <Button variant="ghost" size="icon" onClick={() => handleCopy()}>
            <Copy className="h-4 w-4" />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Good response">
          <Button variant="ghost" size="icon" onClick={() => handleFeedback('positive')}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Bad response">
          <Button variant="ghost" size="icon" onClick={() => handleFeedback('negative')}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </MessageAction>
      </MessageActions>
    </Message>
  );
}

function handleActionClick(actionId: string, params?: any) {
  // Execute action via Convex mutation
  console.log('Execute action:', actionId, params);
}

function handleCopy() {
  // Copy message content
}

function handleFeedback(sentiment: 'positive' | 'negative') {
  // Send feedback to agent
}
```

---

## Part 3: Example Agent Using AG-UI

### IntelligenceAgent with Generative UI

**File:** `convex/services/intelligence-agent.ts`

```typescript
import { Effect } from 'effect';
import { ConvexDatabase } from './convex-database';
import { AgentUIService } from './agent-ui';
import type { Id } from '../_generated/dataModel';
import type { ChartComponentData, TableComponentData } from '../protocols/agent-ui';

export class IntelligenceAgent extends Effect.Service<IntelligenceAgent>()(
  'IntelligenceAgent',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const agentUI = yield* AgentUIService;

      const AGENT_ID = 'agent-intelligence' as Id<'entities'>;

      return {
        /**
         * Analyze user performance and send generative UI dashboard
         */
        analyzePerformance: (args: {
          userId: Id<'entities'>;
          conversationId: Id<'entities'>;
        }) =>
          Effect.gen(function* () {
            // 1. Send reasoning steps
            yield* agentUI.sendReasoning({
              agentId: AGENT_ID,
              conversationId: args.conversationId,
              steps: [
                {
                  step: 1,
                  title: 'Fetching user metrics',
                  description: 'Retrieving performance data from database',
                  completed: true,
                },
                {
                  step: 2,
                  title: 'Analyzing trends',
                  description: 'Identifying patterns and insights',
                  completed: true,
                },
                {
                  step: 3,
                  title: 'Generating visualizations',
                  description: 'Creating charts and tables',
                  completed: false,
                },
              ],
            });

            // 2. Get metrics (simulated)
            const metrics = {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              revenue: [10000, 12000, 15000, 13000, 18000, 20000],
              users: [100, 120, 150, 140, 180, 200],
            };

            // 3. Send text intro
            yield* agentUI.sendText({
              agentId: AGENT_ID,
              conversationId: args.conversationId,
              text: "I've analyzed your performance data. Here's what I found:",
              sentiment: 'positive',
            });

            // 4. Send revenue chart
            const chartComponent: ChartComponentData = {
              component: 'chart',
              data: {
                title: 'Revenue Trend (Last 6 Months)',
                description: '20% growth month-over-month',
                chartType: 'line',
                labels: metrics.labels,
                datasets: [
                  {
                    label: 'Revenue ($)',
                    data: metrics.revenue,
                    color: 'hsl(var(--chart-1))',
                    fill: true,
                  },
                ],
              },
            };

            yield* agentUI.sendUI({
              agentId: AGENT_ID,
              conversationId: args.conversationId,
              component: chartComponent,
            });

            // 5. Send metrics table
            const tableComponent: TableComponentData = {
              component: 'table',
              data: {
                title: 'Monthly Performance Summary',
                headers: ['Month', 'Revenue', 'Users', 'Revenue/User'],
                rows: metrics.labels.map((label, i) => [
                  label,
                  `$${metrics.revenue[i].toLocaleString()}`,
                  metrics.users[i],
                  `$${(metrics.revenue[i] / metrics.users[i]).toFixed(2)}`,
                ]),
                sortable: true,
                filterable: true,
              },
            };

            yield* agentUI.sendUI({
              agentId: AGENT_ID,
              conversationId: args.conversationId,
              component: tableComponent,
            });

            // 6. Send action suggestions
            yield* agentUI.sendActions({
              agentId: AGENT_ID,
              conversationId: args.conversationId,
              actions: [
                {
                  id: 'export_report',
                  label: 'Export Full Report',
                  description: 'Download PDF with detailed analysis',
                  params: { format: 'pdf' },
                },
                {
                  id: 'schedule_review',
                  label: 'Schedule Review',
                  description: 'Set up monthly performance review',
                  params: { frequency: 'monthly' },
                },
                {
                  id: 'deep_dive',
                  label: 'Deep Dive Analysis',
                  description: 'Get detailed insights on specific metrics',
                  params: { metric: 'revenue' },
                },
              ],
            });

            return { success: true };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, AgentUIService.Default],
  }
) {}
```

---

## Part 4: Context Sharing Pattern

### useAgentContext Hook

**File:** `src/hooks/useAgentContext.ts`

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useState, useEffect } from 'react';

/**
 * Context sharing hook (inspired by CopilotKit's useCopilotReadable)
 * Allows agents to access application context
 */
export function useAgentContext(conversationId: Id<'entities'>) {
  const [context, setContext] = useState<Record<string, any>>({});
  const updateContext = useMutation(api.conversations.updateContext);

  // Automatically share context with agent
  useEffect(() => {
    updateContext({
      conversationId,
      context,
    });
  }, [context, conversationId]);

  return {
    // Share context with agent
    shareContext: (key: string, value: any) => {
      setContext((prev) => ({ ...prev, [key]: value }));
    },

    // Remove context
    removeContext: (key: string) => {
      setContext((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    },

    // Get current context
    getContext: () => context,
  };
}

/**
 * Usage example:
 *
 * function MyComponent() {
 *   const { shareContext } = useAgentContext(conversationId);
 *
 *   // Share shopping cart with agent
 *   shareContext('cart', cart);
 *
 *   // Share current page
 *   shareContext('currentPage', location.pathname);
 *
 *   // Share user preferences
 *   shareContext('userPreferences', preferences);
 * }
 */
```

---

## Part 5: Multi-Agent Orchestration

### AgentOrchestrator Service

**File:** `convex/services/agent-orchestrator.ts`

```typescript
import { Effect } from 'effect';
import { IntelligenceAgent } from './intelligence-agent';
import { StrategyAgent } from './strategy-agent';
import { MarketingAgent } from './marketing-agent';
import { SalesAgent } from './sales-agent';
import { AgentUIService } from './agent-ui';
import type { Id } from '../_generated/dataModel';

/**
 * AgentOrchestrator - Coordinate multiple agents
 * Inspired by CopilotKit's multi-agent patterns
 */
export class AgentOrchestrator extends Effect.Service<AgentOrchestrator>()(
  'AgentOrchestrator',
  {
    effect: Effect.gen(function* () {
      const intelligence = yield* IntelligenceAgent;
      const strategy = yield* StrategyAgent;
      const marketing = yield* MarketingAgent;
      const sales = yield* SalesAgent;
      const agentUI = yield* AgentUIService;

      return {
        /**
         * Coordinate campaign creation across multiple agents
         */
        coordinateCampaign: (args: {
          userId: Id<'entities'>;
          conversationId: Id<'entities'>;
          campaignGoal: string;
        }) =>
          Effect.gen(function* () {
            const orchestratorId = 'agent-orchestrator' as Id<'entities'>;

            // Step 1: Intelligence agent analyzes current performance
            yield* agentUI.sendText({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              text: '🎯 Step 1: Analyzing current performance...',
            });

            const analysis = yield* intelligence.analyzePerformance({
              userId: args.userId,
              conversationId: args.conversationId,
            });

            // Step 2: Strategy agent creates plan
            yield* agentUI.sendText({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              text: '📋 Step 2: Creating campaign strategy...',
            });

            const plan = yield* strategy.createCampaignPlan({
              userId: args.userId,
              conversationId: args.conversationId,
              goal: args.campaignGoal,
              insights: analysis,
            });

            // Step 3: Marketing agent creates content
            yield* agentUI.sendText({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              text: '✍️ Step 3: Generating marketing content...',
            });

            const content = yield* marketing.createContent({
              userId: args.userId,
              conversationId: args.conversationId,
              plan: plan,
            });

            // Step 4: Sales agent prepares follow-up
            yield* agentUI.sendText({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              text: '📞 Step 4: Setting up sales follow-up...',
            });

            const followUp = yield* sales.preparefollowUp({
              userId: args.userId,
              conversationId: args.conversationId,
              campaign: content,
            });

            // Final summary
            yield* agentUI.sendText({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              text: '✅ Campaign ready! All agents have contributed.',
              sentiment: 'positive',
            });

            // Send action to approve and launch
            yield* agentUI.sendActions({
              agentId: orchestratorId,
              conversationId: args.conversationId,
              actions: [
                {
                  id: 'approve_campaign',
                  label: 'Approve & Launch Campaign',
                  description: 'Review and launch the complete campaign',
                  params: { planId: plan.id, contentId: content.id },
                  confirmationRequired: true,
                },
              ],
            });

            return { plan, content, followUp };
          }),
      };
    }),
    dependencies: [
      IntelligenceAgent.Default,
      StrategyAgent.Default,
      MarketingAgent.Default,
      SalesAgent.Default,
      AgentUIService.Default,
    ],
  }
) {}
```

---

## Summary

### What We Built (PromptKit + AG-UI)

**UI Layer (PromptKit):**
- ✅ `<Message>` - Chat messages
- ✅ `<PromptInput>` - User input
- ✅ `<ChatContainer>` - Auto-scroll
- ✅ `<Reasoning>` - Agent thinking
- ✅ `<Tool>` - Function calls
- ✅ All shadcn/ui based

**Protocol Layer (Our AG-UI Implementation):**
- ✅ AgentUIMessage types (text, ui, action, context_request, reasoning, tool_call, error)
- ✅ AgentUIService (Effect.ts service)
- ✅ Structured component data (ChartComponentData, TableComponentData, etc.)
- ✅ Type-safe protocol with Convex validators

**Generative UI Layer (Our Renderer):**
- ✅ GenerativeUIRenderer component
- ✅ DynamicChart (Recharts integration)
- ✅ DynamicTable (shadcn table)
- ✅ DynamicCard, DynamicForm, DynamicList, DynamicTimeline
- ✅ AgentMessage component with AG-UI support

**Context & Orchestration:**
- ✅ useAgentContext hook (bidirectional state sharing)
- ✅ AgentOrchestrator service (multi-agent coordination)
- ✅ Action system (human-in-the-loop approvals)

### Final Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Components** | PromptKit (shadcn/ui) | Chat interface, message display |
| **Generative UI** | Our Renderer + Recharts | Dynamic component rendering |
| **Protocol** | AG-UI (our implementation) | Agent-to-frontend communication |
| **AI SDK** | Vercel AI SDK 5 | Streaming, tool calling |
| **Backend** | Convex + Effect.ts | Real-time DB, agent services |
| **State** | Convex reactive queries | Context sharing |

### Benefits

**No Vendor Lock-in:**
- PromptKit: MIT licensed, shadcn-based (can fork/modify)
- AG-UI Protocol: 100% our implementation
- Effect.ts agents: Fully independent
- Convex backend: No CopilotKit dependencies

**CopilotKit Patterns We Implemented:**
- ✅ AG-UI protocol for structured UI messages
- ✅ Generative UI for dynamic component rendering
- ✅ Context sharing (useAgentContext hook)
- ✅ Action suggestions (human-in-the-loop)
- ✅ Multi-agent orchestration (AgentOrchestrator)

**Complete Open Source Freedom:**
- Can replace any component
- Can modify any pattern
- Can extend infinitely
- Zero external runtime dependencies

🎉 **Result:** Professional AI agent interfaces with generative UI, built entirely on open-source stack with PromptKit + Effect.ts + Convex.
