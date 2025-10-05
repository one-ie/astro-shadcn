# ONE Platform - Ontology Specification

**Version:** 1.0.0  
**Purpose:** Complete data model for AI agents to understand how EVERYTHING in ONE platform is structured

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
  | 'creator' // Human creator
  | 'ai_clone' // Digital twin of creator
  | 'audience_member' // Fan/user

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
  | 'external_connection'; // Connection config to external service
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
  totalRevenue: number
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

---

## CONNECTIONS: All The Relationships

### What Goes in Connections?

**Simple test:** If you're describing how entity X relates to entity Y, it's a connection.

Examples:

- "Creator **owns** token" ✅ Connection
- "User **enrolled_in** course" ✅ Connection
- "Agent **powers** AI clone" ✅ Connection
- "Creator created a post" ❌ Event (action), not connection

### Connection Types (Optimized: 24 types)

**Note**: Payment, referral, and notification relationships now use metadata for type variations.

```typescript
type ConnectionType =
  // OWNERSHIP (2)
  | 'owns' // Creator owns token/content
  | 'created_by' // Content created by creator

  // AI RELATIONSHIPS (3)
  | 'clone_of' // AI is clone of creator
  | 'trained_on' // Clone trained on content
  | 'powers' // Agent powers clone/feature

  // CONTENT RELATIONSHIPS (5)
  | 'authored' // User authored content
  | 'generated_by' // Content generated by AI
  | 'published_to' // Content published to platform
  | 'part_of' // Lesson part of course
  | 'references' // Content references entity

  // COMMUNITY RELATIONSHIPS (4)
  | 'member_of' // User member of community
  | 'following' // User follows creator
  | 'moderates' // User moderates community
  | 'participated_in' // User participated in conversation

  // BUSINESS RELATIONSHIPS (4)
  | 'manages' // Agent manages function
  | 'reports_to' // Agent reports to another
  | 'collaborates_with' // Entities collaborate
  | 'assigned_to' // Task assigned to entity

  // TOKEN RELATIONSHIPS (3)
  | 'holds_tokens' // User holds tokens
  | 'staked_in' // Tokens staked in pool
  | 'earned_from' // Tokens earned from action

  // PRODUCT RELATIONSHIPS (4)
  | 'purchased' // User purchased product
  | 'enrolled_in' // User enrolled in course
  | 'completed' // User completed course
  | 'teaching' // AI teaching course

  // CONSOLIDATED: PAYMENT RELATIONSHIPS (1 - was 3)
  | 'transacted' // Payment/subscription/invoice (use metadata.transactionType)

  // CONSOLIDATED: REFERRAL RELATIONSHIPS (1 - was 2)
  | 'referred' // Referral relationship (use metadata.referralType)

  // CONSOLIDATED: NOTIFICATION RELATIONSHIPS (1 - was 2)
  | 'notified' // Notification relationship (use metadata.channel)

  // MEDIA RELATIONSHIPS (2)
  | 'featured_in' // Entity featured in media
  | 'hosted_on' // Content hosted on platform

  // ANALYTICS RELATIONSHIPS (3)
  | 'analyzed_by' // Entity analyzed by agent
  | 'optimized_by' // Process optimized by agent
  | 'influences'; // Entity influences another

// Total: 24 connection types (reduced from 33)
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

### Event Types (Optimized: 38 types)

**Note**: Payment, content, livestream, and notification events now use metadata for status/action variations.

```typescript
type EventType =
  // CREATOR EVENTS (3)
  | 'creator_created'
  | 'creator_updated'
  | 'content_uploaded'

  // AI CLONE EVENTS (5)
  | 'clone_created'
  | 'clone_interaction'
  | 'clone_generated_content'
  | 'voice_cloned'
  | 'appearance_cloned'

  // AGENT EVENTS (4)
  | 'agent_created'
  | 'agent_executed'
  | 'agent_completed'
  | 'agent_failed'

  // CONSOLIDATED: CONTENT EVENTS (2 - was 5)
  | 'content_changed'        // created, updated, deleted (use metadata.action)
  | 'content_interacted'     // viewed, shared, liked (use metadata.interactionType)

  // AUDIENCE EVENTS (4)
  | 'user_joined'
  | 'user_engaged'
  | 'ugc_created'            // User-generated content
  | 'comment_posted'

  // COURSE EVENTS (5)
  | 'course_created'
  | 'course_enrolled'
  | 'lesson_completed'
  | 'course_completed'
  | 'certificate_earned'

  // TOKEN EVENTS (7)
  | 'token_deployed'
  | 'tokens_purchased'
  | 'tokens_earned'
  | 'tokens_burned'
  | 'tokens_staked'
  | 'tokens_unstaked'
  | 'governance_vote'

  // BUSINESS EVENTS (3)
  | 'revenue_generated'
  | 'cost_incurred'
  | 'referral_made'

  // GROWTH EVENTS (4)
  | 'viral_share'
  | 'referral_converted'
  | 'achievement_unlocked'
  | 'level_up'

  // ANALYTICS EVENTS (5)
  | 'metric_calculated'
  | 'insight_generated'
  | 'prediction_made'
  | 'optimization_applied'
  | 'report_generated'

  // CONSOLIDATED: PAYMENT EVENTS (2 - was 6)
  | 'payment_processed'      // initiated, completed, failed, refunded (use metadata.status)
  | 'subscription_updated'   // started, renewed, cancelled (use metadata.action)

  // CONSOLIDATED: LIVESTREAM EVENTS (2 - was 4)
  | 'livestream_status_changed'  // scheduled, started, ended (use metadata.status)
  | 'livestream_interaction'     // joined, left, message (use metadata.type)

  // CONSOLIDATED: NOTIFICATION EVENTS (1 - was 3)
  | 'notification_delivered'     // sent via email, sms, push, in_app (use metadata.channel)

  // CONSOLIDATED: REFERRAL EVENTS (2 - was 3)
  | 'referral_activity'          // created, converted (use metadata.action)
  | 'lead_captured';

// Total: 38 event types (reduced from 54)
```

### Event Structure

```typescript
{
  _id: Id<"events">,
  type: EventType,               // What happened
  actorId: Id<"entities">,       // Who/what caused this
  targetId?: Id<"entities">,     // Optional target entity
  timestamp: number,             // When it happened
  metadata: any,                 // Event-specific data (includes action/status for consolidated types)

  // For consolidated events, metadata includes:
  // - payment_processed: { status: "initiated" | "completed" | "failed" | "refunded", amount, paymentId }
  // - content_changed: { action: "created" | "updated" | "deleted", contentType }
  // - livestream_status_changed: { status: "scheduled" | "started" | "ended", streamId }
  // - notification_delivered: { channel: "email" | "sms" | "push" | "in_app", messageId }
}
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
  | 'skill' // Programming, video-editing, etc.
  | 'industry' // Fitness, business, art, etc.
  | 'topic' // AI, blockchain, marketing, etc.
  | 'format' // Video, text, audio, interactive
  | 'goal' // Learn, earn, build, grow
  | 'audience' // Beginners, professionals, students
  | 'technology' // React, Python, Figma, etc.
  | 'status'; // Featured, trending, new
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

**END OF ONTOLOGY SPECIFICATION**

If you're an AI agent: You now understand how EVERY feature maps to these 4 tables. When you need to implement any feature, start by asking:

1. What entities are involved?
2. What connections link them?
3. What events need to be logged?
4. What tags categorize them?

If you're a human: Your AI agents now have a complete, unambiguous data model. They will generate consistent database operations because they understand the underlying structure.
