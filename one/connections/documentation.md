# ONE Documentation

**Version:** 1.1.0
**Last Updated:** 2025-01-16
**Purpose:** Visual map showing how all documentation files work together
**Total Files:** 48 (added Modes.md)

---

## Documentation Ecosystem Overview

The ONE Platform documentation forms an integrated system where each file serves a specific purpose and references related files. This map shows the information flow from vision → design → specification → implementation.

---

## The Documentation Pyramid

```
                        ┌─────────────┐
                        │  STRATEGY   │ ← Vision & Model
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐         ┌─────▼─────┐
              │ ONTOLOGY  │         │ ARCHITECTURE │ ← Design
              └─────┬─────┘         └─────┬──────┘
                    │                     │
         ┌──────────┴──────────┬──────────┴──────────┐
         │                     │                      │
    ┌────▼────┐          ┌────▼────┐           ┌─────▼─────┐
    │ Language│          │PROTOCOLS│           │  SERVICES │ ← Archiceture
    └────┬────┘          └────┬────┘           └─────┬─────┘
         │                    │                       │
         └────────────┬───────┴───────┬───────────────┘
                      │               │
              ┌───────▼───────┐   ┌───▼────────┐
              │IMPLEMENTATION │   │ INTEGRATION│ ← Build
              └───────────────┘   └────────────┘
```

---

## Layer 1: Strategic Foundation

### Strategy.md (The Vision)
**Purpose:** Business vision, platform features, economic model
**Defines:** 8 core platform features
**Referenced by:** Ontology.md, Implementation.md, README.md

**Platform Features:**
1. AI Clone Technology
2. Content Automation
3. Interactive Avatar
4. UGC Engine
5. AI-Powered LMS
6. Living Community
7. Business OS
8. Token Economy

**Dependency Chain:**
```
Strategy.md → Ontology.md (feature-to-thing mapping)
           → Implementation.md (feature roadmap)
           → Files.md (feature file structure)
```

---

## Layer 2: System Design

### Ontology.md (The Data Model)
**Purpose:** 4-table universal data model (things, connections, events, tags)
**Defines:** 66 thing types, 25 connection types, 55 event types, 12 tag categories
**Referenced by:** DSL files, Schema files, Implementation.md, Patterns.md
**Version:** 2.0.0 - Frontend Complete

**Core Types:**
- **66 Thing Types** (creator, ai_clone, organization, business_agents[10], content[12], tokens, courses, auth[5], UI preferences, etc.)
- **25 Connection Types** (18 specific + 7 consolidated with metadata)
- **55 Event Types** (44 specific + 11 consolidated with metadata - includes auth, org, UI events)
- **12 Tag Categories** (industry, skill, goal, content_type, etc.)

**Key Innovation:** Protocol-agnostic design - all protocols map TO ontology via metadata

**Dependency Chain:**
```
Ontology.md → ONE DSL.md (technical syntax)
           → ONE DSL English.md (plain english syntax)
           → OntologyUpdates.md (historical reference)
           → Schema files (Convex schema)
           → All service files (business logic)
```

### Architecture.md (The Technical Design)
**Purpose:** System architecture, functional programming patterns, tech stack
**Defines:** Effect.ts patterns, Convex integration, service layer design
**Referenced by:** Patterns.md, Rules.md, Service Layer.md

**Core Concepts:**
- Effect.ts service layer (pure functional)
- Convex backend (real-time database)
- Astro + React frontend (islands architecture)
- Type-safe error handling
- Dependency injection

**Dependency Chain:**
```
Architecture.md → Service Layer.md (Effect.ts patterns)
               → Service Providers.md (provider implementations)
               → Patterns.md (code examples)
               → Implementation.md (tech stack decisions)
               → Hono.md (API backend separation)
```

### Modes.md (Operating Modes)
**Purpose:** Two operating modes - Standalone (content-only) vs API Mode (full-stack)
**Defines:** Feature availability, configuration, and use cases for each mode
**Referenced by:** Development.md, Frontend.md, Hono.md, CLAUDE.md

**Core Concepts:**
- **Standalone Mode**: Content collections (markdown) + AI inference + static site
- **API Mode**: Everything + authentication + agents + real-time + multi-tenant
- Progressive enhancement from simple to full-featured
- Environment-based feature switching

**Mode Comparison:**
- **Standalone**: Perfect for blogs, docs, marketing sites (no backend needed)
- **API Mode**: SaaS platforms, user accounts, dynamic features (full backend)
- **Hybrid**: Marketing static, application dynamic (best of both worlds)

