# Ontology-Driven Development Workflow

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Purpose:** The complete workflow AI agents must follow when implementing features

---

## Navigation First: Understanding the Documentation Ecosystem

**BEFORE following this workflow, read:**
- **[docs/Documentation-Map.md](./Documentation-Map.md)** - Complete map of all 41 documentation files

**This workflow assumes you understand:**
- The 8-layer documentation pyramid (Strategy → Ontology → DSL → Protocols → Integrations → Services → Development → Implementation)
- The 5 critical paths for different feature types
- The file relationship matrix showing dependencies
- How to navigate the documentation ecosystem efficiently

---

## The Key Concept: Everything Flows From The Ontology

```
DOCUMENTATION MAP (navigation)
    ↓
STRATEGY (8 platform features)
    ↓
ONTOLOGY (4 tables: 56 entities, 25 connections, 35 events)
    ↓
DSL (Plain English + Technical syntax)
    ↓
PROTOCOLS (A2A, ACP, AP2, X402, ACPayments, AG-UI)
    ↓
CONVEX SCHEMA (type definitions)
    ↓
GENERATED TYPES (automatic TypeScript)
    ↓
EFFECT.TS SERVICES (typed operations)
    ↓
CONVEX FUNCTIONS (compose services)
    ↓
FEATURES (compose functions)
```

**The ontology constrains everything.** AI agents can't invent new structures - they can only combine existing primitives.

Let me show you exactly how this works:

## Step 1: Ontology Defines Reality

```typescript
// convex/schema/entities.ts
// This is the SOURCE OF TRUTH

export const entities = defineEnt({
  type: v.union(
    v.literal("creator"),
    v.literal("ai_clone"),
    v.literal("token"),
    // ... all possible entity types
  ),
  name: v.string(),
  properties: v.any(),  // Type-specific data
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("draft")
  ),
  createdAt: v.number(),
  updatedAt: v.number()
})
```

**This defines what CAN exist.** Nothing else is possible.

## Step 2: Convex Generates Types

```typescript
// convex/_generated/dataModel.d.ts
// AUTOMATICALLY GENERATED - never edit

export type Entity = {
  _id: Id<"entities">;
  type: "creator" | "ai_clone" | "token";
  name: string;
  properties: any;
  status: "active" | "inactive" | "draft";
  createdAt: number;
  updatedAt: number;
}

export type Id<TableName> = string & { __tableName: TableName }
```

**TypeScript now knows what's valid.** Compiler catches mistakes.

## Step 3: Services Use Generated Types

```typescript
// convex/services/core/database.ts
import { Id } from "../../_generated/dataModel";

export class ConvexDatabase extends Effect.Service<ConvexDatabase>()(
  "ConvexDatabase",
  {
    effect: Effect.gen(function* () {
      return {
        // Type-safe! Can only insert valid entities
        insert: <T extends "entities" | "connections" | "events">(
          table: T,
          doc: WithoutSystemFields<Doc<T>>
        ) => Effect.Effect<Id<T>, DatabaseError>,
        
        // Type-safe! Can only get valid IDs
        get: <T extends "entities" | "connections" | "events">(
          id: Id<T>
        ) => Effect.Effect<Doc<T> | null, DatabaseError>,
        
        // Type-safe! Queries know table structure
        query: (table: "entities" | "connections" | "events") =>
          Effect.Effect<QueryBuilder<...>, DatabaseError>
      }
    })
  }
) {}
```

**Services operate on generated types only.** Can't create invalid data.

## Step 4: AI Agents Compose Primitives

When AI generates code, it can ONLY use:

### Primitive 1: Create Entity

```typescript
// AI can generate this (uses ontology)
const createCreator = (data: CreatorData) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    // Type system ensures this is valid
    const creatorId = yield* db.insert("entities", {
      type: "creator",  // Must be valid type from ontology
      name: data.name,
      properties: { /* ... */ },
      status: "active",  // Must be valid status from ontology
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return creatorId;
  });
```

### Primitive 2: Create Connection

```typescript
// AI can generate this (uses ontology)
const createConnection = (from: Id<"entities">, to: Id<"entities">) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    // Type system ensures relationship is valid
    const connId = yield* db.insert("connections", {
      fromEntityId: from,
      toEntityId: to,
      relationshipType: "owns",  // Must be valid type from ontology
      createdAt: Date.now()
    });
    
    return connId;
  });
```

