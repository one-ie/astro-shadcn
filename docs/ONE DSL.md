// ============================================================================
// ONE DSL - Domain Specific Language
// Purpose: Declare features in high-level syntax that compiles to Effect.ts
// ============================================================================

/**
 * DSL SYNTAX SPECIFICATION
 *
 * The ONE DSL is a declarative language for defining features on the ONE platform.
 * It compiles to TypeScript with Effect.ts and plain Convex schemas (no Convex Ents).
 *
 * Core principles:
 * 1. Declarative - describe WHAT, not HOW
 * 2. Type-safe - validates against ontology
 * 3. Composable - features built from primitives
 * 4. Auditable - generates readable TypeScript
 * 5. Metadata-based - uses metadata field for type consolidation
 *
 * Hybrid Type Strategy:
 * - 25 connection types (18 specific + 7 consolidated via metadata)
 * - 35 event types (24 specific + 11 consolidated via metadata)
 * - Specific types for core domain concepts (tokens, courses, clones)
 * - Consolidated types for protocol-agnostic patterns (payment, content, communication)
 * - Metadata field stores variants and protocol identity
 */

// ============================================================================
// DSL PRIMITIVES
// ============================================================================

/**
 * ENTITY DECLARATION
 * Creates a new entity in the ontology
 */
type EntityDeclaration = {
  entity: {
    type: EntityType;
    name: string;
    properties: Record<string, any>;
    status?: "active" | "inactive" | "draft";
  };
};

/**
 * CONNECTION DECLARATION
 * Creates relationship between entities
 *
 * 25 HYBRID CONNECTION TYPES:
 *
 * Specific Types (18):
 * - Ownership: "owns", "created_by"
 * - AI: "clone_of", "trained_on", "powers"
 * - Content: "authored", "generated_by", "published_to", "part_of", "references"
 * - Community: "member_of", "following", "moderates", "participated_in"
 * - Business: "manages", "reports_to", "collaborates_with"
 * - Tokens: "holds_tokens", "staked_in", "earned_from"
 * - Products: "purchased", "enrolled_in", "completed", "teaching"
 *
 * Consolidated Types (7) - use metadata:
 * - "transacted" (metadata.transactionType + protocol)
 * - "notified" (metadata.channel + notificationType)
 * - "referred" (metadata.referralType)
 * - "communicated" (metadata.protocol + messageType)
 * - "delegated" (metadata.protocol + taskType)
 * - "approved" (metadata.approvalType + protocol)
 * - "fulfilled" (metadata.fulfillmentType + protocol)
 */
type ConnectionDeclaration = {
  connect: {
    from: EntityReference;
    to: EntityReference;
    type: ConnectionType; // One of 24 consolidated types
    metadata?: {
      // Type-specific metadata for consolidated types
      paymentType?: "subscription" | "purchase" | "tip" | "refund";
      livestreamType?: "hosted" | "attended" | "moderated" | "banned_from";
      notificationType?: "sent" | "received" | "read";
      referralType?: "referred" | "earned_from";
      actionType?: string; // For admin_action
      // Custom fields
      [key: string]: any;
    };
  };
};

/**
 * EVENT DECLARATION
 * Logs an event
 *
 * 35 HYBRID EVENT TYPES:
 *
 * Specific Types (24):
 * - Entity Lifecycle: "entity_created", "entity_updated", "entity_deleted", "entity_archived"
 * - User: "user_registered", "user_verified", "user_login", "user_logout", "profile_updated"
 * - AI/Clone: "clone_created", "clone_updated", "voice_cloned", "appearance_cloned"
 * - Agent: "agent_created", "agent_executed", "agent_completed", "agent_failed"
 * - Token: "token_created", "token_minted", "token_burned", "tokens_purchased", "tokens_staked", "tokens_unstaked", "tokens_transferred"
 * - Course: "course_created", "course_enrolled", "lesson_completed", "course_completed", "certificate_earned"
 * - Analytics: "metric_calculated", "insight_generated", "prediction_made", "optimization_applied", "report_generated"
 *
 * Consolidated Types (11) - use metadata:
 * - "content_event" (metadata.action: created|updated|deleted|viewed|shared|liked)
 * - "payment_event" (metadata.status: requested|verified|processed + protocol)
 * - "subscription_event" (metadata.action: started|renewed|cancelled)
 * - "commerce_event" (metadata.eventType + protocol: ACP, AP2)
 * - "livestream_event" (metadata.status + metadata.action)
 * - "notification_event" (metadata.channel + deliveryStatus)
 * - "referral_event" (metadata.action: created|completed|rewarded)
 * - "communication_event" (metadata.protocol + messageType: A2A, ACP, AG-UI)
 * - "task_event" (metadata.action: delegated|completed|failed + protocol)
 * - "mandate_event" (metadata.mandateType: intent|cart + protocol: AP2)
 * - "price_event" (metadata.action: checked|changed)
 */
type EventDeclaration = {
  event: {
    entity: EntityReference;
    type: EventType; // One of 38 consolidated types
    actor?: EntityReference;
    metadata?: {
      // Type-specific metadata for consolidated types
      contentType?: "created" | "published" | "edited" | "deleted" | "viewed" | "shared";
      paymentType?: "initiated" | "completed" | "failed" | "refunded" | "subscription_created" | "subscription_cancelled";
      livestreamType?: "started" | "ended" | "viewer_joined" | "viewer_left" | "chat_message" | "donation_received";
      notificationType?: "sent" | "delivered" | "read" | "clicked";
      referralType?: "created" | "completed" | "reward_paid";
      actionType?: string; // For admin_action
      // Custom fields
      [key: string]: any;
    };
  };
};

