# New Service Providers Documentation

**Added**: 2025-10-05
**Status**: Specification Complete - Implementation Pending

---

## Overview

8 new service providers added to support complete Strategy.md implementation:

1. **D-ID** - AI appearance/avatar cloning
2. **HeyGen** - Alternative AI appearance cloning
3. **Uniswap** - Decentralized token exchange (Base chain)
4. **Alchemy** - Blockchain infrastructure provider (Base chain)
5. **Twilio** - SMS and voice communications
6. **SendGrid** - Email service (alternative to Resend)
7. **AWS** - General media storage and CDN (S3 + CloudFront)
8. **Cloudflare** - **LIVESTREAMING ONLY** (Cloudflare Stream)

### Architecture Notes

**Media Storage Strategy:**
- **AWS S3 + CloudFront**: General media storage (images, videos, audio files, documents)
- **Cloudflare Stream**: Livestreaming infrastructure ONLY (real-time RTMP/WebRTC streaming)

**Payment Strategy:**
- **Stripe**: Fiat currency payments ONLY (USD, credit cards, bank transfers)
- **Blockchain tokens**: Handled via chain-specific providers (see Multi-Chain Architecture below)

**Multi-Chain Architecture:**
- Each blockchain gets its own dedicated provider (no consolidation)
- Current: Base chain (Alchemy, Uniswap)
- Future additions: Sui, Solana, Ethereum mainnet
- Each chain provider implements the same Effect.ts interface pattern

---

## 1. D-ID Provider

### Purpose
Create AI video avatars with cloned appearance for creator's digital twin.

### Service Interface
```typescript
// convex/services/providers/did.ts
export class DIDError extends Data.TaggedEnum<{
  APIError: { message: string };
  InvalidImage: { reason: string };
  ProcessingFailed: { avatarId: string };
  QuotaExceeded: { limit: number };
  RateLimitError: { retryAfter: number };
}> {}

export class DIDProvider extends Context.Tag("DIDProvider")<
  DIDProvider,
  {
    readonly cloneAppearance: (params: {
      creatorId: Id<"entities">;
      imageUrl: string;
      videoSamples?: string[];
    }) => Effect.Effect<
      {
        avatarId: string;
        previewUrl: string;
        status: "processing" | "ready";
      },
      DIDError
    >;

    readonly generateVideo: (params: {
      avatarId: string;
      script: string;
      voiceId?: string;
    }) => Effect.Effect<
      {
        videoId: string;
        videoUrl: string;
        duration: number;
      },
      DIDError
    >;

    readonly getAvatar: (
      avatarId: string
    ) => Effect.Effect<
      {
        id: string;
        status: string;
        thumbnailUrl: string;
      },
      DIDError
    >;
  }
>() {}
```

### Environment Variables
```bash
D_ID_API_KEY=your_d_id_api_key
D_ID_BASE_URL=https://api.d-id.com
```

### Use Cases
- AI clone appearance creation
- Video generation with cloned appearance
- Livestream avatar mixing
- Content automation

---

## 2. HeyGen Provider

### Purpose
Alternative AI video avatar creation with higher quality options.

### Service Interface
```typescript
// convex/services/providers/heygen.ts
export class HeyGenError extends Data.TaggedEnum<{
  APIError: { message: string };
  InvalidPhotos: { reason: string };
  ProcessingTimeout: { avatarId: string };
  InsufficientCredits: { required: number; available: number };
  RateLimitError: { retryAfter: number };
}> {}

export class HeyGenProvider extends Context.Tag("HeyGenProvider")<
  HeyGenProvider,
  {
    readonly createAvatar: (params: {
      name: string;
      photos: string[];
      videoSamples?: string[];
    }) => Effect.Effect<
      {
        avatarId: string;
        status: "processing" | "ready";
      },
      HeyGenError
    >;

    readonly generateVideoWithAvatar: (params: {
      avatarId: string;
      script: string;
      voiceId?: string;
      background?: string;
    }) => Effect.Effect<
      {
        videoId: string;
        videoUrl: string;
      },
      HeyGenError
    >;
  }
>() {}
```

### Environment Variables
```bash
HEYGEN_API_KEY=your_heygen_api_key
```

### Use Cases
- Premium AI clone appearances
- High-quality video generation
- Professional livestreams

