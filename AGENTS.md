# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` route files (`.astro`, API under `src/pages/api/`).
- `src/components/` UI; shadcn/ui in `src/components/ui/`. Layouts in `src/layouts/`.
- `src/lib/`, `src/config/`, `src/styles/`, `src/types/` for helpers, config, CSS, and types.
- `public/` static assets. `convex/` backend (auth, schema, HTTP). Build output in `dist/`.

## Build, Test, and Development Commands
- `bun install` install deps (npm/pnpm also work).
- `bun run dev` start Astro dev server with Cloudflare platform proxy.
- `bun run build` type/astro check then build for Cloudflare.
- `bun run preview` serve the built app locally.
- `bun run lint` ESLint for `.ts/.tsx/.astro`. `bun run format` Prettier.

## Coding Style & Naming Conventions
- Prettier: 2‑space indent, semicolons, single quotes, trailing commas (see `.prettierrc`).
- ESLint: `eslint:recommended`, TypeScript, and Astro rules (`.eslintrc.json`). Fix warnings before PR.
- Components: PascalCase (`Button.tsx`, `Header.astro`). Hooks: `useThing.ts`.
- Routes/pages: kebab or descriptive names (`settings.astro`, `blog/[...slug].astro`).
- Avoid default exports for shared utilities; prefer named exports.

## Testing Guidelines
- No formal unit test suite yet. Minimum: `bun run lint` and `bun run build` must pass.
- Type and template checks run via `astro check` (part of build).
- If adding tests, prefer Vitest; place beside source as `*.test.ts(x)` and keep fast.

## Commit & Pull Request Guidelines
- Commits: present tense, concise, scoped when useful (e.g., "Fix: auth callback edge case").
- PRs: clear description, linked issues, screenshots/gifs for UI changes, and notes for Cloudflare/Convex impacts.
- Keep diffs focused; include docs updates when behavior or config changes.

## Security & Configuration Tips
- Secrets in `.env.local`; do not commit. Review `wrangler.toml` for Cloudflare settings.
- Convex config lives in `convex/` (`auth.ts`, `schema.ts`). Avoid leaking tokens in logs.
- Before opening a PR: run `bun run lint && bun run build` and verify key flows locally (auth, blog routes).

