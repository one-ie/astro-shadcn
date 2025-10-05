## The Key Concept: Everything Flows From The Ontology

```
ONTOLOGY (4 tables)
    ↓
CONVEX SCHEMA (definitions)
    ↓
GENERATED TYPES (automatic)
    ↓
EFFECT.TS SERVICES (typed operations)
    ↓
FUNCTIONS (compose services)
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

Want me to show you how to create the `ConvexDatabase` service that enforces these constraints?