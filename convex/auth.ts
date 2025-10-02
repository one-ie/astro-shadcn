import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";

// Simple password hashing using crypto (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Sign up mutation
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      name: args.name,
      createdAt: Date.now(),
    });

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return { token, userId };
  },
});

// Sign in mutation
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const passwordHash = await hashPassword(args.password);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return { token, userId: user._id };
  },
});

// Sign out mutation
export const signOut = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// Sign in with OAuth mutation
export const signInWithOAuth = mutation({
  args: {
    provider: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    providerId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    // Create user if doesn't exist
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        passwordHash: "", // No password for OAuth users
        name: args.name,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
      if (!user) throw new Error("Failed to create user");
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return { token, userId: user._id };
  },
});

// Get current user query
export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    const token = args.token; // Type narrowing for TypeScript

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  },
});

// Internal mutation to create password reset token
const createPasswordResetTokenMutation = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store reset token
    await ctx.db.insert("passwordResets", {
      userId: user._id,
      token: resetToken,
      expiresAt,
      createdAt: Date.now(),
      used: false,
    });

    return { token: resetToken, email: user.email };
  },
});

export const createPasswordResetToken = createPasswordResetTokenMutation;

// Initialize Resend component
const resend = new Resend(components.resend, { testMode: false });

// Internal action to send password reset email
export const sendPasswordResetEmailAction = internalAction({
  args: {
    email: v.string(),
    resetLink: v.string(),
  },
  handler: async (ctx, args) => {
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const subject = "Reset your password - ONE";
    const html = `<!DOCTYPE html><html><body><p>Reset your password by clicking the link below:</p><p><a href="${args.resetLink}">Reset Password</a></p></body></html>`;

    try {
      await resend.sendEmail(ctx, {
        from,
        to: args.email,
        subject,
        html,
      });
      console.log("Password reset email sent to:", args.email);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // Don't throw error to avoid revealing if user exists
    }
  },
});

// Request password reset mutation (public-facing)
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
    baseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Create reset token via internal mutation
    const result = await ctx.runMutation(internal.auth.createPasswordResetToken, {
      email: args.email,
    });

    if (!result) {
      // Don't reveal if user exists for security
      return { success: true };
    }

    // Create reset link
    const resetLink = `${args.baseUrl}/reset-password?token=${result.token}`;

    // Schedule email sending via internal action
    await ctx.scheduler.runAfter(0, internal.auth.sendPasswordResetEmailAction, {
      email: result.email,
      resetLink,
    });

    return { success: true };
  },
});

// Validate reset token query
export const validateResetToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetRequest = await ctx.db
      .query("passwordResets")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetRequest || resetRequest.used || resetRequest.expiresAt < Date.now()) {
      return { valid: false };
    }

    return { valid: true };
  },
});

// Reset password mutation
export const resetPassword = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find reset request
    const resetRequest = await ctx.db
      .query("passwordResets")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetRequest || resetRequest.used || resetRequest.expiresAt < Date.now()) {
      throw new Error("Invalid or expired reset token");
    }

    // Get user
    const user = await ctx.db.get(resetRequest.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const passwordHash = await hashPassword(args.password);

    // Update user password
    await ctx.db.patch(user._id, { passwordHash });

    // Mark reset token as used
    await ctx.db.patch(resetRequest._id, { used: true });

    // Invalidate all existing sessions for this user
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
