import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========================
  // Ontology: Entities
  // ========================
  entities: defineTable({
    type: v.string(),
    name: v.string(),
    properties: v.any(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"]) 
    .index("by_status", ["status"]) 
    .index("by_created", ["createdAt"]) 
    .index("by_updated", ["updatedAt"]),

  // ========================
  // Ontology: Connections
  // ========================
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      // Ownership (2)
      v.literal("owns"),
      v.literal("created_by"),
      // AI (3)
      v.literal("clone_of"),
      v.literal("trained_on"),
      v.literal("powers"),
      // Content (5)
      v.literal("authored"),
      v.literal("generated_by"),
      v.literal("published_to"),
      v.literal("part_of"),
      v.literal("references"),
      // Community (4)
      v.literal("member_of"),
      v.literal("following"),
      v.literal("moderates"),
      v.literal("participated_in"),
      // Business (3)
      v.literal("manages"),
      v.literal("reports_to"),
      v.literal("collaborates_with"),
      // Token (3)
      v.literal("holds_tokens"),
      v.literal("staked_in"),
      v.literal("earned_from"),
      // Product (4)
      v.literal("purchased"),
      v.literal("enrolled_in"),
      v.literal("completed"),
      v.literal("teaching"),
      // Consolidated (7)
      v.literal("transacted"),
      v.literal("notified"),
      v.literal("referred"),
      v.literal("communicated"),
      v.literal("delegated"),
      v.literal("approved"),
      v.literal("fulfilled"),
    ),
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("from_entity", ["fromEntityId"]) 
    .index("to_entity", ["toEntityId"]) 
    .index("from_type", ["fromEntityId", "relationshipType"]) 
    .index("to_type", ["toEntityId", "relationshipType"]) 
    .index("bidirectional", ["fromEntityId", "toEntityId", "relationshipType"]) 
    .index("by_created", ["createdAt"]),

  // ========================
  // Ontology: Events
  // ========================
  events: defineTable({
    type: v.string(),
    actorId: v.id("entities"),
    targetId: v.optional(v.id("entities")),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_type", ["type"]) 
    .index("by_actor", ["actorId"]) 
    .index("by_target", ["targetId"]) 
    .index("by_timestamp", ["timestamp"]) 
    .index("actor_type", ["actorId", "type"]) 
    .index("target_type", ["targetId", "type"]),

  // ========================
  // Ontology: Knowledge + Junction
  // ========================
  knowledge: defineTable({
    knowledgeType: v.union(
      v.literal("label"),
      v.literal("document"),
      v.literal("chunk"),
      v.literal("vector_only"),
    ),
    text: v.optional(v.string()),
    embedding: v.optional(v.array(v.number())),
    embeddingModel: v.optional(v.string()),
    embeddingDim: v.optional(v.number()),
    sourceThingId: v.optional(v.id("entities")),
    sourceField: v.optional(v.string()),
    chunk: v.optional(v.any()),
    labels: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["knowledgeType"]) 
    .index("by_source", ["sourceThingId"]) 
    .index("by_created", ["createdAt"]),

  thingKnowledge: defineTable({
    thingId: v.id("entities"),
    knowledgeId: v.id("knowledge"),
    role: v.optional(v.union(
      v.literal("label"),
      v.literal("summary"),
      v.literal("chunk_of"),
      v.literal("caption"),
      v.literal("keyword"),
    )),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_thing", ["thingId"]) 
    .index("by_knowledge", ["knowledgeId"]),
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  passwordResets: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  emailVerifications: defineTable({
    userId: v.id("users"),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    verified: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  magicLinks: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_email", ["email"]),

  twoFactorAuth: defineTable({
    userId: v.id("users"),
    secret: v.string(),
    backupCodes: v.array(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
