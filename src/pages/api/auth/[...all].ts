import type { APIRoute } from "astro"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

export const prerender = false

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

// Bridge Better Auth UI requests to our custom Convex auth
export const ALL: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url)
  const pathname = url.pathname.replace("/api/auth", "")

  try {
    // Handle session endpoint for Better Auth UI
    if (pathname === "/get-session" || pathname === "/session") {
      const token = cookies.get("auth_token")?.value

      if (!token) {
        return new Response(
          JSON.stringify({ user: null, session: null }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      try {
        const user = await convex.query(api.auth.getCurrentUser, { token })

        if (!user) {
          return new Response(
            JSON.stringify({ user: null, session: null }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
        }

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name || null,
              emailVerified: false,
              image: null,
            },
            session: {
              id: token,
              userId: user.id,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      } catch (convexError) {
        // Gracefully handle Convex errors (e.g., deployment not available)
        return new Response(
          JSON.stringify({ user: null, session: null }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }
    }

    // Handle sign-out endpoint
    if (pathname === "/sign-out" && request.method === "POST") {
      const token = cookies.get("auth_token")?.value

      if (token) {
        await convex.mutation(api.auth.signOut, { token })
      }

      cookies.delete("auth_token", {
        path: "/",
      })

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Handle sign-in endpoint
    if (pathname === "/sign-in/email" && request.method === "POST") {
      const body = await request.json()
      const { email, password } = body

      const result = await convex.mutation(api.auth.signIn, {
        email,
        password,
      })

      cookies.set("auth_token", result.token, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
        secure: import.meta.env.PROD,
      })

      const user = await convex.query(api.auth.getCurrentUser, { token: result.token })

      return new Response(
        JSON.stringify({
          user: user ? {
            id: user.id,
            email: user.email,
            name: user.name || null,
            emailVerified: false,
            image: null,
          } : null,
          session: user ? {
            id: result.token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          } : null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Handle sign-up endpoint
    if (pathname === "/sign-up/email" && request.method === "POST") {
      const body = await request.json()
      const { email, password, name } = body

      const result = await convex.mutation(api.auth.signUp, {
        email,
        password,
        name: name || undefined,
      })

      cookies.set("auth_token", result.token, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
        secure: import.meta.env.PROD,
      })

      const user = await convex.query(api.auth.getCurrentUser, { token: result.token })

      return new Response(
        JSON.stringify({
          user: user ? {
            id: user.id,
            email: user.email,
            name: user.name || null,
            emailVerified: false,
            image: null,
          } : null,
          session: user ? {
            id: result.token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          } : null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Handle social sign-in endpoint (GitHub, Google)
    if (pathname === "/sign-in/social" && request.method === "POST") {
      const body = await request.json()
      const { provider } = body

      // Redirect to the OAuth provider
      const baseUrl = new URL(request.url).origin
      const redirectUrl = `${baseUrl}/api/auth/${provider}`

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      })
    }

    // Return 404 for unhandled routes
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
