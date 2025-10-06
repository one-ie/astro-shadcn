# ONE Platform - Ontology Specification

**Version:** 2.0.0
**Status:** Complete - Frontend & Backend Ready
**Purpose:** The single source of truth for how EVERYTHING in ONE is structured

**Design Principle:** This ontology is protocol-agnostic. All protocols (A2A, ACP, X402, AP2, etc.) map TO this ontology via metadata, never the other way around.

**Frontend Complete:** This ontology now includes all entity types, connections, and events needed to manage the complete frontend architecture:
- Multi-tenant organizations with role-based access (platform_owner, org_owner, org_user, customer)
- Better Auth integration (sessions, OAuth, verification tokens, password resets)
- UI preferences and dashboard customization
- Complete authentication and authorization event tracking

---

## The 4-Table Universe

Every single thing in ONE platform exists in one of these 4 tables:

```
┌──────────────────────────────────────────────────────────────┐
│                      ENTITIES TABLE                          │
│  Every "thing" - users, agents, content, tokens, courses    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    CONNECTIONS TABLE                         │
│  Every relationship - owns, follows, taught_by, powers      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                      EVENTS TABLE                            │
│  Every action - purchased, created, viewed, completed        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                       TAGS TABLE                             │
│  Every category - industry:fitness, skill:video, etc.       │
└──────────────────────────────────────────────────────────────┘
```

**Golden Rule:** If you can't map your feature to these 4 tables, you're thinking about it wrong.

---

## ENTITIES: All The "Things"

### What Goes in Entities?

**Simple test:** If you can point at it and say "this is a \_\_\_", it's an entity.

Examples:

- "This is a **creator**" ✅ Entity
- "This is a **blog post**" ✅ Entity
- "This is a **token**" ✅ Entity
- "This is a **relationship**" ❌ Connection, not entity
- "This is a **purchase**" ❌ Event, not entity

### Entity Types

```typescript
type EntityType =
  // CORE
  | 'creator' // Human creator (role: platform_owner, org_owner, org_user, customer)
  | 'ai_clone' // Digital twin of creator
  | 'audience_member' // Fan/user (role: customer)
  | 'organization' // Multi-tenant organization

  // BUSINESS AGENTS (10 types)
  | 'strategy_agent' // Vision, planning, OKRs
  | 'research_agent' // Market, trends, competitors
  | 'marketing_agent' // Content strategy, SEO, distribution
  | 'sales_agent' // Funnels, conversion, follow-up
  | 'service_agent' // Support, onboarding, success
  | 'design_agent' // Brand, UI/UX, assets
  | 'engineering_agent' // Tech, integration, automation
  | 'finance_agent' // Revenue, costs, forecasting
  | 'legal_agent' // Compliance, contracts, IP
  | 'intelligence_agent' // Analytics, insights, predictions

  // CONTENT
  | 'blog_post' // Written content
  | 'video' // Video content
  | 'podcast' // Audio content
  | 'social_post' // Social media post
  | 'email' // Email content
  | 'course' // Educational course
  | 'lesson' // Individual lesson

  // PRODUCTS
  | 'digital_product' // Templates, tools, assets
  | 'membership' // Tiered membership
  | 'consultation' // 1-on-1 session
  | 'nft' // NFT collectible

  // COMMUNITY
  | 'community' // Community space
  | 'conversation' // Thread/discussion
  | 'message' // Individual message

  // TOKEN
  | 'token' // Actual token instance
  | 'token_contract' // Smart contract

  // KNOWLEDGE
  | 'knowledge_item' // Piece of creator knowledge
  | 'embedding' // Vector embedding

  // PLATFORM
  | 'website' // Auto-generated creator site
  | 'landing_page' // Custom landing pages
  | 'template' // Design templates
  | 'livestream' // Live broadcast
  | 'recording' // Saved livestream content
  | 'media_asset' // Images, videos, files

  // BUSINESS
  | 'payment' // Payment transaction
  | 'subscription' // Recurring subscription
  | 'invoice' // Invoice record
  | 'metric' // Tracked metric
  | 'insight' // AI-generated insight
  | 'prediction' // AI prediction
  | 'report' // Analytics report

  // AUTHENTICATION & SESSION
  | 'session' // User session (Better Auth)
  | 'oauth_account' // OAuth connection (GitHub, Google)
  | 'verification_token' // Email/2FA verification token
  | 'password_reset_token' // Password reset token

  // UI & PREFERENCES
  | 'ui_preferences' // User UI settings (theme, layout, etc.)

  // MARKETING
  | 'notification' // System notification
  | 'email_campaign' // Email marketing campaign
  | 'announcement' // Platform announcement
  | 'referral' // Referral record
  | 'campaign' // Marketing campaign
  | 'lead' // Potential customer/lead

  // EXTERNAL INTEGRATIONS
  | 'external_agent' // External AI agent (ElizaOS, etc.)
  | 'external_workflow' // External workflow (n8n, Zapier, Make)
  | 'external_connection' // Connection config to external service

  // PROTOCOL ENTITIES (protocol-agnostic via properties.protocol)
  | 'mandate' // Intent or cart mandate (AP2)
  | 'product'; // Sellable product (ACP/marketplace)
```

### Entity Structure

```typescript
{
  _id: Id<"entities">,
  type: EntityType,
  name: string,                    // Display name
  properties: {                    // Type-specific properties (JSON)
    // For creator:
    email?: string,
    username?: string,
    niche?: string[],
    // For token:
    contractAddress?: string,
    totalSupply?: number,
    // etc...
  },
  status: "active" | "inactive" | "draft" | "published" | "archived",
  createdAt: number,
  updatedAt: number,
  deletedAt?: number
}
```

### Properties by Entity Type

**Creator Properties:**

```typescript
{
  email: string,
  username: string,
  displayName: string,
  bio?: string,
  avatar?: string,
  niche: string[],
  expertise: string[],
  targetAudience: string,
  brandColors?: {
    primary: string,
    secondary: string,
    accent: string
  },
  totalFollowers: number,
  totalContent: number,
  totalRevenue: number,
  // MULTI-TENANT ROLES
  role: "platform_owner" | "org_owner" | "org_user" | "customer",
  organizationId?: Id<"entities">, // Current/default org (if org_owner or org_user)
  permissions?: string[], // Additional permissions
}
```

**Organization Properties:**

```typescript
{
  name: string,
  slug: string,              // URL-friendly identifier
  domain?: string,           // Custom domain (e.g., acme.one.ie)
  logo?: string,
  description?: string,
  status: "active" | "suspended" | "trial" | "cancelled",
  plan: "starter" | "pro" | "enterprise",
  limits: {
    users: number,           // Max users allowed
    storage: number,         // GB
    apiCalls: number,        // Per month
  },
  usage: {
    users: number,           // Current users
    storage: number,         // GB used
    apiCalls: number,        // This month
  },
  billing: {
    customerId?: string,     // Stripe customer ID
    subscriptionId?: string, // Stripe subscription ID
    currentPeriodEnd?: number,
  },
  settings: {
    allowSignups: boolean,
    requireEmailVerification: boolean,
    enableTwoFactor: boolean,
    allowedDomains?: string[], // Email domain whitelist
  },
  createdAt: number,
  trialEndsAt?: number,
}
```

