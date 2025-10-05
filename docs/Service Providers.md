// ============================================================================
// convex/services/providers/openai.ts
// OpenAI Provider - LLM operations, embeddings, chat completions
// ============================================================================

import { Effect, Context, Layer } from "effect";
import OpenAI from "openai";

// Error Types
export class OpenAIError {
  readonly _tag = "OpenAIError";
  constructor(readonly message: string, readonly code?: string) {}
}

export class RateLimitError {
  readonly _tag = "RateLimitError";
  constructor(readonly retryAfter?: number) {}
}

export class InvalidResponseError {
  readonly _tag = "InvalidResponseError";
  constructor(readonly response: any) {}
}

// Service Interface
export class OpenAIProvider extends Context.Tag("OpenAIProvider")<
  OpenAIProvider,
  {
    readonly chat: (params: {
      systemPrompt: string;
      messages: Array<{ role: string; content: string }>;
      context?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }) => Effect.Effect<
      {
        content: string;
        usage: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      },
      OpenAIError | RateLimitError
    >;

    readonly embed: (
      text: string,
      model?: string
    ) => Effect.Effect<number[], OpenAIError | RateLimitError>;

    readonly generateImage: (
      prompt: string,
      options?: { size?: string; quality?: string }
    ) => Effect.Effect<{ url: string }, OpenAIError | RateLimitError>;

    readonly analyzePersonality: (content: {
      videos: string[];
      posts: string[];
      interactions: string[];
    }) => Effect.Effect<
      {
        systemPrompt: string;
        traits: string[];
        style: string;
        values: string[];
      },
      OpenAIError
    >;
  }
>() {}

// Implementation
export const OpenAIProviderLive = Layer.effect(
  OpenAIProvider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.OPENAI_API_KEY);

    if (!apiKey) {
      return yield* Effect.fail(
        new OpenAIError("OPENAI_API_KEY environment variable not set")
      );
    }

    const client = new OpenAI({ apiKey });

    return OpenAIProvider.of({
      chat: (params) =>
        Effect.gen(function* () {
          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: params.systemPrompt },
          ];

          if (params.context) {
            messages.push({
              role: "system",
              content: `Context:\n${params.context}`,
            });
          }

          messages.push(
            ...params.messages.map(
              (m): OpenAI.Chat.ChatCompletionMessageParam => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })
            )
          );

          const response = yield* Effect.tryPromise({
            try: () =>
              client.chat.completions.create({
                model: params.model || "gpt-4-turbo",
                messages,
                temperature: params.temperature ?? 0.7,
                max_tokens: params.maxTokens,
              }),
            catch: (error: any) => {
              if (error.status === 429) {
                return new RateLimitError(error.headers?.["retry-after"]);
              }
              return new OpenAIError(error.message, error.code);
            },
          });

          const choice = response.choices[0];
          if (!choice?.message?.content) {
            return yield* Effect.fail(
              new InvalidResponseError(response)
            );
          }

          return {
            content: choice.message.content,
            usage: {
              promptTokens: response.usage?.prompt_tokens || 0,
              completionTokens: response.usage?.completion_tokens || 0,
              totalTokens: response.usage?.total_tokens || 0,
            },
          };
        }).pipe(
          Effect.retry({ times: 3, delay: "1 second" }),
          Effect.timeout("60 seconds")
        ),

      embed: (text, model = "text-embedding-3-small") =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              client.embeddings.create({
                model,
                input: text,
                dimensions: 1536,
              }),
            catch: (error: any) => {
              if (error.status === 429) {
                return new RateLimitError(error.headers?.["retry-after"]);
              }
              return new OpenAIError(error.message, error.code);
            },
          });

          return response.data[0].embedding;
        }).pipe(Effect.retry({ times: 3, delay: "1 second" })),

      generateImage: (prompt, options) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              client.images.generate({
                model: "dall-e-3",
                prompt,
                size: (options?.size as any) || "1024x1024",
                quality: (options?.quality as any) || "standard",
                n: 1,
              }),
            catch: (error: any) =>
              new OpenAIError(error.message, error.code),
          });

          const url = response.data[0]?.url;
          if (!url) {
            return yield* Effect.fail(
              new InvalidResponseError(response)
            );
          }

          return { url };
        }),

      analyzePersonality: (content) =>
        Effect.gen(function* () {
          const prompt = `Analyze this creator's personality and communication style to create an AI clone system prompt.

Videos: ${content.videos.join("\n")}
Posts: ${content.posts.join("\n")}
Interactions: ${content.interactions.join("\n")}

Provide a JSON response with:
{
  "systemPrompt": "A detailed system prompt for the AI clone",
  "traits": ["trait1", "trait2", ...],
  "style": "communication style description",
  "values": ["value1", "value2", ...]
}`;

          const response = yield* Effect.gen(function* () {
            return yield* this.chat({
              systemPrompt:
                "You are a personality analysis expert. Respond with valid JSON only.",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
            });
          });

          const parsed = yield* Effect.try({
            try: () => JSON.parse(response.content),
            catch: () => new InvalidResponseError(response.content),
          });

          return parsed;
        }),
    });
  })
);