/**
 * QUERY DECLARATION
 * Retrieves entities/connections/events
 */
type QueryDeclaration = {
  query: {
    from: "entities" | "connections" | "events";
    where?: Array<{
      field: string;
      operator: "eq" | "gt" | "lt" | "contains";
      value: any;
    }>;
    limit?: number;
    orderBy?: { field: string; direction: "asc" | "desc" };
  };
};

/**
 * FLOW DECLARATION
 * Multi-step workflow with branching logic
 */
type FlowDeclaration = {
  flow: {
    name: string;
    steps: Array<StepDeclaration>;
    error?: ErrorHandler;
  };
};

/**
 * SERVICE DECLARATION
 * Calls external provider
 */
type ServiceDeclaration = {
  service: {
    provider:
      | "openai"           // OpenAI GPT models
      | "elevenlabs"       // Voice cloning
      | "stripe"           // Payment processing
      | "blockchain"       // Blockchain interactions
      | "resend"           // Email service
      | "d-id"             // Appearance cloning (D-ID)
      | "heygen"           // Alternative appearance cloning
      | "uniswap"          // DEX integration for token trading
      | "alchemy"          // Blockchain provider/API
      | "twilio"           // SMS and voice communications
      | "sendgrid"         // Email service (alternative)
      | "aws"              // Media storage (S3)
      | "cloudflare";      // CDN and live streaming
    method: string;
    params: Record<string, any>;
  };
};

// ============================================================================
// METADATA PATTERNS - Examples of Consolidated Types
// ============================================================================

/**
 * PAYMENT CONNECTION EXAMPLES
 * Single "payment" type with metadata.paymentType
 */
const paymentSubscriptionExample = {
  connect: {
    from: "$userId",
    to: "$creatorId",
    type: "payment",
    metadata: {
      paymentType: "subscription",
      amount: 999,
      currency: "usd",
      interval: "monthly",
      stripeSubscriptionId: "sub_123",
    },
  },
};

const paymentTipExample = {
  connect: {
    from: "$userId",
    to: "$creatorId",
    type: "payment",
    metadata: {
      paymentType: "tip",
      amount: 500,
      currency: "usd",
      message: "Great content!",
    },
  },
};

/**
 * CONTENT EVENT EXAMPLES
 * Single "content" type with metadata.contentType
 */
const contentPublishedEvent = {
  event: {
    entity: "$contentId",
    type: "content",
    actor: "$userId",
    metadata: {
      contentType: "published",
      title: "My Blog Post",
      visibility: "public",
    },
  },
};

const contentViewedEvent = {
  event: {
    entity: "$contentId",
    type: "content",
    actor: "$viewerId",
    metadata: {
      contentType: "viewed",
      duration: 120, // seconds
      source: "feed",
    },
  },
};

/**
 * LIVESTREAM EVENT EXAMPLES
 * Single "livestream" type with metadata.livestreamType
 */
const livestreamStartedEvent = {
  event: {
    entity: "$livestreamId",
    type: "livestream",
    actor: "$hostId",
    metadata: {
      livestreamType: "started",
      title: "Q&A Session",
      expectedDuration: 3600,
    },
  },
};

const livestreamDonationEvent = {
  event: {
    entity: "$livestreamId",
    type: "livestream",
    actor: "$donorId",
    metadata: {
      livestreamType: "donation_received",
      amount: 1000,
      currency: "usd",
      message: "Love your work!",
    },
  },
};

/**
 * NOTIFICATION CONNECTION EXAMPLES
 * Single "notification" type with metadata.notificationType
 */
const notificationSentConnection = {
  connect: {
    from: "$systemId",
    to: "$userId",
    type: "notification",
    metadata: {
      notificationType: "sent",
      title: "New follower",
      body: "John Doe started following you",
      priority: "medium",
    },
  },
};

/**
 * REFERRAL CONNECTION EXAMPLES
 * Single "referral" type with metadata.referralType
 */
const referralConnection = {
  connect: {
    from: "$referrerId",
    to: "$referredUserId",
    type: "referral",
    metadata: {
      referralType: "referred",
      code: "FRIEND50",
      reward: 500,
      status: "pending",
    },
  },
};

// ============================================================================
// PLAIN CONVEX SCHEMA - How DSL Compiles
// ============================================================================

/**
 * The DSL compiles to plain Convex schemas (NO Convex Ents)
 *
 * This is the actual Convex schema that the DSL generates:
 */

// convex/schema.ts (Generated from DSL)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Entity table - all entities stored here
  entities: defineTable({
    type: v.string(), // Entity type (creator, ai_clone, token, etc.)
    name: v.string(),
    properties: v.any(), // Type-specific properties
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("draft")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Connection table - 24 consolidated types
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.string(), // One of 24 consolidated types
    metadata: v.optional(v.any()), // Stores paymentType, livestreamType, etc.
    createdAt: v.number(),
  })
    .index("by_from", ["fromEntityId"])
    .index("by_to", ["toEntityId"])
    .index("by_type", ["relationshipType"])
    .index("by_from_and_type", ["fromEntityId", "relationshipType"])
    .index("by_to_and_type", ["toEntityId", "relationshipType"]),

  // Event table - 38 consolidated types
  events: defineTable({
    entityId: v.id("entities"),
    eventType: v.string(), // One of 38 consolidated types
    timestamp: v.number(),
    actorType: v.union(v.literal("user"), v.literal("system")),
    actorId: v.optional(v.id("entities")),
    metadata: v.optional(v.any()), // Stores contentType, paymentType, etc.
  })
    .index("by_entity", ["entityId"])
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_entity_and_type", ["entityId", "eventType"])
    .index("by_actor", ["actorId"]),
});

