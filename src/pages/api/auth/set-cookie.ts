import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Set secure httpOnly cookie
    cookies.set("auth_token", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      httpOnly: true,
      secure: import.meta.env.PROD,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Set cookie error:", error);
    return new Response(JSON.stringify({ error: "Failed to set cookie" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