**AI Clone Properties:**

```typescript
{
  voiceId?: string,
  voiceProvider?: "elevenlabs" | "azure" | "custom",
  appearanceId?: string,
  appearanceProvider?: "d-id" | "heygen" | "custom",
  systemPrompt: string,
  temperature: number,
  knowledgeBaseSize: number,
  lastTrainingDate: number,
  totalInteractions: number,
  satisfactionScore: number
}
```

**Agent Properties:**

```typescript
{
  agentType: "strategy" | "marketing" | "sales" | ...,
  systemPrompt: string,
  model: string,
  temperature: number,
  capabilities: string[],
  tools: string[],
  totalExecutions: number,
  successRate: number,
  averageExecutionTime: number
}
```

**Token Properties:**

```typescript
{
  contractAddress: string,
  blockchain: "base" | "ethereum" | "polygon",
  standard: "ERC20" | "ERC721" | "ERC1155",
  totalSupply: number,
  circulatingSupply: number,
  price: number,
  marketCap: number,
  utility: string[],
  burnRate: number,
  holders: number,
  transactions24h: number,
  volume24h: number
}
```

**Course Properties:**

```typescript
{
  title: string,
  description: string,
  thumbnail?: string,
  modules: number,
  lessons: number,
  totalDuration: number,
  price: number,
  currency: string,
  tokenPrice?: number,
  enrollments: number,
  completions: number,
  averageRating: number,
  generatedBy: "ai" | "human" | "hybrid",
  personalizationLevel: "none" | "basic" | "advanced"
}
```

**Website Properties:**

```typescript
{
  domain: string,
  subdomain: string,              // creator.one.ie
  template: "minimal" | "showcase" | "portfolio",
  customCSS?: string,
  customDomain?: string,
  sslEnabled: boolean,
  analytics: {
    visitors30d: number,
    pageViews: number,
    conversionRate: number
  }
}
```

**Livestream Properties:**

```typescript
{
  title: string,
  scheduledAt: number,
  startedAt?: number,
  endedAt?: number,
  platform: "youtube" | "twitch" | "custom",
  streamUrl: string,
  recordingUrl?: string,
  viewersPeak: number,
  viewersAverage: number,
  chatEnabled: boolean,
  aiCloneMixEnabled: boolean,     // For human + AI mixing
  status: "scheduled" | "live" | "ended" | "cancelled"
}
```

**Payment Properties:**

```typescript
{
  amount: number,
  currency: "usd" | "eur",
  paymentMethod: "stripe" | "crypto",
  stripePaymentIntentId?: string,
  txHash?: string,                // Blockchain transaction
  status: "pending" | "completed" | "failed" | "refunded",
  fees: number,
  netAmount: number,
  processedAt?: number
}
```

**Subscription Properties:**

```typescript
{
  tier: "starter" | "pro" | "enterprise",
  price: number,
  currency: string,
  interval: "monthly" | "yearly",
  status: "active" | "cancelled" | "past_due" | "expired",
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAt?: number,
  stripeSubscriptionId?: string
}
```

**Metric Properties:**

```typescript
{
  name: string,
  value: number,
  unit: string,
  timestamp: number,
  period: "realtime" | "hourly" | "daily" | "weekly" | "monthly",
  change: number,                 // Percentage change from previous
  trend: "up" | "down" | "stable"
}
```

**Insight Properties:**

```typescript
{
  title: string,
  description: string,
  category: "performance" | "audience" | "revenue" | "content",
  confidence: number,             // 0.0 to 1.0
  actionable: boolean,
  recommendations: string[],
  generatedAt: number,
  generatedBy: Id<"entities">     // intelligence_agent
}
```

**Referral Properties:**

```typescript
{
  referrerCode: string,
  referredEmail: string,
  referredUserId?: Id<"entities">,
  status: "pending" | "converted" | "expired",
  tokensEarned: number,
  bonusEarned?: number,
  conversionDate?: number,
  expiresAt: number
}
```

**Notification Properties:**

```typescript
{
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  channel: "email" | "sms" | "push" | "in_app",
  read: boolean,
  readAt?: number,
  actionUrl?: string,
  actionLabel?: string
}
```

**External Agent Properties:**

```typescript
{
  platform: "elizaos" | "autogen" | "crewai" | "langchain" | "custom",
  agentId: string,              // External platform's agent ID
  name: string,                 // Agent name
  description?: string,         // What the agent does
  capabilities: string[],       // Available actions/tools
  apiEndpoint?: string,         // REST/GraphQL endpoint
  websocketUrl?: string,        // WebSocket endpoint for real-time
  status: "online" | "offline" | "busy" | "unknown",
  lastSeen?: number,
  metadata: {                   // Platform-specific data
    personality?: any,          // For ElizaOS character
    tools?: string[],           // Available tools
    model?: string,             // LLM model used
    [key: string]: any          // Other platform-specific fields
  },
  conversationCount: number,    // Total conversations
  messageCount: number,         // Total messages exchanged
  createdAt: number,
  updatedAt: number
}
```

**External Workflow Properties:**

```typescript
{
  platform: "n8n" | "zapier" | "make" | "pipedream" | "custom",
  workflowId: string,           // External platform's workflow ID
  name: string,                 // Workflow name
  description: string,          // What the workflow does
  webhookUrl?: string,          // Trigger URL
  active: boolean,              // Is workflow active?
  tags: string[],               // Workflow tags/categories
  inputSchema: {                // Expected input parameters
    [key: string]: {
      type: "string" | "number" | "boolean" | "object" | "array",
      required: boolean,
      description: string,
      default?: any
    }
  },
  outputSchema: {               // Expected output structure
    [key: string]: {
      type: "string" | "number" | "boolean" | "object" | "array",
      description: string
    }
  },
  executionCount: number,       // Total executions
  successRate: number,          // 0.0 to 1.0
  averageExecutionTime: number, // milliseconds
  lastExecutedAt?: number,
  createdAt: number,
  updatedAt: number
}
```

**External Connection Properties:**

```typescript
{
  platform: "elizaos" | "n8n" | "zapier" | "make" | "autogen" | "custom",
  name: string,                 // Connection name
  baseUrl?: string,             // API base URL
  apiKey?: string,              // Encrypted API key
  websocketUrl?: string,        // WebSocket endpoint
  webhookSecret?: string,       // Webhook signature secret
  connectionType: "rest" | "websocket" | "webhook" | "graphql",
  authentication: {
    type: "apiKey" | "oauth" | "basic" | "bearer" | "custom",
    credentials: any            // Encrypted credentials
  },
  status: "active" | "inactive" | "error",
  lastConnectedAt?: number,
  lastError?: string,
  linkedEntityIds: string[],    // Connected agents/workflows
  rateLimits?: {
    requestsPerMinute: number,
    requestsPerDay: number
  },
  createdAt: number,
  updatedAt: number
}
```

**Session Properties:**

```typescript
{
  userId: Id<"entities">,        // User this session belongs to
  token: string,                 // Session token (hashed)
  expiresAt: number,             // Expiration timestamp
  ipAddress?: string,            // IP address
  userAgent?: string,            // Browser/device info
  lastActivityAt: number,        // Last activity timestamp
  createdAt: number,
}
```