/**
 * KEY DIFFERENCES FROM CONVEX ENTS:
 *
 * 1. NO ent() definitions - just plain defineTable()
 * 2. NO edge() definitions - connections stored as regular rows
 * 3. NO automatic relationship traversal - use manual queries
 * 4. Metadata field (v.any()) stores type-specific data
 * 5. Simpler, more flexible, easier to understand
 * 6. Better for AI agents - less magic, more explicit
 */

// ============================================================================
// EXAMPLE 1: Create AI Clone (DSL)
// ============================================================================

const createAICloneDSL = {
  feature: "CreateAIClone",
  input: {
    creatorId: "Id<entities>",
    videoUrls: "string[]",
  },
  output: {
    cloneId: "Id<entities>",
    voiceId: "string",
  },

  flow: [
    // Step 1: Validate input
    {
      validate: {
        creatorId: { exists: true, type: "creator" },
        videoUrls: { minLength: 3 },
      },
      onError: { return: { error: "InsufficientContent" } },
    },

    // Step 2: Extract audio samples
    {
      service: {
        provider: "openai",
        method: "extractAudioFromVideos",
        params: { urls: "$input.videoUrls" },
        output: "audioSamples",
      },
    },

    // Step 3: Clone voice
    {
      service: {
        provider: "elevenlabs",
        method: "cloneVoice",
        params: {
          name: "$creator.name + ' Voice'",
          samples: "$audioSamples",
        },
        output: "voiceId",
        retry: { times: 3, delay: "5s" },
        timeout: "5m",
      },
    },

    // Step 4: Analyze personality
    {
      service: {
        provider: "openai",
        method: "analyzePersonality",
        params: {
          videos: "$input.videoUrls",
          posts: "$creator.properties.recentPosts",
        },
        output: "personality",
      },
    },

    // Step 5: Create AI clone entity
    {
      entity: {
        type: "ai_clone",
        name: "$creator.name + ' AI Clone'",
        properties: {
          voiceId: "$voiceId",
          voiceProvider: "elevenlabs",
          systemPrompt: "$personality.systemPrompt",
          temperature: 0.7,
          totalInteractions: 0,
        },
        status: "active",
      },
      output: "cloneId",
    },

    // Step 6: Create ownership connection
    {
      connect: {
        from: "$input.creatorId",
        to: "$cloneId",
        type: "owns",
      },
    },

    // Step 7: Log creation event
    {
      event: {
        entity: "$cloneId",
        type: "clone_created",
        actor: "$input.creatorId",
        metadata: {
          voiceId: "$voiceId",
          personality: "$personality.traits",
        },
      },
    },

    // Step 8: Return result
    {
      return: {
        cloneId: "$cloneId",
        voiceId: "$voiceId",
      },
    },
  ],
};

// ============================================================================
// EXAMPLE 2: Token Purchase (DSL)
// ============================================================================

const tokenPurchaseDSL = {
  feature: "PurchaseTokens",
  input: {
    userId: "Id<entities>",
    tokenId: "Id<entities>",
    amount: "number",
    usdAmount: "number",
  },
  output: {
    paymentId: "string",
    txHash: "string",
  },

  flow: [
    // Step 1: Validate inputs
    {
      validate: {
        userId: { exists: true, type: "audience_member" },
        tokenId: { exists: true, type: "token" },
        amount: { gt: 0 },
        usdAmount: { gt: 0 },
      },
    },

    // Step 2: Charge payment (atomic with step 3)
    {
      atomic: [
        // 2a: Stripe payment
        {
          service: {
            provider: "stripe",
            method: "charge",
            params: {
              amount: "$input.usdAmount * 100",
              currency: "usd",
              metadata: {
                userId: "$input.userId",
                tokenId: "$input.tokenId",
              },
            },
            output: "payment",
          },
        },

        // 2b: Mint tokens on blockchain
        {
          service: {
            provider: "blockchain",
            method: "mint",
            params: {
              contractAddress: "$token.properties.contractAddress",
              toAddress: "$input.userId",
              amount: "$input.amount",
            },
            output: "mintTx",
          },
        },
      ],
      onError: {
        rollback: [
          {
            service: {
              provider: "stripe",
              method: "refund",
              params: { paymentIntentId: "$payment.id" },
            },
          },
          {
            service: {
              provider: "blockchain",
              method: "burn",
              params: {
                contractAddress: "$token.properties.contractAddress",
                amount: "$input.amount",
              },
            },
          },
        ],
      },
    },

    // Step 3a: Log payment event (using consolidated "payment" event type)
    {
      event: {
        entity: "$input.userId",
        type: "payment",
        actor: "$input.userId",
        metadata: {
          paymentType: "completed",
          amount: "$input.usdAmount",
          currency: "usd",
          paymentId: "$payment.id",
          purpose: "token_purchase",
          tokenId: "$input.tokenId",
          tokenAmount: "$input.amount",
        },
      },
    },

    // Step 3b: Log token purchase event
    {
      event: {
        entity: "$input.tokenId",
        type: "tokens_purchased",
        actor: "$input.userId",
        metadata: {
          amount: "$input.amount",
          usdAmount: "$input.usdAmount",
          paymentId: "$payment.id",
          txHash: "$mintTx.transactionHash",
        },
      },
    },

    // Step 4: Update token balance
    {
      query: {
        from: "connections",
        where: [
          { field: "fromEntityId", operator: "eq", value: "$input.userId" },
          { field: "toEntityId", operator: "eq", value: "$input.tokenId" },
          { field: "relationshipType", operator: "eq", value: "holds_tokens" },
        ],
        limit: 1,
      },
      output: "existingConnection",
    },

    {
      if: {
        condition: "$existingConnection != null",
        then: [
          {
            update: {
              connection: "$existingConnection._id",
              set: {
                metadata: {
                  balance:
                    "$existingConnection.metadata.balance + $input.amount",
                },
              },
            },
          },
        ],
        else: [
          {
            connect: {
              from: "$input.userId",
              to: "$input.tokenId",
              type: "holds_tokens",
              metadata: {
                balance: "$input.amount",
                firstPurchaseDate: Date.now(),
                txHash: "$mintTx.transactionHash",
              },
            },
          },
        ],
      },
    },

    // Step 5a: Create payment connection record (using consolidated "payment" type)
    {
      connect: {
        from: "$input.userId",
        to: "$input.tokenId",
        type: "payment",
        metadata: {
          paymentType: "purchase",
          amount: "$input.usdAmount",
          currency: "usd",
          tokenAmount: "$input.amount",
          paymentId: "$payment.id",
          txHash: "$mintTx.transactionHash",
        },
      },
    },

    // Step 6: Return result
    {
      return: {
        paymentId: "$payment.id",
        txHash: "$mintTx.transactionHash",
      },
    },
  ],
};