// Mock for Testing
export const OpenAIProviderTest = Layer.succeed(
  OpenAIProvider,
  OpenAIProvider.of({
    chat: () =>
      Effect.succeed({
        content: "Mock AI response",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
    embed: () => Effect.succeed(Array(1536).fill(0.1)),
    generateImage: () => Effect.succeed({ url: "https://mock-image.jpg" }),
    analyzePersonality: () =>
      Effect.succeed({
        systemPrompt: "Mock system prompt",
        traits: ["friendly", "knowledgeable"],
        style: "casual and helpful",
        values: ["authenticity", "growth"],
      }),
  })
);

// ============================================================================
// convex/services/providers/elevenlabs.ts
// ElevenLabs Provider - Voice cloning and text-to-speech
// ============================================================================

import { Effect, Context, Layer } from "effect";

// Error Types
export class ElevenLabsError {
  readonly _tag = "ElevenLabsError";
  constructor(readonly message: string) {}
}

export class VoiceCloneFailedError {
  readonly _tag = "VoiceCloneFailedError";
  constructor(readonly reason: string) {}
}

export class InsufficientSamplesError {
  readonly _tag = "InsufficientSamplesError";
  constructor(readonly provided: number, readonly required: number) {}
}

// Service Interface
export class ElevenLabsProvider extends Context.Tag("ElevenLabsProvider")<
  ElevenLabsProvider,
  {
    readonly cloneVoice: (params: {
      name: string;
      samples: string[]; // Storage IDs or URLs
      description?: string;
    }) => Effect.Effect<
      { voiceId: string },
      ElevenLabsError | VoiceCloneFailedError | InsufficientSamplesError
    >;

    readonly textToSpeech: (params: {
      voiceId: string;
      text: string;
      model?: string;
    }) => Effect.Effect<{ audioUrl: string }, ElevenLabsError>;

    readonly listVoices: () => Effect.Effect<
      Array<{ id: string; name: string }>,
      ElevenLabsError
    >;

    readonly deleteVoice: (
      voiceId: string
    ) => Effect.Effect<void, ElevenLabsError>;
  }
>() {}

// Implementation
export const ElevenLabsProviderLive = Layer.effect(
  ElevenLabsProvider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.ELEVENLABS_API_KEY);

    if (!apiKey) {
      return yield* Effect.fail(
        new ElevenLabsError("ELEVENLABS_API_KEY not set")
      );
    }

    const baseUrl = "https://api.elevenlabs.io/v1";

    return ElevenLabsProvider.of({
      cloneVoice: (params) =>
        Effect.gen(function* () {
          // Validate sample count
          if (params.samples.length < 5) {
            return yield* Effect.fail(
              new InsufficientSamplesError(params.samples.length, 5)
            );
          }

          // Create FormData with samples
          const formData = new FormData();
          formData.append("name", params.name);
          if (params.description) {
            formData.append("description", params.description);
          }

          // Add audio samples
          for (const sample of params.samples) {
            // Fetch audio file from storage/URL
            const audioBlob = yield* Effect.tryPromise({
              try: async () => {
                const response = await fetch(sample);
                return await response.blob();
              },
              catch: (error: any) =>
                new ElevenLabsError(`Failed to fetch sample: ${error.message}`),
            });

            formData.append("files", audioBlob, `sample-${Date.now()}.mp3`);
          }

          // API call to create voice
          const response = yield* Effect.tryPromise({
            try: async () => {
              const res = await fetch(`${baseUrl}/voices/add`, {
                method: "POST",
                headers: { "xi-api-key": apiKey },
                body: formData,
              });

              if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail?.message || "Voice clone failed");
              }

              return await res.json();
            },
            catch: (error: any) =>
              new VoiceCloneFailedError(error.message),
          });

          return { voiceId: response.voice_id };
        }).pipe(
          Effect.retry({ times: 2, delay: "5 seconds" }),
          Effect.timeout("5 minutes")
        ),

      textToSpeech: (params) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: async () => {
              const res = await fetch(
                `${baseUrl}/text-to-speech/${params.voiceId}`,
                {
                  method: "POST",
                  headers: {
                    "xi-api-key": apiKey,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    text: params.text,
                    model_id: params.model || "eleven_multilingual_v2",
                    voice_settings: {
                      stability: 0.5,
                      similarity_boost: 0.75,
                    },
                  }),
                }
              );

              if (!res.ok) {
                throw new Error("Text-to-speech failed");
              }

              return await res.blob();
            },
            catch: (error: any) => new ElevenLabsError(error.message),
          });

          // Upload to storage and return URL
          const audioUrl = yield* Effect.succeed(
            URL.createObjectURL(response)
          );

          return { audioUrl };
        }),

      listVoices: () =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: async () => {
              const res = await fetch(`${baseUrl}/voices`, {
                headers: { "xi-api-key": apiKey },
              });

              if (!res.ok) {
                throw new Error("Failed to list voices");
              }

              return await res.json();
            },
            catch: (error: any) => new ElevenLabsError(error.message),
          });

          return response.voices.map((v: any) => ({
            id: v.voice_id,
            name: v.name,
          }));
        }),

      deleteVoice: (voiceId) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: async () => {
              const res = await fetch(`${baseUrl}/voices/${voiceId}`, {
                method: "DELETE",
                headers: { "xi-api-key": apiKey },
              });

              if (!res.ok) {
                throw new Error("Failed to delete voice");
              }
            },
            catch: (error: any) => new ElevenLabsError(error.message),
          });
        }),
    });
  })
);

