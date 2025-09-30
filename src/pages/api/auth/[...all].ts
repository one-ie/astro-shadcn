import type { APIRoute } from "astro"

export const prerender = false

export const ALL: APIRoute = async ({ request }) => {
  const convexUrl = import.meta.env.NEXT_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL

  // Forward auth requests to Convex
  const url = new URL(request.url)
  const convexAuthUrl = `${convexUrl}/api/auth${url.pathname.replace('/api/auth', '')}`

  return fetch(convexAuthUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: 'half'
  } as RequestInit)
}
