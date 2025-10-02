import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=google_auth_failed");
  }

  try {
    const clientId = import.meta.env.GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/google/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return redirect("/login?error=google_token_failed");
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return redirect("/login?error=no_email");
    }

    // Create or sign in user via Convex
    const { ConvexHttpClient } = await import("convex/browser");
    const { api } = await import("../../../../../convex/_generated/api");

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );

    const result = await convex.mutation(api.auth.signInWithOAuth, {
      provider: "google",
      email: googleUser.email,
      name: googleUser.name,
      providerId: googleUser.id,
    });

    if (result?.token) {
      // Set auth cookie
      cookies.set("auth_token", result.token, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
        httpOnly: true,
        secure: import.meta.env.PROD,
      });

      return redirect("/dashboard");
    }

    return redirect("/login?error=auth_failed");
  } catch (error) {
    console.error("Google OAuth error:", error);
    return redirect("/login?error=server_error");
  }
};