### Primitive 3: Log Event

```typescript
// AI can generate this (uses ontology)
const logEvent = (entityId: Id<"entities">, type: EventType) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    // Type system ensures event is valid
    yield* db.insert("events", {
      entityId,
      eventType: type,  // Must be valid event from ontology
      timestamp: Date.now(),
      actorType: "system",
      metadata: {}
    });
  });
```

## Why This Makes AI Generation Perfect

### Without Ontology (Chaos)

```typescript
// AI invents random structure
function createUser(data: any) {
  db.users.insert({
    username: data.name,
    // Wait, is it username or name?
    followers: [],  // Array of IDs? Or objects?
    posts: data.posts  // How is this related?
  });
}

// Later, AI invents different structure
function getUser(id: string) {
  return db.people.find({ userId: id });
  // Wait, is it users or people? userId or id?
}
```

**AI generates inconsistent code because there's no constraint.**

### With Ontology (Perfect)

```typescript
// AI MUST use ontology primitives
const createCreator = (data: CreatorData) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    // TypeScript error if AI tries wrong type!
    const id = yield* db.insert("entities", {
      type: "creator",  // ✅ Valid
      // type: "user",  // ❌ Compiler error - not in ontology
      name: data.name,
      properties: { email: data.email },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return id;
  });
```

**AI can't invent structure. It must compose primitives from ontology.**

## The Magic: Type-Driven Development

```
Ontology → Schema → Types → Services → Functions → Features
   ↓         ↓        ↓         ↓          ↓          ↓
SOURCE   DEFINES  ENFORCES  COMPOSES   BUILDS    DELIVERS
```

**Every layer derives from the previous layer.**

### Example: Token Purchase Feature

**1. Ontology defines:**

- `token` entity type
- `holds_tokens` connection type
- `tokens_purchased` event type

**2. Schema generates:**

```typescript
type Entity = { type: "token", ... }
type Connection = { relationshipType: "holds_tokens", ... }
type Event = { eventType: "tokens_purchased", ... }
```

**3. Services use types:**

```typescript
const TokenService = {
  purchase: (userId: Id<"entities">, tokenId: Id<"entities">) =>
    Effect.gen(function* () {
      // All operations are type-safe
      yield* db.insert("connections", {
        fromEntityId: userId,
        toEntityId: tokenId,
        relationshipType: "holds_tokens"  // Must be valid!
      });
      
      yield* db.insert("events", {
        entityId: tokenId,
        eventType: "tokens_purchased"  // Must be valid!
      });
    })
}
```

**4. AI generates feature:**

```typescript
// AI agent reads ontology, sees "token" entity exists
// AI agent sees "holds_tokens" connection exists
// AI agent composes these primitives
// CANNOT generate invalid code - types prevent it!
```

## Why This Scales With AI

**Traditional approach:**

- AI sees patterns, copies patterns
- Patterns drift over time
- No constraint on what AI can generate
- Codebase becomes inconsistent

**Ontology-driven approach:**

- AI sees primitives, composes primitives
- Primitives never change (ontology is stable)
- Type system constrains AI
- Codebase stays consistent

**At 10,000 files:**

- Traditional: AI generates 100 different ways to "create user"
- Ontology-driven: AI generates 1 way (the only valid way)

## Practical Example

Let's say AI needs to implement "course enrollment":

**AI reads ontology:**

- ✅ `course` entity exists
- ✅ `audience_member` entity exists
- ✅ `enrolled_in` connection exists
- ✅ `course_enrolled` event exists

**AI generates code:**

```typescript
const enrollInCourse = (
  userId: Id<"entities">,
  courseId: Id<"entities">
) =>
  Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    
    // Step 1: Create connection (ontology defines this)
    yield* db.insert("connections", {
      fromEntityId: userId,
      toEntityId: courseId,
      relationshipType: "enrolled_in",  // From ontology!
      metadata: { progress: 0 },
      createdAt: Date.now()
    });
    
    // Step 2: Log event (ontology defines this)
    yield* db.insert("events", {
      entityId: courseId,
      eventType: "course_enrolled",  // From ontology!
      timestamp: Date.now(),
      actorType: "user",
      actorId: userId,
      metadata: {}
    });
  });
```