**Configuration:**
- Standalone: Markdown files + optional AI keys
- API Mode: Convex, Better Auth, OAuth, Stripe (via .env)
- Switch modes by adding/removing PUBLIC_CONVEX_URL

**Dependency Chain:**
```
Modes.md → Development.md (workflow guide)
         → Frontend.md (content collections usage)
         → Hono.md (API backend - only in API mode)
         → Dashboard.md (multi-tenant UI - only in API mode)
         → Middleware.md (integration patterns)
```

### Hono.md (API Backend Separation)
**Purpose:** Hono-based API backend architecture for separation of concerns
**Defines:** API backend with Hono + Better Auth + Convex, dual integration pattern
**Referenced by:** Implementation.md, Files.md, Multitenant.md, Modes.md

**Core Concepts:**
- Hono API backend (Cloudflare Workers)
- Better Auth integration
- Convex integration layer
- API client for Astro frontend
- "Vibe code" workflow for rapid frontend development
- Multi-tenant frontend support

**Architecture:**
- **API Backend**: Hono + Better Auth + Convex (business logic, auth, data)
- **Astro Frontend**: UI components connecting to API (user-customizable)
- **Dual Integration**: Hono API for business logic + Convex hooks for real-time data

**Use Cases:**
- Separate frontend/backend deployment
- Multi-tenant custom frontends
- Rapid prototyping ("vibe code" with Convex hooks)
- API portability across platforms

**Dependency Chain:**
```
Hono.md → Architecture.md (tech stack)
        → Service Layer.md (Effect.ts services in Hono routes)
        → Files.md (api/ directory structure)
        → Implementation.md (migration phases)
        → Multitenant.md (multi-org architecture)
        → Modes.md (API mode configuration)
```

### Multitenant.md (Multi-Tenant Architecture)
**Purpose:** Multi-organization architecture using 4-table ontology
**Defines:** Organization isolation, RBAC, custom frontends, billing/quotas
**Referenced by:** Implementation.md, Files.md

**Core Concepts:**
- Organizations as first-class entities
- Data isolation via `orgId` filtering
- Per-org custom branding and features
- Role-based access control (admin, member, viewer)
- Subdomain routing (`org.oneie.com`)
- Per-org billing and quotas
- Shared infrastructure (single API + database)

**Ontology Integration:**
- **Entities**: `organization`, `user` (with org context)
- **Connections**: `member_of` (user→org), `owns` (org→resources)
- **Events**: All events tagged with `orgId` for audit trail
- **Tags**: Organization categorization (industry, size)

**Use Cases:**
- SaaS with multiple organizations
- Enterprise multi-tenant deployment
- Per-org customization and branding
- Flexible billing per organization

**Dependency Chain:**
```
Multitenant.md → Ontology.md (4-table data model)
               → Hono.md (API backend with org middleware)
               → Service Layer.md (OrganizationService)
               → Files.md (organization services location)
               → Implementation.md (migration phases)
```

### Hono-Effect.md (Full Effect.ts Pipeline)
**Purpose:** 100% Effect.ts coverage throughout the entire stack
**Defines:** Functional programming from frontend to backend, unified error handling
**Referenced by:** Implementation.md, Files.md, Patterns.md

**Core Concepts:**
- Effect.ts in React components (frontend)
- Effect.ts route handlers in Hono (API layer)
- Effect.ts services (business logic)
- Effect.ts wrappers for Convex (data layer)
- Effect.ts wrappers for external providers
- Unified dependency injection across stack

**Pipeline Coverage:**
```
Frontend (React + Effect.ts)
    ↓
Hono API (Effect.ts handlers)
    ↓
Business Logic (Effect.ts services)
    ↓
Convex + Providers (Effect.ts wrappers)
```

**Benefits:**
- Consistent error handling (typed errors everywhere)
- Composable effects (small functions combine)
- Testable (no mocking, use test layers)
- Type-safe (compiler catches errors)
- Observable (built-in logging/tracing)
- Resilient (retry, timeout, circuit breakers)

**Key Patterns:**
- `runEffectHandler` - Run Effect programs in Hono routes
- `useEffectRunner` - React hook for Effect programs
- `ConvexDatabase.Live` - Effect layer for Convex
- Service composition with dependency injection
- Test layers instead of mocks

**Dependency Chain:**
```
Hono-Effect.md → Architecture.md (Effect.ts principles)
               → Hono.md (API backend architecture)
               → Service Layer.md (Effect.ts service patterns)
               → Service Providers.md (provider wrappers)
               → Patterns.md (functional patterns)
               → Implementation.md (migration phases)
```

---

## Layer 3: Domain Specific Languages

