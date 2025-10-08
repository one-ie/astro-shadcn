// convex/workflows/creatorLaunch.ts
// ============================================================================
// COMPLETE FLOW: Creator uploads content → AI clone created → Business launched
// ============================================================================

import { Effect } from "effect";
import { confect } from "confect";
import { AICloneService } from "../services/aiClone";
import { AgentOrchestrator } from "../services/agents";
import { TokenService } from "../services/token";
import { ContentService } from "../services/content";

// ============================================================================
// FLOW 1: CREATOR ONBOARDING
// ============================================================================

export const onboardCreator = confect.mutation({
  args: {
    email: v.string(),
    name: v.string(),
    niche: v.array(v.string()),
    videoUrls: v.array(v.string()),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      yield* Effect.logInfo("Starting creator onboarding", { email: args.email });

      // Step 1: Create creator entity
      const creatorId = yield* Effect.tryPromise(() =>
        ctx.db.insert("entities", {
          type: "creator",
          name: args.name,
          properties: {
            email: args.email,
            username: args.email.split("@")[0],
            displayName: args.name,
            niche: args.niche,
            totalFollowers: 0,
            totalContent: 0,
            totalRevenue: 0,
          },
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );

      // Step 2: Process uploaded videos (parallel)
      const contentIds = yield* Effect.all(
        args.videoUrls.map((url) =>
          Effect.gen(function* () {
            const contentService = yield* ContentService;
            return yield* contentService.processVideo({
              creatorId,
              url,
              source: "onboarding",
            });
          })
        ),
        { concurrency: 3 } // Process 3 videos at a time
      );

      // Step 3: Build knowledge base from content
      const knowledgeBaseId = yield* Effect.gen(function* () {
        const contentService = yield* ContentService;
        return yield* contentService.buildKnowledgeBase({
          creatorId,
          contentIds,
        });
      });

      // Step 4: Create AI clone (voice + personality)
      const clone = yield* Effect.gen(function* () {
        const cloneService = yield* AICloneService;
        return yield* cloneService.createClone(creatorId);
      }).pipe(
        Effect.retry({ times: 3, delay: "5 seconds" }),
        Effect.timeout("5 minutes")
      );

      // Step 5: Launch business agents
      const business = yield* Effect.gen(function* () {
        const orchestrator = yield* AgentOrchestrator;
        return yield* orchestrator.launchCreator(creatorId);
      });

      // Step 6: Deploy creator token
      const token = yield* Effect.gen(function* () {
        const tokenService = yield* TokenService;
        return yield* tokenService.deployToken({
          creatorId,
          name: `${args.name} Token`,
          symbol: args.name.substring(0, 4).toUpperCase(),
          totalSupply: 10_000_000,
        });
      }).pipe(
        Effect.catchTag("BlockchainError", (error) => {
          // Non-critical: can deploy token later
          yield* Effect.logWarning("Token deployment failed, skipping", { error });
          return Effect.succeed(null);
        })
      );

      // Step 7: Generate beautiful creator website
      const website = yield* Effect.gen(function* () {
        const designAgent = business.agents.find((a) => a.type === "design_agent");
        return yield* executeAgent(designAgent, {
          task: "design_website",
          context: {
            creatorName: args.name,
            niche: args.niche,
            cloneId: clone.cloneId,
          },
        });
      });

      // Step 8: Record onboarding event
      yield* Effect.tryPromise(() =>
        ctx.db.insert("events", {
          entityId: creatorId,
          eventType: "creator_created",
          timestamp: Date.now(),
          actorType: "system",
          metadata: {
            contentProcessed: contentIds.length,
            cloneId: clone.cloneId,
            tokenId: token?.tokenId,
            websiteUrl: website.url,
          },
        })
      );

      yield* Effect.logInfo("Creator onboarding completed", {
        creatorId,
        cloneId: clone.cloneId,
        tokenId: token?.tokenId,
      });

      return {
        creatorId,
        clone,
        business,
        token,
        website,
      };
    }).pipe(
      Effect.withSpan("onboardCreator", { attributes: { email: args.email } })
    ),
});

// ============================================================================
// FLOW 2: AUDIENCE INTERACTION WITH AI CLONE
// ============================================================================

export const chatWithClone = confect.mutation({
  args: {
    cloneId: v.id("entities"),
    userId: v.id("entities"),
    message: v.string(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const cloneService = yield* AICloneService;
      const tokenService = yield* TokenService;

      // Step 1: Check if user has access (token gate)
      const hasAccess = yield* Effect.gen(function* () {
        const connection = yield* Effect.tryPromise(() =>
          ctx.db
            .query("connections")
            .withIndex("from_type", (q) =>
              q.eq("fromEntityId", args.userId).eq("relationshipType", "holds_tokens")
            )
            .first()
        );

        if (!connection) {
          return false;
        }

        return connection.metadata.balance > 0;
      });

      if (!hasAccess) {
        return yield* Effect.fail({
          _tag: "AccessDeniedError",
          message: "Purchase tokens to chat with AI clone",
        });
      }

      // Step 2: Generate AI response
      const response = yield* cloneService.interact(
        args.cloneId,
        args.message,
        args.userId
      );

      // Step 3: Reward user for engagement (earn tokens)
      const tokensEarned = 10; // 10 tokens per message
      yield* tokenService.rewardTokens({
        userId: args.userId,
        amount: tokensEarned,
        reason: "chat_engagement",
      });

      // Step 4: Check if this triggers achievement
      const totalInteractions = yield* Effect.gen(function* () {
        const events = yield* Effect.tryPromise(() =>
          ctx.db
            .query("events")
            .withIndex("entity_type_time")
            .filter((q) =>
              q.and(
                q.eq(q.field("entityId"), args.userId),
                q.eq(q.field("eventType"), "clone_interaction")
              )
            )
            .collect()
        );
        return events.length;
      });

      // Unlock achievements at milestones
      if ([10, 50, 100].includes(totalInteractions)) {
        yield* Effect.tryPromise(() =>
          ctx.db.insert("events", {
            entityId: args.userId,
            eventType: "achievement_unlocked",
            timestamp: Date.now(),
            actorType: "system",
            metadata: {
              achievement: `${totalInteractions}_interactions`,
              bonusTokens: totalInteractions * 5,
            },
          })
        );
      }

      return {
        response,
        tokensEarned,
        totalInteractions,
      };
    }),
});

// ============================================================================
// FLOW 3: USER CREATES CONTENT (UGC) → VIRAL LOOP
// ============================================================================

export const createUGC = confect.mutation({
  args: {
    userId: v.id("entities"),
    creatorId: v.id("entities"),
    contentType: v.union(v.literal("video"), v.literal("post"), v.literal("meme")),
    content: v.string(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const contentService = yield* ContentService;
      const tokenService = yield* TokenService;

      // Step 1: Create UGC entity
      const ugcId = yield* Effect.tryPromise(() =>
        ctx.db.insert("entities", {
          type: args.contentType === "post" ? "social_post" : "video",
          name: `UGC by user`,
          properties: {
            body: args.content,
            format: args.contentType,
            views: 0,
            likes: 0,
            shares: 0,
            generatedBy: "user",
          },
          status: "published",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );

      // Step 2: Link UGC to creator and user
      yield* Effect.all([
        Effect.tryPromise(() =>
          ctx.db.insert("connections", {
            fromEntityId: args.userId,
            toEntityId: ugcId,
            relationshipType: "authored",
            createdAt: Date.now(),
          })
        ),
        Effect.tryPromise(() =>
          ctx.db.insert("connections", {
            fromEntityId: ugcId,
            toEntityId: args.creatorId,
            relationshipType: "references",
            createdAt: Date.now(),
          })
        ),
      ]);

      // Step 3: Reward creator for UGC creation (big reward)
      const tokensEarned = 100;
      yield* tokenService.rewardTokens({
        userId: args.userId,
        amount: tokensEarned,
        reason: "ugc_created",
      });

      // Step 4: AI analyzes UGC quality
      const quality = yield* Effect.gen(function* () {
        const intelligenceService = yield* IntelligenceService;
        return yield* intelligenceService.analyzeContent({
          contentId: ugcId,
          metrics: ["engagement_potential", "brand_alignment", "virality_score"],
        });
      });

      // Step 5: Feature high-quality UGC (amplification)
      if (quality.viralityScore > 0.8) {
        yield* Effect.gen(function* () {
          const marketingAgent = yield* getAgent(args.creatorId, "marketing_agent");
          yield* executeAgent(marketingAgent, {
            task: "amplify_ugc",
            context: { ugcId, qualityScore: quality.viralityScore },
          });
        });

        // Bonus tokens for viral content
        yield* tokenService.rewardTokens({
          userId: args.userId,
          amount: 500,
          reason: "viral_content_bonus",
        });
      }

      // Step 6: Trigger viral loop (if shared)
      const viralShare = yield* Effect.gen(function* () {
        // Generate unique referral link
        const referralCode = `${args.userId}-${ugcId}`.slice(0, 12);

        yield* Effect.tryPromise(() =>
          ctx.db.insert("events", {
            entityId: ugcId,
            eventType: "content_shared",
            timestamp: Date.now(),
            actorType: "user",
            actorId: args.userId,
            metadata: {
              referralCode,
              platform: "all",
            },
          })
        );

        return {
          shareUrl: `https://one.ie/share/${referralCode}`,
          referralCode,
        };
      });

      return {
        ugcId,
        tokensEarned,
        quality,
        viralShare,
      };
    }),
});

// ============================================================================
// FLOW 4: AUTOMATED DAILY OPERATIONS
// ============================================================================

export const runDailyOperations = confect.action({
  args: { creatorId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      yield* Effect.logInfo("Running daily operations", {
        creatorId: args.creatorId,
      });

      // === MORNING: ANALYTICS & PLANNING ===
      const insights = yield* Effect.gen(function* () {
        const intelligenceAgent = yield* getAgent(
          args.creatorId,
          "intelligence_agent"
        );

        return yield* executeAgent(intelligenceAgent, {
          task: "daily_analytics",
          context: { date: new Date().toISOString() },
        });
      });

      // === MORNING: STRATEGY ADJUSTMENT ===
      const strategy = yield* Effect.gen(function* () {
        const strategyAgent = yield* getAgent(args.creatorId, "strategy_agent");

        return yield* executeAgent(strategyAgent, {
          task: "adjust_strategy",
          context: insights,
        });
      });

      // === MORNING: CONTENT PLANNING ===
      const contentPlan = yield* Effect.gen(function* () {
        const marketingAgent = yield* getAgent(args.creatorId, "marketing_agent");

        return yield* executeAgent(marketingAgent, {
          task: "create_content_calendar",
          context: { insights, strategy },
        });
      });

      // === AFTERNOON: CONTENT GENERATION (PARALLEL) ===
      const content = yield* Effect.all(
        contentPlan.posts.map((post) =>
          Effect.gen(function* () {
            const cloneService = yield* AICloneService;
            const clone = yield* getClone(args.creatorId);

            // AI clone generates content
            const generated = yield* cloneService.generateContent({
              cloneId: clone.cloneId,
              type: post.type,
              topic: post.topic,
              platform: post.platform,
            });

            // Design agent creates visuals
            const designAgent = yield* getAgent(args.creatorId, "design_agent");
            const visuals = yield* executeAgent(designAgent, {
              task: "create_visual",
              context: { content: generated.content },
            });

            // Save content entity
            const contentId = yield* Effect.tryPromise(() =>
              ctx.db.insert("entities", {
                type: "social_post",
                name: post.topic,
                properties: {
                  body: generated.content,
                  imageUrl: visuals.url,
                  platform: post.platform,
                  scheduledFor: post.scheduledTime,
                  generatedBy: "ai",
                },
                status: "draft",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            return { contentId, platform: post.platform };
          })
        ),
        { concurrency: 5 }
      );

      // === EVENING: DISTRIBUTION ===
      yield* Effect.all(
        content.map((item) =>
          Effect.gen(function* () {
            const marketingAgent = yield* getAgent(
              args.creatorId,
              "marketing_agent"
            );

            yield* executeAgent(marketingAgent, {
              task: "publish_content",
              context: item,
            });

            // Update status
            yield* Effect.tryPromise(() =>
              ctx.db.patch(item.contentId, { status: "published" })
            );
          })
        ),
        { concurrency: 3 }
      );

      // === NIGHT: COMMUNITY ENGAGEMENT ===
      const engagement = yield* Effect.gen(function* () {
        const serviceAgent = yield* getAgent(args.creatorId, "service_agent");
        const clone = yield* getClone(args.creatorId);

        // AI clone responds to community messages
        const messages = yield* Effect.tryPromise(() =>
          ctx.db
            .query("entities")
            .withIndex("by_type", (q) => q.eq("type", "message"))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .take(50)
        );

        return yield* Effect.all(
          messages.map((msg) =>
            Effect.gen(function* () {
              const cloneService = yield* AICloneService;
              const response = yield* cloneService.interact(
                clone.cloneId,
                msg.properties.body,
                msg.properties.fromUserId
              );

              yield* Effect.tryPromise(() =>
                ctx.db.insert("entities", {
                  type: "message",
                  name: "AI Clone Response",
                  properties: {
                    body: response,
                    fromClone: true,
                    inReplyTo: msg._id,
                  },
                  status: "sent",
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                })
              );
            })
          ),
          { concurrency: 10 }
        );
      });

      // === FINAL: FINANCIAL REPORTING ===
      const financials = yield* Effect.gen(function* () {
        const financeAgent = yield* getAgent(args.creatorId, "finance_agent");

        return yield* executeAgent(financeAgent, {
          task: "daily_report",
          context: { insights, content: content.length, engagement },
        });
      });

      yield* Effect.logInfo("Daily operations completed", {
        contentCreated: content.length,
        messagesResponded: engagement.length,
        revenue: financials.dailyRevenue,
      });

      return {
        insights,
        strategy,
        contentCreated: content.length,
        engagement: engagement.length,
        financials,
      };
    }).pipe(
      Effect.timeout("2 hours"), // Don't let daily ops run forever
      Effect.retry({ times: 2, delay: "10 minutes" })
    ),
});

// ============================================================================
// FLOW 5: TOKEN APPRECIATION CYCLE
// ============================================================================

export const updateTokenEconomics = confect.action({
  args: { tokenId: v.id("entities") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      // Step 1: Calculate current metrics
      const metrics = yield* Effect.gen(function* () {
        const [holders, volume, burns] = yield* Effect.all([
          // Total unique holders
          Effect.tryPromise(() =>
            ctx.db
              .query("connections")
              .withIndex("to_type", (q) =>
                q
                  .eq("toEntityId", args.tokenId)
                  .eq("relationshipType", "holds_tokens")
              )
              .collect()
          ),

          // 24h transaction volume
          Effect.tryPromise(() =>
            ctx.db
              .query("events")
              .withIndex("entity_type_time")
              .filter((q) =>
                q.and(
                  q.eq(q.field("entityId"), args.tokenId),
                  q.eq(q.field("eventType"), "tokens_purchased"),
                  q.gte(q.field("timestamp"), Date.now() - 24 * 60 * 60 * 1000)
                )
              )
              .collect()
          ),

          // Total burned
          Effect.tryPromise(() =>
            ctx.db
              .query("events")
              .withIndex("entity_type_time")
              .filter((q) =>
                q.and(
                  q.eq(q.field("entityId"), args.tokenId),
                  q.eq(q.field("eventType"), "tokens_burned")
                )
              )
              .collect()
          ),
        ]);

        return {
          holders: holders.length,
          volume24h: volume.reduce((sum, e) => sum + e.metadata.amount, 0),
          totalBurned: burns.reduce((sum, e) => sum + e.metadata.amount, 0),
        };
      });

      // Step 2: Calculate supply and price
      const economics = yield* Effect.gen(function* () {
        const token = yield* Effect.tryPromise(() =>
          ctx.db.get(args.tokenId)
        );

        const circulatingSupply =
          token.properties.totalSupply - metrics.totalBurned;

        // Simple price model: demand / supply
        const price = (metrics.volume24h * 0.01) / circulatingSupply;

        return {
          totalSupply: token.properties.totalSupply,
          circulatingSupply,
          price,
          marketCap: price * circulatingSupply,
        };
      });

      // Step 3: Update token entity
      yield* Effect.tryPromise(() =>
        ctx.db.patch(args.tokenId, {
          properties: {
            ...economics,
            holders: metrics.holders,
            transactions24h: metrics.volume24h,
          },
          updatedAt: Date.now(),
        })
      );

      // Step 4: Record analytics
      yield* Effect.tryPromise(() =>
        ctx.db.insert("analytics", {
          entityId: args.tokenId,
          metricType: "token_price",
          period: "daily",
          value: economics,
          timestamp: Date.now(),
        })
      );

      yield* Effect.logInfo("Token economics updated", {
        price: economics.price,
        holders: metrics.holders,
      });

      return economics;
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getAgent = (creatorId: Id<"entities">, agentType: string) =>
  Effect.gen(function* () {
    const agent = yield* Effect.tryPromise(() =>
      ctx.db
        .query("connections")
        .withIndex("from_type")
        .filter((q) =>
          q.and(
            q.eq(q.field("fromEntityId"), creatorId),
            q.eq(q.field("relationshipType"), "owns")
          )
        )
        .collect()
        .then((conns) => conns.find((c) => c.toEntity.type === agentType))
    );

    if (!agent) {
      return yield* Effect.fail({
        _tag: "AgentNotFoundError",
        agentType,
      });
    }

    return agent.toEntity;
  });

const getClone = (creatorId: Id<"entities">) =>
  Effect.gen(function* () {
    const clone = yield* Effect.tryPromise(() =>
      ctx.db
        .query("connections")
        .withIndex("from_type")
        .filter((q) =>
          q.and(
            q.eq(q.field("fromEntityId"), creatorId),
            q.eq(q.field("relationshipType"), "owns")
          )
        )
        .collect()
        .then((conns) => conns.find((c) => c.toEntity.type === "ai_clone"))
    );

    if (!clone) {
      return yield* Effect.fail({
        _tag: "CloneNotFoundError",
        creatorId,
      });
    }

    return clone.toEntity;
  });

const executeAgent = (agent: Entity, config: { task: string; context: any }) =>
  Effect.gen(function* () {
    const openai = yield* OpenAIProvider;

    const result = yield* openai.chat({
      systemPrompt: agent.properties.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Task: ${config.task}\n\nContext: ${JSON.stringify(config.context)}`,
        },
      ],
    });

    return JSON.parse(result.content);
  });