// ============================================================================
// EXAMPLE 2B: Token Purchase with Referral (DSL)
// Shows referral metadata pattern
// ============================================================================

const tokenPurchaseWithReferralDSL = {
  feature: "PurchaseTokensWithReferral",
  input: {
    userId: "Id<entities>",
    tokenId: "Id<entities>",
    amount: "number",
    usdAmount: "number",
    referralCode: "string",
  },
  output: {
    paymentId: "string",
    txHash: "string",
    referralReward: "number",
  },

  flow: [
    // Step 1: Find referral connection
    {
      query: {
        from: "connections",
        where: [
          { field: "toEntityId", operator: "eq", value: "$input.userId" },
          { field: "relationshipType", operator: "eq", value: "referral" },
          {
            field: "metadata.code",
            operator: "eq",
            value: "$input.referralCode",
          },
          { field: "metadata.status", operator: "eq", value: "pending" },
        ],
        limit: 1,
      },
      output: "referralConnection",
    },

    // Step 2: Process payment (same as before)
    // ... payment steps ...

    // Step 3: Update referral status if found
    {
      if: {
        condition: "$referralConnection != null",
        then: [
          {
            update: {
              connection: "$referralConnection._id",
              set: {
                metadata: {
                  referralType: "completed",
                  code: "$input.referralCode",
                  reward: 500,
                  status: "completed",
                  completedAt: Date.now(),
                },
              },
            },
          },
          {
            event: {
              entity: "$referralConnection.fromEntityId",
              type: "referral",
              actor: "$input.userId",
              metadata: {
                referralType: "completed",
                code: "$input.referralCode",
                reward: 500,
                referredUserId: "$input.userId",
              },
            },
          },
        ],
      },
    },

    // Step 4: Return result
    {
      return: {
        paymentId: "$payment.id",
        txHash: "$mintTx.transactionHash",
        referralReward:
          "$referralConnection != null ? $referralConnection.metadata.reward : 0",
      },
    },
  ],
};

// ============================================================================
// EXAMPLE 3: Livestream with Notifications (DSL)
// Shows livestream and notification metadata patterns
// ============================================================================

const livestreamWithNotificationsDSL = {
  feature: "StartLivestreamWithNotifications",
  input: {
    hostId: "Id<entities>",
    title: "string",
    description: "string",
  },
  output: {
    livestreamId: "Id<entities>",
    notificationsSent: "number",
  },

  flow: [
    // Step 1: Create livestream entity
    {
      entity: {
        type: "livestream",
        name: "$input.title",
        properties: {
          description: "$input.description",
          status: "live",
          viewerCount: 0,
          startedAt: Date.now(),
        },
        status: "active",
      },
      output: "livestreamId",
    },

    // Step 2: Create livestream connection (using consolidated type)
    {
      connect: {
        from: "$input.hostId",
        to: "$livestreamId",
        type: "livestream",
        metadata: {
          livestreamType: "hosted",
          role: "host",
          startedAt: Date.now(),
        },
      },
    },

    // Step 3: Log livestream started event (using consolidated type)
    {
      event: {
        entity: "$livestreamId",
        type: "livestream",
        actor: "$input.hostId",
        metadata: {
          livestreamType: "started",
          title: "$input.title",
          expectedDuration: 3600,
        },
      },
    },

    // Step 4: Get all followers
    {
      query: {
        from: "connections",
        where: [
          { field: "toEntityId", operator: "eq", value: "$input.hostId" },
          { field: "relationshipType", operator: "eq", value: "following" },
        ],
      },
      output: "followers",
    },

    // Step 5: Send notifications to all followers
    {
      forEach: {
        array: "$followers",
        do: [
          {
            connect: {
              from: "$input.hostId",
              to: "$item.fromEntityId",
              type: "notification",
              metadata: {
                notificationType: "sent",
                title: "Livestream started!",
                body: "$input.title",
                livestreamId: "$livestreamId",
                sentAt: Date.now(),
                priority: "high",
              },
            },
          },
          {
            event: {
              entity: "$item.fromEntityId",
              type: "notification",
              actor: "$input.hostId",
              metadata: {
                notificationType: "sent",
                channel: "push",
                livestreamId: "$livestreamId",
              },
            },
          },
        ],
        output: "notificationResults",
      },
    },

    // Step 6: Return result
    {
      return: {
        livestreamId: "$livestreamId",
        notificationsSent: "$notificationResults.length",
      },
    },
  ],
};