### DSL.md (DSL Overview)
**Purpose:** Introduction to ONE's two DSL systems
**Defines:** Why we need DSLs, how they work together
**Referenced by:** ONE DSL.md, ONE DSL English.md

### ONE DSL.md (Technical DSL)
**Purpose:** JSON-like DSL for precise ontology operations
**Defines:** Syntax for entities, connections, events, tags
**Uses:** Ontology.md types (56 entities, 25 connections, 35 events)
**Referenced by:** Implementation Examples.md, Patterns.md

**Example:**
```javascript
ENTITY creator "Sarah" WITH {
  type: "creator",
  properties: { industry: "fitness", expertise: ["yoga", "pilates"] }
}

CONNECT creator "Sarah" TO ai_clone "Sarah's Clone"
  VIA "owns"
  WITH { createdAt: "2025-01-01" }

EVENT "course_created" BY creator "Sarah"
  ON entity course "Yoga Fundamentals"
  WITH { price: 99, duration: "8 weeks" }
```

### ONE DSL English.md (Plain English DSL)
**Purpose:** Plain English commands that compile to ONE DSL
**Compiles to:** ONE DSL.md syntax
**Referenced by:** Implementation.md, AI agent prompts

**Example:**
```
Sarah creates an AI clone named "Sarah's Clone"
→ compiles to ENTITY + CONNECT + EVENT

Sarah publishes a course "Yoga Fundamentals" for $99
→ compiles to ENTITY + CONNECT + EVENT with commerce metadata
```

**Dependency Chain:**
```
DSL.md → ONE DSL.md (technical syntax)
      → ONE DSL English.md (plain english)
      → Implementation Examples.md (code examples)
      → CLAUDE.md (AI agent instructions)
```

---

## Layer 4: Protocol Specifications

### README-Protocols.md (Protocol Overview)
**Purpose:** Quick reference for all 5 protocols
**Summarizes:** A2A, ACP, AP2, X402, ACPayments
**Referenced by:** All protocol docs

### A2A.md (Agent-to-Agent Communication)
**Purpose:** A2A protocol specification for inter-agent communication
**Official Spec:** https://a2a-protocol.org/latest/
**Maps to Ontology:**
- Events: `task_delegated`, `communication_event` with `metadata.protocol: "a2a"`
- Connections: `communicated` with `metadata.protocol: "a2a"`

**Use Cases:**
- External agent integration (ElizaOS, CrewAI, LangGraph)
- Multi-agent workflows
- Task delegation

### ACP.md (Agent Communication Protocol - REST)
**Purpose:** REST API for agent-to-frontend communication
**Maps to Ontology:**
- Events: `commerce_event` with `metadata.protocol: "acp"`
- Connections: `transacted` with `metadata.protocol: "acp"`

**Use Cases:**
- Agent-initiated purchases
- ChatGPT agent commerce
- Token purchases via conversational AI

### AP2.md (Agent Payments Protocol)
**Purpose:** Autonomous agent payment authorization (mandates)
**Maps to Ontology:**
- Events: `mandate_event`, `price_event` with `metadata.protocol: "ap2"`
- Connections: `fulfilled` with `metadata.protocol: "ap2"`
- Entities: `intent_mandate`, `cart_mandate`

**Use Cases:**
- "Buy when price drops below $X"
- Subscription renewals
- Automated purchasing

### X402.md (HTTP Micropayments)
**Purpose:** HTTP 402 Payment Required standard for micropayments
**Maps to Ontology:**
- Events: `payment_event` with `metadata.protocol: "x402"`
- Connections: `transacted` with `metadata.protocol: "x402"`

**Use Cases:**
- Pay-per-view content
- Blockchain micropayments
- Streaming payments

### ACPayments.md (Unified Payment Ecosystem)
**Purpose:** Unified layer combining ACP, AP2, X402
**Coordinates:** All payment protocols
**Maps to Ontology:**
- All payment events have `metadata.protocol` to identify source

**Dependency Chain:**
```
README-Protocols.md → A2A.md, ACP.md, AP2.md, X402.md, ACPayments.md
                   → Specifications.md (detailed integration)
                   → Ontology.md (protocol mapping via metadata)
```

### Specifications.md (Complete Protocol Integration)
**Purpose:** How all protocols work together in ONE
**Integrates:** All 5 protocols + ontology mapping patterns
**Referenced by:** Implementation.md, Service files

---

## Layer 5: External Integrations

### ElizaOS.md (External AI Agents)
**Purpose:** ElizaOS integration for external AI agents
**Protocol Used:** A2A
**Maps to Ontology:**
- Entity type: `external_agent`
- Connection type: `communicated` with `metadata.protocol: "a2a"`
- Event type: `communication_event` with `metadata.protocol: "a2a"`

