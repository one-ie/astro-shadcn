import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Match the schema's relationshipType union
const relationshipTypeValidator = v.union(
  v.literal("owns"),
  v.literal("created_by"),
  v.literal("clone_of"),
  v.literal("trained_on"),
  v.literal("powers"),
  v.literal("authored"),
  v.literal("generated_by"),
  v.literal("published_to"),
  v.literal("part_of"),
  v.literal("references"),
  v.literal("member_of"),
  v.literal("following"),
  v.literal("moderates"),
  v.literal("participated_in"),
  v.literal("manages"),
  v.literal("reports_to"),
  v.literal("collaborates_with"),
  v.literal("holds_tokens"),
  v.literal("staked_in"),
  v.literal("earned_from"),
  v.literal("purchased"),
  v.literal("enrolled_in"),
  v.literal("completed"),
  v.literal("teaching"),
  v.literal("transacted"),
  v.literal("notified"),
  v.literal("referred"),
  v.literal("communicated"),
  v.literal("delegated"),
  v.literal("approved"),
  v.literal("fulfilled"),
);

export const create = mutation({
  args: {
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: relationshipTypeValidator,
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
    relationshipType: relationshipTypeValidator,
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
        relationshipType: relationshipTypeValidator,
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