**OAuth Account Properties:**

```typescript
{
  userId: Id<"entities">,        // User this account belongs to
  provider: "github" | "google" | "discord" | "twitter",
  providerAccountId: string,     // Provider's user ID
  accessToken?: string,          // Encrypted access token
  refreshToken?: string,         // Encrypted refresh token
  expiresAt?: number,            // Token expiration
  tokenType?: string,            // Bearer, etc.
  scope?: string,                // Granted scopes
  idToken?: string,              // OpenID Connect ID token
  createdAt: number,
  updatedAt: number,
}
```

**Verification Token Properties:**

```typescript
{
  userId: Id<"entities">,        // User to verify
  token: string,                 // Verification token (hashed)
  type: "email" | "two_factor",  // Verification type
  expiresAt: number,             // Expiration timestamp
  attempts: number,              // Failed attempts count
  maxAttempts: number,           // Max allowed attempts
  verifiedAt?: number,           // When verified (if completed)
  createdAt: number,
}
```

**Password Reset Token Properties:**

```typescript
{
  userId: Id<"entities">,        // User requesting reset
  token: string,                 // Reset token (hashed)
  expiresAt: number,             // Expiration timestamp (15-30 min)
  usedAt?: number,               // When token was used
  createdAt: number,
}
```

**UI Preferences Properties:**

```typescript
{
  userId: Id<"entities">,        // User these preferences belong to
  theme: "light" | "dark" | "system",
  language: string,              // ISO language code
  timezone: string,              // IANA timezone
  dashboardLayout: {
    sidebarCollapsed: boolean,
    defaultView: "grid" | "list" | "kanban",
    itemsPerPage: number,
  },
  notifications: {
    email: boolean,
    push: boolean,
    sms: boolean,
    inApp: boolean,
  },
  accessibility: {
    reducedMotion: boolean,
    highContrast: boolean,
    fontSize: "small" | "medium" | "large",
  },
  customSettings: any,           // App-specific settings
  updatedAt: number,
}
```

---

## CONNECTIONS: All The Relationships

### What Goes in Connections?

**Simple test:** If you're describing how entity X relates to entity Y, it's a connection.

Examples:

- "Creator **owns** token" ✅ Connection
- "User **enrolled_in** course" ✅ Connection
- "Agent **powers** AI clone" ✅ Connection
- "Creator created a post" ❌ Event (action), not connection

### Connection Types (25 total)

**Design Principle:** Consolidated types with metadata for variants. Protocol identity stored in `metadata.protocol`.

```typescript
type ConnectionType =
  // OWNERSHIP (2)
  | 'owns'
  | 'created_by'

  // AI RELATIONSHIPS (3)
  | 'clone_of'
  | 'trained_on'
  | 'powers'

  // CONTENT RELATIONSHIPS (5)
  | 'authored'
  | 'generated_by'
  | 'published_to'
  | 'part_of'
  | 'references'

  // COMMUNITY RELATIONSHIPS (4)
  | 'member_of'
  | 'following'
  | 'moderates'
  | 'participated_in'

  // BUSINESS RELATIONSHIPS (3)
  | 'manages'
  | 'reports_to'
  | 'collaborates_with'

  // TOKEN RELATIONSHIPS (3)
  | 'holds_tokens'
  | 'staked_in'
  | 'earned_from'

  // PRODUCT RELATIONSHIPS (4)
  | 'purchased'
  | 'enrolled_in'
  | 'completed'
  | 'teaching'

  // CONSOLIDATED TYPES (use metadata for variants + protocol)
  | 'transacted'     // Payment/subscription/invoice (metadata.transactionType + protocol)
  | 'notified'       // Notifications (metadata.channel + notificationType)
  | 'referred'       // Referrals (metadata.referralType)
  | 'communicated'   // Agent/protocol communication (metadata.protocol + messageType)
  | 'delegated'      // Task/workflow delegation (metadata.protocol + taskType)
  | 'approved'       // Approvals (metadata.approvalType + protocol)
  | 'fulfilled';     // Fulfillment (metadata.fulfillmentType + protocol)

// Total: 25 connection types
```

### Connection Structure

```typescript
{
  _id: Id<"connections">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: ConnectionType,
  metadata?: {              // Optional relationship data
    // For revenue splits:
    revenueShare?: number,  // 0.0 to 1.0
    // For token holdings:
    balance?: number,
    // For course enrollment:
    enrolledAt?: number,
    progress?: number,
    // etc...
  },
  strength?: number,        // Relationship strength (0-1)
  validFrom?: number,       // When relationship started
  validTo?: number,         // When relationship ended
  createdAt: number,
  updatedAt?: number
}
```

### Common Connection Patterns

**Pattern: Ownership**

```typescript
// Creator owns AI clone
{
  fromEntityId: creatorId,
  toEntityId: cloneId,
  relationshipType: "owns",
  createdAt: Date.now()
}
```

**Pattern: Revenue Split**

```typescript
// Collaborator owns 30% of course
{
  fromEntityId: collaboratorId,
  toEntityId: courseId,
  relationshipType: "owns",
  metadata: {
    revenueShare: 0.3
  },
  createdAt: Date.now()
}
```

**Pattern: Token Holding**

```typescript
// User holds 1000 tokens
{
  fromEntityId: userId,
  toEntityId: tokenId,
  relationshipType: "holds_tokens",
  metadata: {
    balance: 1000,
    acquiredAt: Date.now()
  },
  createdAt: Date.now()
}
```

**Pattern: Course Enrollment**

```typescript
// User enrolled in course
{
  fromEntityId: userId,
  toEntityId: courseId,
  relationshipType: "enrolled_in",
  metadata: {
    progress: 0.45,        // 45% complete
    enrolledAt: Date.now(),
    lastAccessedAt: Date.now()
  },
  createdAt: Date.now()
}
```

**Pattern: Organization Membership**

```typescript
// User is member of organization with role
{
  fromEntityId: userId,
  toEntityId: organizationId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner" | "org_user",  // Organization-specific role
    permissions: ["read", "write", "admin"],
    invitedBy?: Id<"entities">,      // Who invited this user
    invitedAt?: number,
    joinedAt: Date.now(),
  },
  createdAt: Date.now()
}

// Organization owns content/resources
{
  fromEntityId: organizationId,
  toEntityId: contentId,
  relationshipType: "owns",
  metadata: {
    createdBy: userId,               // User who created it
  },
  createdAt: Date.now()
}
```

**Pattern: Payment Transaction (Consolidated)**

```typescript
// User paid for product (use "transacted" with metadata)
{
  fromEntityId: userId,
  toEntityId: productId,
  relationshipType: "transacted",
  metadata: {
    transactionType: "payment",    // or "subscription" or "invoice"
    amount: 99.00,
    currency: "USD",
    paymentId: "pi_123456",
    status: "completed"
  },
  createdAt: Date.now()
}

// User subscribed to service
{
  fromEntityId: userId,
  toEntityId: subscriptionId,
  relationshipType: "transacted",
  metadata: {
    transactionType: "subscription",
    amount: 29.00,
    currency: "USD",
    interval: "monthly",
    subscriptionId: "sub_123456",
    status: "active"
  },
  createdAt: Date.now()
}
```