### CopilotKit.md (Generative UI)
**Purpose:** CopilotKit integration for agent-driven UI generation
**Protocol Used:** AG-UI (inspired by CopilotKit)
**Maps to Ontology:**
- Event type: `communication_event` with `metadata.protocol: "ag-ui"`

### PromptKit.md (AI UI Components)
**Purpose:** Production-ready AI/chat UI components
**Built on:** shadcn/ui
**Components:** 17 AI-specific React components
**Related Files:**
- `src/components/prompt-kit/*` (17 component files)
- `convex/services/protocols/ag-ui/*` (5 backend services)

### MCP.md (Model Context Protocol)
**Purpose:** Anthropic's Model Context Protocol for tool/resource access
**Complementary to:** A2A protocol
**Distinction:**
- MCP: Agent ↔ Tool/Resource
- A2A: Agent ↔ Agent

### N8N.md (Workflow Automation)
**Purpose:** n8n integration for no-code workflow automation
**Maps to Ontology:**
- Event type: `task_event` with `metadata.protocol: "n8n"`

### Agent-Communications.md (Communication Patterns)
**Purpose:** Agent communication patterns across protocols
**Synthesizes:** A2A, ACP, AG-UI, MCP patterns

**Dependency Chain:**
```
ElizaOS.md → A2A.md (uses A2A protocol)
          → Agent-Communications.md (communication patterns)
          → Ontology.md (entity/event types)

CopilotKit.md → AGUI.md (AG-UI protocol)
             → PromptKit.md (UI components)

MCP.md → A2A.md (complementary protocols)
```

---

## Layer 6: Service & Component Architecture

### Service Layer.md (Effect.ts Architecture)
**Purpose:** Effect.ts service layer patterns
**Defines:** Pure functional services, dependency injection, error handling
**Referenced by:** Service Providers.md, Patterns.md, Implementation.md

**Core Pattern:**
```typescript
export class TokenService extends Effect.Service<TokenService>()("TokenService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    return {
      purchase: (args) => Effect.gen(function* () { /* ... */ })
    };
  }),
  dependencies: [ConvexDatabase.Default]
}) {}
```

### Service Providers.md (External Provider Wrappers)
**Purpose:** Effect.ts wrappers for 26 external providers
**Categories:** 7 (AI/LLM, Blockchain, Payment, Communication, Media, Integration, Social)
**All files:** `convex/services/providers/*.ts`

**26 Providers:**
- **AI/LLM (5):** OpenAI, Anthropic, ElevenLabs, D-ID, HeyGen
- **Blockchain (4):** Base, Alchemy, Uniswap, WalletConnect
- **Payment (2):** Stripe, Coinbase
- **Communication (4):** Resend, SendGrid, Twilio, Pusher
- **Media/Storage (2):** AWS S3, Cloudflare Stream
- **Integration (3):** ElizaOS, CopilotKit, n8n
- **Social Media (6):** Twitter, Instagram, YouTube, TikTok, LinkedIn, Facebook

### Service Providers - New.md (New Provider Specs)
**Purpose:** Specifications for newly added providers (D-ID, HeyGen, etc.)
**Supplements:** Service Providers.md

### Components.md (Convex Components)
**Purpose:** Integration patterns for Convex components
**9 Components:** agent, workflow, rag, rate-limiter, action-retrier, workpool, persistent-text-streaming, crons, resend
**All wrapped with:** Effect.ts service layer

**Dependency Chain:**
```
Service Layer.md → Service Providers.md (26 provider implementations)
                → Service Providers - New.md (new specs)
                → Components.md (Convex component wrappers)
                → Patterns.md (usage examples)
```

---

## Layer 7: Development Guidelines

### Rules.md (Golden Rules)
**Purpose:** Non-negotiable development rules
**Defines:** Type safety, error handling, ontology-first approach
**Referenced by:** CLAUDE.md, Patterns.md, Workflow.md

**Golden Rules:**
1. Everything maps to 4 tables
2. Explicit types everywhere (no `any`)
3. Typed errors with `_tag`
4. Pure functions in services
5. Thin Convex wrappers
6. Test everything

### Patterns.md (Code Patterns)
**Purpose:** Proven code patterns to replicate
**Examples:** Entity creation, relationship queries, event logging
**Referenced by:** Implementation Examples.md, CLAUDE.md

### Workflow.md (Development Flow)
**Purpose:** Ontology-driven development workflow
**Process:** Map to ontology → Design types → Generate code → Test
**Referenced by:** CLAUDE.md, Implementation.md