---

## 3. Uniswap Provider (Base Chain)

### Purpose
Decentralized exchange integration for creator token trading on Base chain.

**Chain-Specific Note:** This provider is for Base chain only. Future chains (Sui, Solana) will have their own DEX providers (e.g., SuiDEXProvider, RaydiumProvider).

### Service Interface
```typescript
// convex/services/providers/uniswap.ts
export class UniswapError extends Data.TaggedEnum<{
  NetworkError: { message: string };
  InsufficientLiquidity: { tokenAddress: string };
  SlippageTooHigh: { expected: number; actual: number };
  RateLimitError: { retryAfter: number };
}> {}

export class UniswapProvider extends Context.Tag("UniswapProvider")<
  UniswapProvider,
  {
    readonly createLiquidityPool: (params: {
      tokenAddress: string;
      initialLiquidity: number;
      initialPrice: number;
    }) => Effect.Effect<
      {
        poolAddress: string;
        txHash: string;
      },
      UniswapError
    >;

    readonly getTokenPrice: (
      tokenAddress: string
    ) => Effect.Effect<
      {
        price: number;
        volume24h: number;
        liquidity: number;
      },
      UniswapError
    >;

    readonly swap: (params: {
      fromToken: string;
      toToken: string;
      amount: number;
      slippage: number;
    }) => Effect.Effect<
      {
        txHash: string;
        amountOut: number;
      },
      UniswapError
    >;
  }
>() {}
```

### Environment Variables
```bash
UNISWAP_ROUTER_ADDRESS=0x... # Base chain Uniswap V3 router
BASE_RPC_URL=https://mainnet.base.org
```

### Use Cases
- Creator token liquidity on Base
- Token price discovery
- Secondary market trading
- **Note**: Each blockchain will have its own DEX provider

---

## 4. Alchemy Provider (Base Chain)

### Purpose
Blockchain infrastructure for token operations and NFTs on Base chain.

**Chain-Specific Note:** This provider is for Base chain only. Future chains will have their own infrastructure providers:
- Sui: SuiProvider (using Mysten Labs API)
- Solana: SolanaProvider (using Helius or Alchemy Solana)
- Each chain provider implements the same Effect.ts interface pattern

### Service Interface
```typescript
// convex/services/providers/alchemy.ts
export class AlchemyError extends Data.TaggedEnum<{
  NetworkError: { message: string };
  InvalidAddress: { address: string };
  InsufficientFunds: { required: number; available: number };
  ContractError: { message: string };
  RateLimitError: { retryAfter: number };
}> {}

export class AlchemyProvider extends Context.Tag("AlchemyProvider")<
  AlchemyProvider,
  {
    readonly deployToken: (params: {
      name: string;
      symbol: string;
      totalSupply: number;
      owner: string;
    }) => Effect.Effect<
      {
        contractAddress: string;
        txHash: string;
      },
      AlchemyError
    >;

    readonly getTokenBalance: (params: {
      walletAddress: string;
      tokenAddress: string;
    }) => Effect.Effect<number, AlchemyError>;

    readonly sendTokens: (params: {
      from: string;
      to: string;
      tokenAddress: string;
      amount: number;
    }) => Effect.Effect<
      {
        txHash: string;
      },
      AlchemyError
    >;

    readonly getNFTMetadata: (params: {
      contractAddress: string;
      tokenId: string;
    }) => Effect.Effect<any, AlchemyError>;
  }
>() {}
```

### Environment Variables
```bash
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_NETWORK=base-mainnet  # Base chain only
```

### Use Cases
- Token deployment on Base
- Token transfers
- NFT metadata
- Blockchain querying
- **Note**: Each blockchain will have its own infrastructure provider

---

## 5. Twilio Provider

### Purpose
SMS and voice communications for notifications and 2FA.