**Pattern: Referral (Consolidated)**

```typescript
// User referred by another user (use "referred" with metadata)
{
  fromEntityId: newUserId,
  toEntityId: referrerId,
  relationshipType: "referred",
  metadata: {
    referralType: "direct",        // or "conversion" or "campaign"
    source: "referral_link",
    referralCode: "REF123",
    tokensEarned: 100,
    status: "converted"
  },
  createdAt: Date.now()
}
```

**Pattern: Notification (Consolidated)**

```typescript
// User notified about event (use "notified" with metadata)
{
  fromEntityId: userId,
  toEntityId: notificationId,
  relationshipType: "notified",
  metadata: {
    channel: "email",              // or "sms" or "push" or "in_app"
    campaignId: campaignId,        // optional
    deliveredAt: Date.now(),
    readAt: Date.now(),
    clicked: true
  },
  createdAt: Date.now()
}
```

---

## EVENTS: All The Actions

### What Goes in Events?

**Simple test:** If you're describing something that HAPPENED at a specific TIME, it's an event.

Examples:

- "User **purchased** tokens at 3pm" ✅ Event
- "Content **was published** yesterday" ✅ Event
- "Clone **interacted** with user" ✅ Event
- "User owns tokens" ❌ Connection (state), not event

### Event Types (35 total)

**Design Principle:** Consolidated types with metadata for variants. Protocol identity stored in `metadata.protocol`.

```typescript
type EventType =
  // ENTITY LIFECYCLE (4)
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'entity_archived'

  // USER EVENTS (5)
  | 'user_registered'
  | 'user_verified'
  | 'user_login'
  | 'user_logout'
  | 'profile_updated'

  // AUTHENTICATION EVENTS (6)
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verification_sent'
  | 'email_verified'
  | 'two_factor_enabled'
  | 'two_factor_disabled'

  // ORGANIZATION EVENTS (5)
  | 'organization_created'
  | 'organization_updated'
  | 'user_invited_to_org'
  | 'user_joined_org'
  | 'user_removed_from_org'

  // DASHBOARD & UI EVENTS (4)
  | 'dashboard_viewed'
  | 'settings_updated'
  | 'theme_changed'
  | 'preferences_updated'

  // AI/CLONE EVENTS (4)
  | 'clone_created'
  | 'clone_updated'
  | 'voice_cloned'
  | 'appearance_cloned'

  // AGENT EVENTS (4)
  | 'agent_created'
  | 'agent_executed'
  | 'agent_completed'
  | 'agent_failed'

  // TOKEN EVENTS (7)
  | 'token_created'
  | 'token_minted'
  | 'token_burned'
  | 'tokens_purchased'
  | 'tokens_staked'
  | 'tokens_unstaked'
  | 'tokens_transferred'

  // COURSE EVENTS (5)
  | 'course_created'
  | 'course_enrolled'
  | 'lesson_completed'
  | 'course_completed'
  | 'certificate_earned'

  // ANALYTICS EVENTS (5)
  | 'metric_calculated'
  | 'insight_generated'
  | 'prediction_made'
  | 'optimization_applied'
  | 'report_generated'

  // CONSOLIDATED EVENTS (use metadata for variants + protocol)
  | 'content_event'        // metadata.action: created|updated|deleted|viewed|shared|liked
  | 'payment_event'        // metadata.status: requested|verified|processed + protocol
  | 'subscription_event'   // metadata.action: started|renewed|cancelled
  | 'commerce_event'       // metadata.eventType + protocol (ACP, AP2)
  | 'livestream_event'     // metadata.status: started|ended + metadata.action: joined|left|chat|donation
  | 'notification_event'   // metadata.channel: email|sms|push|in_app + deliveryStatus
  | 'referral_event'       // metadata.action: created|completed|rewarded
  | 'communication_event'  // metadata.protocol (A2A, ACP, AG-UI) + messageType
  | 'task_event'          // metadata.action: delegated|completed|failed + protocol
  | 'mandate_event'       // metadata.mandateType: intent|cart + protocol (AP2)
  | 'price_event';        // metadata.action: checked|changed

// Total: 35 event types
```

### Event Structure

```typescript
{
  _id: Id<"events">,
  type: EventType,               // What happened
  actorId: Id<"entities">,       // Who/what caused this
  targetId?: Id<"entities">,     // Optional target entity
  timestamp: number,             // When it happened
  metadata: any                  // Event-specific data
}
```

**Metadata Structure:**

The `metadata` field is flexible JSON that ALWAYS includes `protocol` for protocol-specific events:

```typescript
// Protocol-agnostic events (no protocol field needed)
{ action: "created", contentType: "blog_post" }

// Protocol-specific events (includes protocol identifier)
{
  protocol: "a2a" | "acp" | "ap2" | "x402" | "ag-ui",
  // ... protocol-specific fields
}

// Examples:
// A2A message
{ protocol: "a2a", messageType: "task_delegation", task: "research" }

// ACP commerce
{ protocol: "acp", eventType: "purchase_initiated", agentPlatform: "chatgpt" }

// AP2 mandate
{ protocol: "ap2", mandateType: "intent", autoExecute: true }

// X402 payment
{ protocol: "x402", network: "base", txHash: "0x..." }
```

### Event Patterns

**Pattern: User Action**

```typescript
// User purchased tokens
{
  type: "tokens_purchased",
  actorId: userId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    amount: 100,
    usdAmount: 10,
    paymentId: "pi_123",
    txHash: "0x456"
  }
}
```

**Pattern: Payment Event (Consolidated)**

```typescript
// Payment completed (use "payment_processed" with metadata.status)
{
  type: "payment_processed",
  actorId: userId,
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    status: "completed",        // or "initiated" | "failed" | "refunded"
    amount: 99.00,
    currency: "USD",
    paymentId: "pi_123456",
    method: "stripe"
  }
}

// Subscription renewed (use "subscription_updated" with metadata.action)
{
  type: "subscription_updated",
  actorId: userId,
  targetId: subscriptionId,
  timestamp: Date.now(),
  metadata: {
    action: "renewed",          // or "started" | "cancelled"
    tier: "pro",
    amount: 29.00,
    nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000
  }
}
```

**Pattern: Content Event (Consolidated)**

```typescript
// Content created (use "content_changed" with metadata.action)
{
  type: "content_changed",
  actorId: creatorId,
  targetId: contentId,
  timestamp: Date.now(),
  metadata: {
    action: "created",          // or "updated" | "deleted"
    contentType: "blog_post",
    generatedBy: "marketing_agent",
    platform: "instagram"
  }
}

// Content viewed (use "content_interacted" with metadata.interactionType)
{
  type: "content_interacted",
  actorId: userId,
  targetId: contentId,
  timestamp: Date.now(),
  metadata: {
    interactionType: "viewed",  // or "shared" | "liked"
    duration: 120,              // seconds
    source: "feed"
  }
}
```

**Pattern: Livestream Event (Consolidated)**

