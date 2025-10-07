import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect, locals }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=google_auth_failed");
  }

  try {
    // Access runtime environment variables from Cloudflare context
    // @ts-ignore - Cloudflare runtime is available but not typed
    const runtime = locals.runtime;
    const env = runtime?.env || {};

    const clientId = env.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "stack.one OAuth (google-callback)",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error("Google token exchange failed:", tokenResponse.status, text.substring(0, 200));
      return redirect(`/login?error=google_token_failed&details=${encodeURIComponent('Google API error: ' + tokenResponse.status)}`);
    }

    const tokenText = await tokenResponse.text();
    let tokenData: any;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error("Failed to parse Google token response:", tokenText.substring(0, 200));
      return redirect(`/login?error=google_token_invalid&details=${encodeURIComponent('Invalid response from Google token API')}`);
    }

    if (!tokenData.access_token) {
      return redirect(`/login?error=google_token_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || 'No access token')}`);
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
        "User-Agent": "stack.one OAuth (google-callback)",
      },
    });

    if (!userResponse.ok) {
      const text = await userResponse.text();
      console.error("Google user fetch failed:", userResponse.status, text.substring(0, 200));
      return redirect(`/login?error=google_user_failed&details=${encodeURIComponent('Google API error: ' + userResponse.status)}`);
    }

    let googleUser: any;
    try {
      googleUser = await userResponse.json();
    } catch (e) {
      const text = await userResponse.text();
      console.error("Failed to parse Google user response:", text.substring(0, 200));
      return redirect(`/login?error=google_user_invalid&details=${encodeURIComponent('Invalid response from Google user API')}`);
    }

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