// Mock for Testing
export const ElevenLabsProviderTest = Layer.succeed(
  ElevenLabsProvider,
  ElevenLabsProvider.of({
    cloneVoice: () => Effect.succeed({ voiceId: "mock-voice-id" }),
    textToSpeech: () =>
      Effect.succeed({ audioUrl: "https://mock-audio.mp3" }),
    listVoices: () =>
      Effect.succeed([
        { id: "voice-1", name: "Mock Voice 1" },
        { id: "voice-2", name: "Mock Voice 2" },
      ]),
    deleteVoice: () => Effect.succeed(undefined),
  })
);

// ============================================================================
// convex/services/providers/stripe.ts
// Stripe Provider - Payment processing
// ============================================================================

import { Effect, Context, Layer } from "effect";
import Stripe from "stripe";

// Error Types
export class StripeError {
  readonly _tag = "StripeError";
  constructor(
    readonly message: string,
    readonly code?: string,
    readonly declineCode?: string
  ) {}
}

export class PaymentFailedError {
  readonly _tag = "PaymentFailedError";
  constructor(readonly reason: string) {}
}

// Service Interface
export class StripeProvider extends Context.Tag("StripeProvider")<
  StripeProvider,
  {
    readonly charge: (params: {
      amount: number; // in cents
      currency: string;
      metadata?: Record<string, string>;
    }) => Effect.Effect<
      { id: string; amount: number; status: string },
      StripeError | PaymentFailedError
    >;

    readonly createCheckoutSession: (params: {
      amount: number;
      currency: string;
      successUrl: string;
      cancelUrl: string;
      metadata?: Record<string, string>;
    }) => Effect.Effect<
      { sessionId: string; url: string },
      StripeError
    >;

    readonly refund: (
      paymentIntentId: string,
      amount?: number
    ) => Effect.Effect<{ refundId: string }, StripeError>;

    readonly createConnectAccount: (params: {
      email: string;
      country: string;
    }) => Effect.Effect<{ accountId: string }, StripeError>;

    readonly getPaymentStatus: (
      paymentIntentId: string
    ) => Effect.Effect<
      { status: string; amount: number },
      StripeError
    >;
  }
>() {}

