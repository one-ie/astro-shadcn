# AI Platform (Provider‑Agnostic)

Purpose: Adopt OpenAI SDK, AgentKit, and the new ChatKit without lock‑in by building on top of the Vercel AI SDK. Enable streaming of React components inside the chat UI. All modeling follows the ONE ontology (things, connections, events, knowledge).

—

## Goals

- Provider‑agnostic foundation using Vercel AI SDK (models, tools, streaming).
- Optional adapters for OpenAI SDK, AgentKit, and ChatKit — used only where compatible.
- Streamed chat UX that can render React components (Generative UI) incrementally.
- Clean mapping to ONE primitives with proper protocol metadata and indexes.
- Org‑scoped provider config, easy to switch or mix (OpenAI, Anthropic, Google, Mistral, Ollama/Groq, etc.).

Non‑goals (initially)
- No hard dependency on Assistants/Responses specifics or provider‑proprietary features.
- No lock‑in to a single tool‑calling schema; we normalize via Vercel AI SDK.

—

## High‑Level Architecture

Core layers (inside apps/astro‑shadcn):

- Transport & Streaming
  - Use Vercel AI SDK server utilities (`streamText` / `StreamData`), emitting SSE/HTTP streams.
  - Define a secondary “UI stream” channel for Generative UI instructions.

- Model Provider Adapter (provider‑agnostic)
  - Wrap Vercel AI SDK model registry to expose models by provider key: `openai:gpt-4o`, `anthropic:claude-3-5-sonnet`, `google:gemini-1.5-pro`, `mistral:large`, `ollama:llama3`.
  - Centralize auth/env lookup per org in Convex.

- Tool Calling Adapter (unified)
  - Define tool interfaces with Zod schemas; register as Vercel AI `tools` so calls work across providers.
  - Map provider‑specific function/tool variants back to a normalized tool call event.

- Generative UI (React component streaming)
  - Protocol: use AG‑UI messages (see `one/things/CopilotKit.md`) with `type: 'ui'` and structured payloads.
  - Server streams UI instructions interleaved with text tokens.
  - Client renders via a component registry, keyed by `component` and `version`.

- Optional Adapters
  - OpenAI SDK: used for features not yet in Vercel AI SDK (e.g., TTS, Realtime, Assistants), guarded by capability flags per provider.
  - AgentKit: selectively adopt utilities that don’t constrain provider choice; wrap behind an internal interface.
  - ChatKit: consume only UI‑primitives or patterns compatible with Astro/React islands; no RSC lock‑in.

—

## OpenAI AgentKit Alignment

Reference: “Introducing AgentKit” (OpenAI). Treat AgentKit as an optional provider‑specific runtime we can target without changing our core abstractions.

Design
- Internal interface `IAgentRuntime` with methods:
  - `createSession(args): Promise<Session>`
  - `respond({ messages, tools, context, stream }): Stream | Response`
  - `endSession(sessionId)`
- Implementations:
  - `OpenAI_AgentKitRuntime` (uses OpenAI AgentKit sessions/endpoints when provider = 'openai')
  - `AI_SDK_Runtime` (default; uses Vercel AI SDK across providers)

Sessions
- Model session as a Thing: `agent_session` with `properties: { provider, sessionId, expiresAt, protocol: 'openai' }`.
- Create `entity_created` and `communication_event { messageType: 'session_created' }` on start; `session_closed` on end.

UI/Widgets
- If AgentKit emits “widgets”/UI artifacts, translate them to AG‑UI envelopes: `{ type: 'ui', component, props }`.
- When not using ChatKit client, render via our `GenerativeUIRenderer` and component registry.

Tools
- Register our tools in a provider‑agnostic way (Zod schemas). For OpenAI, expose them to AgentKit through its tool interface; otherwise run via AI SDK tools.

Safety & Fallbacks
- Capability flag `features.agentkit = true|false` per org.
- If AgentKit session creation fails or not allowed, fall back to `AI_SDK_Runtime` seamlessly.

Lock‑in Avoidance
- No code paths should require AgentKit; it’s an adapter behind `IAgentRuntime`.
- All messages/events/knowledge are persisted using our consolidated types; protocol specifics live in `properties/metadata`.

—

## ONE Ontology Mapping

Thing types (examples)
- `external_agent` — an agent runtime (OpenAI, local worker) with `properties.protocol` and `properties.model`.
- `model_provider` — OpenAI/Anthropic/Google/Mistral/Groq/Ollama.
- `ai_model` — concrete model (e.g., `gpt-4o`, `claude-3-5-sonnet`), include pricing/limits in `properties`.
- `ai_tool` — a callable tool; `properties` includes name, schema, capability tags.
- `conversation` — a chat thread.
- `conversation_message` — message thing when needed as a first‑class entity.

Connections
- `external_agent -> ai_model uses { protocol }`
- `creator -> external_agent delegated { scope[] }`
- `external_agent -> conversation communicated { channel: 'chat', protocol }`
- `creator|org -> model_provider holds_tokens { balance, currency }`

Events (use consolidated families; include `metadata.protocol`)
- `communication_event { messageType: 'chat|ui|tool_call|reasoning', stream?: boolean }`
- `entity_created|updated|deleted` for lifecycle
- `metric_calculated|insight_generated` for analytics

Indexes
- `things.by_type`, `events.type_time`, `events.actor_time`, `events.thing_type_time`, `connections.from_type`, `connections.to_type`.

—

## Streaming React Components (Generative UI)

Protocol (server → client)
- Stream JSON envelopes interleaved with token text via SSE:
  - `{ type: 'text', delta: '…' }`
  - `{ type: 'ui', component: 'Card', key: 'msg-123', props: { title, body }, mode: 'append|replace' }`
  - `{ type: 'tool_call', name, args, status }`
  - `{ type: 'reasoning', step, message }`