// ============================================================================
// EXAMPLE 4: ELEVATE Journey (DSL)
// ============================================================================

const elevateJourneyDSL = {
  feature: "ELEVATEJourney",
  input: {
    userId: "Id<entities>",
  },
  output: {
    completed: "boolean",
  },

  flow: [
    // Step 1: Hook - Free AI analysis
    {
      step: "hook",
      actions: [
        {
          service: {
            provider: "openai",
            method: "generateBusinessAnalysis",
            params: { userId: "$input.userId" },
            output: "analysis",
          },
        },
        {
          event: {
            entity: "$input.userId",
            type: "elevate_step_completed",
            metadata: { step: "hook", output: "$analysis" },
          },
        },
      ],
    },

    // Wait 24 hours
    { wait: "24h" },

    // Step 2: Gift - Send insights
    {
      step: "gift",
      actions: [
        {
          service: {
            provider: "resend",
            method: "sendInsightsReport",
            params: {
              to: "$user.properties.email",
              insights: "$analysis",
            },
          },
        },
        {
          event: {
            entity: "$input.userId",
            type: "elevate_step_completed",
            metadata: { step: "gift" },
          },
        },
      ],
    },

    // Step 3: Identify - Payment gate
    {
      step: "identify",
      actions: [
        {
          service: {
            provider: "stripe",
            method: "createCheckoutSession",
            params: {
              amount: 10000,
              currency: "usd",
              successUrl: "$baseUrl/elevate/success",
              cancelUrl: "$baseUrl/elevate/cancel",
            },
            output: "checkout",
          },
        },
        {
          waitForEvent: {
            eventType: "payment_completed",
            entityId: "$input.userId",
            timeout: "7d",
          },
          output: "paymentCompleted",
        },
        {
          if: {
            condition: "$paymentCompleted == false",
            then: [{ return: { completed: false } }],
          },
        },
      ],
    },

    // Steps 4-9 continue...

    { return: { completed: true } },
  ],
};

// ============================================================================
// EXAMPLE 4: Query Pattern (DSL)
// ============================================================================

const getCreatorWithContentDSL = {
  feature: "GetCreatorWithContent",
  input: {
    creatorId: "Id<entities>",
  },
  output: {
    creator: "Entity",
    content: "Entity[]",
    followerCount: "number",
  },

  flow: [
    // Step 1: Get creator entity
    {
      query: {
        from: "entities",
        where: [
          { field: "_id", operator: "eq", value: "$input.creatorId" },
          { field: "type", operator: "eq", value: "creator" },
        ],
        limit: 1,
      },
      output: "creator",
    },

    // Step 2: Get authored content
    {
      query: {
        from: "connections",
        where: [
          { field: "fromEntityId", operator: "eq", value: "$input.creatorId" },
          { field: "relationshipType", operator: "eq", value: "authored" },
        ],
      },
      output: "contentConnections",
    },

    // Step 3: Hydrate content entities
    {
      forEach: {
        array: "$contentConnections",
        do: [
          {
            query: {
              from: "entities",
              where: [
                { field: "_id", operator: "eq", value: "$item.toEntityId" },
              ],
            },
          },
        ],
        output: "content",
      },
    },

    // Step 4: Count followers
    {
      query: {
        from: "connections",
        where: [
          { field: "toEntityId", operator: "eq", value: "$input.creatorId" },
          { field: "relationshipType", operator: "eq", value: "following" },
        ],
      },
      output: "followers",
    },

    // Step 5: Return result
    {
      return: {
        creator: "$creator",
        content: "$content",
        followerCount: "$followers.length",
      },
    },
  ],
};

// ============================================================================
// DSL COMPILER
// Compiles DSL to TypeScript with Effect.ts and Plain Convex
// ============================================================================

class ONECompiler {
  /**
   * Compiles DSL to TypeScript with Effect.ts
   *
   * Key Features:
   * - Generates plain Convex queries/mutations (NO Convex Ents)
   * - Uses ctx.db.insert/query/patch directly
   * - Metadata field stores type-specific data
   * - Effect.ts for composition and error handling
   */
  compile(dsl: any): string {
    const feature = dsl.feature;
    const input = dsl.input;
    const output = dsl.output;
    const flow = dsl.flow;

    let code = `// Generated from ONE DSL
// Compiles to Plain Convex (NO Convex Ents) + Effect.ts
import { Effect } from "effect";
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { OpenAIProvider, ElevenLabsProvider, StripeProvider, BlockchainProvider, ResendProvider } from "@/convex/services/providers";

/**
 * Generated ${feature} function
 * Uses plain Convex with Effect.ts for composition
 */
export const ${this.toCamelCase(feature)} = mutation({
  args: ${this.generateInputArgs(input)},
  handler: async (ctx, args) => {
    return await Effect.runPromise(
      Effect.gen(function* () {
`;

    // Compile each step in flow
    for (const step of flow) {
      code += this.compileStep(step, 4);
    }

    code += `      })
    );
  },
});
`;

    return code;
  }

