# ONE Platform - Master Todo List

**Version:** 2.0.0
**Last Updated:** 2025-10-08
**Owner:** Platform Owner (Anthony O'Connell)
**Managed By:** Director Agent
**Status:** Active Development - Foundation Phase

---

## 🤖 Agents - Team Builder & Orchestrator

### Director Agent (Strategy Agent) ✅ CREATED
**Status:** Specification complete, implementation pending
**Location:** `one/things/agents/director.md`, `convex/services/agents/director/`
- [x] Create director agent specification
- [ ] Implement todo management (read, update, prioritize)
- [ ] Implement workflow orchestration
- [ ] Implement task delegation to specialist agents
- [ ] Implement progress monitoring
- [ ] Implement daily reporting to owner

### Designer Agent (Design Agent)
**Status:** ⏸️ Planned
**Responsibilities:** Components, design system, animations
**Location:** `convex/services/agents/business/design/`
- [ ] Create designer agent specification
- [ ] Implement DesignAgent service
- [ ] Implement component design generation (shadcn/ui patterns)
- [ ] Implement design system creation (tokens, variables)
- [ ] Implement animation generation (Framer Motion, CSS)
- [ ] Implement Figma export integration
- [ ] Implement asset generation (icons, backgrounds, patterns)
- [ ] Tools: `component_design`, `figma_export`, `asset_generation`

### Backend Agent (Engineering Agent)
**Status:** ⏸️ Planned
**Responsibilities:** Convex, Effect.ts, Hono
**Location:** `convex/services/agents/business/engineering/`
- [ ] Create backend agent specification
- [ ] Implement BackendAgent service
- [ ] Implement Convex mutation generation
- [ ] Implement Effect.ts service generation
- [ ] Implement Hono route generation
- [ ] Implement schema updates
- [ ] Tools: `generate_mutation`, `generate_service`, `generate_route`

### AI Specialist Agent
**Status:** ⏸️ Planned
**Responsibilities:** Hono + AI SDK integration
**Location:** `convex/services/agents/business/ai/`
- [ ] Create AI specialist agent specification
- [ ] Implement AIAgent service
- [ ] Implement AI SDK route generation
- [ ] Implement streaming responses
- [ ] Implement RAG integration
- [ ] Implement LLM provider switching (OpenAI, Anthropic, etc.)
- [ ] Tools: `generate_ai_route`, `implement_streaming`, `integrate_rag`

### Frontend Engineer Agent
**Status:** ⏸️ Planned
**Responsibilities:** Astro specialist, React 19, shadcn/ui
**Location:** `convex/services/agents/business/frontend/`
- [ ] Create frontend engineer specification
- [ ] Implement FrontendAgent service
- [ ] Implement Astro page generation
- [ ] Implement React 19 component generation
- [ ] Implement shadcn/ui component integration
- [ ] Implement responsive layouts
- [ ] Tools: `generate_page`, `generate_component`, `add_shadcn`

### Copywriter Agent (Marketing Agent)
**Status:** ⏸️ Planned
**Responsibilities:** Content writing, SEO, messaging
**Location:** `convex/services/agents/business/marketing/`
- [ ] Create copywriter agent specification
- [ ] Implement CopywriterAgent service
- [ ] Implement blog post generation
- [ ] Implement landing page copy
- [ ] Implement SEO optimization
- [ ] Implement email templates
- [ ] Tools: `generate_blog_post`, `optimize_seo`, `write_email`

### Mobile Designer Agent
**Status:** ⏸️ Planned
**Responsibilities:** Mobile-first design, responsive patterns
**Location:** `convex/services/agents/business/mobile/`
- [ ] Create mobile designer specification
- [ ] Implement MobileAgent service
- [ ] Implement mobile-first layouts
- [ ] Implement touch interactions
- [ ] Implement PWA features
- [ ] Tools: `design_mobile_layout`, `add_pwa_features`

### Ingestor Agent (Data Migration Agent) ✅ SPECIFIED
**Status:** Specification exists in AGENTS.md
**Responsibilities:** Migrate data from one.ie and bullfm
**Location:** `convex/services/agents/specialized/ingestor/`
- [ ] Create ingestor agent implementation
- [ ] Implement data extraction from old systems
- [ ] Implement data transformation (to 4-table ontology)
- [ ] Implement data validation
- [ ] Implement migration reports
- [ ] Tools: `extract_data`, `transform_data`, `validate_migration`

### Testor Agent (QA Agent)
**Status:** ⏸️ Planned
**Responsibilities:** Testing, quality assurance
**Location:** `convex/services/agents/specialized/qa/`
- [ ] Create testor agent specification
- [ ] Implement TestorAgent service
- [ ] Implement unit test generation
- [ ] Implement integration test generation
- [ ] Implement E2E test generation
- [ ] Implement test execution and reporting
- [ ] Tools: `generate_tests`, `run_tests`, `analyze_coverage`

### Documentor Agent
**Status:** ⏸️ Planned
**Responsibilities:** Documentation updates, API docs
**Location:** `convex/services/agents/specialized/docs/`
- [ ] Create documentor agent specification
- [ ] Implement DocumentorAgent service
- [ ] Implement documentation updates (sync with code)
- [ ] Implement API documentation generation
- [ ] Implement changelog generation
- [ ] Tools: `update_docs`, `generate_api_docs`, `generate_changelog`

### Performance Optimiser Agent (Intelligence Agent)
**Status:** ⏸️ Planned
**Responsibilities:** Performance analysis, optimization
**Location:** `convex/services/agents/business/intelligence/`
- [ ] Create performance optimizer specification
- [ ] Implement PerformanceAgent service
- [ ] Implement performance metric tracking
- [ ] Implement bottleneck detection
- [ ] Implement optimization recommendations
- [ ] Tools: `analyze_performance`, `detect_bottlenecks`, `suggest_optimizations`

### SEO Agent (Marketing Sub-Agent)
**Status:** ⏸️ Planned
**Responsibilities:** SEO optimization, meta tags, sitemap
**Location:** `convex/services/agents/business/seo/`
- [ ] Create SEO agent specification
- [ ] Implement SEOAgent service
- [ ] Implement meta tag optimization
- [ ] Implement sitemap generation
- [ ] Implement structured data (JSON-LD)
- [ ] Implement keyword optimization
- [ ] Tools: `optimize_meta`, `generate_sitemap`, `add_structured_data`

---

## 🪝 Hooks - Application Enhancement

### Structure Hooks
**Purpose:** Organize codebase structure, enforce patterns
- [ ] **Pre-commit hook:** Validate file naming conventions
- [ ] **Pre-commit hook:** Validate TypeScript strict mode
- [ ] **Pre-commit hook:** Validate no 'any' types (except properties)
- [ ] **Pre-commit hook:** Validate imports use path aliases (@/*)
- [ ] **Post-merge hook:** Run `bunx astro sync` to regenerate types
- [ ] **Post-merge hook:** Run `bun install` if package.json changed

### Secrets Hooks
**Purpose:** Prevent secret leakage, enforce security
- [ ] **Pre-commit hook:** Scan for API keys in code
- [ ] **Pre-commit hook:** Scan for private keys
- [ ] **Pre-commit hook:** Scan for .env files in git
- [ ] **Pre-commit hook:** Validate environment variables used are documented
- [ ] **CI/CD hook:** Rotate secrets on deployment
- [ ] **Runtime hook:** Validate all secrets are encrypted (Better Auth, Stripe, etc.)

### Ontology Hooks
**Purpose:** Enforce 4-table ontology patterns
- [ ] **Pre-mutation hook:** Validate entity type exists in ontology
- [ ] **Pre-mutation hook:** Validate connection type exists in ontology
- [ ] **Pre-mutation hook:** Validate event type exists in ontology
- [ ] **Post-mutation hook:** Auto-log events for entity changes
- [ ] **Query hook:** Enforce org-scoped queries (multi-tenant isolation)
- [ ] **Query hook:** Validate protocol metadata format

### Files Hooks
**Purpose:** Keep file system organized
- [ ] **Pre-commit hook:** Validate file locations match files.md
- [ ] **Pre-commit hook:** Validate new files update files.md
- [ ] **Post-file-create hook:** Auto-generate barrel exports (index.ts)
- [ ] **Pre-delete hook:** Check for references before deleting
- [ ] **Post-move hook:** Update all imports automatically

### Patterns Hooks
**Purpose:** Enforce code patterns from patterns.md
- [ ] **Pre-commit hook:** Validate Effect.ts services follow pattern
- [ ] **Pre-commit hook:** Validate Convex mutations are thin wrappers
- [ ] **Pre-commit hook:** Validate React components use Convex hooks
- [ ] **Pre-commit hook:** Validate Astro pages use SSR patterns
- [ ] **Code review hook:** Auto-comment with pattern violations

---

## 🎮 Commands - Developer Experience

### /design Command
**Purpose:** Generate design system components
**Location:** `.claude/commands/design.ts`
- [ ] Implement `/design` command handler
- [ ] Integrate with designer agent
- [ ] Generate design tokens (colors, spacing, typography)
- [ ] Generate component variants
- [ ] Generate Tailwind CSS configuration
- [ ] Generate Figma tokens export
- **Usage:** `/design button primary | /design colors light-mode`

### /push Command ✅ EXISTS
**Purpose:** Build, fix errors, commit, and push
**Location:** Configured in slash commands
- [x] Command exists and works
- [ ] Enhance with pre-push validation
- [ ] Add automatic changelog generation
- [ ] Add deployment trigger option
- **Usage:** `/push "feat: add password reset"`

### /deploy Command
**Purpose:** Deploy to production (Cloudflare Pages)
**Location:** `.claude/commands/deploy.ts`
- [ ] Implement `/deploy` command handler
- [ ] Build production bundle
- [ ] Run all tests
- [ ] Deploy to Cloudflare Pages
- [ ] Verify deployment health
- [ ] Rollback on failure
- **Usage:** `/deploy production | /deploy staging`

---

## 🖥️ CLI - Command Line Interface

### npx oneie CLI
**Purpose:** Bootstrap and manage ONE projects
**Location:** `packages/cli/` (future package)
**Status:** ⏸️ Planned - see `one/things/cli.md`
- [ ] Create @one/cli package
- [ ] Implement `npx oneie create` (bootstrap project)
- [ ] Implement `npx oneie add` (add features)
- [ ] Implement `npx oneie agent` (spawn agents)
- [ ] Implement `npx oneie deploy` (deploy project)
- [ ] Implement `npx oneie status` (show org status)
- [ ] Implement `npx oneie docs` (open documentation)

---

## 🔌 MCP's - Model Context Protocols

### Convex MCP ✅ CONFIGURED
**Status:** Configured in `.mcp.json`
**Purpose:** Convex deployment management
- [x] MCP configured and working
- [ ] Enhance with inference quota tracking
- [ ] Enhance with organization usage tracking
- [ ] Add real-time log streaming
- **Tools:** `status`, `data`, `tables`, `functionSpec`, `run`, `envList`, `logs`

### Chrome DevTools MCP
**Purpose:** Browser debugging integration
**Status:** ⏸️ Not yet configured
- [ ] Research chrome-devtools MCP implementation
- [ ] Configure in `.mcp.json`
- [ ] Integrate with frontend testing workflow
- [ ] Enable remote debugging for mobile

### Error Tracking MCP (Sentry/Similar)
**Purpose:** Production error monitoring
**Status:** ⏸️ Not yet configured
- [ ] Choose error tracking service (Sentry, Rollbar, or custom)
- [ ] Create error tracking MCP
- [ ] Configure in `.mcp.json`
- [ ] Integrate with agent alert system
- [ ] Auto-create issues for critical errors

---

## 🎨 Design - Design System

### Design System Foundation
**Status:** ⏸️ Planned
**Location:** `src/styles/design-system.css`
- [ ] Create design system documentation
- [ ] Define design tokens (CSS custom properties)
- [ ] Define spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- [ ] Define typography scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- [ ] Define breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- [ ] Define z-index scale (modal, dropdown, sticky, fixed)

### Light / Dark Mode ✅ IMPLEMENTED
**Status:** Implemented with Tailwind v4
**Location:** `src/styles/global.css`, `src/components/ModeToggle.tsx`
- [x] Light mode colors defined
- [x] Dark mode colors defined
- [x] Mode toggle component working
- [ ] Enhance with system preference detection
- [ ] Add theme transition animations
- [ ] Add per-user theme persistence (Better Auth)

### Color System
**Status:** Partial - Needs expansion
**Location:** `src/styles/global.css` (@theme blocks)
- [ ] Define primary brand colors (with HSL values)
- [ ] Define secondary colors
- [ ] Define accent colors
- [ ] Define semantic colors (success, warning, error, info)
- [ ] Define surface colors (background, card, popover)
- [ ] Define text colors (foreground, muted, muted-foreground)
- [ ] Test WCAG contrast ratios (AA minimum)

### Logo Assets
**Status:** ⏸️ Needed
**Location:** `public/logo/`
- [ ] Design ONE Platform logo (light version)
- [ ] Design ONE Platform logo (dark version)
- [ ] Export SVG (optimized)
- [ ] Export PNG (multiple sizes: 32px, 64px, 128px, 256px, 512px)
- [ ] Export favicon (16px, 32px, ICO format)
- [ ] Add to Layout.astro

### Icon System
**Status:** Partial - Lucide React icons in use
**Location:** `src/components/ui/`, `public/icons/`
- [ ] Audit current icon usage (Lucide React)
- [ ] Create custom icons for ONE-specific concepts
- [ ] Export custom icons as SVG sprites
- [ ] Document icon usage patterns
- [ ] Create icon component wrapper

### Backgrounds
**Status:** ⏸️ Needed
**Location:** `public/backgrounds/`
- [ ] Design hero background (light mode)
- [ ] Design hero background (dark mode)
- [ ] Design section backgrounds (features, pricing, testimonials)
- [ ] Design authentication page backgrounds
- [ ] Design dashboard backgrounds
- [ ] Optimize for web (WebP, lazy loading)

### Patterns & Gradients
**Status:** ⏸️ Needed
**Location:** `src/styles/patterns.css`
- [ ] Create dot grid pattern
- [ ] Create mesh gradient pattern
- [ ] Create noise texture overlay
- [ ] Create animated gradient backgrounds
- [ ] Create card hover effects
- [ ] Document pattern usage

### Button System ✅ SHADCN CONFIGURED
**Status:** shadcn/ui buttons installed
**Location:** `src/components/ui/button.tsx`
- [x] Primary button variant
- [x] Secondary button variant
- [x] Outline button variant
- [x] Ghost button variant
- [x] Link button variant
- [ ] Add loading state variant
- [ ] Add icon button variant
- [ ] Document button usage patterns

---

## 🎬 Animation - Motion Design

### Scroll Animations
**Status:** ⏸️ Planned
**Library:** Framer Motion or CSS Scroll-driven Animations
**Location:** `src/components/animations/`
- [ ] Choose animation library (Framer Motion vs CSS scroll-driven)
- [ ] Implement fade-in on scroll
- [ ] Implement slide-up on scroll
- [ ] Implement parallax effects
- [ ] Implement stagger animations (for lists)
- [ ] Implement scroll progress indicators
- [ ] Add `prefers-reduced-motion` support
- [ ] Document animation patterns

### Page Transitions
**Status:** ⏸️ Planned
**Location:** `src/layouts/Layout.astro`, `src/components/PageTransition.astro`
- [ ] Implement page transition component
- [ ] Add route change animations
- [ ] Add loading indicators
- [ ] Optimize for performance (60fps target)

### Micro-interactions
**Status:** ⏸️ Planned
**Location:** `src/components/ui/` (enhance existing components)
- [ ] Add button click ripple effect
- [ ] Add input focus animations
- [ ] Add checkbox/switch toggle animations
- [ ] Add toast notification animations
- [ ] Add modal enter/exit animations
- [ ] Add dropdown slide animations

---

## 🧩 Components - UI Building Blocks

### Search Component
**Status:** ⏸️ Planned - Need to choose implementation
**Options:**
1. **Astro Content Collection Search** (built-in, type-safe)
2. **Pagefind** (static search, fast, no backend)
3. **Convex Full-Text Search** (real-time, dynamic content)

**Decision Needed:** Which search approach?
- [ ] **Option A: Astro Content Collection Search**
  - [ ] Implement search index generation
  - [ ] Create SearchInput component
  - [ ] Add fuzzy matching
  - [ ] Add filters (by type, tag, date)
  - **Pros:** Type-safe, built-in
  - **Cons:** Static only (no user-generated content)

- [ ] **Option B: Pagefind**
  - [ ] Install Pagefind
  - [ ] Configure build-time indexing
  - [ ] Create SearchInput component
  - [ ] Integrate Pagefind UI
  - [ ] Style to match design system
  - **Pros:** Fast, no backend, works with static + dynamic
  - **Cons:** Requires build step

- [ ] **Option C: Convex Search**
  - [ ] Implement full-text search in Convex
  - [ ] Create SearchInput component
  - [ ] Add real-time search results
  - [ ] Add search analytics
  - **Pros:** Real-time, dynamic content, rich features
  - **Cons:** Requires backend, query costs

**Recommendation:** Start with Pagefind (best of both worlds), upgrade to Convex when user-generated content scales.

**Location:** `src/components/Search.tsx`, `src/components/SearchResults.tsx`

---

## 📐 Layouts - Page Structure

### Layout System ✅ EXISTS
**Status:** Base layouts exist
**Location:** `src/layouts/`
- [x] `Layout.astro` - Base layout with header, footer
- [x] `Blog.astro` - Blog post layout with ToC
- [ ] `AppLayout.astro` - Application layout (dashboard, authenticated pages)
- [ ] `LandingLayout.astro` - Landing page layout (marketing)
- [ ] `AuthLayout.astro` - Authentication layout (signin, signup)
- [ ] `DocsLayout.astro` - Documentation layout

### Page Templates
**Status:** Partial - Some pages exist
**Location:** `src/pages/`
- [ ] Marketing pages (home, features, pricing, about, contact)
- [ ] Authentication pages (✅ exist in /account/)
- [ ] Dashboard pages (platform owner, org owner, org user, customer)
- [ ] Application pages (agents, workflows, todos)
- [ ] Documentation pages (guides, API reference, examples)
- [ ] Error pages (404, 500, maintenance)

---

## 📊 Current Phase: Foundation Setup

**Goal:** Establish core infrastructure and agent orchestration system
**Timeline:** Weeks 1-4 of 12-week implementation roadmap
**Progress:** 15% complete (documentation system established)

---

## 🎯 Active Todos (High Priority)

### Phase 1A: Documentation & Planning (15% Complete)

#### ✅ Completed
- [x] Create documentation ecosystem (90 .md files, 73k lines) - **DONE**
- [x] Define ontology (4 tables, 66 things, 25 connections, 67 events) - **DONE**
- [x] Define architecture (Effect.ts, Convex, Astro, Hono) - **DONE**
- [x] Create strategy documentation (8 core features) - **DONE**
- [x] Create workflow documentation (ontology-driven development) - **DONE**

**Status:** Documentation foundation is EXCELLENT. All patterns defined.

#### ⏳ In Progress
1. **Convex Schema Implementation**
   **Priority:** P0
   **Effort:** M
   **Assigned to:** Director Agent
   **Dependencies:** None (ontology spec complete)
   **Status:** ⏳ Need to verify schema.ts matches ontology.md exactly
   **Location:** `convex/schema.ts`
   **Checklist:**
   - [ ] Verify `entities` table matches 66 thing types
   - [ ] Verify `connections` table matches 25 connection types
   - [ ] Verify `events` table matches 67 event types
   - [ ] Add `knowledge` table (labels + chunks + vectors)
   - [ ] Add `thingKnowledge` junction table
   - [ ] Verify all indexes are optimized
   - [ ] Verify Better Auth tables (users, sessions, etc.)
   - [ ] Run `bunx astro check` to verify types
   - [ ] Deploy to Convex

2. **ConvexDatabase Effect.ts Service**
   **Priority:** P0
   **Effort:** M
   **Assigned to:** Director Agent
   **Dependencies:** Schema implementation complete
   **Status:** ⏳ Waiting for schema verification
   **Location:** `convex/services/database/convexDatabase.ts`
   **Checklist:**
   - [ ] Create ConvexDatabase service (Effect.ts)
   - [ ] Implement CRUD operations (insert, get, query, patch, delete)
   - [ ] Implement connection queries (from_type, to_type, bidirectional)
   - [ ] Implement event queries (by_entity, by_type, by_timestamp)
   - [ ] Implement knowledge queries (by_type, by_source, vector search)
   - [ ] Add typed errors (DatabaseError, NotFoundError, etc.)
   - [ ] Add retry logic (3 attempts, exponential backoff)
   - [ ] Add timeout (30 seconds for mutations)
   - [ ] Write unit tests (mock Convex context)
   - [ ] Document in patterns.md

3. **Better Auth Integration**
   **Priority:** P0
   **Effort:** L
   **Assigned to:** Director Agent
   **Dependencies:** Schema implementation complete
   **Status:** ⏳ Waiting for schema verification
   **Location:** `convex/auth/` and `src/pages/account/`
   **Checklist:**
   - [ ] Verify Better Auth schema tables exist
   - [ ] Create AuthService (Effect.ts)
   - [ ] Implement authentication mutations (signin, signup, signout)
   - [ ] Implement password reset flow (request, verify, complete)
   - [ ] Implement email verification flow
   - [ ] Implement magic link flow
   - [ ] Implement 2FA flow (totp, backup codes)
   - [ ] Add session management (create, verify, invalidate)
   - [ ] Add OAuth integration (GitHub, Google)
   - [ ] Link users to entities table (users.thingId → entities._id)
   - [ ] Write integration tests
   - [ ] Document in patterns.md

### Phase 1B: Core Services (0% Complete)

4. **Directory Structure for Agents**
   **Priority:** P1
   **Effort:** S
   **Assigned to:** Director Agent
   **Dependencies:** ConvexDatabase service complete
   **Status:** ⏸️ Waiting for P0 tasks
   **Location:** `convex/services/agents/`
   **Checklist:**
   - [ ] Create `convex/services/agents/` directory
   - [ ] Create `convex/services/agents/director/` (orchestrator)
   - [ ] Create `convex/services/agents/clone/` (AI clones)
   - [ ] Create `convex/services/agents/business/` (10 business agents)
   - [ ] Create agent schema types in ontology
   - [ ] Document agent patterns in `one/agents/README.md`

5. **Agent Orchestration Service**
   **Priority:** P1
   **Effort:** XL
   **Assigned to:** Director Agent
   **Dependencies:** ConvexDatabase service, directory structure
   **Status:** ⏸️ Waiting for P0 tasks
   **Location:** `convex/services/agents/orchestrator.ts`
   **Checklist:**
   - [ ] Create AgentOrchestrator service (Effect.ts)
   - [ ] Implement agent registration (create agent entity)
   - [ ] Implement agent discovery (query by type)
   - [ ] Implement task delegation (create delegated connection)
   - [ ] Implement task status tracking (events)
   - [ ] Implement agent communication (A2A protocol)
   - [ ] Add typed errors (AgentNotFoundError, TaskFailedError)
   - [ ] Add retry logic (exponential backoff per agent)
   - [ ] Write unit tests (mock agents)
   - [ ] Document in patterns.md

6. **Director Agent Implementation**
   **Priority:** P1
   **Effort:** XL
   **Assigned to:** Platform Owner (with AI assistance)
   **Dependencies:** AgentOrchestrator service
   **Status:** ⏸️ Waiting for orchestration service
   **Location:** `convex/services/agents/director/`
   **Checklist:**
   - [ ] Create DirectorAgent service (Effect.ts)
   - [ ] Implement todo management (read, update, prioritize)
   - [ ] Implement work delegation (assign tasks to clone agents)
   - [ ] Implement progress tracking (monitor task events)
   - [ ] Implement decision making (analyze blockers, suggest solutions)
   - [ ] Implement reporting (daily summary to owner)
   - [ ] Add communication with clone agents (A2A protocol)
   - [ ] Add communication with business agents (A2A protocol)
   - [ ] Write integration tests
   - [ ] Document in `one/agents/director.md`

7. **Clone Agent Implementation**
   **Priority:** P1
   **Effort:** XL
   **Assigned to:** Director Agent (with AI assistance)
   **Dependencies:** AgentOrchestrator service
   **Status:** ⏸️ Waiting for orchestration service
   **Location:** `convex/services/agents/clone/`
   **Checklist:**
   - [ ] Create CloneAgent service (Effect.ts)
   - [ ] Implement code generation (use patterns from patterns.md)
   - [ ] Implement PR creation (via gh CLI)
   - [ ] Implement testing (run tests, verify results)
   - [ ] Implement documentation updates (keep docs current)
   - [ ] Add communication with director (A2A protocol)
   - [ ] Add self-improvement (learn from mistakes)
   - [ ] Write integration tests
   - [ ] Document in `one/agents/clone.md`

---

## 📋 Next Phase: Core Services (0% Complete)

### Phase 2A: Token Economy (Planned)

8. **TokenService Implementation**
   **Priority:** P2
   **Effort:** L
   **Assigned to:** Clone Agent (future)
   **Dependencies:** ConvexDatabase, Multi-chain providers (Sui, Base, Solana)
   **Status:** ⏸️ Planned
   **Location:** `convex/services/tokens/`
   **Checklist:**
   - [ ] Create TokenService (Effect.ts)
   - [ ] Implement token creation (mint on SUI blockchain)
   - [ ] Implement token purchase (fiat via Stripe OR crypto direct)
   - [ ] Implement token balance queries (connection: holds_tokens)
   - [ ] Implement token burn (deflationary mechanism)
   - [ ] Implement token staking (connection: staked_in)
   - [ ] Implement token transfers (update connections)
   - [ ] Add multi-chain support (Sui, Base, Solana)
   - [ ] Add typed errors per blockchain
   - [ ] Write unit tests (mock blockchain providers)
   - [ ] Document in patterns.md

9. **Multi-Chain Provider Implementations**
   **Priority:** P2
   **Effort:** XL
   **Assigned to:** Clone Agent (future)
   **Dependencies:** TokenService design complete
   **Status:** ⏸️ Planned
   **Location:** `convex/services/providers/`
   **Checklist:**
   - [ ] Create SuiProvider (Effect.ts) - Move language contracts
   - [ ] Create BaseProvider (Effect.ts) - EVM-compatible L2
   - [ ] Create SolanaProvider (Effect.ts) - High-speed, low-cost
   - [ ] Implement wallet connection (each chain)
   - [ ] Implement token minting (each chain)
   - [ ] Implement token burning (each chain)
   - [ ] Implement token transfers (each chain)
   - [ ] Implement NFT minting (each chain)
   - [ ] Add chain-specific error types
   - [ ] Add retry logic per chain
   - [ ] Write integration tests (testnet transactions)
   - [ ] Document in `one/connections/cryptonetworks.md`

### Phase 2B: Content & AI (Planned)

10. **ContentService Implementation**
    **Priority:** P2
    **Effort:** L
    **Assigned to:** Clone Agent (future)
    **Dependencies:** ConvexDatabase, OpenAI provider
    **Status:** ⏸️ Planned
    **Location:** `convex/services/content/`
    **Checklist:**
    - [ ] Create ContentService (Effect.ts)
    - [ ] Implement content creation (blog, video, social, email)
    - [ ] Implement content publishing (status: draft → published)
    - [ ] Implement content distribution (multi-platform)
    - [ ] Implement content generation (AI via OpenAI)
    - [ ] Implement content RAG (chunk + embed + store in knowledge)
    - [ ] Add typed errors
    - [ ] Write unit tests
    - [ ] Document in patterns.md

11. **AICloneService Implementation**
    **Priority:** P2
    **Effort:** XL
    **Assigned to:** Clone Agent (future)
    **Dependencies:** ContentService, ElevenLabs, D-ID/HeyGen providers
    **Status:** ⏸️ Planned
    **Location:** `convex/services/agents/clone/`
    **Checklist:**
    - [ ] Create AICloneService (Effect.ts)
    - [ ] Implement voice cloning (ElevenLabs)
    - [ ] Implement appearance cloning (D-ID or HeyGen)
    - [ ] Implement personality extraction (OpenAI + RAG)
    - [ ] Implement clone interaction (chat with users)
    - [ ] Implement clone content generation (in creator's style)
    - [ ] Implement clone teaching (course delivery)
    - [ ] Add typed errors
    - [ ] Write integration tests
    - [ ] Document in patterns.md

12. **RAG Knowledge Ingestion**
    **Priority:** P2
    **Effort:** L
    **Assigned to:** Clone Agent (future)
    **Dependencies:** ContentService, OpenAI embeddings
    **Status:** ⏸️ Planned
    **Location:** `convex/services/knowledge/`
    **Checklist:**
    - [ ] Create KnowledgeService (Effect.ts)
    - [ ] Implement document chunking (800 tokens, 200 overlap)
    - [ ] Implement embedding generation (OpenAI text-embedding-3-large)
    - [ ] Implement knowledge storage (knowledge table)
    - [ ] Implement thingKnowledge linking (junction table)
    - [ ] Implement semantic search (vector similarity)
    - [ ] Implement label management (taxonomy)
    - [ ] Add typed errors
    - [ ] Write unit tests
    - [ ] Document in ontology.md (RAG section)

### Phase 2C: Community & Courses (Planned)

13. **CommunityService Implementation**
    **Priority:** P3
    **Effort:** M
    **Assigned to:** Clone Agent (future)
    **Dependencies:** ConvexDatabase
    **Status:** ⏸️ Planned
    **Location:** `convex/services/community/`
    **Checklist:**
    - [ ] Create CommunityService (Effect.ts)
    - [ ] Implement community creation
    - [ ] Implement member management (invite, join, remove)
    - [ ] Implement message threads (conversation entity)
    - [ ] Implement real-time chat (Convex subscriptions)
    - [ ] Implement moderation (AI + human)
    - [ ] Add typed errors
    - [ ] Write unit tests
    - [ ] Document in patterns.md

14. **CourseService Implementation**
    **Priority:** P3
    **Effort:** L
    **Assigned to:** Clone Agent (future)
    **Dependencies:** ContentService, TokenService
    **Status:** ⏸️ Planned
    **Location:** `convex/services/courses/`
    **Checklist:**
    - [ ] Create CourseService (Effect.ts)
    - [ ] Implement course creation (AI-generated)
    - [ ] Implement lesson creation (modular units)
    - [ ] Implement enrollment (connection: enrolled_in)
    - [ ] Implement progress tracking (metadata: progress %)
    - [ ] Implement completion (event: course_completed)
    - [ ] Implement token-gating (check holds_tokens balance)
    - [ ] Implement gamification (rewards, achievements)
    - [ ] Add typed errors
    - [ ] Write unit tests
    - [ ] Document in patterns.md

---

## 🔮 Future Phase: Integration (Planned)

### Phase 3: External Integrations

15. **SUI Blockchain Contracts**
    **Priority:** P3
    **Effort:** XL
    **Assigned to:** External contractor + Clone Agent
    **Dependencies:** SuiProvider complete
    **Status:** ⏸️ Planned
    **Checklist:**
    - [ ] Design Move contract for creator tokens (ERC-20 equivalent)
    - [ ] Design Move contract for NFTs (ERC-721 equivalent)
    - [ ] Design Move contract for token vesting
    - [ ] Implement contracts in Move language
    - [ ] Deploy to SUI testnet
    - [ ] Write integration tests
    - [ ] Deploy to SUI mainnet
    - [ ] Document in `one/connections/cryptonetworks.md`

16. **ElevenLabs Voice Cloning**
    **Priority:** P2
    **Effort:** M
    **Assigned to:** Clone Agent (future)
    **Dependencies:** AICloneService design
    **Status:** ⏸️ Planned
    **Checklist:**
    - [ ] Create ElevenLabsProvider (Effect.ts)
    - [ ] Implement voice cloning API integration
    - [ ] Implement voice synthesis (text-to-speech)
    - [ ] Implement voice storage (save voiceId in ai_clone entity)
    - [ ] Add typed errors
    - [ ] Write integration tests
    - [ ] Document in service-providers.md

17. **Protocol Implementations**
    **Priority:** P3
    **Effort:** XL
    **Assigned to:** Clone Agent (future)
    **Dependencies:** AgentOrchestrator, external agents
    **Status:** ⏸️ Planned
    **Checklist:**
    - [ ] Implement A2A (Agent-to-Agent) protocol
    - [ ] Implement ACP (Agentic Commerce Protocol)
    - [ ] Implement AP2 (Agent Payments Protocol)
    - [ ] Implement X402 (HTTP Micropayments)
    - [ ] Implement AG-UI (Generative UI Protocol)
    - [ ] Document in `one/things/specifications.md`

---

## 🚧 Blockers

### Critical Blockers (P0)
**None currently** - Documentation foundation is complete, ready to implement.

### Potential Blockers
1. **API Keys Missing**
   - ElevenLabs API key (voice cloning)
   - D-ID or HeyGen API key (appearance cloning)
   - OpenAI API key (embeddings, chat)
   - Resend API key (emails)
   - Stripe API keys (fiat payments)
   - SUI wallet private keys (testnet/mainnet)
   - **Resolution:** Set up API keys in Convex environment variables

2. **Blockchain Testnet Tokens**
   - Need testnet tokens for Sui, Base, Solana
   - **Resolution:** Request from faucets once providers are implemented

3. **Voice Samples for Cloning**
   - Need high-quality voice samples (15+ minutes)
   - **Resolution:** Record samples from creator (Anthony O'Connell)

---

## 🤔 Decisions Needed

### Immediate Decisions (This Week)
1. **Which AI clone provider?**
   - Option A: D-ID (cheaper, good quality)
   - Option B: HeyGen (premium, best quality)
   - Option C: Build custom (Wav2Lip + Stable Diffusion)
   - **Recommendation:** Start with D-ID, upgrade to HeyGen if needed
   - **Owner Decision:** Pending

2. **Which blockchain for launch?**
   - Option A: Sui (high throughput, Move language, new)
   - Option B: Base (Coinbase L2, EVM-compatible, established)
   - Option C: Solana (high speed, low cost, proven)
   - Option D: All three (multi-chain from day 1)
   - **Recommendation:** Start with Sui (aligns with strategy.md), add Base + Solana later
   - **Owner Decision:** Pending

3. **Development sequence priority?**
   - Option A: Agents first (director + clone agents) - enables autonomous development
   - Option B: Features first (tokens + courses) - enables revenue faster
   - **Recommendation:** Agents first (multiplies development speed)
   - **Owner Decision:** Pending

### Strategic Decisions (Next 2 Weeks)
4. **Revenue model priority?**
   - Platform subscriptions (€99-499/month)
   - Course revenue share (10-20%)
   - Token transaction fees (2-5%)
   - **Decision:** Start with platform subscriptions (predictable revenue)

5. **Beta creator selection criteria?**
   - Minimum followers (25K+)
   - Active community (engagement rate >5%)
   - Niche diversity (fitness, business, art, tech)
   - **Decision:** Define exact criteria before Phase 3

---

## 📚 Resources

### Documentation Links (Critical Reading)
- **[one/connections/documentation.md](../connections/documentation.md)** - Complete doc ecosystem map
- **[one/connections/modes.md](../connections/modes.md)** - Standalone vs API mode
- **[one/connections/development.md](../connections/development.md)** - Using `npx oneie` CLI with Claude Code
- **[AGENTS.md](../../AGENTS.md)** - Convex development patterns
- **[one/things/rules.md](./rules.md)** - Golden rules for AI code generation
- **[one/connections/workflow.md](../connections/workflow.md)** - Ontology-driven development flow
- **[one/connections/patterns.md](../connections/patterns.md)** - Proven code patterns
- **[one/things/architecture.md](./architecture.md)** - System architecture & functional programming
- **[one/things/frontend.md](./frontend.md)** - Astro frontend with content collections
- **[one/connections/middleware.md](../connections/middleware.md)** - Convex hooks, API client, Effect.ts services
- **[one/things/hono.md](./hono.md)** - Hono API backend with Effect.ts services
- **[one/things/files.md](./files.md)** - File system map
- **[one/things/strategy.md](./strategy.md)** - Platform vision & 8 core features
- **[one/connections/ontology.md](../connections/ontology.md)** - 4-table data model
- **[one/connections/dashboard.md](../connections/dashboard.md)** - Multi-tenant UI
- **[one/things/specifications.md](./specifications.md)** - Protocol integration patterns
- **[one/connections/implementation.md](../connections/implementation.md)** - 12-week roadmap

### API Documentation
- **Convex:** https://docs.convex.dev
- **Effect.ts:** https://effect.website
- **Confect:** https://github.com/get-convex/confect
- **Astro:** https://docs.astro.build
- **Hono:** https://hono.dev
- **Better Auth:** https://www.better-auth.com
- **ElevenLabs:** https://docs.elevenlabs.io
- **SUI Move:** https://docs.sui.io

### Code Patterns
- **CRUD Operations:** See `one/connections/patterns.md` - Entity CRUD
- **Agent Communication:** See `one/connections/patterns.md` - A2A Protocol
- **Multi-Chain:** See `one/things/architecture.md` - Multi-Chain Providers
- **RAG Ingestion:** See `one/connections/ontology.md` - RAG Strategy

---

## 📊 Progress Tracking

### Overall Progress: 15% Complete

**Phase 1: Foundation (15% of 100% total)**
- [x] Documentation (100% complete)
- [ ] Core services (0% complete)
  - [ ] Schema implementation
  - [ ] ConvexDatabase service
  - [ ] Better Auth integration
  - [ ] Agent infrastructure

**Phase 2: Core Features (0% of 40% total)**
- [ ] Token economy
- [ ] Content & AI
- [ ] Community & courses

**Phase 3: Integration (0% of 35% total)**
- [ ] Blockchain contracts
- [ ] External services
- [ ] Protocol implementations

**Phase 4: Launch (0% of 10% total)**
- [ ] Beta testing
- [ ] Production deployment
- [ ] First 10 creators

### Velocity Metrics
- **Current:** 1 documentation file per day (90 files in 90 days)
- **Target:** 1 feature per week (once agents are operational)
- **Bottleneck:** No code generation yet (waiting for agents)

### Risk Assessment
- **Documentation Risk:** LOW (complete, comprehensive)
- **Technical Risk:** MEDIUM (new architecture, unproven at scale)
- **Timeline Risk:** MEDIUM (12 weeks is aggressive)
- **Team Risk:** HIGH (single developer + AI agents - untested)

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [x] All 90 documentation files exist and are accurate
- [ ] Convex schema deployed and verified
- [ ] ConvexDatabase service passes all unit tests
- [ ] Better Auth working (signin, signup, password reset)
- [ ] Director agent can read and update this todo list
- [ ] Clone agent can generate simple CRUD operations

### Phase 2 Complete When:
- [ ] Users can purchase tokens (fiat or crypto)
- [ ] AI clone can generate content in creator's voice
- [ ] Courses can be created and enrolled in
- [ ] RAG knowledge search returns relevant results
- [ ] Community messaging works in real-time

### Phase 3 Complete When:
- [ ] SUI smart contracts deployed to mainnet
- [ ] Voice cloning produces high-quality output
- [ ] At least 2 protocols (A2A + ACP) fully implemented
- [ ] External agents can communicate via A2A

### Launch Complete When:
- [ ] 10 beta creators onboarded
- [ ] €10K+ in monthly recurring revenue
- [ ] All core features stable in production
- [ ] NPS score >50 from beta creators

---

## 💡 Notes for AI Agents

### For Director Agent
**Your job:** Manage this todo list, prioritize tasks, delegate to clone agents, report progress.

**Daily Tasks:**
1. Review active todos (check ⏳ items)
2. Update progress (change statuses, check boxes)
3. Identify blockers (add to blockers section)
4. Prioritize decisions (add to decisions needed)
5. Report to owner (daily summary via email)

**Communication Protocol:**
- Use A2A protocol for all agent communication
- Log all decisions as events (event type: decision_made)
- Create connections for task delegation (connection type: delegated)

**Success Metrics:**
- All P0 tasks completed within 1 week
- All P1 tasks completed within 2 weeks
- Zero blockers older than 3 days
- Clone agents report 90%+ task success rate

### For Clone Agents
**Your job:** Execute tasks delegated by director, follow patterns exactly, report status.

**Task Workflow:**
1. Receive task from director (via A2A protocol)
2. Read relevant documentation (links in checklist)
3. Generate code (follow patterns.md exactly)
4. Write tests (unit + integration)
5. Verify types (`bunx astro check`)
6. Update documentation (patterns.md, files.md)
7. Report completion (via A2A protocol)

**Code Generation Rules:**
- 100% Effect.ts for business logic (NO async/await)
- Typed errors with `_tag` pattern
- Dependency injection via Effect layers
- Map all features to 4-table ontology
- Follow patterns.md examples exactly

**Success Metrics:**
- 90%+ code generation accuracy (compiles first time)
- 100% test coverage for new code
- Zero breaking changes to existing code
- All PRs approved within 1 day

### For Platform Owner (Human)
**Your job:** Make strategic decisions, provide vision, approve critical changes.

**Daily Tasks:**
1. Review director agent's progress report
2. Make decisions on blockers (if needed)
3. Approve high-risk changes (blockchain, payments)
4. Provide feedback on AI-generated code

**Weekly Tasks:**
1. Review overall progress (vs 12-week roadmap)
2. Adjust priorities based on user feedback
3. Make strategic decisions (revenue model, beta criteria)
4. Communicate vision to agents

**Success Metrics:**
- All P0 decisions made within 24 hours
- All P1 decisions made within 1 week
- Zero critical bugs in production
- Platform on track for 12-week launch

---

## 🚀 Next Actions (This Week)

### Monday (Priority Order)
1. **Verify Convex Schema** (Director Agent)
   - Compare `convex/schema.ts` to `one/connections/ontology.md`
   - Ensure all 66 thing types, 25 connections, 67 events are represented
   - Add `knowledge` table if missing
   - Deploy to Convex
   - Verify with `bunx astro check`

2. **Create ConvexDatabase Service** (Clone Agent)
   - Read `one/connections/patterns.md` - Database Patterns
   - Generate `convex/services/database/convexDatabase.ts`
   - Implement all CRUD operations
   - Write unit tests
   - Update `one/connections/patterns.md`

3. **Create Better Auth Service** (Clone Agent)
   - Read `AGENTS.md` - Better Auth section
   - Generate `convex/auth/authService.ts`
   - Implement signin, signup, password reset
   - Write integration tests
   - Update `one/connections/patterns.md`

### Tuesday-Friday
4. **Agent Infrastructure** (Director + Clone)
5. **Agent Orchestration** (Director)
6. **First AI-Generated Feature** (Clone Agent test)

---

## 📈 Long-Term Vision (12 Weeks)

**Week 1-4: Foundation** (Current Phase)
→ Core services, agent infrastructure, basic CRUD

**Week 5-8: Core Features**
→ Tokens, content, AI clones, courses

**Week 9-10: Integration**
→ Blockchain, external services, protocols

**Week 11-12: Launch**
→ Beta testing, first 10 creators, production

**Result:** AI-native creator platform generating €10K+ MRR with 10 beta creators and autonomous agent workforce.

---

**END OF TODO LIST**

*This list is managed by the Director Agent and updated daily. Last human edit: 2025-10-08*