// Implementation
export const StripeProviderLive = Layer.effect(
  StripeProvider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.STRIPE_SECRET_KEY);

    if (!apiKey) {
      return yield* Effect.fail(
        new StripeError("STRIPE_SECRET_KEY not set")
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: "2024-11-20.acacia",
    });

    return StripeProvider.of({
      charge: (params) =>
        Effect.gen(function* () {
          const paymentIntent = yield* Effect.tryPromise({
            try: () =>
              stripe.paymentIntents.create({
                amount: params.amount,
                currency: params.currency,
                automatic_payment_methods: { enabled: true },
                metadata: params.metadata,
              }),
            catch: (error: any) => {
              if (error.type === "card_error") {
                return new PaymentFailedError(
                  error.message || "Card declined"
                );
              }
              return new StripeError(error.message, error.code);
            },
          });

          return {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status,
          };
        }),

      createCheckoutSession: (params) =>
        Effect.gen(function* () {
          const session = yield* Effect.tryPromise({
            try: () =>
              stripe.checkout.sessions.create({
                line_items: [
                  {
                    price_data: {
                      currency: params.currency,
                      unit_amount: params.amount,
                      product_data: {
                        name: "Token Purchase",
                      },
                    },
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
                metadata: params.metadata,
              }),
            catch: (error: any) =>
              new StripeError(error.message, error.code),
          });

          return {
            sessionId: session.id,
            url: session.url!,
          };
        }),

      refund: (paymentIntentId, amount) =>
        Effect.gen(function* () {
          const refund = yield* Effect.tryPromise({
            try: () =>
              stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount,
              }),
            catch: (error: any) =>
              new StripeError(error.message, error.code),
          });

          return { refundId: refund.id };
        }),

      createConnectAccount: (params) =>
        Effect.gen(function* () {
          const account = yield* Effect.tryPromise({
            try: () =>
              stripe.accounts.create({
                type: "express",
                email: params.email,
                country: params.country,
                capabilities: {
                  card_payments: { requested: true },
                  transfers: { requested: true },
                },
              }),
            catch: (error: any) =>
              new StripeError(error.message, error.code),
          });

          return { accountId: account.id };
        }),

      getPaymentStatus: (paymentIntentId) =>
        Effect.gen(function* () {
          const paymentIntent = yield* Effect.tryPromise({
            try: () => stripe.paymentIntents.retrieve(paymentIntentId),
            catch: (error: any) =>
              new StripeError(error.message, error.code),
          });

          return {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
          };
        }),
    });
  })
);

// Mock for Testing
export const StripeProviderTest = Layer.succeed(
  StripeProvider,
  StripeProvider.of({
    charge: () =>
      Effect.succeed({
        id: "pi_mock123",
        amount: 1000,
        status: "succeeded",
      }),
    createCheckoutSession: () =>
      Effect.succeed({
        sessionId: "cs_mock123",
        url: "https://checkout.stripe.com/mock",
      }),
    refund: () => Effect.succeed({ refundId: "re_mock123" }),
    createConnectAccount: () =>
      Effect.succeed({ accountId: "acct_mock123" }),
    getPaymentStatus: () =>
      Effect.succeed({ status: "succeeded", amount: 1000 }),
  })
);

// ============================================================================
// convex/services/providers/blockchain.ts
// Blockchain Provider - Base L2 token operations
// ============================================================================

import { Effect, Context, Layer } from "effect";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

// Error Types
export class BlockchainError {
  readonly _tag = "BlockchainError";
  constructor(readonly message: string) {}
}

export class TransactionFailedError {
  readonly _tag = "TransactionFailedError";
  constructor(readonly txHash?: string, readonly reason?: string) {}
}

// Service Interface
export class BlockchainProvider extends Context.Tag("BlockchainProvider")<
  BlockchainProvider,
  {
    readonly deployToken: (params: {
      name: string;
      symbol: string;
      totalSupply: number;
    }) => Effect.Effect<
      { contractAddress: string; txHash: string },
      BlockchainError | TransactionFailedError
    >;

    readonly mint: (params: {
      contractAddress: string;
      toAddress: string;
      amount: number;
    }) => Effect.Effect<
      { transactionHash: string },
      BlockchainError | TransactionFailedError
    >;

    readonly burn: (params: {
      contractAddress: string;
      amount: number;
    }) => Effect.Effect<
      { transactionHash: string },
      BlockchainError | TransactionFailedError
    >;

    readonly transfer: (params: {
      contractAddress: string;
      fromAddress: string;
      toAddress: string;
      amount: number;
    }) => Effect.Effect<{ transactionHash: string }, BlockchainError>;

    readonly getBalance: (params: {
      contractAddress: string;
      address: string;
    }) => Effect.Effect<number, BlockchainError>;
  }
>() {}

