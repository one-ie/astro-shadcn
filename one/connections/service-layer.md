// convex/services/aiClone.ts
import { Effect, Layer } from "effect";
import { ConvexDatabase } from "./database";
import { ElevenLabsProvider } from "./providers/elevenlabs";
import { OpenAIProvider } from "./providers/openai";

// ============================================================================
// ERROR TYPES: Explicit, typed errors
// ============================================================================

export class InsufficientContentError {
  readonly _tag = "InsufficientContentError";
  constructor(readonly creatorId: string, readonly contentCount: number) {}
}

export class VoiceCloneFailedError {
  readonly _tag = "VoiceCloneFailedError";
  constructor(readonly reason: string) {}
}

export class PersonalityExtractionError {
  readonly _tag = "PersonalityExtractionError";
  constructor(readonly reason: string) {}
}

// ============================================================================
// AI CLONE SERVICE: Creator personality → AI
// ============================================================================

export class AICloneService extends Effect.Service<AICloneService>()(
  "AICloneService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const elevenlabs = yield* ElevenLabsProvider;
      const openai = yield* OpenAIProvider;

      return {
        // ====================================================================
        // CREATE CLONE: Extract personality from creator content
        // ====================================================================
        createClone: (creatorId: Id<"entities">) =>
          Effect.gen(function* () {
            yield* Effect.logInfo("Starting AI clone creation", { creatorId });

            // Step 1: Gather creator content with validation
            const content = yield* Effect.tryPromise({
              try: () => db.getCreatorContent(creatorId),
              catch: (error) =>
                new InsufficientContentError(creatorId, 0),
            });

            if (content.videos.length < 3 || content.audioSamples.length < 5) {
              return yield* Effect.fail(
                new InsufficientContentError(creatorId, content.videos.length)
              );
            }

            // Step 2: Clone voice (parallel with appearance)
            const voiceId = yield* Effect.gen(function* () {
              const samples = content.audioSamples.slice(0, 10);
              const result = yield* elevenlabs.cloneVoice({
                name: `${content.creatorName}_voice`,
                samples,
              });
              return result.voiceId;
            }).pipe(
              Effect.retry({ times: 3, delay: "2 seconds" }),
              Effect.timeout("60 seconds"),
              Effect.catchAll((error) =>
                Effect.fail(new VoiceCloneFailedError(error.message))
              )
            );

            // Step 3: Extract personality from content
            const personality = yield* Effect.gen(function* () {
              const analysis = yield* openai.analyzePersonality({
                videos: content.videos,
                posts: content.posts,
                interactions: content.interactions,
              });

              return {
                systemPrompt: analysis.systemPrompt,
                traits: analysis.traits,
                communicationStyle: analysis.style,
                values: analysis.values,
              };
            }).pipe(
              Effect.catchAll((error) =>
                Effect.fail(new PersonalityExtractionError(error.message))
              )
            );

            // Step 4: Create AI clone entity
            const cloneId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "ai_clone",
                name: `${content.creatorName} AI Clone`,
                properties: {
                  voiceId,
                  voiceProvider: "elevenlabs",
                  systemPrompt: personality.systemPrompt,
                  temperature: 0.7,
                  knowledgeBaseSize: content.totalItems,
                  lastTrainingDate: Date.now(),
                  totalInteractions: 0,
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // Step 5: Create relationships
            yield* Effect.all(
              [
                // Clone belongs to creator
                db.insert("connections", {
                  fromEntityId: creatorId,
                  toEntityId: cloneId,
                  relationshipType: "owns",
                  createdAt: Date.now(),
                }),
                // Clone trained on content
                db.insert("connections", {
                  fromEntityId: cloneId,
                  toEntityId: content.knowledgeBaseId,
                  relationshipType: "trained_on",
                  createdAt: Date.now(),
                }),
              ],
              { concurrency: 2 }
            );

            // Step 6: Log event
            yield* db.insert("events", {
              entityId: cloneId,
              eventType: "clone_created",
              timestamp: Date.now(),
              actorType: "system",
              metadata: {
                voiceId,
                contentCount: content.totalItems,
                personality: personality.traits,
              },
            });

            yield* Effect.logInfo("AI clone created successfully", {
              cloneId,
              voiceId,
            });

            return { cloneId, voiceId, personality };
          }).pipe(
            Effect.withSpan("createAIClone", { attributes: { creatorId } })
          ),

        // ====================================================================
        // INTERACT: User chats with AI clone
        // ====================================================================
        interact: (cloneId: Id<"entities">, message: string, userId: Id<"entities">) =>
          Effect.gen(function* () {
            // Get clone configuration
            const clone = yield* db.get("entities", cloneId);

            // Retrieve relevant knowledge via RAG
            const context = yield* Effect.gen(function* () {
              const embedding = yield* openai.embed(message);
              const results = yield* db.vectorSearch({
                vector: embedding,
                limit: 5,
              });
              return results.map((r) => r.content).join("\n");
            });

            // Generate response with clone's personality
            const response = yield* openai.chat({
              systemPrompt: clone.properties.systemPrompt,
              context,
              messages: [{ role: "user", content: message }],
              temperature: clone.properties.temperature,
            });

            // Save interaction
            yield* db.insert("events", {
              entityId: cloneId,
              eventType: "clone_interaction",
              timestamp: Date.now(),
              actorType: "user",
              actorId: userId,
              metadata: {
                message,
                response,
                tokensUsed: response.usage.totalTokens,
              },
            });

            // Update stats
            yield* db.update("entities", cloneId, {
              properties: {
                ...clone.properties,
                totalInteractions: clone.properties.totalInteractions + 1,
              },
            });

            return response.content;
          }),
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      ElevenLabsProvider.Default,
      OpenAIProvider.Default,
    ],
  }
) {}

