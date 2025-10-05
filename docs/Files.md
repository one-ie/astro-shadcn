# ONE Platform - File System Map

**Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Purpose:** Exact location for every file type - AI agents use this to know where to place generated code

---

## How AI Agents Use This Map

**Before creating ANY file:**
1. Find the file type in this map
2. Use the exact path shown
3. Follow naming conventions precisely
4. Update this map if creating new directories

**Never:**
- Create files in random locations
- Invent new directory structures
- Use different naming conventions
- Skip updating this map

---

## Complete Directory Tree

```
astro-shadcn/
│
├── .ai/                                    # AI AGENT CONTEXT (never commit secrets)
│   ├── agents/                             # Agent specifications
│   │   ├── frontend-agent.md               # Astro/React specialist
│   │   ├── backend-agent.md                # Convex/Effect.ts specialist
│   │   ├── auth-agent.md                   # Auth specialist
│   │   ├── blockchain-agent.md             # Web3 specialist
│   │   ├── ai-ml-agent.md                  # AI/ML specialist
│   │   └── ingestor-agent.md               # Migration specialist
│   │
│   ├── context/                            # System context
│   │   ├── ontology.md                     # ✅ CREATED - 4-table data model
│   │   ├── architecture.md                 # ✅ CREATED - System design + FP
│   │   ├── patterns.md                     # ✅ CREATED - Code patterns
│   │   ├── file-map.md                     # ✅ THIS FILE
│   │   └── dependencies.md                 # Package versions & APIs
│   │
│   ├── specs/                              # Feature specifications
│   │   ├── auth-flow.md                    # Authentication system
│   │   ├── ai-clone-creation.md            # AI clone pipeline
│   │   ├── token-economics.md              # Token system
│   │   ├── elevate-journey.md              # ELEVATE workflow
│   │   ├── content-generation.md           # Content automation
│   │   ├── viral-loops.md                  # Growth mechanisms
│   │   ├── course-builder.md               # AI course generation
│   │   └── analytics-dashboard.md          # Analytics & insights
│   │
│   ├── prompts/                            # Reusable prompts
│   │   ├── new-feature.md                  # Feature creation template
│   │   ├── fix-bug.md                      # Bug fixing workflow
│   │   ├── refactor.md                     # Refactoring guide
│   │   ├── test-generation.md              # Test creation
│   │   └── documentation.md                # Doc generation
│   │
│   └── rules.md                            # ✅ CREATED - Golden rules
│
├── docs/                                   # HUMAN DOCUMENTATION
│   ├── README.md                           # Project overview
│   ├── ARCHITECTURE.md                     # Technical architecture
│   ├── ONTOLOGY.md                         # Data model guide
│   ├── GETTING-STARTED.md                  # Developer setup
│   ├── API.md                              # API reference
│   ├── DEPLOYMENT.md                       # Deploy guide
│   ├── CONTRIBUTING.md                     # Contribution guide
│   └── CHANGELOG.md                        # Version history
│
├── src/                                    # FRONTEND SOURCE
│   │
│   ├── components/                         # React components
│   │   │
│   │   ├── ui/                             # shadcn/ui primitives (50+)
│   │   │   ├── button.tsx                  # Button component
│   │   │   ├── card.tsx                    # Card component
│   │   │   ├── dialog.tsx                  # Dialog/modal
│   │   │   ├── input.tsx                   # Input field
│   │   │   ├── label.tsx                   # Label
│   │   │   ├── select.tsx                  # Select dropdown
│   │   │   ├── checkbox.tsx                # Checkbox
│   │   │   ├── radio-group.tsx             # Radio buttons
│   │   │   ├── switch.tsx                  # Toggle switch
│   │   │   ├── slider.tsx                  # Slider
│   │   │   ├── progress.tsx                # Progress bar
│   │   │   ├── alert.tsx                   # Alert messages
│   │   │   ├── badge.tsx                   # Badge/tag
│   │   │   ├── avatar.tsx                  # Avatar image
│   │   │   ├── skeleton.tsx                # Loading skeleton
│   │   │   ├── toast.tsx                   # Toast notifications
│   │   │   ├── tooltip.tsx                 # Tooltips
│   │   │   ├── popover.tsx                 # Popover
│   │   │   ├── dropdown-menu.tsx           # Dropdown menu
│   │   │   ├── context-menu.tsx            # Context menu
│   │   │   ├── menubar.tsx                 # Menu bar
│   │   │   ├── navigation-menu.tsx         # Navigation
│   │   │   ├── breadcrumb.tsx              # Breadcrumbs
│   │   │   ├── tabs.tsx                    # Tab panels
│   │   │   ├── accordion.tsx               # Accordion
│   │   │   ├── collapsible.tsx             # Collapsible
│   │   │   ├── sheet.tsx                   # Side sheet
│   │   │   ├── drawer.tsx                  # Drawer
│   │   │   ├── hover-card.tsx              # Hover card
│   │   │   ├── table.tsx                   # Data table
│   │   │   ├── calendar.tsx                # Date picker
│   │   │   ├── command.tsx                 # Command palette
│   │   │   ├── separator.tsx               # Separator line
│   │   │   ├── scroll-area.tsx             # Scroll container
│   │   │   ├── textarea.tsx                # Text area
│   │   │   ├── form.tsx                    # Form wrapper
│   │   │   └── [more shadcn components]    # 50+ total
│   │   │
│   │   └── features/                       # Feature-specific components
│   │       │
│   │       ├── auth/                       # Authentication
│   │       │   ├── SignInForm.tsx          # Sign in form
│   │       │   ├── SignUpForm.tsx          # Sign up form
│   │       │   ├── PasswordReset.tsx       # Password reset
│   │       │   ├── EmailVerification.tsx   # Email verify
│   │       │   ├── OAuthButtons.tsx        # OAuth buttons
│   │       │   └── AuthGuard.tsx           # Auth wrapper
│   │       │
│   │       ├── creators/                   # Creator features
│   │       │   ├── CreatorOnboarding.tsx   # Onboarding flow
│   │       │   ├── CreatorProfile.tsx      # Profile display
│   │       │   ├── CreatorDashboard.tsx    # Dashboard
│   │       │   ├── ContentUploader.tsx     # Upload content
│   │       │   ├── AICloneStatus.tsx       # Clone status
│   │       │   ├── RevenueChart.tsx        # Revenue chart
│   │       │   └── SettingsForm.tsx        # Settings
│   │       │
│   │       ├── ai-clone/                   # AI Clone features
│   │       │   ├── CloneCreator.tsx        # Create clone UI
│   │       │   ├── CloneChat.tsx           # Chat interface
│   │       │   ├── CloneChatMessage.tsx    # Chat message
│   │       │   ├── VoicePlayer.tsx         # Voice playback
│   │       │   ├── PersonalityEditor.tsx   # Edit personality
│   │       │   └── TrainingProgress.tsx    # Training status
│   │       │
│   │       ├── tokens/                     # Token features
│   │       │   ├── TokenPurchase.tsx       # Purchase UI
│   │       │   ├── TokenBalance.tsx        # Balance display
│   │       │   ├── TokenChart.tsx          # Price chart
│   │       │   ├── StakingInterface.tsx    # Staking UI
│   │       │   ├── TokenHolders.tsx        # Holder list
│   │       │   └── TransactionHistory.tsx  # TX history
│   │       │
│   │       ├── courses/                    # Course features
│   │       │   ├── CourseBuilder.tsx       # Build course
│   │       │   ├── CourseCard.tsx          # Course card
│   │       │   ├── CourseCatalog.tsx       # Course list
│   │       │   ├── LessonPlayer.tsx        # Lesson UI
│   │       │   ├── ProgressTracker.tsx     # Progress bar
│   │       │   ├── QuizInterface.tsx       # Quiz UI
│   │       │   └── CertificateDisplay.tsx  # Certificate
│   │       │
│   │       ├── community/                  # Community features
│   │       │   ├── MessageList.tsx         # Message list
│   │       │   ├── MessageComposer.tsx     # Compose message
│   │       │   ├── MessageItem.tsx         # Single message
│   │       │   ├── MemberList.tsx          # Member list
│   │       │   ├── MemberCard.tsx          # Member card
│   │       │   └── ActivityFeed.tsx        # Activity feed
│   │       │
│   │       ├── elevate/                    # ELEVATE journey
│   │       │   ├── JourneyMap.tsx          # Journey visualization
│   │       │   ├── StepCard.tsx            # Single step
│   │       │   ├── ProgressRing.tsx        # Progress ring
│   │       │   ├── AchievementBadge.tsx    # Achievement badge
│   │       │   └── PaymentGate.tsx         # Payment step
│   │       │
│   │       ├── content/                    # Content features
│   │       │   ├── ContentCard.tsx         # Content card
│   │       │   ├── ContentGrid.tsx         # Content grid
│   │       │   ├── ContentEditor.tsx       # Edit content
│   │       │   ├── ContentPreview.tsx      # Preview
│   │       │   └── ContentStats.tsx        # Stats display
│   │       │
│   │       └── analytics/                  # Analytics features
│   │           ├── MetricCard.tsx          # Metric display
│   │           ├── GrowthChart.tsx         # Growth chart
│   │           ├── FunnelVisualization.tsx # Funnel chart
│   │           ├── InsightsPanel.tsx       # Insights
│   │           └── RealtimeFeed.tsx        # Real-time feed
│   │
│   ├── layouts/                            # Astro layouts
│   │   ├── Layout.astro                    # Base layout
│   │   ├── Dashboard.astro                 # Dashboard layout
│   │   ├── Marketing.astro                 # Marketing layout
│   │   └── Auth.astro                      # Auth layout
│   │
│   ├── pages/                              # Astro pages (routing)
│   │   ├── index.astro                     # Homepage /
│   │   ├── signin.astro                    # Sign in /signin
│   │   ├── signup.astro                    # Sign up /signup
│   │   ├── dashboard.astro                 # Dashboard /dashboard
│   │   ├── 404.astro                       # 404 page
│   │   │
│   │   ├── creators/                       # Creator routes
│   │   │   ├── [username].astro            # /creators/[username]
│   │   │   ├── onboard.astro               # /creators/onboard
│   │   │   └── settings.astro              # /creators/settings
│   │   │
│   │   ├── clone/                          # AI Clone routes
│   │   │   ├── create.astro                # /clone/create
│   │   │   ├── chat.astro                  # /clone/chat
│   │   │   └── manage.astro                # /clone/manage
│   │   │
│   │   ├── courses/                        # Course routes
│   │   │   ├── index.astro                 # /courses
│   │   │   ├── [id].astro                  # /courses/[id]
│   │   │   ├── create.astro                # /courses/create
│   │   │   └── learn/
│   │   │       └── [id].astro              # /courses/learn/[id]
│   │   │
│   │   ├── community/                      # Community routes
│   │   │   ├── index.astro                 # /community
│   │   │   └── [id].astro                  # /community/[id]
│   │   │
│   │   ├── tokens/                         # Token routes
│   │   │   ├── [symbol].astro              # /tokens/[symbol]
│   │   │   └── buy.astro                   # /tokens/buy
│   │   │
│   │   ├── elevate/                        # ELEVATE routes
│   │   │   ├── index.astro                 # /elevate
│   │   │   └── journey.astro               # /elevate/journey
│   │   │
│   │   └── api/                            # API routes
│   │       └── auth/
│   │           ├── [...all].ts             # Better Auth handler
│   │           ├── github/
│   │           │   └── callback.ts         # GitHub OAuth
│   │           └── google/
│   │               └── callback.ts         # Google OAuth
│   │
│   ├── lib/                                # Frontend utilities
│   │   ├── auth-client.ts                  # Better Auth client
│   │   ├── convex-client.ts                # Convex setup
│   │   ├── utils.ts                        # cn() + helpers
│   │   ├── hooks.ts                        # Custom hooks
│   │   ├── validators.ts                   # Zod schemas
│   │   └── constants.ts                    # Constants
│   │
│   ├── styles/                             # Styles
│   │   ├── global.css                      # Global + Tailwind
│   │   └── themes/
│   │       ├── light.css                   # Light theme vars
│   │       └── dark.css                    # Dark theme vars
│   │
│   └── types/                              # Frontend types
│       ├── index.ts                        # Shared types
│       ├── entities.ts                     # Entity types
│       ├── auth.ts                         # Auth types
│       └── api.ts                          # API types
│
├── convex/                                 # CONVEX BACKEND
│   │
│   ├── schema/                             # Database schema
│   │   ├── index.ts                        # Main schema export
│   │   ├── entities.ts                     # Entities table
│   │   ├── connections.ts                  # Connections table
│   │   ├── events.ts                       # Events table
│   │   ├── tags.ts                         # Tags tables
│   │   └── types.ts                        # Property types
│   │
│   ├── services/                           # Effect.ts services
│   │   ├── index.ts                        # Service exports
│   │   │
│   │   ├── core/                           # Core services
│   │   │   ├── database.ts                 # DB service
│   │   │   ├── auth.ts                     # Auth service
│   │   │   └── storage.ts                  # File storage
│   │   │
│   │   ├── ai/                             # AI services
│   │   │   ├── clone.ts                    # AI clone
│   │   │   ├── content-generation.ts       # Content gen
│   │   │   ├── personality.ts              # Personality
│   │   │   └── rag.ts                      # RAG system
│   │   │
│   │   ├── business/                       # Business agents
│   │   │   ├── orchestrator.ts             # Orchestration
│   │   │   ├── strategy.ts                 # Strategy agent
│   │   │   ├── marketing.ts                # Marketing agent
│   │   │   ├── sales.ts                    # Sales agent
│   │   │   ├── service.ts                  # Service agent
│   │   │   ├── design.ts                   # Design agent
│   │   │   ├── engineering.ts              # Engineering agent
│   │   │   ├── finance.ts                  # Finance agent
│   │   │   ├── legal.ts                    # Legal agent
│   │   │   └── intelligence.ts             # Intelligence agent
│   │   │
│   │   ├── community/                      # Community services
│   │   │   ├── messages.ts                 # Messaging
│   │   │   ├── moderation.ts               # Moderation
│   │   │   └── engagement.ts               # Engagement
│   │   │
│   │   ├── tokens/                         # Token services
│   │   │   ├── purchase.ts                 # Purchase
│   │   │   ├── rewards.ts                  # Rewards
│   │   │   ├── staking.ts                  # Staking
│   │   │   └── economics.ts                # Economics
│   │   │
│   │   ├── courses/                        # Course services
│   │   │   ├── builder.ts                  # Building
│   │   │   ├── generation.ts               # Generation
│   │   │   ├── enrollment.ts               # Enrollment
│   │   │   └── progress.ts                 # Progress
│   │   │
│   │   ├── entities/                       # Entity services
│   │   │   ├── creator.ts                  # Creator CRUD
│   │   │   ├── content.ts                  # Content CRUD
│   │   │   └── user.ts                     # User CRUD
│   │   │
│   │   ├── connections/                    # Connection services
│   │   │   ├── follow.ts                   # Follow/unfollow
│   │   │   ├── enrollment.ts               # Enrollment
│   │   │   └── ownership.ts                # Ownership
│   │   │
│   │   └── providers/                      # External providers
│   │       ├── openai.ts                   # OpenAI
│   │       ├── elevenlabs.ts               # ElevenLabs
│   │       ├── blockchain.ts               # Base L2
│   │       ├── stripe.ts                   # Stripe
│   │       └── resend.ts                   # Resend
│   │
│   ├── mutations/                          # Convex mutations
│   │   ├── auth.ts                         # Auth mutations
│   │   ├── creators.ts                     # Creator mutations
│   │   ├── clone.ts                        # Clone mutations
│   │   ├── content.ts                      # Content mutations
│   │   ├── tokens.ts                       # Token mutations
│   │   ├── courses.ts                      # Course mutations
│   │   ├── community.ts                    # Community mutations
│   │   ├── connections.ts                  # Connection mutations
│   │   └── elevate.ts                      # ELEVATE mutations
│   │
│   ├── queries/                            # Convex queries
│   │   ├── auth.ts                         # Auth queries
│   │   ├── creators.ts                     # Creator queries
│   │   ├── clone.ts                        # Clone queries
│   │   ├── content.ts                      # Content queries
│   │   ├── tokens.ts                       # Token queries
│   │   ├── courses.ts                      # Course queries
│   │   ├── community.ts                    # Community queries
│   │   ├── connections.ts                  # Connection queries
│   │   ├── analytics.ts                    # Analytics queries
│   │   └── search.ts                       # Search queries
│   │
│   ├── actions/                            # Convex actions
│   │   ├── ai/                             # AI actions
│   │   │   ├── clone-voice.ts              # Voice cloning
│   │   │   ├── clone-appearance.ts         # Appearance clone
│   │   │   ├── generate-content.ts         # Content gen
│   │   │   ├── chat.ts                     # AI chat
│   │   │   └── analyze.ts                  # Analysis
│   │   │
│   │   ├── blockchain/                     # Blockchain actions
│   │   │   ├── deploy-token.ts             # Deploy token
│   │   │   ├── mint.ts                     # Mint tokens
│   │   │   ├── burn.ts                     # Burn tokens
│   │   │   └── transfer.ts                 # Transfer
│   │   │
│   │   ├── payments/                       # Payment actions
│   │   │   ├── create-checkout.ts          # Checkout
│   │   │   ├── webhook.ts                  # Webhooks
│   │   │   └── refund.ts                   # Refunds
│   │   │
│   │   └── emails/                         # Email actions
│   │       ├── send-verification.ts        # Verification
│   │       ├── send-reset.ts               # Reset
│   │       └── send-notification.ts        # Notifications
│   │
│   ├── workflows/                          # Long-running workflows
│   │   ├── creator-launch.ts               # Creator onboard
│   │   ├── elevate-journey.ts              # ELEVATE flow
│   │   ├── content-pipeline.ts             # Content gen
│   │   ├── token-launch.ts                 # Token deploy
│   │   └── daily-operations.ts             # Daily tasks
│   │
│   ├── crons/                              # Scheduled functions
│   │   ├── daily-content.ts                # Daily content
│   │   ├── update-analytics.ts             # Analytics
│   │   ├── token-economics.ts              # Token metrics
│   │   └── cleanup.ts                      # Cleanup
│   │
│   ├── http/                               # HTTP endpoints
│   │   ├── webhooks.ts                     # Webhook handler
│   │   └── health.ts                       # Health check
│   │
│   ├── lib/                                # Backend utilities
│   │   ├── errors.ts                       # Error classes
│   │   ├── validators.ts                   # Validation
│   │   └── helpers.ts                      # Helpers
│   │
│   ├── schema.ts                           # Schema entry
│   ├── convex.config.ts                    # Convex config
│   └── _generated/                         # Generated (don't edit)
│       ├── api.d.ts                        # API types
│       ├── api.js                          # API runtime
│       ├── dataModel.d.ts                  # Data model
│       └── server.d.ts                     # Server types
│
├── tests/                                  # TESTS
│   ├── unit/                               # Unit tests
│   │   ├── services/                       # Service tests
│   │   │   ├── ai-clone.test.ts
│   │   │   ├── token.test.ts
│   │   │   ├── course.test.ts
│   │   │   └── agents.test.ts
│   │   │
│   │   ├── utils/                          # Utility tests
│   │   │   ├── validators.test.ts
│   │   │   └── helpers.test.ts
│   │   │
│   │   └── components/                     # Component tests
│   │       ├── auth.test.tsx
│   │       └── tokens.test.tsx
│   │
│   ├── integration/                        # Integration tests
│   │   ├── auth-flow.test.ts
│   │   ├── token-purchase.test.ts
│   │   ├── clone-creation.test.ts
│   │   └── content-generation.test.ts
│   │
│   ├── e2e/                                # E2E tests
│   │   ├── creator-onboarding.spec.ts
│   │   ├── audience-journey.spec.ts
│   │   ├── token-flow.spec.ts
│   │   └── elevate-journey.spec.ts
│   │
│   ├── fixtures/                           # Test fixtures
│   │   ├── creators.ts
│   │   ├── content.ts
│   │   ├── tokens.ts
│   │   └── users.ts
│   │
│   └── helpers/                            # Test helpers
│       ├── setup.ts
│       ├── mocks.ts
│       └── factories.ts
│
├── scripts/                                # AUTOMATION SCRIPTS
│   ├── setup/                              # Setup scripts
│   │   ├── init-dev.ts                     # Init dev env
│   │   ├── seed-data.ts                    # Seed data
│   │   └── create-admin.ts                 # Create admin
│   │
│   ├── migration/                          # Migration scripts
│   │   ├── inventory-one-ie.md             # one.ie inventory
│   │   ├── inventory-bullfm.md             # bullfm inventory
│   │   ├── mappings.md                     # Data mappings
│   │   ├── migrate-one-ie.ts               # Migrate one.ie
│   │   ├── migrate-bullfm.ts               # Migrate bullfm
│   │   ├── transform-data.ts               # Transform
│   │   └── verify-migration.ts             # Verify
│   │
│   ├── deploy/                             # Deployment scripts
│   │   ├── pre-deploy.ts                   # Pre-deploy
│   │   ├── deploy.ts                       # Deploy
│   │   └── post-deploy.ts                  # Post-deploy
│   │
│   └── utils/                              # Utility scripts
│       ├── backup-db.ts                    # Backup
│       ├── analyze-performance.ts          # Performance
│       └── generate-types.ts               # Generate types
│
├── public/                                 # STATIC ASSETS
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── hero.png
│   │   └── features/
│   │
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── manifest-icon-192.png
│   │
│   └── fonts/
│       └── inter/
│
├── .vscode/                                # VS CODE SETTINGS
│   ├── settings.json                       # Workspace settings
│   ├── extensions.json                     # Extensions
│   ├── tasks.json                          # Tasks
│   └── launch.json                         # Debug config
│
├── .github/                                # GITHUB
│   └── workflows/
│       ├── ci.yml                          # CI pipeline
│       ├── deploy.yml                      # Deploy workflow
│       └── tests.yml                       # Test workflow
│
├── astro.config.mjs                        # Astro config
├── tailwind.config.mjs                     # Tailwind config
├── tsconfig.json                           # TypeScript config
├── package.json                            # Dependencies
├── bun.lockb                               # Lock file
├── .env.example                            # Env template
├── .env.local                              # Local env (gitignored)
├── .gitignore                              # Git ignore
├── .eslintrc.json                          # ESLint config
├── .prettierrc                             # Prettier config
├── vitest.config.ts                        # Test config
└── README.md                               # Root README
```

