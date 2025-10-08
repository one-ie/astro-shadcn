import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.string(),
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.fromEntityId === args.toEntityId) {
      throw new Error("Cannot connect an entity to itself");
    }
    const now = Date.now();
    const id = await ctx.db.insert("connections", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const upsert = mutation({
  args: {
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.string(),
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("bidirectional", (q) =>
        q
          .eq("fromEntityId", args.fromEntityId)
          .eq("toEntityId", args.toEntityId)
          .eq("relationshipType", args.relationshipType)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { metadata: args.metadata, strength: args.strength, validFrom: args.validFrom, validTo: args.validTo, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("connections", { ...args, createdAt: now, updatedAt: now });
  },
});

export const bulkCreate = mutation({
  args: {
    connections: v.array(
      v.object({
        fromEntityId: v.id("entities"),
        toEntityId: v.id("entities"),
        relationshipType: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, { connections }) => {
    const now = Date.now();
    const results = [] as any[];
    for (const c of connections) {
      if (c.fromEntityId === c.toEntityId) continue;
      const id = await ctx.db.insert("connections", { ...c, createdAt: now, updatedAt: now });
      results.push(id);
    }
    return results;
  },
});