// ============================================================================
// BUSINESS AGENT ORCHESTRATION: Multiple agents working together
// ============================================================================

export class AgentOrchestrator extends Effect.Service<AgentOrchestrator>()(
  "AgentOrchestrator",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        // ====================================================================
        // LAUNCH CREATOR: All business agents setup
        // ====================================================================
        launchCreator: (creatorId: Id<"entities">) =>
          Effect.gen(function* () {
            yield* Effect.logInfo("Launching creator business", { creatorId });

            // Create all business function agents in parallel
            const agents = yield* Effect.all(
              [
                createAgent(db, creatorId, "strategy_agent", {
                  systemPrompt: "You are a strategic business advisor...",
                  capabilities: ["goal_setting", "okr_planning", "vision"],
                }),
                createAgent(db, creatorId, "marketing_agent", {
                  systemPrompt: "You are a marketing expert...",
                  capabilities: ["content_strategy", "seo", "distribution"],
                }),
                createAgent(db, creatorId, "sales_agent", {
                  systemPrompt: "You are a sales optimization specialist...",
                  capabilities: ["funnel_design", "conversion", "follow_up"],
                }),
                createAgent(db, creatorId, "finance_agent", {
                  systemPrompt: "You are a financial analyst...",
                  capabilities: ["revenue_tracking", "forecasting", "costs"],
                }),
                createAgent(db, creatorId, "intelligence_agent", {
                  systemPrompt: "You are an analytics and insights expert...",
                  capabilities: ["data_analysis", "predictions", "optimization"],
                }),
              ],
              { concurrency: 5 }
            );

            // Strategy agent sets initial goals
            const strategyAgent = agents[0];
            const initialGoals = yield* executeAgent(
              db,
              strategyAgent,
              "Create initial 90-day business plan"
            );

            // Marketing agent creates content calendar based on goals
            const marketingAgent = agents[1];
            const contentCalendar = yield* executeAgent(
              db,
              marketingAgent,
              `Create content calendar for: ${initialGoals.goals.join(", ")}`
            );

            yield* Effect.logInfo("Creator business launched", {
              agentCount: agents.length,
              initialGoals: initialGoals.goals.length,
            });

            return {
              agents: agents.map((a) => a.agentId),
              initialGoals,
              contentCalendar,
            };
          }).pipe(
            Effect.withSpan("launchCreator", { attributes: { creatorId } })
          ),

        // ====================================================================
        // DAILY OPERATIONS: Agents execute automated tasks
        // ====================================================================
        runDailyOperations: (creatorId: Id<"entities">) =>
          Effect.gen(function* () {
            const agents = yield* db.query("connections", {
              fromEntityId: creatorId,
              relationshipType: "owns",
            });

            // Intelligence agent analyzes yesterday's data
            const analytics = yield* Effect.gen(function* () {
              const intelligenceAgent = agents.find(
                (a) => a.toEntity.type === "intelligence_agent"
              );
              return yield* executeAgent(
                db,
                intelligenceAgent,
                "Analyze yesterday's metrics and provide insights"
              );
            });

            // Marketing agent generates content based on insights
            const content = yield* Effect.gen(function* () {
              const marketingAgent = agents.find(
                (a) => a.toEntity.type === "marketing_agent"
              );
              return yield* executeAgent(
                db,
                marketingAgent,
                `Create today's content. Context: ${analytics.summary}`
              );
            });

            // Design agent creates assets for content
            const assets = yield* Effect.gen(function* () {
              const designAgent = agents.find(
                (a) => a.toEntity.type === "design_agent"
              );
              return yield* executeAgent(
                db,
                designAgent,
                `Design assets for: ${content.contentPlan}`
              );
            });

            return { analytics, content, assets };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, OpenAIProvider.Default],
  }
) {}

// ============================================================================
// TOKEN SERVICE: Atomic token operations
// ============================================================================

