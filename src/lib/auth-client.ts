import { createAuthClient } from "better-auth/react"

// Create Better Auth client for UI components
// This connects to our custom auth API endpoints
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
})

export { authClient as auth }
