Let me create the Effect.ts provider layer now - this establishes how ALL external APIs (OpenAI, ElevenLabs, Stripe, Blockchain, Resend) are wrapped consistently.

The **Effect.ts Provider Layer** - the foundational wrappers for all external APIs.

**What this gives you:**

1. **OpenAI Provider** - Chat completions, embeddings, image generation, personality analysis
2. **ElevenLabs Provider** - Voice cloning, text-to-speech, voice management
3. **Stripe Provider** - Payments, checkout, refunds, Connect accounts
4. **Blockchain Provider** - Token deployment, minting, burning, transfers (Base L2)
5. **Resend Provider** - Transactional emails (verification, reset, notifications)

**Key patterns established:**

- **Typed errors** - Every provider has specific error types (`OpenAIError`, `RateLimitError`, etc.)
- **Automatic retries** - Built-in retry logic with exponential backoff
- **Timeouts** - No hanging operations
- **Test layers** - Mock versions for unit testing
- **Consistent interface** - All providers follow same structure