**AI couldn't generate different code even if it wanted to.** The types constrain it.

## Summary

**Everything flows from ontology:**

1. **Ontology** = Source of truth (4 tables, limited types)
2. **Schema** = Convex definition (defines what exists)
3. **Generated Types** = TypeScript (compiler enforces)
4. **Services** = Effect.ts operations (compose primitives)
5. **Functions** = Business logic (use services)
6. **Features** = User-facing (compose functions)

**AI agents can only generate code that:**

- Uses entity types from ontology
- Uses connection types from ontology
- Uses event types from ontology
- Composes existing services
- Follows Effect.ts patterns

**AI can't:**

- Invent new entity types (not in ontology)
- Create arbitrary relationships (not in ontology)
- Log invalid events (not in ontology)
- Skip type checking (compiler prevents it)

**This is why larger codebases get BETTER - the ontology gets richer, giving AI more primitives to compose, but it can never break the constraints.**

---

## Complete Workflow: Implementing a New Feature

### Phase 1: Documentation Navigation (5-10 minutes)

**1. Start with Documentation-Map.md**
```
Read: docs/Documentation-Map.md
Action: Identify which layer your feature belongs to
Output: Understanding of critical path to follow
```

**2. Identify Feature Type**

| Feature Type | Critical Path to Follow |
|--------------|------------------------|
| **Core Platform Feature** | Strategy → Ontology → Service Layer → Implementation |
| **Protocol Integration** | README-Protocols → Protocol Spec → Specifications → Ontology |
| **External Integration** | Integration Doc → Protocol Used → Agent-Communications → Ontology |
| **Service Provider** | Service Providers → Service Layer → Patterns |
| **UI Component** | PromptKit/CopilotKit → AGUI → Components → Files |

**3. Follow Critical Path**
- Read only the docs in your dependency chain
- Use the file relationship matrix to understand connections
- Reference the information flow diagram

### Phase 2: Feature Mapping (10-15 minutes)

**1. Map to Strategy (if new feature)**
```
Read: docs/Strategy.md
Question: Which of the 8 platform features does this relate to?
  1. AI Clone Technology
  2. Content Automation
  3. Interactive Avatar
  4. UGC Engine
  5. AI-Powered LMS
  6. Living Community
  7. Business OS
  8. Token Economy
```

**2. Map to Ontology**
```
Read: docs/Ontology.md
Questions:
  - What entities are involved? (56 entity types available)
  - What connections? (25 connection types available)
  - What events? (35 event types available)
  - What tags? (12 tag categories available)
```

**3. Check for Protocol Requirements**
```
Read: docs/README-Protocols.md (if applicable)
Questions:
  - Does this feature use A2A? (agent-to-agent communication)
  - Does this feature use ACP? (agent REST API)
  - Does this feature use AP2? (payment mandates)
  - Does this feature use X402? (micropayments)
  - Does this feature use AG-UI? (generative UI)
```

**4. Check for Integration Requirements**
```
Questions:
  - Does this integrate with ElizaOS? (external AI agents)
  - Does this integrate with CopilotKit? (generative UI)
  - Does this use PromptKit? (AI UI components)
  - Does this use MCP? (model context protocol)
  - Does this use n8n? (workflow automation)
```

### Phase 3: Design (15-20 minutes)

**1. Read Relevant Patterns**
```
Read: docs/Patterns.md
Action: Find similar existing patterns
Output: Code pattern to replicate
```

**2. Design Effect.ts Service**
```
Read: docs/Service Layer.md
Pattern: Pure functional service with dependency injection
Location: convex/services/[category]/[service].ts
```

**3. Plan Data Flow**
```
Entity Creation → Connection Creation → Event Logging → Return Result
All operations: Type-safe, explicit errors, Effect.ts
```

**4. Identify Dependencies**
```
Questions:
  - Which service providers needed? (26 available - see Service Providers.md)
  - Which Convex components needed? (9 available - see Components.md)
  - Which protocols needed? (6 available - see Specifications.md)
```