Client (Astro + React islands)
- Maintain a registry: `UIRegistry[componentName] = ReactComponent`.
- Chat message renderer switches on `type` and renders UI envelopes using the registry.
- For partial UI, use `mode: 'replace'` to progressively refine a placeholder skeleton.

Why not lock into RSC
- Astro does not rely on Next.js RSC APIs. We stream typed messages and hydrate React islands that render components, keeping the approach framework‑agnostic.

—

## Provider‑Agnostic Model & Tools

Model registry
- Expose a simple `getModelForOrg(orgId, capability)` that returns an id like `openai:gpt-4o-mini` or `anthropic:claude-3-5-sonnet` based on policy.

Tools
- Define tools with Zod schemas and register through Vercel AI SDK so they work across providers.
- Persist tool calls as `communication_event { messageType: 'tool_call' }` with args/result in `metadata`.

Fallbacks
- If a provider lacks a feature (e.g., parallel tool calls), serialize calls in our adapter and keep UI consistent.

—

## Implementation Plan (Milestones)

M0 — Scaffolding & Config
- Add `src/lib/ai/provider.ts`: Vercel AI SDK bindings, provider registry, env lookup via Convex.
- Add `src/lib/ai/tools.ts`: Zod tool definitions + adapter to Vercel AI.
- Add `src/lib/ai/stream.ts`: SSE helpers, `StreamData` envelopes for text/ui/tool.

M1 — Basic Chat Streaming
- API route `src/pages/api/ai/chat.ts` (Astro): accepts messages, streams tokens using Vercel AI `streamText`.
- Frontend chat: integrate with shadcn chat components; consume SSE stream.
- Event logging: `communication_event` for user/assistant turns.

M2 — Tools (Unified)
- Wire tool calling across providers via Vercel AI `tools`.
- Persist tool calls as events; show tool call progress in UI stream.
- Add sample tools: `get_weather`, `search_docs`, `create_task`.

M3 — Generative UI Streaming
- Implement `UIRegistry` and `<GenerativeUIRenderer />` in `src/components/ai/`.
- Server emits `{ type: 'ui', component, props }` envelopes; client renders inline in the chat.
- Provide reference components: `Card`, `Table`, `Chart`, `Form`.

M4 — Optional OpenAI SDK / AgentKit / ChatKit
- OpenAI SDK: gate advanced features (TTS, Realtime) behind capability flags.
- AgentKit: adopt utilities that do not constrain provider choice; expose through internal interfaces only.
- ChatKit: use only UI primitives/patterns compatible with Astro islands; no hard RSC/Routing coupling.

M5 — Multi‑Provider & Governance
- Per‑org policy: choose default model, max tokens, allowed capabilities.
- Observability: trace ids in stream envelopes; persist to events.
- Add fallbacks and circuit breakers (time limits, token caps) in adapters.

—

## File Map (initial)

- `src/lib/ai/provider.ts` — provider registry using Vercel AI SDK; model ids, capability flags.
- `src/lib/ai/tools.ts` — Zod tool schemas; execution router; event persistence.
- `src/lib/ai/stream.ts` — SSE helpers; typed envelopes for `text|ui|tool|reasoning`.
- `src/components/ai/Chat.tsx` — Chat container (shadcn), consumes stream.
- `src/components/ai/GenerativeUIRenderer.tsx` — Renders UI envelopes via registry.
- `src/components/ai/registry.ts` — Component registry (Card/Table/Chart/Form).
- `src/pages/api/ai/chat.ts` — Chat endpoint (Astro API route) streaming via Vercel AI.

—

## Example: Streaming Endpoint (sketch)

```ts
// src/pages/api/ai/chat.ts
import { streamText } from 'ai';
import { getModelForOrg } from '@/lib/ai/provider';
import { StreamData } from 'ai';

export const post = async ({ request, locals }) => {
  const { messages, orgId } = await request.json();
  const model = await getModelForOrg(orgId, 'general');

  const data = new StreamData();
  const result = await streamText({
    model,
    messages,
    onChunk: ({ chunk }) => {
      // data.append({ type: 'text', delta: chunk.textDelta })
    },
    // tools: [ ... ]
  });

  // You can interleave UI messages at any time
  // data.append({ type: 'ui', component: 'Card', key: crypto.randomUUID(), props: { title: 'Analysis', body: '...' } });
  // data.close();

  return result.toAIStreamResponse({ data });
};
```

—

## Governance & Safety

- Capability flags per provider and per org; default to least privilege.
- Human‑in‑the‑loop for impactful tools; model as `delegated` connections with explicit scopes.
- Log all tool calls and UI emissions as events; include `metadata.protocol`.

—

## Testing & Validation

- Unit: adapter selection, tool schema validation, UI envelope schema.
- Integration: chat stream happy path + tool call; UI streaming end‑to‑end render.
- Cross‑provider: run the same prompt/tools across at least two providers.

—

## Rollout

1) M0–M1 in a feature branch; connect to basic chat page.
2) Add 2–3 demo UI components (Card/Table). Validate streaming in Astro.
3) Introduce tools with one provider; then verify with a second provider.
4) Add optional OpenAI SDK/AgentKit features behind flags; integrate ChatKit UI primitives as compatible.
5) Document per‑org settings and indexing; add observability.

—

## Cross‑Refs

- `one/things/AgentKit.md` — OpenAI SDK agent modeling
- `one/things/CopilotKit.md` — AG‑UI protocol and Generative UI renderer
- `AGENTS.md` — ONE ontology rules (4 primitives)
