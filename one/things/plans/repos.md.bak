Templates

ONE one-ie/one
ONE Base - Astro Shadcn one-ie/astro-base
ONE Mail - Astro Mail one-ie/astro-mail
ONE Blog - Astro Blog one-ie/astro-blog
ONE Backend -Convex Hono Better Auth one-ie/backend
ONE Stack - Astro Convex Better Auth one-ie/stack

---

## Deployment Strategy

### Stack Branch → one-ie/stack → stack.one.ie

**One-time setup:**
```bash
git remote add stack git@github.com:one-ie/stack.git
```

**Deploy workflow:**
```bash
# 1. Switch to stack branch
git checkout stack

# 2. Push to GitHub
git push stack stack:main

# 3. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=stack
```

**Cloudflare configuration:**
- Project: `stack`
- URL: https://stack.one.ie
- Build: `bun run build`
- Output: `dist`

**Environment variables:**
```
CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://stack.one.ie
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
RESEND_API_KEY=xxx
RESEND_FROM_EMAIL=noreply@stack.one.ie
```

### GitHub Actions (automated deployment)

Add `.github/workflows/deploy.yml` to one-ie/stack:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=stack
```