### Phase 4: Implementation (30-60 minutes)

**1. Create Service (Business Logic)**
```typescript
// convex/services/[category]/[service].ts
export class FeatureService extends Effect.Service<FeatureService>()(
  "FeatureService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const provider = yield* ExternalProvider;

      return {
        operation: (args: Args) =>
          Effect.gen(function* () {
            // 1. Validate inputs
            // 2. Call external provider if needed
            // 3. Create/update entities
            // 4. Create connections
            // 5. Log events
            // 6. Return typed result
          })
      };
    }),
    dependencies: [ConvexDatabase.Default, ExternalProvider.Default]
  }
) {}
```

**2. Create Convex Function (Thin Wrapper)**
```typescript
// convex/mutations/[domain].ts or convex/queries/[domain].ts
export const operation = confect.mutation({
  args: { /* Convex validators */ },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* FeatureService;
      return yield* service.operation(args);
    }).pipe(Effect.provide(MainLayer))
});
```

**3. Create React Component (if UI needed)**
```typescript
// src/components/features/[domain]/[Component].tsx
export function FeatureComponent({ id }: Props) {
  const operation = useMutation(api.domain.operation);

  return (
    <Button onClick={() => operation({ id })}>
      Action
    </Button>
  );
}
```

**4. Create Astro Page (if needed)**
```astro
---
// src/pages/feature/[id].astro
const data = await convex.query(api.domain.get, { id });
---
<Layout>
  <FeatureComponent client:load id={data._id} />
</Layout>
```

### Phase 5: Testing (15-30 minutes)

**1. Unit Tests**
```typescript
// tests/unit/services/[service].test.ts
describe("FeatureService", () => {
  it("should perform operation successfully", async () => {
    // Test with mocked dependencies
  });
});
```

**2. Integration Tests**
```typescript
// tests/integration/[feature].test.ts
describe("Feature Flow", () => {
  it("should complete full flow", async () => {
    // Test end-to-end
  });
});
```

**3. Type Checking**
```bash
bunx astro check
```

### Phase 6: Documentation Update (10 minutes)

**1. Update Files.md**
- Add new files to appropriate sections
- Follow existing structure

**2. Update Patterns.md (if novel pattern)**
- Add new pattern example
- Document when to use it

**3. Update Implementation Examples.md (if helpful)**
- Add working code example
- Show complete flow

---

## Decision Tree: Where Do I Start?

```
┌─────────────────────────────────────┐
│ What are you building?              │
└───────────┬─────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌──────────┐
│Protocol │   │Core      │
│Feature  │   │Platform  │
└────┬────┘   │Feature   │
     │        └────┬─────┘
     │             │
     │        ┌────┴────┐
     │        │         │
     │        ▼         ▼
     │   ┌────────┐ ┌──────────┐
     │   │Has     │ │No        │
     │   │External│ │External  │
     │   │Service │ │Service   │
     │   └───┬────┘ └────┬─────┘
     │       │           │
     ▼       ▼           ▼
┌──────────────────────────┐
│Read: Documentation-Map.md│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Follow Critical Path for  │
│your feature type         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Read: Ontology.md         │
│Map feature to 4 tables   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Read: Patterns.md         │
│Find similar pattern      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Read: Service Layer.md    │
│Design Effect.ts service  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Read: Files.md            │
│Determine file locations  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Implement → Test → Update │
└──────────────────────────┘
```

---

## Quick Reference Checklists

### Before Writing Code
- [ ] Read Documentation-Map.md (understand ecosystem)
- [ ] Identified feature layer (Strategy → Implementation)
- [ ] Followed critical path for feature type
- [ ] Mapped to ontology (entities, connections, events)
- [ ] Identified protocols needed (if any)
- [ ] Identified integrations needed (if any)
- [ ] Found similar pattern in Patterns.md
- [ ] Know file locations from Files.md
- [ ] Understand service provider dependencies

### During Implementation
- [ ] Service uses Effect.ts patterns
- [ ] All types are explicit (no `any` except entity properties)
- [ ] Errors are typed with `_tag`
- [ ] Dependencies injected via Effect.Service
- [ ] Convex function is thin wrapper
- [ ] All ontology operations use correct types
- [ ] Protocol metadata added (if using protocols)
- [ ] Files in correct locations per Files.md

