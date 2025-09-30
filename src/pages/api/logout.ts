import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Get token from cookie
  const token = cookies.get("auth_token")?.value;

  if (token) {
    try {
      // Call Convex signOut mutation
      const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

      await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "auth:signOut",
          args: { token },
          format: "json",
        }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Delete cookie
  cookies.delete("auth_token", { path: "/" });

  // Redirect to login
  return redirect("/login");
};
