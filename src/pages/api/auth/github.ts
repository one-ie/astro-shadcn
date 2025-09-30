import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ redirect }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const redirectUri = `${import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;

  return redirect(githubAuthUrl);
};
