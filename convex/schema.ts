import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
