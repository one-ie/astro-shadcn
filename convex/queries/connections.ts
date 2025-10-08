import { query } from "../_generated/server";
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

export const listFrom = query({
  args: {
    fromEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { fromEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", fromEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("from_type", (q) =>
          q.eq("fromEntityId", fromEntityId).eq("relationshipType", relationshipType as any)
        );
    }
    return await q.collect();
  },
});

export const listTo = query({
  args: {
    toEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { toEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("to_entity", (q) => q.eq("toEntityId", toEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("to_type", (q) =>
          q.eq("toEntityId", toEntityId).eq("relationshipType", relationshipType as any)
        );
    }
    return await q.collect();
  },
});

export const listBetween = query({
  args: {
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { fromEntityId, toEntityId, relationshipType }) => {
    const q = ctx.db
      .query("connections")
      .withIndex("bidirectional", (q) =>
        q
          .eq("fromEntityId", fromEntityId)
          .eq("toEntityId", toEntityId)
          .eq("relationshipType", relationshipType || ("owns" as any))
      );
    // If relationshipType not provided, fall back to manual filter
    if (!relationshipType) {
      const all = await ctx.db
        .query("connections")
        .withIndex("from_entity", (q) => q.eq("fromEntityId", fromEntityId))
        .collect();
      return all.filter((c) => c.toEntityId === toEntityId);
    }
    return await q.collect();
  },
});

export const listByType = query({
  args: { relationshipType: relationshipTypeValidator, limit: v.optional(v.number()) },
  handler: async (ctx, { relationshipType, limit }) => {
    // Filter all connections by relationshipType (no suitable index for this query)
    const allConns = await ctx.db.query("connections").collect();
    const filtered = allConns.filter((c) => c.relationshipType === relationshipType);
    return limit ? filtered.slice(0, limit) : filtered;
  },
});