  private compileStep(step: any, indent: number): string {
    const ind = "  ".repeat(indent);

    // Entity creation (Plain Convex - NO Convex Ents)
    if (step.entity) {
      return `${ind}// Create entity using plain Convex ctx.db.insert
${ind}const ${step.output || "entity"} = yield* Effect.promise(() =>
${ind}  ctx.db.insert("entities", {
${ind}    type: "${step.entity.type}",
${ind}    name: ${this.compileExpression(step.entity.name)},
${ind}    properties: ${JSON.stringify(step.entity.properties, null, 2).replace(/\n/g, "\n" + ind + "    ")},
${ind}    status: "${step.entity.status || "active"}",
${ind}    createdAt: Date.now(),
${ind}    updatedAt: Date.now(),
${ind}  })
${ind});
`;
    }

    // Connection creation (Plain Convex - stores metadata)
    if (step.connect) {
      const metadataStr = step.connect.metadata
        ? JSON.stringify(step.connect.metadata, null, 2).replace(
            /\n/g,
            "\n" + ind + "    "
          )
        : "undefined";
      return `${ind}// Create connection using plain Convex ctx.db.insert
${ind}yield* Effect.promise(() =>
${ind}  ctx.db.insert("connections", {
${ind}    fromEntityId: ${this.compileExpression(step.connect.from)},
${ind}    toEntityId: ${this.compileExpression(step.connect.to)},
${ind}    relationshipType: "${step.connect.type}",
${ind}    metadata: ${metadataStr},
${ind}    createdAt: Date.now(),
${ind}  })
${ind});
`;
    }

    // Event logging (Plain Convex - stores metadata)
    if (step.event) {
      const metadataStr = step.event.metadata
        ? JSON.stringify(step.event.metadata, null, 2).replace(
            /\n/g,
            "\n" + ind + "    "
          )
        : "undefined";
      return `${ind}// Log event using plain Convex ctx.db.insert
${ind}yield* Effect.promise(() =>
${ind}  ctx.db.insert("events", {
${ind}    entityId: ${this.compileExpression(step.event.entity)},
${ind}    eventType: "${step.event.type}",
${ind}    timestamp: Date.now(),
${ind}    actorType: "${step.event.actor ? "user" : "system"}",
${ind}    actorId: ${this.compileExpression(step.event.actor || "undefined")},
${ind}    metadata: ${metadataStr},
${ind}  })
${ind});
`;
    }

    // Service call
    if (step.service) {
      const provider = this.capitalizeFirst(step.service.provider);
      return `${ind}const ${step.output || "result"} = yield* Effect.gen(function* () {
${ind}  const ${step.service.provider} = yield* ${provider}Provider;
${ind}  return yield* ${step.service.provider}.${step.service.method}(${JSON.stringify(step.service.params)});
${ind}})${step.retry ? `.pipe(Effect.retry({ times: ${step.retry.times} }))` : ""}${step.timeout ? `.pipe(Effect.timeout("${step.timeout}"))` : ""};
`;
    }

    // Query (Plain Convex - uses ctx.db.query)
    if (step.query) {
      return `${ind}// Query using plain Convex ctx.db.query
${ind}const ${step.output || "queryResult"} = yield* Effect.promise(async () => {
${ind}  let query = ctx.db.query("${step.query.from}");
${this.compileQueryFilters(step.query.where || [], indent + 1)}
${step.query.limit ? `${ind}  query = query.take(${step.query.limit});` : ""}
${ind}  return await query.collect();
${ind}});
`;
    }

    // Conditional
    if (step.if) {
      let code = `${ind}if (${this.compileExpression(step.if.condition)}) {
`;
      for (const thenStep of step.if.then) {
        code += this.compileStep(thenStep, indent + 1);
      }
      if (step.if.else) {
        code += `${ind}} else {
`;
        for (const elseStep of step.if.else) {
          code += this.compileStep(elseStep, indent + 1);
        }
      }
      code += `${ind}}
`;
      return code;
    }

    // Return
    if (step.return) {
      return `${ind}return ${JSON.stringify(step.return)};
`;
    }

    return `${ind}// Unknown step type
`;
  }

  private compileExpression(expr: string): string {
    if (expr.startsWith("$")) {
      // Variable reference
      return expr.substring(1).replace(/\./g, "?.");
    }
    return `"${expr}"`;
  }

  private compileQueryFilters(filters: any[], indent: number): string {
    const ind = "  ".repeat(indent);
    let code = "";
    for (const filter of filters) {
      // Plain Convex filter syntax (no Convex Ents)
      code += `${ind}query = query.filter((q) => q.eq(q.field("${filter.field}"), ${this.compileExpression(filter.value)}));\n`;
    }
    return code;
  }

  private generateInputArgs(input: Record<string, string>): string {
    // Generate Convex args validator object
    const args = Object.entries(input)
      .map(([key, type]) => {
        const convexType = this.typeToConvexValidator(type);
        return `    ${key}: ${convexType}`;
      })
      .join(",\n");
    return `{\n${args}\n  }`;
  }

  private typeToConvexValidator(type: string): string {
    // Map DSL types to Convex validators
    if (type.includes("Id<")) return "v.id('entities')";
    if (type === "string") return "v.string()";
    if (type === "number") return "v.number()";
    if (type === "boolean") return "v.boolean()";
    if (type.includes("[]")) {
      const innerType = type.replace("[]", "");
      return `v.array(${this.typeToConvexValidator(innerType)})`;
    }
    return "v.any()";
  }

  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ============================================================================
// DSL VALIDATOR
// Validates DSL against ontology before compilation
// ============================================================================

class ONEValidator {
  private ontology: {
    entityTypes: string[];
    connectionTypes: string[]; // 24 consolidated types
    eventTypes: string[]; // 38 consolidated types
  };