```typescript
// Livestream started (use "livestream_status_changed" with metadata.status)
{
  type: "livestream_status_changed",
  actorId: creatorId,
  targetId: livestreamId,
  timestamp: Date.now(),
  metadata: {
    status: "started",          // or "scheduled" | "ended"
    streamId: "stream_123",
    platform: "cloudflare",
    rtmpUrl: "rtmp://..."
  }
}

// Viewer joined (use "livestream_interaction" with metadata.type)
{
  type: "livestream_interaction",
  actorId: viewerId,
  targetId: livestreamId,
  timestamp: Date.now(),
  metadata: {
    type: "joined",             // or "left" | "message"
    viewerCount: 42,
    message: "Hello!"           // if type === "message"
  }
}
```

**Pattern: Notification Event (Consolidated)**

```typescript
// Email notification sent (use "notification_delivered" with metadata.channel)
{
  type: "notification_delivered",
  actorId: systemId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    channel: "email",           // or "sms" | "push" | "in_app"
    messageId: "msg_123",
    subject: "New content available",
    deliveredAt: Date.now(),
    readAt: Date.now() + 1000   // optional
  }
}
```

**Pattern: AI Interaction**

```typescript
// Clone chatted with user
{
  type: "clone_interaction",
  actorId: userId,
  targetId: cloneId,
  timestamp: Date.now(),
  metadata: {
    message: "How do I start?",
    response: "Let me help you...",
    tokensUsed: 150,
    sentiment: "positive"
  }
}
```

**Pattern: Metric Tracking**

```typescript
// Token price calculated
{
  type: "metric_calculated",
  actorId: systemId,
  targetId: tokenId,
  timestamp: Date.now(),
  metadata: {
    metric: "token_price",
    value: 0.12,
    change: +0.05,
    changePercent: 4.2
  }
}
```

**Pattern: Authentication Events**

```typescript
// Password reset requested
{
  type: "password_reset_requested",
  actorId: userId,
  targetId: passwordResetTokenId,
  timestamp: Date.now(),
  metadata: {
    email: "user@example.com",
    ipAddress: "192.168.1.1",
    expiresAt: Date.now() + 30 * 60 * 1000  // 30 minutes
  }
}

// Email verified
{
  type: "email_verified",
  actorId: userId,
  targetId: verificationTokenId,
  timestamp: Date.now(),
  metadata: {
    email: "user@example.com",
    verificationMethod: "link" | "code"
  }
}

// Two-factor enabled
{
  type: "two_factor_enabled",
  actorId: userId,
  timestamp: Date.now(),
  metadata: {
    method: "totp" | "sms" | "email",
    backupCodesGenerated: 10
  }
}
```

**Pattern: Organization Events**

```typescript
// Organization created
{
  type: "organization_created",
  actorId: creatorId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    name: "Acme Corp",
    slug: "acme",
    plan: "pro",
    trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000  // 14 days
  }
}

// User invited to organization
{
  type: "user_invited_to_org",
  actorId: inviterId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    invitedEmail: "newuser@example.com",
    role: "org_user",
    inviteToken: "inv_123456",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}

// User joined organization
{
  type: "user_joined_org",
  actorId: userId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    role: "org_user",
    invitedBy: inviterId
  }
}
```

**Pattern: Dashboard & UI Events**

```typescript
// Dashboard viewed
{
  type: "dashboard_viewed",
  actorId: userId,
  timestamp: Date.now(),
  metadata: {
    dashboardType: "platform_owner" | "org_owner" | "org_user" | "customer",
    organizationId?: organizationId,
    route: "/admin/dashboard",
    sessionDuration: 0  // Updated on session end
  }
}

// Theme changed
{
  type: "theme_changed",
  actorId: userId,
  targetId: uiPreferencesId,
  timestamp: Date.now(),
  metadata: {
    previousTheme: "light",
    newTheme: "dark"
  }
}

// Settings updated
{
  type: "settings_updated",
  actorId: userId,
  targetId: uiPreferencesId,
  timestamp: Date.now(),
  metadata: {
    updatedFields: ["dashboardLayout", "notifications"],
    changes: {
      "dashboardLayout.sidebarCollapsed": { from: false, to: true },
      "notifications.email": { from: true, to: false }
    }
  }
}
```

---

## TAGS: All The Categories

### What Goes in Tags?

**Simple test:** If you're describing a category, characteristic, or taxonomy, it's a tag.

Examples:

- "This creator is in the **fitness** industry" ✅ Tag
- "This content is **video** format" ✅ Tag
- "This is a **beginner** skill level" ✅ Tag
- "This user follows this creator" ❌ Connection, not tag

### Tag Categories

```typescript
type TagCategory =
  | 'skill'          // Programming, video-editing, etc.
  | 'industry'       // Fitness, business, art, etc.
  | 'topic'          // AI, blockchain, marketing, etc.
  | 'format'         // Video, text, audio, interactive
  | 'goal'           // Learn, earn, build, grow
  | 'audience'       // Beginners, professionals, students
  | 'technology'     // React, Python, Figma, etc.
  | 'status'         // Featured, trending, new
  | 'capability'     // Agent capabilities (image_gen, analysis, etc.)
  | 'protocol'       // a2a, acp, ap2, x402, ag-ui
  | 'payment_method' // stripe, crypto, x402, ap2
  | 'network';       // base, ethereum, solana
```

### Tag Structure

```typescript
{
  _id: Id<"tags">,
  name: string,              // e.g., "fitness", "video-editing"
  category: TagCategory,
  description?: string,
  color?: string,            // Hex color for UI
  icon?: string,             // Icon name/URL
  usageCount: number,        // How many entities have this tag
  createdAt: number
}
```

### Entity-Tag Association

Use junction table `entityTags`:

```typescript
{
  _id: Id<"entityTags">,
  entityId: Id<"entities">,
  tagId: Id<"tags">,
  createdAt: number
}
```

### Tag Patterns

**Pattern: Multi-Tag Entity**

```typescript
// Creator with multiple tags
const creatorTags = [
  { name: 'fitness', category: 'industry' },
  { name: 'video-editing', category: 'skill' },
  { name: 'youtube', category: 'technology' },
  { name: 'beginners', category: 'audience' },
];

for (const tag of creatorTags) {
  // Create or get tag
  const tagId = await getOrCreateTag(tag);

  // Associate with creator
  await db.insert('entityTags', {
    entityId: creatorId,
    tagId,
    createdAt: Date.now(),
  });
}
```

**Pattern: Search by Tags**

```typescript
// Find all fitness content
const fitnessTags = await db
  .query('tags')
  .filter((q) => q.eq(q.field('name'), 'fitness'))
  .collect();

const fitnessContent = await db
  .query('entityTags')
  .filter((q) => q.eq(q.field('tagId'), fitnessTags[0]._id))
  .collect()
  .then((assocs) => assocs.map((a) => a.entity));
```

---

## How Features Map to Ontology

### Feature: AI Clone Creation

**Entities Created:**

1. `ai_clone` entity (the clone)
2. `knowledge_item` entities (training data)

**Connections Created:**

1. creator → ai_clone (relationship: "owns")
2. ai_clone → knowledge_items (relationship: "trained_on")

**Events Logged:**

1. `clone_created` (when clone created)
2. `voice_cloned` (when voice ready)
3. `appearance_cloned` (when appearance ready)

**Tags Added:**

- Clone inherits creator's tags
- Additional: "ai_clone", "active"