### Service Interface
```typescript
// convex/services/providers/twilio.ts
export class TwilioError extends Data.TaggedEnum<{
  SendFailed: { message: string };
  InvalidPhoneNumber: { number: string };
  InsufficientBalance: { required: number; available: number };
  VerificationFailed: { reason: string };
  RateLimitError: { retryAfter: number };
}> {}

export class TwilioProvider extends Context.Tag("TwilioProvider")<
  TwilioProvider,
  {
    readonly sendSMS: (params: {
      to: string;
      message: string;
    }) => Effect.Effect<
      {
        sid: string;
        status: string;
      },
      TwilioError
    >;

    readonly sendVoiceMessage: (params: {
      to: string;
      message: string;
      voice?: string;
    }) => Effect.Effect<
      {
        sid: string;
      },
      TwilioError
    >;

    readonly verify2FA: (params: {
      to: string;
      code: string;
    }) => Effect.Effect<boolean, TwilioError>;
  }
>() {}
```

### Environment Variables
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Use Cases
- SMS notifications
- 2FA verification
- Voice notifications
- Emergency alerts

---

## 6. SendGrid Provider

### Purpose
Alternative email service with advanced analytics.

### Service Interface
```typescript
// convex/services/providers/sendgrid.ts
export class SendGridError extends Data.TaggedEnum<{
  SendFailed: { message: string };
  InvalidEmail: { email: string };
  TemplateNotFound: { templateId: string };
  QuotaExceeded: { limit: number };
  RateLimitError: { retryAfter: number };
}> {}

export class SendGridProvider extends Context.Tag("SendGridProvider")<
  SendGridProvider,
  {
    readonly sendEmail: (params: {
      to: string;
      subject: string;
      html: string;
      from?: string;
    }) => Effect.Effect<
      {
        messageId: string;
      },
      SendGridError
    >;

    readonly sendTemplate: (params: {
      to: string;
      templateId: string;
      dynamicData: Record<string, any>;
    }) => Effect.Effect<
      {
        messageId: string;
      },
      SendGridError
    >;

    readonly getEmailStats: (
      messageId: string
    ) => Effect.Effect<
      {
        delivered: boolean;
        opened: boolean;
        clicked: boolean;
      },
      SendGridError
    >;
  }
>() {}
```

### Environment Variables
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Use Cases
- Transactional emails
- Email campaigns
- Email tracking
- Template-based emails

---

## 7. AWS Provider

### Purpose
**General media storage and CDN** via S3 and CloudFront. This handles ALL non-streaming media assets.

**Important Distinction:**
- **AWS (this provider)**: General media storage - images, videos, audio, documents, avatars, thumbnails
- **Cloudflare Stream**: Livestreaming ONLY - real-time RTMP/WebRTC streaming infrastructure
- AWS S3 + CloudFront provides the primary media infrastructure; Cloudflare Stream is a specialized supplement for live content

### Service Interface
```typescript
// convex/services/providers/aws.ts
export class AWSError extends Data.TaggedEnum<{
  UploadError: { message: string };
  AccessDenied: { key: string };
  NotFound: { key: string };
  InvalidFile: { reason: string };
  QuotaExceeded: { limit: number };
}> {}

export class AWSProvider extends Context.Tag("AWSProvider")<
  AWSProvider,
  {
    readonly uploadFile: (params: {
      file: Blob;
      key: string;
      contentType: string;
      acl?: string;
    }) => Effect.Effect<
      {
        url: string;
        cloudFrontUrl: string;
        key: string;
      },
      AWSError
    >;

    readonly getSignedUrl: (params: {
      key: string;
      expiresIn?: number;
    }) => Effect.Effect<string, AWSError>;

    readonly deleteFile: (
      key: string
    ) => Effect.Effect<void, AWSError>;

    readonly listFiles: (params: {
      prefix: string;
      maxKeys?: number;
    }) => Effect.Effect<
      Array<{
        key: string;
        size: number;
        lastModified: Date;
      }>,
      AWSError
    >;
  }
>() {}
```

### Environment Variables
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
```

### Use Cases
- **All general media storage** (not livestreaming)
- Video/audio file hosting
- Image storage and optimization
- Document storage
- Avatar and thumbnail storage
- File downloads
- Static asset CDN delivery via CloudFront

---

## 8. Cloudflare Provider

### Purpose
**LIVESTREAMING ONLY** - Real-time RTMP/WebRTC streaming infrastructure via Cloudflare Stream.

**CRITICAL DISTINCTION:**
- **Cloudflare Stream (this provider)**: LIVESTREAMING ONLY - real-time streaming, RTMP ingest, WebRTC playback
- **AWS S3 + CloudFront**: General media storage and CDN (images, videos, audio, documents)
- This provider does NOT handle general video hosting - that's AWS S3
- This provider ONLY handles live streaming infrastructure

### Service Interface
```typescript
// convex/services/providers/cloudflare.ts
export class CloudflareError extends Data.TaggedEnum<{
  StreamCreationError: { message: string };
  StreamNotFound: { streamId: string };
  IngestError: { message: string };
  QuotaExceeded: { limit: number };
  RateLimitError: { retryAfter: number };
}> {}

