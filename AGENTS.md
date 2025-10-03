# AGENTS.md

Concise Convex reference for Claude Code agents. Optimized to minimize context window usage.

## Core Convex Functions

**Queries** (read data, cached, reactive):
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

**Mutations** (write data, transactional):
```typescript
import { mutation } from "./_generated/server";

export const create = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
    });
    return id;
  },
});
```

**Actions** (call external APIs, non-transactional):
```typescript
import { action } from "./_generated/server";

export const sendEmail = action({
  args: { to: v.string(), subject: v.string() },
  handler: async (ctx, args) => {
    // Call external service
    const response = await fetch("https://api.example.com/send", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return response.json();
  },
});
```

**Internal Functions** (only callable from other Convex functions):
```typescript
import { internalMutation, internalAction } from "./_generated/server";

export const internal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Only callable from other Convex functions
  },
});
```

## Database Patterns

**Insert/Update/Delete**:
```typescript
// Insert
const id = await ctx.db.insert("tableName", { field: "value" });

// Update
await ctx.db.patch(id, { field: "newValue" });

// Replace (replaces entire document)
await ctx.db.replace(id, { field: "newValue", required: "fields" });

// Delete
await ctx.db.delete(id);
```

**Queries with Indexes**:
```typescript
// Define index in schema.ts
defineTable({
  email: v.string(),
  name: v.string(),
}).index("by_email", ["email"])

// Use index in query
const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .unique(); // or .first() or .collect()
```

**Pagination**:
```typescript
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tableName")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## Schema Definition

**convex/schema.ts**:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created", ["createdAt"]),

  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    publishedAt: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["publishedAt"]),
});
```

## Authentication (Better Auth Integration)

**Get current user in Convex functions**:
```typescript
import { auth } from "./auth"; // Your Better Auth integration

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.get(userId);
  },
});
```

**Protected mutations**:
```typescript
export const update = mutation({
  args: { id: v.id("posts"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Forbidden");

    await ctx.db.patch(args.id, { title: args.title });
  },
});
```

## Components Usage

**Configuration** (convex/convex.config.ts):
```typescript
import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";

const app = defineApp();
app.use(resend);
export default app;
```

**Using Resend Component** (email sending):
```typescript
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

// MUST be in internal action (not mutation/query)
export const sendEmailAction = internalAction({
  args: { email: v.string(), subject: v.string(), html: v.string() },
  handler: async (ctx, args) => {
    const resend = new Resend(components.resend, { testMode: false });
    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL!,
      to: args.email,
      subject: args.subject,
      html: args.html,
    });
  },
});

// Schedule from mutation
export const requestEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Do mutation work here
    // Schedule email asynchronously
    await ctx.scheduler.runAfter(0, internal.email.sendEmailAction, {
      email: args.email,
      subject: "Subject",
      html: "<p>Content</p>",
    });
  },
});
```

## File Storage

**Upload**:
```typescript
import { action } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

**Store reference**:
```typescript
export const saveFile = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.name,
    });
  },
});
```

**Retrieve**:
```typescript
export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## Scheduled Functions

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired tokens",
  { minutes: 60 }, // Every hour
  internal.auth.cleanupExpiredTokens,
);

export default crons;
```

## Environment Variables

**Access in Convex**:
```typescript
export const myAction = action({
  handler: async (ctx) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY not set");
    // Use apiKey
  },
});
```

**Required for this project**:
```bash
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Critical Rules for Agents

1. **Email Sending**: MUST use internal actions, schedule from mutations with `ctx.scheduler.runAfter(0, ...)`
2. **Schema Changes**: Run `npx convex dev` to regenerate types after schema changes
3. **Indexes**: Required for queries on non-_id fields - define in schema
4. **Mutations vs Actions**: Mutations = database operations (transactional), Actions = external calls (non-transactional)
5. **Internal Functions**: Use `internalMutation`/`internalAction` for functions that should only be called by other Convex functions
6. **Validation**: Always use `v` validators in args - provides type safety and runtime validation
7. **Unique Constraints**: Use `.unique()` when expecting one result, `.first()` for optional, `.collect()` for arrays

## Common Patterns

**Create with validation**:
```typescript
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("Email already exists");

    // Insert
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
```

**Soft delete pattern**:
```typescript
// Schema
defineTable({
  // ... fields
  deletedAt: v.optional(v.number()),
}).index("active", ["deletedAt"])

// Query only active
const active = await ctx.db
  .query("tableName")
  .withIndex("active", (q) => q.eq("deletedAt", undefined))
  .collect();

// Soft delete
await ctx.db.patch(id, { deletedAt: Date.now() });
```

**Relationship pattern**:
```typescript
// Get user with posts
const user = await ctx.db.get(userId);
const posts = await ctx.db
  .query("posts")
  .withIndex("by_author", (q) => q.eq("authorId", userId))
  .collect();
return { ...user, posts };
```

## This Project's Setup

- **Backend**: Convex with Better Auth (NOT Convex Auth)
- **Email**: `@convex-dev/resend` component
- **Auth Flow**: Better Auth handles OAuth (GitHub, Google), password reset, email verification
- **Database**: Convex tables for users, sessions, accounts, verification tokens
- **Components**: Resend email component configured in `convex/convex.config.ts`

## Reference

- Convex Dashboard: https://dashboard.convex.dev
- Convex Docs: https://docs.convex.dev
- Better Auth: https://www.better-auth.com
- Resend Component: https://github.com/get-convex/convex-helpers