  constructor(ontology: any) {
    this.ontology = ontology;
  }

  validate(dsl: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate all entity types used exist in ontology
    this.validateEntities(dsl.flow, errors);

    // Validate all connection types used exist in ontology
    this.validateConnections(dsl.flow, errors);

    // Validate all event types used exist in ontology
    this.validateEvents(dsl.flow, errors);

    // Validate metadata patterns for consolidated types
    this.validateMetadata(dsl.flow, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateEntities(flow: any[], errors: string[]): void {
    for (const step of flow) {
      if (step.entity && !this.ontology.entityTypes.includes(step.entity.type)) {
        errors.push(
          `Invalid entity type: ${step.entity.type}. Must be one of: ${this.ontology.entityTypes.join(", ")}`
        );
      }
    }
  }

  private validateConnections(flow: any[], errors: string[]): void {
    for (const step of flow) {
      if (
        step.connect &&
        !this.ontology.connectionTypes.includes(step.connect.type)
      ) {
        errors.push(
          `Invalid connection type: ${step.connect.type}. Must be one of 24 consolidated types: ${this.ontology.connectionTypes.join(", ")}`
        );
      }
    }
  }

  private validateEvents(flow: any[], errors: string[]): void {
    for (const step of flow) {
      if (step.event && !this.ontology.eventTypes.includes(step.event.type)) {
        errors.push(
          `Invalid event type: ${step.event.type}. Must be one of 38 consolidated types: ${this.ontology.eventTypes.join(", ")}`
        );
      }
    }
  }

  private validateMetadata(flow: any[], errors: string[]): void {
    const consolidatedTypes = {
      payment: ["subscription", "purchase", "tip", "refund"],
      livestream: ["hosted", "attended", "moderated", "banned_from"],
      notification: ["sent", "received", "read"],
      referral: ["referred", "earned_from"],
      content: ["created", "published", "edited", "deleted", "viewed", "shared"],
    };

    for (const step of flow) {
      // Validate connection metadata
      if (step.connect && step.connect.metadata) {
        const type = step.connect.type;
        if (consolidatedTypes[type]) {
          const metadataType = step.connect.metadata[`${type}Type`];
          if (
            metadataType &&
            !consolidatedTypes[type].includes(metadataType)
          ) {
            errors.push(
              `Invalid ${type}Type: ${metadataType}. Must be one of: ${consolidatedTypes[type].join(", ")}`
            );
          }
        }
      }

      // Validate event metadata
      if (step.event && step.event.metadata) {
        const type = step.event.type;
        if (consolidatedTypes[type]) {
          const metadataType = step.event.metadata[`${type}Type`];
          if (
            metadataType &&
            !consolidatedTypes[type].includes(metadataType)
          ) {
            errors.push(
              `Invalid ${type}Type: ${metadataType}. Must be one of: ${consolidatedTypes[type].join(", ")}`
            );
          }
        }
      }
    }
  }
}

// ============================================================================
// USAGE EXAMPLE - Full Ontology with 24+38 Consolidated Types
// ============================================================================

/**
 * Complete ontology with hybrid type strategy
 */
const FULL_ONTOLOGY = {
  entityTypes: [
    "creator",
    "ai_clone",
    "token",
    "audience_member",
    "content",
    "course",
    "livestream",
    "subscription",
    "notification",
  ],

  // 25 HYBRID CONNECTION TYPES
  connectionTypes: [
    // Specific Types (18)
    "owns", "created_by",
    "clone_of", "trained_on", "powers",
    "authored", "generated_by", "published_to", "part_of", "references",
    "member_of", "following", "moderates", "participated_in",
    "manages", "reports_to", "collaborates_with",
    "holds_tokens", "staked_in", "earned_from",
    "purchased", "enrolled_in", "completed", "teaching",
    // Consolidated Types (7) - use metadata
    "transacted",     // metadata.transactionType + protocol
    "notified",       // metadata.channel + notificationType
    "referred",       // metadata.referralType
    "communicated",   // metadata.protocol + messageType
    "delegated",      // metadata.protocol + taskType
    "approved",       // metadata.approvalType + protocol
    "fulfilled",      // metadata.fulfillmentType + protocol
  ],

  // 35 HYBRID EVENT TYPES
  eventTypes: [
    // Specific Types (24)
    "entity_created", "entity_updated", "entity_deleted", "entity_archived",
    "user_registered", "user_verified", "user_login", "user_logout", "profile_updated",
    "clone_created", "clone_updated", "voice_cloned", "appearance_cloned",
    "agent_created", "agent_executed", "agent_completed", "agent_failed",
    "token_created", "token_minted", "token_burned", "tokens_purchased", "tokens_staked", "tokens_unstaked", "tokens_transferred",
    "course_created", "course_enrolled", "lesson_completed", "course_completed", "certificate_earned",
    "metric_calculated", "insight_generated", "prediction_made", "optimization_applied", "report_generated",
    // Consolidated Types (11) - use metadata
    "content_event",        // metadata.action + protocol
    "payment_event",        // metadata.status + protocol
    "subscription_event",   // metadata.action
    "commerce_event",       // metadata.eventType + protocol
    "livestream_event",     // metadata.status + metadata.action
    "notification_event",   // metadata.channel + deliveryStatus
    "referral_event",       // metadata.action
    "communication_event",  // metadata.protocol + messageType
    "task_event",          // metadata.action + protocol
    "mandate_event",       // metadata.mandateType + protocol
    "price_event",         // metadata.action
  ],
};

// 1. Define feature in DSL
const myFeature = livestreamWithNotificationsDSL;

// 2. Validate against full ontology
const validator = new ONEValidator(FULL_ONTOLOGY);

const validation = validator.validate(myFeature);
if (!validation.valid) {
  console.error("DSL validation failed:", validation.errors);
  process.exit(1);
}

// 3. Compile to TypeScript with Plain Convex
const compiler = new ONECompiler();
const generatedCode = compiler.compile(myFeature);

// 4. Write to file
// fs.writeFileSync("convex/features/startLivestream.ts", generatedCode);

console.log("Generated Plain Convex code:");
console.log(generatedCode);

/**
 * EXAMPLE OUTPUT - What the compiler generates:
 *
 * // Generated from ONE DSL
 * // Compiles to Plain Convex (NO Convex Ents) + Effect.ts
 * import { Effect } from "effect";
 * import { mutation } from "./_generated/server";
 * import { v } from "convex/values";
 *
 * export const startLivestreamWithNotifications = mutation({
 *   args: {
 *     hostId: v.id('entities'),
 *     title: v.string(),
 *     description: v.string()
 *   },
 *   handler: async (ctx, args) => {
 *     return await Effect.runPromise(
 *       Effect.gen(function* () {
 *         // Create entity using plain Convex ctx.db.insert
 *         const livestreamId = yield* Effect.promise(() =>
 *           ctx.db.insert("entities", {
 *             type: "livestream",
 *             name: args.title,
 *             properties: { ... },
 *             ...
 *           })
 *         );
 *
 *         // Create connection with metadata
 *         yield* Effect.promise(() =>
 *           ctx.db.insert("connections", {
 *             fromEntityId: args.hostId,
 *             toEntityId: livestreamId,
 *             relationshipType: "livestream",
 *             metadata: {
 *               livestreamType: "hosted",
 *               ...
 *             }
 *           })
 *         );
 *         // ... rest of generated code
 *       })
 *     );
 *   }
 * });
 */

// ============================================================================
// DSL SYNTAX SUMMARY - Plain English vs Technical DSL
// ============================================================================

/**
 * The ONE DSL supports TWO syntax styles:
 *
 * 1. PLAIN ENGLISH DSL (Non-technical users)
 *    - Natural language commands
 *    - Example: "Create a token named 'MyToken' with supply 1000000"
 *    - Example: "When user purchases tokens, send them a confirmation email"
 *
 * 2. TECHNICAL DSL (Developers and AI agents)
 *    - Structured declarative syntax (shown in this file)
 *    - Type-safe with validation
 *    - Compiles to Effect.ts + Plain Convex
 *
 * Both syntaxes are maintained separately but compile to the same output.
 *
 * WHY TWO SYNTAXES?
 * - Plain English: For product managers, designers, non-technical stakeholders
 * - Technical DSL: For developers, AI agents who need precision and type safety
 *
 * CURRENT STATUS:
 * - Technical DSL: Fully specified in this file
 * - Plain English DSL: Defined in separate documentation
 * - Both will be implemented in the compiler
 */

// ============================================================================
// KEY ARCHITECTURAL DECISIONS
// ============================================================================

/**
 * 1. PLAIN CONVEX (NO CONVEX ENTS)
 *    - Uses defineTable() not ent()
 *    - Manual relationship queries
 *    - More explicit, easier for AI agents
 *    - Better for metadata-based patterns
 *
 * 2. 25 HYBRID CONNECTION TYPES
 *    - 18 specific semantic types for core domain
 *    - 7 consolidated types with metadata variants
 *    - Protocol-agnostic via metadata.protocol
 *    - Simpler queries, better AI comprehension
 *
 * 3. 35 HYBRID EVENT TYPES
 *    - 24 specific types for core domain events
 *    - 11 consolidated types with metadata variants
 *    - Protocol identification via metadata
 *    - Balance between specificity and flexibility
 *
 * 4. METADATA-BASED PATTERNS
 *    - Consolidated types use metadata for variants
 *    - Protocol identity in metadata.protocol
 *    - Reduces schema complexity
 *    - Maintains queryability
 *    - Flexible for future protocols
 *
 * 5. EFFECT.TS INTEGRATION
 *    - All compiled code uses Effect.ts
 *    - Composable, type-safe operations
 *    - Standardized error handling
 *    - Better testability
 *
 * 6. VALIDATOR WITH METADATA CHECKING
 *    - Validates base types (24 connections, 38 events)
 *    - Validates metadata patterns for consolidated types
 *    - Ensures type safety before compilation
 *    - Prevents invalid metadata.typeType values
 */

// ============================================================================
// NEXT STEPS FOR IMPLEMENTATION
// ============================================================================

/**
 * 1. Implement Plain English parser
 *    - Parse natural language to Technical DSL AST
 *    - Use LLM for intent extraction
 *    - Map to Technical DSL constructs
 *
 * 2. Complete compiler implementation
 *    - Add support for all DSL primitives
 *    - Generate Effect.ts code
 *    - Generate plain Convex mutations/queries
 *    - Add error handling and retry logic
 *
 * 3. Add schema generator
 *    - Generate Convex schema from DSL features
 *    - Create indices based on query patterns
 *    - Generate TypeScript types
 *
 * 4. Build testing infrastructure
 *    - DSL validator tests
 *    - Compiler output tests
 *    - Generated code integration tests
 *
 * 5. Create developer tools
 *    - VS Code extension for DSL syntax
 *    - Real-time validation
 *    - Auto-completion
 *    - DSL playground
 */