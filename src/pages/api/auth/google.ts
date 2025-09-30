import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ redirect }) => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/google/callback`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid email profile&access_type=offline&prompt=select_account`;

  return redirect(googleAuthUrl);
};