---

## Naming Conventions

### Files

**Components (React):**
```
PascalCase.tsx
✅ CreatorProfile.tsx
✅ TokenPurchase.tsx
❌ creatorProfile.tsx
❌ creator-profile.tsx
```

**Pages (Astro):**
```
kebab-case.astro or [param].astro
✅ signin.astro
✅ [username].astro
✅ reset-password.astro
❌ SignIn.astro
❌ resetPassword.astro
```

**Services (Effect.ts):**
```
camelCase.ts
✅ clone.ts
✅ content-generation.ts
✅ token-economics.ts
❌ Clone.ts
❌ contentGeneration.ts
```

**Mutations/Queries/Actions:**
```
camelCase.ts (grouped by domain)
✅ creators.ts
✅ tokens.ts
❌ Creators.ts
❌ creator-mutations.ts (redundant)
```

**Tests:**
```
[name].test.ts or [name].spec.ts
✅ token.test.ts (unit)
✅ token-flow.spec.ts (e2e)
❌ tokenTest.ts
```

### Exports

**Components:**
```typescript
// ✅ CORRECT: Named export matching filename
export function CreatorProfile() { }

// ❌ WRONG: Default export or mismatched name
export default function Profile() { }
```

**Services:**
```typescript
// ✅ CORRECT: Class with Service suffix
export class TokenService extends Effect.Service<TokenService>()

// ❌ WRONG: No suffix or different name
export class Token extends Effect.Service<Token>()
```