### Feature: Token Purchase

**Entities Involved:**

1. `token` entity (the token being purchased)
2. `audience_member` entity (the buyer)

**Connections Created/Updated:**

1. buyer → token (relationship: "holds_tokens", metadata: { balance: 100 })

**Events Logged:**

1. `tokens_purchased` (the purchase)
2. `revenue_generated` (for creator)

**Tags Added:**

- None (tokens already tagged)

### Feature: Course Generation

**Entities Created:**

1. `course` entity
2. `lesson` entities (multiple)

**Connections Created:**

1. creator → course (relationship: "owns")
2. ai_clone → course (relationship: "teaching")
3. course → lessons (relationship: "part_of")

**Events Logged:**

1. `course_created`
2. `content_generated` (for each lesson)

**Tags Added:**

- skill tags (what course teaches)
- industry tags (course category)
- audience tags (target audience)

### Feature: ELEVATE Journey

**Entities Involved:**

1. `audience_member` (user going through journey)
2. Workflow entity (tracks progress)

**Connections Created:**

- None (journey tracked in workflow state)

**Events Logged:**

1. `journey_step_completed` (for each step: hook, gift, identify, etc.)
2. `achievement_unlocked` (at milestones)
3. `tokens_earned` (rewards)

**Tags Added:**

- Status tags (current step)

---

## Querying the Ontology

### Get Entity by ID

```typescript
const entity = await db.get(entityId);
```

### Get All Entities of Type

```typescript
const creators = await db
  .query('entities')
  .withIndex('by_type', (q) => q.eq('type', 'creator'))
  .collect();
```

### Get Entity's Relationships

```typescript
// Get all entities this entity owns
const owned = await db
  .query('connections')
  .withIndex('from_type', (q) =>
    q.eq('fromEntityId', entityId).eq('relationshipType', 'owns')
  )
  .collect();

const ownedEntities = await Promise.all(
  owned.map((conn) => db.get(conn.toEntityId))
);
```

### Get Entity's History

```typescript
// Get all events for this entity
const history = await db
  .query('events')
  .withIndex('entity_type_time', (q) => q.eq('entityId', entityId))
  .order('desc') // Most recent first
  .collect();
```

### Get Entity's Tags

```typescript
const tagAssociations = await db
  .query('entityTags')
  .withIndex('by_entity', (q) => q.eq('entityId', entityId))
  .collect();

const tags = await Promise.all(
  tagAssociations.map((assoc) => db.get(assoc.tagId))
);
```

### Search by Multiple Criteria

```typescript
// Find fitness creators with >10k followers
const creators = await db
  .query('entities')
  .withIndex('by_type', (q) => q.eq('type', 'creator'))
  .collect();

const fitnessCreators = creators.filter(
  (c) =>
    c.properties.totalFollowers > 10000 &&
    c.properties.niche.includes('fitness')
);
```

---

## Migration from Old Systems

When migrating from one.ie or bullfm:

### Step 1: Identify Entity Types

Map old models to new entity types:

- Old "User" → "creator" or "audience_member"
- Old "Post" → "blog_post" or "social_post"
- Old "Follow" → connection with "following" type
- Old "Like" → event with "content_liked" type

### Step 2: Transform Properties

Extract structured data into `properties` JSON:

```typescript
// Old user model
{
  id: "123",
  name: "John",
  email: "john@example.com",
  bio: "Fitness coach",
  followers: 5000
}

// New entity
{
  type: "creator",
  name: "John",
  properties: {
    email: "john@example.com",
    username: "john",
    displayName: "John",
    bio: "Fitness coach",
    niche: ["fitness"],
    totalFollowers: 5000,
    totalContent: 0,
    totalRevenue: 0
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
}
```

### Step 3: Convert Relationships

Transform foreign keys into connections:

```typescript
// Old: user_id in posts table
// New: connection
{
  fromEntityId: userId,
  toEntityId: postId,
  relationshipType: "authored",
  createdAt: Date.now()
}
```

### Step 4: Preserve History

Convert activity logs to events:

```typescript
// Old: activity log entry
{ user: "123", action: "viewed", post: "456", timestamp: 1234567890 }

// New: event
{
  entityId: "post-456",
  eventType: "content_viewed",
  timestamp: 1234567890,
  actorType: "user",
  actorId: "user-123"
}
```

---

## Validation Rules

### Entity Validation

- `type` must be valid EntityType
- `name` cannot be empty
- `properties` structure must match type
- `status` must be valid status
- `createdAt` required, `updatedAt` required

### Connection Validation

- `fromEntityId` must exist
- `toEntityId` must exist
- `relationshipType` must be valid
- Cannot connect entity to itself (usually)
- Relationship must make semantic sense

### Event Validation

- `entityId` must exist
- `eventType` must be valid
- `timestamp` required
- `actorId` must exist if provided
- `metadata` structure must match event type

### Tag Validation

- `name` must be unique
- `category` must be valid TagCategory
- `usageCount` must be >= 0

---

## Performance Optimization

### Indexes

Every table has optimized indexes:

```typescript
entities: -by_type(type) -
  by_status(status) -
  by_created(createdAt) -
  search_entities(name, type, status);

connections: -from_type(fromEntityId, relationshipType) -
  to_type(toEntityId, relationshipType) -
  bidirectional(fromEntityId, toEntityId);

events: -entity_type_time(entityId, eventType, timestamp) -
  type_time(eventType, timestamp) -
  session(sessionId, timestamp);

tags: -by_name(name) - unique - by_category(category) - by_usage(usageCount);
```

### Query Optimization

- Always use indexes for filters
- Limit results with `.take(n)`
- Paginate large result sets
- Use `.collect()` sparingly, prefer streaming

---

## Protocol Integration Examples

### How Protocols Map to This Ontology

**Key Principle:** Our ontology is protocol-agnostic. Protocols identify themselves via `metadata.protocol`.

#### A2A Protocol (Agent-to-Agent)

```typescript
// Event: Agent delegates task
{
  type: "task_delegated",
  actorId: oneAgentId,
  targetId: externalAgentId,
  timestamp: Date.now(),
  metadata: {
    protocol: "a2a",
    task: "research_market_trends",
    parameters: { industry: "fitness" }
  }
}

// Connection: Agents communicate
{
  fromEntityId: oneAgentId,
  toEntityId: externalAgentId,
  relationshipType: "communicates_with",
  metadata: {
    protocol: "a2a",
    platform: "elizaos",
    messagesExchanged: 42
  }
}
```

#### ACP Protocol (Agentic Commerce)

```typescript
// Event: Purchase initiated
{
  type: "commerce_event",
  actorId: agentId,
  targetId: transactionId,
  timestamp: Date.now(),
  metadata: {
    protocol: "acp",
    eventType: "purchase_initiated",
    agentPlatform: "chatgpt",
    productId: productId,
    amount: 99.00
  }
}

// Connection: Merchant approves
{
  fromEntityId: merchantId,
  toEntityId: transactionId,
  relationshipType: "approved",
  metadata: {
    protocol: "acp",
    approvalType: "transaction",
    approvedAt: Date.now()
  }
}
```

#### AP2 Protocol (Agent Payments)