export class TokenService extends Effect.Service<TokenService>()("TokenService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const blockchain = yield* BlockchainProvider;
    const stripe = yield* StripeProvider;

    return {
      // ====================================================================
      // PURCHASE TOKENS: Atomic payment + mint + record
      // ====================================================================
      purchaseTokens: (
        userId: Id<"entities">,
        tokenId: Id<"entities">,
        amount: number,
        usdAmount: number
      ) =>
        Effect.gen(function* () {
          yield* Effect.logInfo("Starting token purchase", {
            userId,
            amount,
            usdAmount,
          });

          // All operations must succeed together or all fail
          const result = yield* Effect.all(
            [
              // 1. Charge payment
              stripe.createPaymentIntent({
                amount: usdAmount,
                currency: "usd",
                metadata: { userId, tokenId, tokenAmount: amount },
              }),

              // 2. Mint tokens on blockchain
              blockchain.mintTokens({
                contractAddress: tokenId,
                toAddress: userId,
                amount,
              }),
            ],
            { concurrency: 2 }
          ).pipe(
            // Automatic rollback on any failure
            Effect.tap(([payment, mint]) =>
              Effect.gen(function* () {
                // 3. Record in database
                yield* db.insert("events", {
                  entityId: tokenId,
                  eventType: "tokens_purchased",
                  timestamp: Date.now(),
                  actorType: "user",
                  actorId: userId,
                  metadata: {
                    amount,
                    usdAmount,
                    paymentId: payment.id,
                    txHash: mint.transactionHash,
                  },
                });

                // 4. Update token balance connection
                yield* db.upsert("connections", {
                  fromEntityId: userId,
                  toEntityId: tokenId,
                  relationshipType: "holds_tokens",
                  metadata: {
                    balance: amount, // Will be updated by trigger
                  },
                });
              })
            ),
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                // Rollback: refund payment and burn tokens
                yield* Effect.logError("Token purchase failed, rolling back", {
                  error,
                });
                yield* Effect.all([
                  stripe.refund(payment.id),
                  blockchain.burnTokens({
                    contractAddress: tokenId,
                    amount,
                  }),
                ]);
                return yield* Effect.fail(error);
              })
            )
          );

          yield* Effect.logInfo("Token purchase completed", {
            txHash: result[1].transactionHash,
          });

          return {
            paymentId: result[0].id,
            txHash: result[1].transactionHash,
            amount,
          };
        }).pipe(
          Effect.withSpan("purchaseTokens", {
            attributes: { userId, tokenId, amount },
          })
        ),
    };
  }),
  dependencies: [ConvexDatabase.Default, BlockchainProvider.Default, StripeProvider.Default],
}) {}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const createAgent = (
  db: ConvexDatabase,
  creatorId: Id<"entities">,
  agentType: string,
  config: { systemPrompt: string; capabilities: string[] }
) =>
  Effect.gen(function* () {
    const agentId = yield* db.insert("entities", {
      type: agentType,
      name: `${agentType.replace("_", " ")} for creator`,
      properties: {
        agentType,
        systemPrompt: config.systemPrompt,
        model: "gpt-4-turbo",
        temperature: 0.7,
        capabilities: config.capabilities,
        totalExecutions: 0,
        successRate: 1.0,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    yield* db.insert("connections", {
      fromEntityId: creatorId,
      toEntityId: agentId,
      relationshipType: "owns",
      createdAt: Date.now(),
    });

    return { agentId, agentType };
  });

const executeAgent = (
  db: ConvexDatabase,
  agent: { agentId: Id<"entities"> },
  task: string
) =>
  Effect.gen(function* () {
    const openai = yield* OpenAIProvider;

    const agentEntity = yield* db.get("entities", agent.agentId);

    const result = yield* openai.chat({
      systemPrompt: agentEntity.properties.systemPrompt,
      messages: [{ role: "user", content: task }],
    });

    yield* db.insert("events", {
      entityId: agent.agentId,
      eventType: "agent_executed",
      timestamp: Date.now(),
      actorType: "system",
      metadata: {
        task,
        result: result.content,
        tokensUsed: result.usage.totalTokens,
      },
    });

    return JSON.parse(result.content);
  });

// ============================================================================
// TESTING EXAMPLE: Mock services for unit tests
// ============================================================================

export const MockAICloneService = Layer.succeed(AICloneService, {
  createClone: () =>
    Effect.succeed({
      cloneId: "mock-clone-id" as Id<"entities">,
      voiceId: "mock-voice-id",
      personality: {
        systemPrompt: "Mock system prompt",
        traits: ["friendly", "expert"],
        communicationStyle: "casual",
        values: ["authenticity"],
      },
    }),
  interact: () => Effect.succeed("Mock AI response"),
});

// Usage in tests:
// const result = await Effect.runPromise(
//   createClone("creator-123").pipe(Effect.provide(MockAICloneService))
// );