import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// Create Better Auth client for UI components
// Now connects to Better Auth Convex HTTP routes
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
  plugins: [
    convexClient(), // Convex plugin for Better Auth integration
  ],
});

export { authClient as auth };