### Files.md (File System Map)
**Purpose:** Exact location for every file type
**Defines:** 170+ frontend files, 100+ backend files
**Referenced by:** All AI agents, Implementation.md

**Dependency Chain:**
```
Rules.md → Patterns.md (example implementations)
        → Workflow.md (development process)
        → Files.md (file locations)
        → CLAUDE.md (AI agent instructions)
```

---

## Layer 8: Implementation & Examples

### Schema.md (Convex Schema Implementation)
**Purpose:** Complete Convex schema implementation with 56 entities, 25 connections, 35 events
**Status:** Plain Convex (migrated from Convex Ents)
**References:** Ontology.md, OntologyUpdates.md

**NOTE:** Schema.md contains actual schema code ready for `convex/schema.ts`

### Implementation.md (Build Guide)
**Purpose:** Complete implementation roadmap
**Timeline:** 12 weeks to MVP, 24 weeks to Scale
**References:** Ontology.md, Architecture.md, all protocol docs

**Implementation Phases:**
1. Foundation (Week 1-2): Schema + ConvexDatabase service
2. Core Services (Week 3-6): Entity/connection/event operations
3. Protocol Services (Week 7-10): A2A, ACP, AP2, X402, ACPayments
4. Platform Features (Week 11-18): AI Clone, Content, Courses, etc.
5. External Integrations (Week 19-22): ElizaOS, CopilotKit, n8n
6. Polish & Scale (Week 23-24): Performance, security, deployment

### Development.md (Developer Experience Guide)
**Purpose:** Complete guide for developers using ONE Platform with Claude Code
**Topics:** npx oneie CLI, template generation, API connection, vibe coding workflow
**References:** Ontology.md, API.md, Files.md, CLAUDE.md

**Key Workflows:**
1. Frontend-only mode (connect to api.one.ie)
2. Embedded backend mode (full source control)
3. Claude Code integration (AI-native development)
4. Custom entity/event/product creation
5. Multi-tenant deployment

**Dependency Chain:**
```
Development.md → CLAUDE.md (AI development patterns)
              → Files.md (project structure)
              → API.md (backend endpoints)
              → Implementation.md (technical implementation)
```

### Implementation Examples.md (Code Examples)
**Purpose:** Real working code examples for common patterns
**Uses:** DSL syntax, Effect.ts patterns, Convex functions

### Workflow Examples.md (Complete Workflow Code)
**Purpose:** Full end-to-end workflow implementations
**Examples:** Creator onboarding, AI clone creation, token purchase flows
**Uses:** Effect.ts services, Convex functions, complete patterns

### OntologyUpdates.md (Implementation Plan)
**Purpose:** Detailed migration plan from Convex Ents to plain Convex
**Status:** Design complete, ready for implementation
**References:** Ontology.md, Schema files

### Agent Ingestor.md (Migration Agent Spec)
**Purpose:** Specification for migrating data from one.ie and bullfm to new platform
**Role:** Migration specialist agent
**References:** Ontology.md (target structure), Schema.md (target schema)

### Migration-Guide.md (DELETED)
**Status:** Removed (outdated after Better Auth migration)
**Replaced by:** OntologyUpdates.md

**Dependency Chain:**
```
Implementation.md → OntologyUpdates.md (schema migration)
                 → Implementation Examples.md (code patterns)
                 → Files.md (file structure)
                 → All protocol docs
                 → All integration docs
```

---

## Layer 9: Tooling & Reference

### CLI.md (CLI Tool Specification)
**Purpose:** Specification for `oneie` CLI tool for Plain English feature generation
**Commands:** `one create-feature`, `one compile`, `one test`
**References:** ONE DSL English.md, ONE DSL.md, Ontology.md

### CLI Code.md (CLI Implementation)
**Purpose:** Complete implementation code for `oneie` CLI package
**Includes:** Parser, validator, compiler, test generator
**Technology:** TypeScript, Commander.js, Effect.ts

### CLI Compiler Code.md (Compiler Implementation)
**Purpose:** Detailed compiler implementation (Plain English → Technical DSL → TypeScript)
**Process:** Parse → Validate → Compile → Generate Tests
**Output:** Service files, Convex functions, React components, tests

### API.md (API Reference)
**Purpose:** Complete API reference for all Convex functions, services, and integrations
**Sections:** Queries, Mutations, Actions, Service Layer, External Providers
**References:** Schema.md, Service Layer.md, Service Providers.md

### API-docs.md (Auto-Generated API Docs)
**Purpose:** Auto-generated API documentation from code comments
**Generated from:** Convex function signatures, TypeScript types
**Format:** OpenAPI-style reference

