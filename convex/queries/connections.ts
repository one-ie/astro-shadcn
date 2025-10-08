import { query } from "../_generated/server";
import { v } from "convex/values";

export const listFrom = query({
  args: {
    fromEntityId: v.id("entities"),
    relationshipType: v.optional(v.string()),
  },
  handler: async (ctx, { fromEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", fromEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("from_type", (q) =>
          q.eq("fromEntityId", fromEntityId).eq("relationshipType", relationshipType)
        );
    }
    return await q.collect();
  },
});

export const listTo = query({
  args: {
    toEntityId: v.id("entities"),
    relationshipType: v.optional(v.string()),
  },
  handler: async (ctx, { toEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("to_entity", (q) => q.eq("toEntityId", toEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("to_type", (q) =>
          q.eq("toEntityId", toEntityId).eq("relationshipType", relationshipType)
        );
    }
    return await q.collect();
  },
});

export const listBetween = query({
  args: {
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.optional(v.string()),
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
  args: { relationshipType: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { relationshipType, limit }) => {
    const conns = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) => q.eq("relationshipType", relationshipType) as any)
      .collect();
    return limit ? conns.slice(0, limit) : conns;
  },
});