```typescript
// Event: Intent mandate created
{
  type: "mandate_created",
  actorId: userId,
  targetId: mandateId,
  timestamp: Date.now(),
  metadata: {
    protocol: "ap2",
    mandateType: "intent",
    autoExecute: true,
    maxBudget: 1500
  }
}

// Event: Price checked
{
  type: "price_checked",
  actorId: agentId,
  targetId: intentMandateId,
  timestamp: Date.now(),
  metadata: {
    protocol: "ap2",
    productId: "prod_123",
    currentPrice: 1399,
    targetPrice: 1500,
    withinBudget: true
  }
}

// Connection: Cart fulfills intent
{
  fromEntityId: intentMandateId,
  toEntityId: cartMandateId,
  relationshipType: "fulfills",
  metadata: {
    protocol: "ap2",
    fulfillmentType: "intent_to_cart",
    matchScore: 0.95
  }
}
```

#### X402 Protocol (HTTP Micropayments)

```typescript
// Event: Payment requested (402 status)
{
  type: "payment_requested",
  actorId: apiServiceId,
  targetId: resourceId,
  timestamp: Date.now(),
  metadata: {
    protocol: "x402",
    scheme: "permit",
    network: "base",
    amount: "0.01",
    resource: "/api/agent/analyze"
  }
}

// Event: Payment verified
{
  type: "payment_verified",
  actorId: systemId,
  targetId: paymentId,
  timestamp: Date.now(),
  metadata: {
    protocol: "x402",
    network: "base",
    txHash: "0x...",
    verified: true
  }
}

// Connection: Payment made
{
  fromEntityId: payerId,
  toEntityId: serviceId,
  relationshipType: "transacted",
  metadata: {
    protocol: "x402",
    network: "base",
    amount: "0.01",
    txHash: "0x..."
  }
}
```

#### AG-UI Protocol (CopilotKit Generative UI)

```typescript
// Event: UI component sent
{
  type: "message_sent",
  actorId: agentId,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    protocol: "ag-ui",
    messageType: "ui",
    component: "chart",
    data: { chartType: "line", ... }
  }
}

// Connection: No connections needed (UI is stateless)
```

### Cross-Protocol Queries

**All payments across all protocols:**
```typescript
const allPayments = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("type"), "payment_processed"))
  .collect();
```

**Only X402 blockchain payments:**
```typescript
const x402Payments = allPayments.filter(e =>
  e.metadata.protocol === "x402"
);
```

**Total revenue by protocol:**
```typescript
const byProtocol = allPayments.reduce((acc, e) => {
  const protocol = e.metadata.protocol || "traditional";
  acc[protocol] = (acc[protocol] || 0) + e.metadata.amount;
  return acc;
}, {});

// Result: { x402: 1250, acp: 3400, ap2: 890, traditional: 5600 }
```

---

## Summary Statistics

**Entity Types:** 66 total
- Core: 4 (creator, ai_clone, audience_member, organization)
- Business Agents: 10
- Content: 7
- Products: 4
- Community: 3
- Token: 2
- Knowledge: 2
- Platform: 6
- Business: 7
- Authentication & Session: 5 (session, oauth_account, verification_token, password_reset_token, ui_preferences)
- Marketing: 6
- External: 3
- Protocol: 2

**Connection Types:** 25 total (Hybrid approach)
- 18 specific semantic types
- 7 consolidated types with metadata variants
- Protocol-agnostic via metadata.protocol
- Includes organization membership with role-based metadata

**Event Types:** 55 total (Hybrid approach)
- 4 Entity lifecycle
- 5 User events
- 6 Authentication events (NEW: password_reset, email_verification, 2FA)
- 5 Organization events (NEW: org_created, user_invited, user_joined)
- 4 Dashboard & UI events (NEW: dashboard_viewed, theme_changed, settings_updated)
- 4 AI/Clone events
- 4 Agent events
- 7 Token events
- 5 Course events
- 5 Analytics events
- 11 consolidated types with metadata variants
- Protocol identification via metadata.protocol

**Tag Categories:** 12 total
- Industry, skill, topic, format, goal, audience, technology, status
- Plus: capability, protocol, payment_method, network

**Design Benefits:**
- ✅ Single source of truth
- ✅ Protocol-agnostic core
- ✅ Infinite protocol extensibility
- ✅ Cross-protocol analytics
- ✅ Clean, maintainable
- ✅ Type-safe
- ✅ Future-proof

---

**END OF ONTOLOGY SPECIFICATION**

## The Philosophy

**Simplicity is the ultimate sophistication.**

This ontology proves that you don't need hundreds of event types or dozens of tables to build a complete AI-native platform. You need:

1. **4 tables** (entities, connections, events, tags)
2. **56 entity types** (every "thing")
3. **25 connection types** (18 specific + 7 consolidated - every relationship)
4. **35 event types** (24 specific + 11 consolidated - every action)
5. **Metadata** (for protocol identity via metadata.protocol)

That's it. Everything else is just data.

### Why This Works

**Other systems:**
- Create new tables for every feature
- Add protocol-specific event types
- Pollute schema with temporary concepts
- End up with 50+ tables, 200+ event types
- Become unmaintainable nightmares

**ONE's approach:**
- Map every feature to 4 tables
- Use generic event types + metadata
- Protocol-agnostic core design
- Scale infinitely without schema changes
- Stay simple, clean, beautiful

### The Result

A database schema that:
- AI agents can understand completely
- Humans can reason about easily
- Supports infinite protocols
- Never needs breaking changes
- Grows more powerful as it grows larger

**This is what happens when you design for clarity first.**

---

## Frontend Integration Examples

### How the Frontend Uses This Ontology

The Astro frontend (documented in `docs/Frontend.md`) uses this ontology through:

1. **Astro Content Collections** - Can load entities as typed collections
2. **Convex Hooks** - Real-time subscriptions to entity/connection/event data
3. **Hono API** - Complex mutations that create/update entities and log events

**Example: Multi-Tenant Dashboard**

```typescript
// Frontend Component (src/components/admin/OrganizationList.tsx)
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function OrganizationList() {
  // Query organizations (type: "organization")
  const orgs = useQuery(api.queries.admin.listOrganizations);

  return (
    <div>
      {orgs?.map(org => (
        <Card key={org._id}>
          <CardHeader>
            <CardTitle>{org.name}</CardTitle>
            <Badge>{org.properties.plan}</Badge>
          </CardHeader>
          <CardContent>
            <p>{org.properties.usage.users} / {org.properties.limits.users} users</p>
            <p>Status: {org.properties.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Example: Authentication Flow**

```typescript
// Password reset request creates:
// 1. Entity: password_reset_token
// 2. Event: password_reset_requested