### Architecture Diagram.md (Visual Architecture)
**Purpose:** Visual diagrams showing system architecture
**Diagrams:** Component architecture, data flow, service dependencies
**References:** Architecture.md, Service Layer.md

### Creator Diagram.md (Creator Journey Visuals)
**Purpose:** Visual diagrams of creator user journeys
**Flows:** Onboarding, AI clone creation, content generation, monetization
**References:** Strategy.md, Workflow Examples.md

---

## Special Files

### CLAUDE.md (AI Agent Instructions)
**Purpose:** Complete instructions for Claude Code AI
**Location:** Root directory (not in docs/)
**Synthesizes:** All documentation into actionable AI instructions

**Includes:**
- Quick reference links to all docs
- Development commands
- Architecture overview
- Step-by-step feature implementation process
- Technology stack rules
- Pre/post-generation checklists

**References:**
- AGENTS.md (Convex patterns)
- Rules.md (golden rules)
- Workflow.md (development flow)
- Patterns.md (code patterns)
- Files.md (file locations)
- All other docs as needed

### AGENTS.md (Convex Development)
**Purpose:** Convex-specific development patterns
**Location:** Root directory (not in docs/)
**Covers:** Queries, mutations, actions, schema, Effect.ts integration

**Dependency Chain:**
```
CLAUDE.md → AGENTS.md (Convex patterns)
         → one/things/rules.md (golden rules)
         → one/connections/workflow.md (development flow)
         → one/connections/patterns.md (code patterns)
         → one/things/architecture.md (tech stack)
         → ALL other docs (as needed)
```

---

## Information Flow: Vision → Code

### The Complete Chain

```
1. VISION
   Strategy.md (8 platform features)
   ↓

2. DATA MODEL
   Ontology.md (56 entities, 25 connections, 35 events)
   ↓

3. LANGUAGES
   DSL.md → ONE DSL.md (technical) + ONE DSL English.md (plain english)
   ↓

4. PROTOCOLS
   README-Protocols.md → A2A, ACP, AP2, X402, ACPayments
   Specifications.md (integration patterns)
   ↓

5. INTEGRATIONS
   ElizaOS, CopilotKit, PromptKit, MCP, N8N
   Agent-Communications.md (communication patterns)
   ↓

6. ARCHITECTURE
   Architecture.md (tech stack, FP patterns)
   Hono.md (API backend separation)
   Multitenant.md (multi-org architecture)
   Hono-Effect.md (full Effect.ts pipeline)
   Service Layer.md (Effect.ts services)
   Service Providers.md (26 external providers)
   Components.md (9 Convex components)
   ↓

7. DEVELOPMENT
   Rules.md (golden rules)
   Patterns.md (code patterns)
   Workflow.md (development process)
   Files.md (file locations)
   ↓

8. IMPLEMENTATION
   Implementation.md (12-week roadmap)
   OntologyUpdates.md (schema migration)
   Implementation Examples.md (code examples)
   ↓

9. AI EXECUTION
   CLAUDE.md (synthesizes all docs)
   AGENTS.md (Convex patterns)
   → Generated code in convex/ and src/
```

---

## File Relationship Matrix