**Mutations/Queries:**
```typescript
// ✅ CORRECT: Named export
export const create = mutation({ })
export const get = query({ })

// ❌ WRONG: Default export
export default mutation({ })
```

---

## Where Each File Type Goes

### Frontend Components

**shadcn/ui primitives:**
```
Location: src/components/ui/[component].tsx
Example: src/components/ui/button.tsx
Rule: Only shadcn components, no custom logic
```

**Feature components:**
```
Location: src/components/features/[domain]/[Component].tsx
Example: src/components/features/tokens/TokenPurchase.tsx
Rule: Grouped by domain, one component per file
```

### Backend Services

**Effect.ts services:**
```
Location: convex/services/[category]/[service].ts
Example: convex/services/ai/clone.ts
Rule: Business logic only, pure functions
```

**Convex functions:**
```
Mutations: convex/mutations/[domain].ts
Queries: convex/queries/[domain].ts
Actions: convex/actions/[category]/[action].ts
Rule: Thin wrappers around services
```

### Schema

**Schema files:**
```
Location: convex/schema/[table].ts
Example: convex/schema/entities.ts
Rule: One file per table definition
```

**Type definitions:**
```
Location: convex/schema/types.ts
Rule: Property types for entities
```

### Tests

**Unit tests:**
```
Location: tests/unit/[category]/[name].test.ts
Example: tests/unit/services/token.test.ts
Rule: Mirror source structure
```