export class CloudflareProvider extends Context.Tag("CloudflareProvider")<
  CloudflareProvider,
  {
    readonly createLivestream: (params: {
      name: string;
      scheduledAt?: number;
    }) => Effect.Effect<
      {
        streamId: string;
        rtmpUrl: string;
        streamKey: string;
        playbackUrl: string;
        webRtcUrl: string;
      },
      CloudflareError
    >;

    readonly getLivestreamStatus: (
      streamId: string
    ) => Effect.Effect<
      {
        status: "idle" | "live" | "ended";
        viewerCount: number;
        duration: number;
      },
      CloudflareError
    >;

    readonly endLivestream: (
      streamId: string
    ) => Effect.Effect<
      {
        recordingUrl?: string; // Saved to AWS S3 after stream ends
      },
      CloudflareError
    >;

    // Note: For pre-recorded video uploads, use AWS Provider instead
    readonly getStreamMetrics: (
      streamId: string
    ) => Effect.Effect<
      {
        totalViews: number;
        peakViewers: number;
        averageViewDuration: number;
      },
      CloudflareError
    >;
  }
>() {}
```

### Environment Variables
```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_STREAM_NAMESPACE=your_namespace
```

### Use Cases
- **LIVESTREAMING ONLY:**
  - Creator livestreams (RTMP/WebRTC)
  - AI clone + human mixing in real-time
  - Real-time viewer interaction
  - Live event broadcasting
- **NOT for:** Pre-recorded video hosting (use AWS S3 instead)

---

## Multi-Chain Architecture

### Design Philosophy

**Each blockchain gets its own dedicated provider - NO consolidation.**

This architecture ensures:
- Type safety per chain (different address formats, gas models, etc.)
- Independent versioning and updates
- Chain-specific optimizations
- Clear separation of concerns

### Current Chain: Base

**Base Chain Providers:**
- `AlchemyProvider` - Blockchain infrastructure (RPC, indexing, token operations)
- `UniswapProvider` - DEX for token trading and liquidity

### Future Chain Additions

**Sui Chain (Future):**
```typescript
// convex/services/providers/sui.ts
export class SuiProvider extends Context.Tag("SuiProvider")<...>() {}
export class SuiDEXProvider extends Context.Tag("SuiDEXProvider")<...>() {}
```

**Solana Chain (Future):**
```typescript
// convex/services/providers/solana.ts
export class SolanaProvider extends Context.Tag("SolanaProvider")<...>() {}
export class RaydiumProvider extends Context.Tag("RaydiumProvider")<...>() {} // DEX
```

**Ethereum Mainnet (Future):**
```typescript
// convex/services/providers/ethereum.ts
export class EthereumProvider extends Context.Tag("EthereumProvider")<...>() {}
export class UniswapV3Provider extends Context.Tag("UniswapV3Provider")<...>() {}
```

### Multi-Chain Provider Pattern

Each chain follows the same Effect.ts interface pattern:

```typescript
// 1. Chain-specific errors
export class ChainError extends Data.TaggedEnum<{
  NetworkError: { message: string };
  InvalidAddress: { address: string };
  InsufficientFunds: { required: number; available: number };
  TransactionFailed: { txHash: string; reason: string };
}> {}

// 2. Infrastructure provider
export class ChainProvider extends Context.Tag("ChainProvider")<
  ChainProvider,
  {
    readonly deployToken: (...) => Effect.Effect<...>;
    readonly getBalance: (...) => Effect.Effect<...>;
    readonly sendTransaction: (...) => Effect.Effect<...>;
  }
>() {}