| File | Depends On | Referenced By |
|------|-----------|---------------|
| **Strategy.md** | None (foundation) | Ontology.md, Implementation.md, Files.md |
| **Ontology.md** | Strategy.md | DSL files, Schema, All services, Patterns.md |
| **Architecture.md** | Strategy.md | Service Layer.md, Patterns.md, Implementation.md, Hono.md |
| **Hono.md** | Architecture.md, Service Layer.md | Implementation.md, Files.md, Multitenant.md, Hono-Effect.md |
| **Multitenant.md** | Ontology.md, Hono.md, Service Layer.md | Implementation.md, Files.md |
| **Hono-Effect.md** | Architecture.md, Hono.md, Service Layer.md, Service Providers.md | Implementation.md, Files.md, Patterns.md |
| **DSL.md** | Ontology.md | ONE DSL.md, ONE DSL English.md |
| **ONE DSL.md** | DSL.md, Ontology.md | Implementation Examples.md, CLAUDE.md |
| **ONE DSL English.md** | ONE DSL.md | Implementation.md, CLAUDE.md |
| **README-Protocols.md** | Ontology.md | All protocol docs |
| **A2A.md** | README-Protocols.md, Ontology.md | ElizaOS.md, Specifications.md |
| **ACP.md** | README-Protocols.md, Ontology.md | Specifications.md, ACPayments.md |
| **AP2.md** | README-Protocols.md, Ontology.md | Specifications.md, ACPayments.md |
| **X402.md** | README-Protocols.md, Ontology.md | Specifications.md, ACPayments.md |
| **ACPayments.md** | ACP.md, AP2.md, X402.md | Specifications.md |
| **AGUI.md** | Ontology.md | CopilotKit.md, PromptKit.md |
| **Specifications.md** | All protocol docs, Ontology.md | Implementation.md, Service files |
| **ElizaOS.md** | A2A.md, Ontology.md | Agent-Communications.md, Implementation.md |
| **CopilotKit.md** | AGUI.md | PromptKit.md, Implementation.md |
| **PromptKit.md** | AGUI.md, CopilotKit.md | Files.md, Component files |
| **MCP.md** | A2A.md | Agent-Communications.md |
| **N8N.md** | Ontology.md | Implementation.md |
| **Agent-Communications.md** | A2A.md, ElizaOS.md, MCP.md | Implementation.md |
| **Service Layer.md** | Architecture.md | Service Providers.md, Patterns.md |
| **Service Providers.md** | Service Layer.md | Files.md, Implementation.md |
| **Service Providers - New.md** | Service Providers.md | Files.md |
| **Components.md** | Service Layer.md | Files.md, Implementation.md |
| **Rules.md** | Architecture.md | Patterns.md, Workflow.md, CLAUDE.md |
| **Patterns.md** | Rules.md, Ontology.md | Implementation Examples.md, CLAUDE.md |
| **Workflow.md** | Rules.md, Ontology.md | CLAUDE.md, Implementation.md |
| **Files.md** | All docs (maps all files) | CLAUDE.md, All AI agents |
| **Implementation.md** | ALL docs (synthesis) | None (execution layer) |
| **Development.md** | Ontology.md, API.md, Files.md, CLAUDE.md | Implementation.md |
| **OntologyUpdates.md** | Ontology.md, Implementation.md | Schema files |
| **Implementation Examples.md** | Patterns.md, ONE DSL.md | CLAUDE.md |
| **CLAUDE.md** | ALL docs (complete synthesis) | None (AI execution) |
| **AGENTS.md** | Architecture.md, Service Layer.md | CLAUDE.md |

---

## Critical Paths

### Path 1: Strategy → Implementation
```
Strategy.md
→ Ontology.md (map features to entities)
→ Implementation.md (build roadmap)
→ Files.md (file structure)
→ Code generation
```

### Path 2: Ontology → Code
```
Ontology.md
→ ONE DSL.md (syntax)
→ OntologyUpdates.md (schema plan)
→ Schema files (convex/schema.ts)
→ Service files (business logic)
→ Convex functions (API layer)
```

### Path 3: Protocols → Services
```
README-Protocols.md
→ Individual protocol docs (A2A, ACP, AP2, X402, ACPayments)
→ Specifications.md (integration patterns)
→ Service files (convex/services/protocols/*)
→ Ontology mapping (via metadata.protocol)
```

### Path 4: Architecture → Implementation
```
Architecture.md
→ Service Layer.md (Effect.ts patterns)
→ Service Providers.md (26 providers)
→ Patterns.md (code examples)
→ Implementation Examples.md (working code)
→ Code generation
```

### Path 5: Multi-Tenant Implementation
```
Multitenant.md
→ Ontology.md (organization entity, member_of connections)
→ Hono.md (API backend with org middleware)
→ Service Layer.md (OrganizationService pattern)
→ Files.md (convex/services/organizations/)
→ Implementation.md (migration phases)
→ Generate code
```

### Path 6: Effect.ts Pipeline Implementation
```
Hono-Effect.md
→ Architecture.md (Effect.ts principles)
→ Service Layer.md (Effect.ts service patterns)
→ Hono.md (API integration)
→ Service Providers.md (provider wrappers)
→ Patterns.md (functional patterns)
→ Files.md (service locations)
→ Implementation.md (migration strategy)
→ Generate Effect.ts code
```

### Path 7: AI Agent Execution
```
CLAUDE.md (reads all docs)
→ AGENTS.md (Convex patterns)
→ Rules.md (validate approach)
→ Workflow.md (follow process)
→ Ontology.md (map feature to tables)
→ Patterns.md (replicate patterns)
→ Files.md (determine file locations)
→ Generate code
→ Verify against Implementation Examples.md
```

### Path 8: Developer Quick Start (Using ONE CLI + Claude Code)
```
Development.md
→ npx oneie create (bootstrap project)
→ CLAUDE.md (AI development workflow)
→ Ontology.md (understand data model)
→ API.md (backend endpoints)
→ Files.md (project structure)
→ Vibe code with Claude (rapid frontend development)
→ Deploy
```