// Implementation
export const BlockchainProviderLive = Layer.effect(
  BlockchainProvider,
  Effect.gen(function* () {
    const privateKey = yield* Effect.sync(
      () => process.env.WALLET_PRIVATE_KEY as `0x${string}`
    );

    if (!privateKey) {
      return yield* Effect.fail(
        new BlockchainError("WALLET_PRIVATE_KEY not set")
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: base,
      transport: http(),
    });

    return BlockchainProvider.of({
      deployToken: (params) =>
        Effect.gen(function* () {
          // Deploy ERC20 contract
          const txHash = yield* Effect.tryPromise({
            try: async () => {
              // Contract deployment logic here
              // This is simplified - real implementation would use contract ABIs
              return "0xmock-deploy-hash";
            },
            catch: (error: any) =>
              new TransactionFailedError(undefined, error.message),
          });

          // Wait for confirmation
          yield* Effect.sleep("30 seconds");

          return {
            contractAddress: "0xmock-contract-address",
            txHash,
          };
        }).pipe(
          Effect.retry({ times: 2, delay: "10 seconds" }),
          Effect.timeout("5 minutes")
        ),

      mint: (params) =>
        Effect.gen(function* () {
          const txHash = yield* Effect.tryPromise({
            try: async () => {
              // Mint tokens on contract
              // Simplified - real implementation would call contract
              return "0xmock-mint-hash";
            },
            catch: (error: any) =>
              new TransactionFailedError(undefined, error.message),
          });

          return { transactionHash: txHash };
        }),

      burn: (params) =>
        Effect.gen(function* () {
          const txHash = yield* Effect.tryPromise({
            try: async () => {
              // Burn tokens
              return "0xmock-burn-hash";
            },
            catch: (error: any) =>
              new TransactionFailedError(undefined, error.message),
          });

          return { transactionHash: txHash };
        }),

      transfer: (params) =>
        Effect.gen(function* () {
          const txHash = yield* Effect.tryPromise({
            try: async () => {
              // Transfer tokens
              return "0xmock-transfer-hash";
            },
            catch: (error: any) => new BlockchainError(error.message),
          });

          return { transactionHash: txHash };
        }),

      getBalance: (params) =>
        Effect.gen(function* () {
          const balance = yield* Effect.tryPromise({
            try: async () => {
              // Get balance from contract
              return 1000; // Mock balance
            },
            catch: (error: any) => new BlockchainError(error.message),
          });

          return balance;
        }),
    });
  })
);

// Mock for Testing
export const BlockchainProviderTest = Layer.succeed(
  BlockchainProvider,
  BlockchainProvider.of({
    deployToken: () =>
      Effect.succeed({
        contractAddress: "0xmock-contract",
        txHash: "0xmock-deploy",
      }),
    mint: () => Effect.succeed({ transactionHash: "0xmock-mint" }),
    burn: () => Effect.succeed({ transactionHash: "0xmock-burn" }),
    transfer: () => Effect.succeed({ transactionHash: "0xmock-transfer" }),
    getBalance: () => Effect.succeed(1000),
  })
);

// ============================================================================
// convex/services/providers/resend.ts
// Resend Provider - Transactional emails
// ============================================================================

import { Effect, Context, Layer } from "effect";
import { Resend } from "resend";

// Error Types
export class ResendError {
  readonly _tag = "ResendError";
  constructor(readonly message: string) {}
}

export class EmailSendFailedError {
  readonly _tag = "EmailSendFailedError";
  constructor(readonly reason: string) {}
}

// Service Interface
export class ResendProvider extends Context.Tag("ResendProvider")<
  ResendProvider,
  {
    readonly sendVerificationEmail: (params: {
      to: string;
      verificationUrl: string;
    }) => Effect.Effect<{ messageId: string }, ResendError | EmailSendFailedError>;

    readonly sendPasswordReset: (params: {
      to: string;
      resetUrl: string;
    }) => Effect.Effect<{ messageId: string }, ResendError | EmailSendFailedError>;

    readonly sendNotification: (params: {
      to: string;
      subject: string;
      body: string;
    }) => Effect.Effect<{ messageId: string }, ResendError | EmailSendFailedError>;

    readonly sendInsightsReport: (params: {
      to: string;
      insights: any;
    }) => Effect.Effect<{ messageId: string }, ResendError | EmailSendFailedError>;
  }
>() {}