// 3. DEX provider (if applicable)
export class ChainDEXProvider extends Context.Tag("ChainDEXProvider")<
  ChainDEXProvider,
  {
    readonly createPool: (...) => Effect.Effect<...>;
    readonly swap: (...) => Effect.Effect<...>;
    readonly getPrice: (...) => Effect.Effect<...>;
  }
>() {}
```

### Environment Variables Per Chain

**Base:**
```bash
ALCHEMY_API_KEY=...
ALCHEMY_NETWORK=base-mainnet
UNISWAP_ROUTER_ADDRESS=0x... # Base Uniswap
BASE_RPC_URL=https://mainnet.base.org
```

**Sui (Future):**
```bash
SUI_RPC_URL=https://fullnode.mainnet.sui.io
SUI_NETWORK=mainnet
SUI_DEX_PACKAGE_ID=0x...
```

**Solana (Future):**
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=...
RAYDIUM_PROGRAM_ID=...
```

### Why No Consolidation?

**Type Safety:**
- Base addresses: `0x...` (20 bytes, hex)
- Sui addresses: `0x...` (32 bytes, hex)
- Solana addresses: base58 encoded (32 bytes)

**Different Gas Models:**
- Base: EVM gas (gwei, gas limits)
- Sui: Object-based gas (MIST units)
- Solana: Lamports per compute unit

**Different Token Standards:**
- Base: ERC-20
- Sui: Coin<T> standard
- Solana: SPL Token

Each chain's unique characteristics require dedicated providers to maintain type safety and developer experience.

---

## Stripe Provider Clarification

### Purpose
**Fiat currency payments ONLY** - USD, credit cards, bank transfers.

**Payment Architecture:**
- **Stripe (this provider)**: Fiat payments ONLY (USD → platform)
- **Blockchain providers**: Crypto payments (tokens → wallets)
- Clear separation between fiat and crypto payment flows

### Use Cases
- Subscription payments in USD
- One-time purchases in fiat
- Credit card processing
- Bank transfers
- **NOT for:** Crypto payments (use blockchain providers)

---

## Implementation Priority

### Phase 1: Critical (Week 1)
1. **Alchemy** - Required for token operations
2. **Twilio** - Required for 2FA and notifications
3. **AWS** - Required for media storage

### Phase 2: AI Features (Week 2)
4. **D-ID** - AI appearance cloning
5. **HeyGen** - Premium AI avatars

### Phase 3: Advanced Features (Week 3)
6. **Cloudflare** - Livestreaming
7. **Uniswap** - Token trading
8. **SendGrid** - Advanced email

---

## Integration Pattern

All providers follow the same Effect.ts pattern with proper error handling:

```typescript
// 1. Define errors using Data.TaggedEnum for exhaustive pattern matching
export class ProviderError extends Data.TaggedEnum<{
  NetworkError: { message: string };
  InvalidInput: { field: string; reason: string };
  RateLimitError: { retryAfter: number };
  QuotaExceeded: { limit: number };
  APIError: { message: string; code?: number };
}> {}

// 2. Define service interface with Context.Tag
export class Provider extends Context.Tag("Provider")<
  Provider,
  {
    readonly method1: (params: {...}) => Effect.Effect<Result, ProviderError>;
    readonly method2: (params: {...}) => Effect.Effect<Result, ProviderError>;
  }
>() {}

// 3. Implement provider with Layer.effect
export const ProviderLive = Layer.effect(
  Provider,
  Effect.gen(function* () {
    const apiKey = yield* Effect.sync(() => process.env.PROVIDER_API_KEY);
    if (!apiKey) {
      yield* Effect.fail(
        new ProviderError({ _tag: "InvalidInput", field: "apiKey", reason: "Missing API key" })
      );
    }

    return {
      method1: (params) =>
        Effect.tryPromise({
          try: async () => {
            // Implementation
          },
          catch: (error) =>
            new ProviderError({ _tag: "APIError", message: String(error) }),
        }),
    };
  })
);

// 4. Export for composition
export const AllProviders = Layer.mergeAll(
  OpenAIProviderLive,
  ElevenLabsProviderLive,
  StripeProviderLive,
  // ... new providers
  DIDProviderLive,
  HeyGenProviderLive,
  UniswapProviderLive,
  AlchemyProviderLive,
  TwilioProviderLive,
  SendGridProviderLive,
  AWSProviderLive,
  CloudflareProviderLive,
);
```

