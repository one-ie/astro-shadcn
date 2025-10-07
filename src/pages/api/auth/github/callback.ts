import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect, locals }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=github_auth_failed");
  }

  try {
    // Access runtime environment variables from Cloudflare context
    // @ts-ignore - Cloudflare runtime is available but not typed
    const runtime = locals.runtime;
    const env = runtime?.env || {};

    const clientId = env.GITHUB_CLIENT_ID || import.meta.env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET || import.meta.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/github/callback`;

    console.log("GitHub OAuth Debug:", {
      clientId,
      redirectUri,
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length || 0,
      codeLength: code.length,
      hasRuntime: !!runtime,
      hasEnv: !!env
    });

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "stack.one OAuth (github-callback)",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    // Check if response is OK before parsing
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("GitHub token exchange failed:", tokenResponse.status, errorText);
      return redirect(`/login?error=github_token_failed&details=${encodeURIComponent('GitHub API error: ' + tokenResponse.status)}`);
    }

    const responseText = await tokenResponse.text();
    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse GitHub response:", responseText.substring(0, 200));
      return redirect(`/login?error=github_token_failed&details=${encodeURIComponent('Invalid response from GitHub')}`);
    }

    if (!tokenData.access_token) {
      console.error("GitHub token exchange failed:", tokenData);
      return redirect(`/login?error=github_token_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || 'No access token')}`);
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
        "User-Agent": "stack.one OAuth (github-callback)",
      },
    });

    if (!userResponse.ok) {
      const body = await userResponse.text();
      console.error("GitHub user fetch failed:", userResponse.status, body.substring(0, 200));
      return redirect(`/login?error=github_user_failed&details=${encodeURIComponent('GitHub API error: ' + userResponse.status)}`);
    }

    let githubUser: any;
    try {
      githubUser = await userResponse.json();
    } catch (e) {
      const body = await userResponse.text();
      console.error("Failed to parse GitHub user response:", body.substring(0, 200));
      return redirect(`/login?error=github_user_invalid&details=${encodeURIComponent('Invalid response from GitHub user API')}`);
    }

    // Get user email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "User-Agent": "stack.one OAuth (github-callback)",
        },
      });

      if (!emailResponse.ok) {
        const body = await emailResponse.text();
        console.error("GitHub emails fetch failed:", emailResponse.status, body.substring(0, 200));
        return redirect(`/login?error=github_email_failed&details=${encodeURIComponent('GitHub API error: ' + emailResponse.status)}`);
      }

      let emails: any[];
      try {
        emails = await emailResponse.json();
      } catch (e) {
        const body = await emailResponse.text();
        console.error("Failed to parse GitHub emails response:", body.substring(0, 200));
        return redirect(`/login?error=github_email_invalid&details=${encodeURIComponent('Invalid response from GitHub emails API')}`);
      }
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      return redirect("/login?error=no_email");
    }

    // Create or sign in user via Convex
    const { ConvexHttpClient } = await import("convex/browser");
    const { api } = await import("../../../../../convex/_generated/api");

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );

    const result = await convex.mutation(api.auth.signInWithOAuth, {
      provider: "github",
      email,
      name: githubUser.name || githubUser.login,
      providerId: String(githubUser.id),
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
    console.error("GitHub OAuth error:", error);
    const errorMessage = error instanceof Error ? error.message : 'unknown_error';
    return redirect(`/login?error=server_error&details=${encodeURIComponent(errorMessage)}`);
  }
};
