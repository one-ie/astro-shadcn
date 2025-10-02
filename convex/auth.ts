import { betterAuth } from "better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// Create Better Auth Convex client
export const authComponent = createClient<DataModel>(components.betterAuth);

// Create Better Auth instance
export const createAuth = (ctx: any) => {
  const siteUrl = process.env.SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:4321";

  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true when email verification is ready
    },

    // Social providers
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        enabled: !!process.env.GITHUB_CLIENT_ID,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        enabled: !!process.env.GOOGLE_CLIENT_ID,
      },
    },

    // Plugins
    plugins: [
      convex(), // Required for Convex integration
    ],

    // Account linking configuration
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
        updateUserInfoOnLink: true,
      },
    },

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });
};