// Backend (Convex mutation)
export const requestPasswordReset = mutation({
  handler: async (ctx, { email }) => {
    // 1. Find user entity
    const user = await ctx.db.query("entities")
      .filter(q => q.eq(q.field("properties.email"), email))
      .first();

    if (!user) return { success: true }; // Don't reveal if user exists

    // 2. Create password_reset_token entity
    const tokenId = await ctx.db.insert("entities", {
      type: "password_reset_token",
      name: `Reset token for ${email}`,
      properties: {
        userId: user._id,
        token: hashedToken,
        expiresAt: Date.now() + 30 * 60 * 1000,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Log event
    await ctx.db.insert("events", {
      type: "password_reset_requested",
      actorId: user._id,
      targetId: tokenId,
      timestamp: Date.now(),
      metadata: {
        email,
        ipAddress: ctx.auth.sessionId,
        expiresAt: Date.now() + 30 * 60 * 1000,
      },
    });

    return { success: true };
  },
});

// Frontend usage
import { useMutation } from 'convex/react';

export function PasswordResetForm() {
  const requestReset = useMutation(api.auth.requestPasswordReset);

  const handleSubmit = async (email: string) => {
    await requestReset({ email });
    // Show success message
  };
}
```

**Example: Organization Membership Check**

```typescript
// Check if user is org_owner (Middleware.md pattern)
export const checkOrgOwner = query({
  args: { userId: v.id("entities"), orgId: v.id("entities") },
  handler: async (ctx, { userId, orgId }) => {
    // Query connection with role metadata
    const membership = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromEntityId", userId)
         .eq("toEntityId", orgId)
         .eq("relationshipType", "member_of")
      )
      .first();

    return membership?.metadata?.role === "org_owner";
  },
});

// Frontend usage in middleware
import { ConvexHttpClient } from 'convex/browser';

export async function checkAccess(userId: string, orgId: string) {
  const convex = new ConvexHttpClient(env.CONVEX_URL);
  const isOwner = await convex.query(api.auth.checkOrgOwner, { userId, orgId });

  if (!isOwner) {
    throw new Error("Forbidden: Org owner access required");
  }
}
```

**Example: Dashboard Analytics**

```typescript
// Query events for analytics (Dashboard.md pattern)
export const getOrgAnalytics = query({
  args: { orgId: v.id("entities"), days: v.number() },
  handler: async (ctx, { orgId, days }) => {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    // Get all dashboard_viewed events for org users
    const orgMembers = await ctx.db
      .query("connections")
      .withIndex("to_type", q =>
        q.eq("toEntityId", orgId)
         .eq("relationshipType", "member_of")
      )
      .collect();

    const memberIds = orgMembers.map(m => m.fromEntityId);

    const dashboardViews = await ctx.db
      .query("events")
      .withIndex("type_time", q =>
        q.eq("type", "dashboard_viewed")
         .gte("timestamp", since)
      )
      .filter(q => memberIds.includes(q.field("actorId")))
      .collect();

    return {
      totalViews: dashboardViews.length,
      uniqueUsers: new Set(dashboardViews.map(e => e.actorId)).size,
      averageSessionDuration: dashboardViews.reduce(
        (sum, e) => sum + (e.metadata.sessionDuration || 0), 0
      ) / dashboardViews.length,
    };
  },
});
```

**Example: UI Preferences Sync**

```typescript
// Update user preferences (creates ui_preferences entity if not exists)
export const updatePreferences = mutation({
  args: {
    userId: v.id("entities"),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    language: v.optional(v.string()),
  },
  handler: async (ctx, { userId, theme, language }) => {
    // Get or create ui_preferences entity
    let prefs = await ctx.db
      .query("entities")
      .withIndex("by_type", q => q.eq("type", "ui_preferences"))
      .filter(q => q.eq(q.field("properties.userId"), userId))
      .first();

    if (!prefs) {
      // Create new preferences entity
      const prefsId = await ctx.db.insert("entities", {
        type: "ui_preferences",
        name: `Preferences for user ${userId}`,
        properties: {
          userId,
          theme: theme || "system",
          language: language || "en",
          timezone: "UTC",
          dashboardLayout: { sidebarCollapsed: false, defaultView: "grid", itemsPerPage: 20 },
          notifications: { email: true, push: false, sms: false, inApp: true },
          accessibility: { reducedMotion: false, highContrast: false, fontSize: "medium" },
          updatedAt: Date.now(),
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      prefs = await ctx.db.get(prefsId);
    } else {
      // Update existing preferences
      await ctx.db.patch(prefs._id, {
        properties: {
          ...prefs.properties,
          theme: theme || prefs.properties.theme,
          language: language || prefs.properties.language,
          updatedAt: Date.now(),
        },
        updatedAt: Date.now(),
      });
    }

    // Log preferences_updated event
    if (theme) {
      await ctx.db.insert("events", {
        type: "theme_changed",
        actorId: userId,
        targetId: prefs._id,
        timestamp: Date.now(),
        metadata: {
          previousTheme: prefs.properties.theme,
          newTheme: theme,
        },
      });
    }

    return { success: true };
  },
});

// Frontend hook
export function usePreferences(userId: string) {
  const prefs = useQuery(api.queries.preferences.get, { userId });
  const updatePrefs = useMutation(api.mutations.preferences.update);

  return { preferences: prefs?.properties, updatePreferences: updatePrefs };
}
```

### Key Frontend Patterns

**1. Entity as Content Collection**
```typescript
// src/content/config.ts
const agentsCollection = defineCollection({
  type: 'data',
  loader: async () => {
    const convex = new ConvexHttpClient(env.CONVEX_URL);
    const agents = await convex.query(api.queries.entities.list, {
      type: "strategy_agent"
    });
    return agents;
  },
});
```

**2. Real-time Dashboard Stats**
```tsx
export function DashboardStats({ orgId }) {
  // Subscribes to changes - auto-updates when events are logged!
  const stats = useQuery(api.queries.dashboard.getStats, { orgId });

  return <StatsCards data={stats} />;
}
```

**3. Permission-Based Rendering**
```tsx
export function AdminPanel({ userId, orgId }) {
  const membership = useQuery(api.queries.orgs.getMembership, { userId, orgId });

  if (membership?.metadata?.role !== "org_owner") {
    return <div>Access denied</div>;
  }

  return <AdminDashboard />;
}
```

**4. Astro SSR with Ontology**
```astro
---
// src/pages/org/[orgId]/dashboard.astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

// Fetch organization entity
const org = await convex.query(api.queries.entities.get, {
  id: Astro.params.orgId
});

// Fetch org members (connections where relationshipType = "member_of")
const members = await convex.query(api.queries.orgs.getMembers, {
  orgId: Astro.params.orgId
});
---

<Layout title={org.name}>
  <h1>{org.name} Dashboard</h1>
  <p>Plan: {org.properties.plan}</p>
  <p>Members: {members.length} / {org.properties.limits.users}</p>

  <!-- Real-time stats component -->
  <OrgStats client:load orgId={org._id} />
</Layout>
```

This demonstrates how the complete ontology (entities, connections, events, tags) powers the entire frontend architecture through clean, type-safe queries and real-time subscriptions.

---

## For Implementers

**AI agents:** When implementing ANY feature, start by asking:

1. What **entities** are involved?
2. What **connections** link them?
3. What **events** need to be logged?
4. What **tags** categorize them?
5. What **protocol** is this for? (add to metadata)

**Humans:** Your AI agents now have a complete, unambiguous data model. They will generate consistent database operations because they understand the underlying structure.

**Developers:** You have a schema that will never need major refactoring. Just add new entity types as needed, use existing event types with metadata, and enjoy the simplicity.

**This ontology is complete. It's ready for production.**
