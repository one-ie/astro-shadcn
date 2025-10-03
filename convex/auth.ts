import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { RateLimiter } from "@convex-dev/rate-limiter";

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
    sendVerificationEmail: v.optional(v.boolean()),
    baseUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limiting check
    await rateLimiter.limit(ctx, "signUp", { key: args.email });

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

    // Create user (email starts as unverified)
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      name: args.name,
      emailVerified: false,
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

    // Optionally send verification email
    if (args.sendVerificationEmail && args.baseUrl) {
      const result = await ctx.runMutation(internal.auth.createEmailVerificationToken, {
        userId,
        email: args.email,
      });

      if (result) {
        const verificationLink = `${args.baseUrl}/verify-email?token=${result.token}`;
        await ctx.scheduler.runAfter(0, internal.auth.sendVerificationEmailAction, {
          email: result.email,
          verificationLink,
        });
      }
    }

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
    // Rate limiting check
    await rateLimiter.limit(ctx, "signIn", { key: args.email });

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

// Initialize Rate Limiter
const rateLimiter = new RateLimiter(components.rateLimiter, {
  // 5 attempts per 15 minutes per user/IP
  signIn: { kind: "fixed window", rate: 5, period: 15 * 60 * 1000 },
  signUp: { kind: "fixed window", rate: 3, period: 60 * 60 * 1000 }, // 3 per hour
  passwordReset: { kind: "fixed window", rate: 3, period: 60 * 60 * 1000 }, // 3 per hour
});

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
    // Rate limiting check
    await rateLimiter.limit(ctx, "passwordReset", { key: args.email });

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

// Internal mutation to create email verification token
const createEmailVerificationTokenMutation = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate verification token
    const verificationToken = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store verification token
    await ctx.db.insert("emailVerifications", {
      userId: args.userId,
      email: args.email,
      token: verificationToken,
      expiresAt,
      createdAt: Date.now(),
      verified: false,
    });

    return { token: verificationToken, email: args.email };
  },
});

export const createEmailVerificationToken = createEmailVerificationTokenMutation;

// Internal action to send verification email
export const sendVerificationEmailAction = internalAction({
  args: {
    email: v.string(),
    verificationLink: v.string(),
  },
  handler: async (ctx, args) => {
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const subject = "Verify your email - ONE";
    const html = `<!DOCTYPE html><html><body><p>Welcome to ONE! Please verify your email by clicking the link below:</p><p><a href="${args.verificationLink}">Verify Email</a></p><p>This link will expire in 24 hours.</p></body></html>`;

    try {
      await resend.sendEmail(ctx, {
        from,
        to: args.email,
        subject,
        html,
      });
      console.log("Verification email sent to:", args.email);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw error;
    }
  },
});

// Verify email mutation
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find verification request
    const verificationRequest = await ctx.db
      .query("emailVerifications")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!verificationRequest || verificationRequest.verified || verificationRequest.expiresAt < Date.now()) {
      throw new Error("Invalid or expired verification token");
    }

    // Get user
    const user = await ctx.db.get(verificationRequest.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Mark user as verified
    await ctx.db.patch(user._id, { emailVerified: true });

    // Mark verification token as used
    await ctx.db.patch(verificationRequest._id, { verified: true });

    return { success: true };
  },
});

// Check if email is verified query
export const isEmailVerified = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { verified: false };
    }

    const token = args.token;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { verified: false };
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return { verified: false };
    }

    return { verified: user.emailVerified || false };
  },
});

// Internal mutation to create magic link token
const createMagicLinkTokenMutation = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate magic link token
    const magicToken = generateToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store magic link token
    await ctx.db.insert("magicLinks", {
      email: args.email,
      token: magicToken,
      expiresAt,
      createdAt: Date.now(),
      used: false,
    });

    return { token: magicToken, email: args.email };
  },
});

export const createMagicLinkToken = createMagicLinkTokenMutation;

// Internal action to send magic link email
export const sendMagicLinkEmailAction = internalAction({
  args: {
    email: v.string(),
    magicLink: v.string(),
  },
  handler: async (ctx, args) => {
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const subject = "Your magic link to sign in - ONE";
    const html = `<!DOCTYPE html><html><body><p>Click the link below to sign in to your account:</p><p><a href="${args.magicLink}">Sign in to ONE</a></p><p>This link will expire in 15 minutes and can only be used once.</p><p>If you didn't request this link, you can safely ignore this email.</p></body></html>`;

    try {
      await resend.sendEmail(ctx, {
        from,
        to: args.email,
        subject,
        html,
      });
      console.log("Magic link email sent to:", args.email);
    } catch (error) {
      console.error("Failed to send magic link email:", error);
      throw error;
    }
  },
});

// Request magic link mutation (public-facing)
export const requestMagicLink = mutation({
  args: {
    email: v.string(),
    baseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Rate limiting check
    await rateLimiter.limit(ctx, "passwordReset", { key: args.email });

    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true };
    }

    // Create magic link token
    const result = await ctx.runMutation(internal.auth.createMagicLinkToken, {
      email: args.email,
    });

    if (result) {
      const magicLink = `${args.baseUrl}/auth/magic-link?token=${result.token}`;
      await ctx.scheduler.runAfter(0, internal.auth.sendMagicLinkEmailAction, {
        email: result.email,
        magicLink,
      });
    }

    return { success: true };
  },
});

// Sign in with magic link mutation
export const signInWithMagicLink = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find magic link request
    const magicLinkRequest = await ctx.db
      .query("magicLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!magicLinkRequest || magicLinkRequest.used || magicLinkRequest.expiresAt < Date.now()) {
      throw new Error("Invalid or expired magic link");
    }

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", magicLinkRequest.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Mark magic link as used
    await ctx.db.patch(magicLinkRequest._id, { used: true });

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

// Setup 2FA (TOTP) mutation
export const setup2FA = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const secret = generateToken().slice(0, 32);
    const backupCodes = Array.from({ length: 10 }, () =>
      generateToken().slice(0, 8).toUpperCase()
    );

    await ctx.db.insert("twoFactorAuth", {
      userId: user._id,
      secret,
      backupCodes,
      enabled: false,
      createdAt: Date.now(),
    });

    return { secret, backupCodes };
  },
});

// Verify and enable 2FA
export const verify2FA = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid session");
    }

    const twoFactor = await ctx.db
      .query("twoFactorAuth")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    if (!twoFactor) {
      throw new Error("2FA not set up");
    }

    await ctx.db.patch(twoFactor._id, { enabled: true });
    return { success: true };
  },
});

// Disable 2FA
export const disable2FA = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const passwordHash = await hashPassword(args.password);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Invalid password");
    }

    const twoFactor = await ctx.db
      .query("twoFactorAuth")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (twoFactor) {
      await ctx.db.delete(twoFactor._id);
    }

    return { success: true };
  },
});

// Check 2FA status
export const get2FAStatus = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { enabled: false, hasSetup: false };
    }

    const token = args.token; // TypeScript type narrowing

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { enabled: false, hasSetup: false };
    }

    const twoFactor = await ctx.db
      .query("twoFactorAuth")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();

    return {
      enabled: twoFactor?.enabled || false,
      hasSetup: !!twoFactor,
    };
  },
});