### After Writing Code
- [ ] TypeScript compiles (`bunx astro check`)
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] No `any` types (except entity properties)
- [ ] All errors typed
- [ ] Files in correct locations
- [ ] Documentation updated (Files.md, Patterns.md if needed)
- [ ] Code follows existing patterns

---

## Example: Complete Workflow for "User Enrolls in Course"

### 1. Documentation Navigation
```
Read: Documentation-Map.md
Identify: Core Platform Feature (AI-Powered LMS)
Path: Strategy → Ontology → Service Layer → Patterns → Files → Implementation
```

### 2. Feature Mapping
```
Read: Strategy.md
Feature: AI-Powered LMS (#5)

Read: Ontology.md
Entities: course, audience_member
Connections: enrolled_in
Events: course_enrolled
Tags: skill (via entityTags)

No protocols needed
No external integrations needed
```

### 3. Design
```
Read: Patterns.md
Pattern: "Create Entity with Relationships" (line 665)

Read: Service Layer.md
Service: CourseService
Method: enroll(userId, courseId)

Read: Files.md
Location: convex/services/learning/course.ts
```

### 4. Implementation

**Service:**
```typescript
// convex/services/learning/course.ts
export class CourseService extends Effect.Service<CourseService>()(
  "CourseService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        enroll: (userId: Id<"entities">, courseId: Id<"entities">) =>
          Effect.gen(function* () {
            // 1. Create enrollment connection
            yield* db.insert("connections", {
              fromEntityId: userId,
              toEntityId: courseId,
              relationshipType: "enrolled_in",
              metadata: { progress: 0, startedAt: Date.now() },
              createdAt: Date.now()
            });

            // 2. Log enrollment event
            yield* db.insert("events", {
              entityId: courseId,
              eventType: "course_enrolled",
              timestamp: Date.now(),
              actorType: "user",
              actorId: userId,
              metadata: {}
            });

            return { success: true };
          })
      };
    }),
    dependencies: [ConvexDatabase.Default]
  }
) {}
```

**Convex Function:**
```typescript
// convex/mutations/courses.ts
export const enroll = confect.mutation({
  args: {
    userId: v.id("entities"),
    courseId: v.id("entities")
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const courseService = yield* CourseService;
      return yield* courseService.enroll(args.userId, args.courseId);
    }).pipe(Effect.provide(MainLayer))
});
```

**Component:**
```typescript
// src/components/features/learning/EnrollButton.tsx
export function EnrollButton({ courseId, userId }: Props) {
  const enroll = useMutation(api.courses.enroll);

  return (
    <Button onClick={() => enroll({ userId, courseId })}>
      Enroll in Course
    </Button>
  );
}
```

### 5. Testing
```typescript
// tests/unit/services/course.test.ts
describe("CourseService.enroll", () => {
  it("should enroll user successfully", async () => {
    // Test implementation
  });
});
```

### 6. Documentation
```
Update: docs/Files.md
  - Added convex/services/learning/course.ts
  - Added src/components/features/learning/EnrollButton.tsx
```

---

## Summary

**This workflow ensures:**
1. **Documentation-driven** - Start with Documentation-Map.md
2. **Ontology-constrained** - Map to 4 tables before coding
3. **Pattern-consistent** - Replicate proven patterns
4. **Type-safe** - Explicit types everywhere
5. **Service-oriented** - Business logic in Effect.ts
6. **Well-tested** - Tests define behavior
7. **Properly documented** - Update docs as you go

**Result:** Every feature improves the codebase by adding typed, tested, documented code that follows established patterns.

**The larger the codebase grows, the BETTER it gets - because AI has more primitives to compose while staying constrained by the ontology.**

---

## Integration with CLAUDE.md

**For AI agents (Claude Code):**
- This workflow is referenced in **[CLAUDE.md](../CLAUDE.md)** as the canonical development process
- CLAUDE.md provides quick-reference instructions for AI agents
- This document (Workflow.md) provides the complete 6-phase workflow with examples
- **Always read this document** when implementing complex features

**Key principle:** CLAUDE.md tells AI agents WHAT to do, Workflow.md shows HOW to do it step-by-step.