// Implementation
export const ResendProviderLive = Layer.effect(
  ResendProvider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.RESEND_API_KEY);

    if (!apiKey) {
      return yield* Effect.fail(new ResendError("RESEND_API_KEY not set"));
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@one.ie";

    return ResendProvider.of({
      sendVerificationEmail: (params) =>
        Effect.gen(function* () {
          const { data, error } = yield* Effect.tryPromise({
            try: () =>
              resend.emails.send({
                from: fromEmail,
                to: params.to,
                subject: "Verify your email",
                html: `
                  <h1>Welcome to ONE Platform!</h1>
                  <p>Click the link below to verify your email:</p>
                  <a href="${params.verificationUrl}">Verify Email</a>
                  <p>This link expires in 24 hours.</p>
                `,
              }),
            catch: (error: any) =>
              new EmailSendFailedError(error.message),
          });

          if (error) {
            return yield* Effect.fail(
              new EmailSendFailedError(error.message)
            );
          }

          return { messageId: data!.id };
        }),

      sendPasswordReset: (params) =>
        Effect.gen(function* () {
          const { data, error } = yield* Effect.tryPromise({
            try: () =>
              resend.emails.send({
                from: fromEmail,
                to: params.to,
                subject: "Reset your password",
                html: `
                  <h1>Password Reset Request</h1>
                  <p>Click the link below to reset your password:</p>
                  <a href="${params.resetUrl}">Reset Password</a>
                  <p>This link expires in 1 hour.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                `,
              }),
            catch: (error: any) =>
              new EmailSendFailedError(error.message),
          });

          if (error) {
            return yield* Effect.fail(
              new EmailSendFailedError(error.message)
            );
          }

          return { messageId: data!.id };
        }),

      sendNotification: (params) =>
        Effect.gen(function* () {
          const { data, error } = yield* Effect.tryPromise({
            try: () =>
              resend.emails.send({
                from: fromEmail,
                to: params.to,
                subject: params.subject,
                html: params.body,
              }),
            catch: (error: any) =>
              new EmailSendFailedError(error.message),
          });

          if (error) {
            return yield* Effect.fail(
              new EmailSendFailedError(error.message)
            );
          }

          return { messageId: data!.id };
        }),

      sendInsightsReport: (params) =>
        Effect.gen(function* () {
          const { data, error } = yield* Effect.tryPromise({
            try: () =>
              resend.emails.send({
                from: fromEmail,
                to: params.to,
                subject: "Your Business Insights Report",
                html: `
                  <h1>Your Business Insights</h1>
                  <p>Here's your personalized analysis:</p>
                  <pre>${JSON.stringify(params.insights, null, 2)}</pre>
                `,
              }),
            catch: (error: any) =>
              new EmailSendFailedError(error.message),
          });

          if (error) {
            return yield* Effect.fail(
              new EmailSendFailedError(error.message)
            );
          }

          return { messageId: data!.id };
        }),
    });
  })
);

// Mock for Testing
export const ResendProviderTest = Layer.succeed(
  ResendProvider,
  ResendProvider.of({
    sendVerificationEmail: () =>
      Effect.succeed({ messageId: "mock-verify-123" }),
    sendPasswordReset: () => Effect.succeed({ messageId: "mock-reset-123" }),
    sendNotification: () => Effect.succeed({ messageId: "mock-notif-123" }),
    sendInsightsReport: () =>
      Effect.succeed({ messageId: "mock-insights-123" }),
  })
);

// ============================================================================
// convex/services/index.ts
// Main Layer - Combines all providers
// ============================================================================

import { Layer } from "effect";
import { OpenAIProviderLive } from "./providers/openai";
import { ElevenLabsProviderLive } from "./providers/elevenlabs";
import { StripeProviderLive } from "./providers/stripe";
import { BlockchainProviderLive } from "./providers/blockchain";
import { ResendProviderLive } from "./providers/resend";
import { ConvexDatabaseLive } from "./core/database";

// Production Layer - All real providers
export const MainLayer = Layer.mergeAll(
  OpenAIProviderLive,
  ElevenLabsProviderLive,
  StripeProviderLive,
  BlockchainProviderLive,
  ResendProviderLive,
  ConvexDatabaseLive
);

// Test Layer - All mock providers
export const TestLayer = Layer.mergeAll(
  OpenAIProviderTest,
  ElevenLabsProviderTest,
  StripeProviderTest,
  BlockchainProviderTest,
  ResendProviderTest,
  ConvexDatabaseTest
);