---

## Documentation Health Checklist

### ✅ Complete
- [x] All 47 .md files mapped in Files.md
- [x] Strategy defines all 8 platform features
- [x] Ontology covers all features (100% coverage verified)
- [x] DSL supports all ontology types (hybrid approach: 25 connections, 35 events)
- [x] All 6 protocols specified (A2A, ACP, AP2, X402, ACPayments, AG-UI)
- [x] All integrations documented (ElizaOS, CopilotKit, PromptKit, MCP, N8N)
- [x] Service layer fully specified (26 providers + 9 Convex components)
- [x] Development guidelines complete (Rules, Patterns, Workflow, Files)
- [x] Implementation roadmap ready (12-week plan)
- [x] AI agent instructions complete (CLAUDE.md)
- [x] CLI tooling specified (CLI.md, CLI Code.md, CLI Compiler Code.md)
- [x] API documentation complete (API.md, API-docs.md)
- [x] Schema implementation ready (Schema.md)
- [x] Migration agent specified (Agent Ingestor.md)
- [x] API backend architecture specified (Hono.md)
- [x] Multi-tenant architecture specified (Multitenant.md)
- [x] Full Effect.ts pipeline coverage specified (Hono-Effect.md)

### 🚧 In Progress
- [ ] Actual code implementation (convex/ and src/ directories)
- [ ] Automated tests
- [ ] CLI tooling

### 📋 Future Enhancements
- [ ] Video tutorials
- [ ] Interactive documentation
- [ ] API reference (auto-generated from code)
- [ ] Component storybook

---

## How to Use This Map

### For Human Developers
**Quick Start (Using ONE Platform):**
1. Start with **Development.md** for rapid setup using npx oneie CLI
2. Read **CLAUDE.md** for AI-assisted development workflow
3. Use **API.md** to understand available backend endpoints
4. Reference **Files.md** for project structure

**Deep Dive (Building from Scratch):**
1. Start with **Strategy.md** to understand the vision
2. Read **Ontology.md** to understand the data model
3. Check **Architecture.md** for tech stack decisions
4. Review **Rules.md** and **Patterns.md** for development guidelines
5. Follow **Workflow.md** for feature development process
6. Reference **Files.md** for file locations
7. Use **Implementation.md** for roadmap and timeline

### For AI Agents (Claude Code)
1. **ALWAYS** start with **CLAUDE.md** (synthesizes all docs)
2. Read **AGENTS.md** for Convex-specific patterns
3. Read **Rules.md** for non-negotiable rules
4. Read **Workflow.md** for step-by-step process
5. Read **Ontology.md** to map feature to 4 tables
6. Read **Patterns.md** to find similar code
7. Read **Files.md** to determine file locations
8. Generate code following proven patterns
9. Verify against **Implementation Examples.md**

### For Protocol Implementers
1. Read **README-Protocols.md** for overview
2. Read specific protocol doc (A2A.md, ACP.md, etc.)
3. Read **Specifications.md** for integration patterns
4. Read **Ontology.md** for data model mapping
5. Check **Service Layer.md** for Effect.ts patterns
6. Implement service in `convex/services/protocols/`

### For External Integration
1. Read **Agent-Communications.md** for communication patterns
2. Read relevant integration doc (ElizaOS.md, CopilotKit.md, etc.)
3. Check protocol used (A2A, AG-UI, MCP, etc.)
4. Read **Service Providers.md** for wrapper patterns
5. Implement wrapper in `convex/services/providers/`

---

## Summary

The ONE Platform documentation is a **complete, integrated system** where:

- **Strategy.md** defines the vision (8 features)
- **Ontology.md** defines the data model (4 tables, 128 types)
- **DSL files** provide two languages for ontology operations
- **Protocol docs** specify external standards integration
- **Integration docs** define external system connections
- **Service docs** specify Effect.ts architecture
- **Development docs** guide code generation
- **Implementation docs** provide roadmap and examples
- **CLAUDE.md** synthesizes everything for AI agents

**Every file has a purpose. Every file references related files. Everything flows from Strategy → Ontology → Implementation.**

**The system is designed for AI-generated code at scale while maintaining consistency and type safety.**

---

**Next Steps:**
1. Read this map to understand the documentation ecosystem
2. Follow the critical paths for your use case
3. Reference the file relationship matrix for dependencies
4. Use the information flow diagram to understand the complete chain
5. Start implementation following the 12-week roadmap in Implementation.md

**This map ensures no documentation file is orphaned and every file's role is clear.**