**Integration tests:**
```
Location: tests/integration/[feature].test.ts
Example: tests/integration/token-purchase.test.ts
Rule: End-to-end feature flows
```

**E2E tests:**
```
Location: tests/e2e/[flow].spec.ts
Example: tests/e2e/creator-onboarding.spec.ts
Rule: Full user journeys with Playwright
```

### Documentation

**AI context:**
```
Location: .ai/context/[topic].md
Rule: For AI agents, technical
```

**Human docs:**
```
Location: docs/[topic].md
Rule: For developers, user-friendly
```

---

## File Creation Checklist

When creating a new file, verify:

- [ ] File is in correct directory per this map
- [ ] Filename follows naming convention
- [ ] Export name matches filename
- [ ] Imports use path aliases (@/)
- [ ] File is added to this map (if new category)
- [ ] Related test file created

---

## Path Aliases

```typescript
// Use these in imports:
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/hooks"

// Never use relative paths:
import { Button } from "../../../components/ui/button"  // ❌ WRONG
```

**Configured in:**
- `tsconfig.json` - TypeScript
- `astro.config.mjs` - Astro

---

## Special Directories

### Don't Edit

```
convex/_generated/     # Auto-generated by Convex
node_modules/          # Dependencies
dist/                  # Build output
.astro/                # Astro cache
```

### Don't Commit

```
.env.local             # Local environment
.DS_Store              # macOS
*.log                  # Log files
coverage/              # Test coverage
```

---

## Migration Notes

**From one.ie and bullfm:**

Old structure → New structure mapping:

```
one.ie/components/Auth/         → src/components/features/auth/
one.ie/pages/dashboard/         → src/pages/dashboard.astro
one.ie/lib/api/                 → convex/mutations/ + queries/
one.ie/models/                  → convex/schema/
one.ie/utils/                   → src/lib/

bullfm/components/              → src/components/features/[domain]/
bullfm/api/                     → convex/actions/
```

**Ingestor agent will handle this mapping automatically.**

---

## Summary

**Key principles:**
1. Everything has a specific place
2. Naming is consistent and predictable
3. Structure mirrors functionality
4. AI agents know exactly where to put files
5. No ambiguity, no guessing

**When in doubt:**
- Read this file
- Find similar existing file
- Follow the same pattern
- Update this file if creating new structure

**This map is the source of truth for file locations.**

---

**Last updated:** 2025-01-15  
**Maintained by:** AI agents + human developers  
**Update frequency:** Every time new directory created