### Error Handling Best Practices

**1. Use Data.TaggedEnum for all errors:**
```typescript
export class ProviderError extends Data.TaggedEnum<{
  NetworkError: { message: string };
  InvalidInput: { field: string; reason: string };
  RateLimitError: { retryAfter: number };
}> {}
```

**2. Pattern match on errors:**
```typescript
const result = await Effect.runPromise(
  providerEffect.pipe(
    Effect.catchTag("RateLimitError", (error) =>
      Effect.delay(`${error.retryAfter}ms`)(providerEffect)
    ),
    Effect.catchTag("NetworkError", (error) =>
      Effect.fail(new SystemError({ message: error.message }))
    )
  )
);
```

**3. Compose effects with proper error propagation:**
```typescript
const workflow = Effect.gen(function* () {
  const didService = yield* DIDProvider;
  const awsService = yield* AWSProvider;

  const avatar = yield* didService.cloneAppearance({ ... });
  const upload = yield* awsService.uploadFile({ ... });

  return { avatar, upload };
});
```

---

## Testing

Each provider should have:

1. **Unit tests** - Mock API responses
2. **Integration tests** - Real API calls (CI only)
3. **Error handling tests** - Rate limits, timeouts, failures
4. **Effect composition tests** - Verify DI works

---

## Documentation

Each provider file should include:

1. Purpose and use cases
2. Service interface with full types
3. Error types
4. Environment variables
5. Example usage
6. Rate limits and quotas
7. Cost considerations

---

## Next Steps

1. Create provider files in `convex/services/providers/`
2. Implement basic functionality for each
3. Add comprehensive tests
4. Update `Service Providers.md` with integration details
5. Create example workflows using new providers
6. Add to `AllProviders` composition layer

---

## Document Update Summary

**Last Updated**: 2025-10-05

### Key Clarifications Added

**1. Media Storage Architecture:**
- **AWS S3 + CloudFront**: General media storage (images, videos, audio, documents, avatars)
- **Cloudflare Stream**: LIVESTREAMING ONLY (real-time RTMP/WebRTC streaming)
- Clear separation of concerns between static media and live streaming

**2. Payment Architecture:**
- **Stripe**: Fiat payments ONLY (USD, credit cards, bank transfers)
- **Blockchain providers**: Crypto payments (tokens, on-chain transactions)
- No overlap between fiat and crypto payment flows

**3. Multi-Chain Architecture:**
- Each blockchain gets its own dedicated provider (NO consolidation)
- Current: Base chain (Alchemy + Uniswap)
- Future: Sui (SuiProvider + SuiDEXProvider), Solana (SolanaProvider + RaydiumProvider)
- Reason: Type safety, different address formats, gas models, and token standards

**4. Effect.ts Error Handling:**
- All providers now use `Data.TaggedEnum` for exhaustive error handling
- Proper error types for each provider:
  - `DIDError`, `HeyGenError`, `UniswapError`, `AlchemyError`
  - `TwilioError`, `SendGridError`, `AWSError`, `CloudflareError`
- Pattern matching support via `Effect.catchTag`
- Composable error handling across provider workflows

**5. Provider-Specific Updates:**
- **Uniswap**: Marked as Base chain only, noted DEX will vary per chain
- **Alchemy**: Marked as Base chain only, noted infrastructure provider per chain
- **AWS**: Added CloudFront URL in upload response, clarified non-streaming media
- **Cloudflare**: Removed `uploadVideo` (use AWS), added `getStreamMetrics`, emphasized livestreaming only
- **All providers**: Added comprehensive error types with Data.TaggedEnum

### Architecture Principles

**No Consolidation:**
- Each service provider is independent
- Each blockchain gets dedicated providers
- Type safety and chain-specific optimizations prioritized

**Effect.ts First:**
- All providers use Effect.ts patterns
- Context.Tag for dependency injection
- Data.TaggedEnum for type-safe errors
- Layer composition for provider orchestration

**Clear Separation:**
- Media: AWS vs Cloudflare Stream
- Payments: Stripe vs blockchain providers
- Chains: Dedicated providers per blockchain

---

**Status**: Ready for implementation. All specifications complete with architecture clarifications.
