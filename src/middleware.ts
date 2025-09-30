import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Get auth token from cookie
  const token = context.cookies.get("auth_token")?.value;

  if (token) {
    try {
      // Query Convex to get user info
      const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

      const response = await fetch(`${convexUrl}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "auth:getCurrentUser",
          args: { token },
          format: "json",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.value) {
          context.locals.user = result.value;
          context.locals.session = { token };
        } else {
          context.locals.user = null;
          context.locals.session = null;
        }
      } else {
        context.locals.user = null;
        context.locals.session = null;
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      context.locals.user = null;
      context.locals.session = null;
    }
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
