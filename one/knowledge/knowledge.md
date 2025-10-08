# Knowledge: Vectors, Embeddings & Inference

**The Intelligence Layer**

Knowledge is the fourth primitive in ONE's ontology. It powers:
- **Semantic search** via vector embeddings
- **RAG** (Retrieval-Augmented Generation) for AI responses
- **Inference** for content generation
- **Taxonomy** via labels (replaces legacy "tags")

---

## The Knowledge Table

```typescript
type KnowledgeType = 'label' | 'document' | 'chunk' | 'vector_only';

type Knowledge = {
  _id: Id<'knowledge'>;
  knowledgeType: KnowledgeType;

  // Content
  text?: string;                   // Omitted for vector_only
  embedding?: number[];            // Float32 vector (e.g., 3072 dims)
  embeddingModel?: string;         // 'text-embedding-3-large'
  embeddingDim?: number;

  // Source linkage
  sourceThingId?: Id<'things'>;    // Which thing this came from
  sourceField?: string;            // 'content', 'transcript', 'title'
  chunk?: {
    index: number;
    start?: number;
    end?: number;
    tokenCount?: number;
    overlap?: number;
  };

  // Taxonomy
  labels?: string[];               // ['industry:fitness', 'skill:video']

  // Metadata
  metadata?: {
    language?: string;
    protocol?: string;             // For protocol-specific knowledge
    hash?: string;                 // Content hash for deduplication
    modelVersion?: string;
    qualityScore?: number;
    [key: string]: any;
  };

  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

### Junction: thingKnowledge

Links knowledge ↔ things with roles:

```typescript
type ThingKnowledge = {
  _id: Id<'thingKnowledge'>;
  thingId: Id<'things'>;
  knowledgeId: Id<'knowledge'>;
  role?: 'label' | 'summary' | 'chunk_of' | 'caption' | 'keyword';
  metadata?: Record<string, any>;
  createdAt: number;
}
```

---

## Four Knowledge Types

### 1. Label (Taxonomy)
Replaces legacy "tags" with structured labels:

```typescript
{
  knowledgeType: 'label',
  labels: ['industry:fitness', 'skill:video-editing'],
  text: 'fitness video-editing',  // Searchable text
  metadata: {
    category: 'skill',
    usageCount: 42
  }
}
```

**Label Categories:**
- `industry:*` - fitness, tech, education
- `skill:*` - video-editing, copywriting, design
- `topic:*` - seo, social-media, email-marketing
- `format:*` - video, blog, podcast, course
- `goal:*` - lead-generation, brand-awareness
- `audience:*` - beginners, professionals
- `technology:*` - youtube, instagram, tiktok
- `status:*` - draft, published, archived
- `capability:*` - chat, analyze, generate
- `protocol:*` - a2a, acp, ap2, x402, ag-ui
- `payment_method:*` - stripe, crypto, invoice
- `network:*` - sui, solana, base, ethereum

### 2. Document (Pre-chunking Wrapper)
Represents a source document before chunking:

```typescript
{
  knowledgeType: 'document',
  text: '[Full document text]',
  sourceThingId: blogPostId,
  sourceField: 'content',
  metadata: {
    title: 'How to Build a Creator Business',
    wordCount: 2500,
    language: 'en'
  }
}
```

### 3. Chunk (Semantic Fragment)
800-token chunks with embeddings for RAG:

```typescript
{
  knowledgeType: 'chunk',
  text: '[Paragraph of content...]',
  embedding: [0.123, -0.456, ...],  // 3072-dim vector
  embeddingModel: 'text-embedding-3-large',
  embeddingDim: 3072,
  sourceThingId: blogPostId,
  sourceField: 'content',
  chunk: {
    index: 5,
    tokenCount: 783,
    start: 3200,    // Char offset
    end: 6100,
    overlap: 200
  },
  labels: ['industry:fitness', 'topic:seo']
}
```

### 4. Vector-Only (Privacy)
Embedding without storing plaintext:

```typescript
{
  knowledgeType: 'vector_only',
  embedding: [0.123, -0.456, ...],
  embeddingModel: 'text-embedding-3-large',
  sourceThingId: privateDocId,
  metadata: {
    hash: 'sha256:abc123...',  // Content hash
    redacted: true
  }
}
```

---

## Inference Flow

### How Knowledge Powers Generation

```
┌─────────────────────────────────────────────────────┐
│  1. User Request                                     │
│     "Create a fitness course about weight loss"      │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  2. Vector Search                                    │
│     Query embedding → Find similar chunks            │
│     Filter: labels=['industry:fitness',             │
│                     'format:course']                 │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  3. RAG Context Assembly                             │
│     Top 10 chunks → Context for LLM                  │
│     + Labels + Metadata                              │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  4. LLM Generation                                   │
│     Context + Prompt → Generated content             │
│     Track: inference_request event                   │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  5. New Thing Created                                │
│     Course entity + Lessons + Connections            │
│     Log: content_event (action: 'created')           │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  6. Embed New Content                                │
│     Course → chunks → embeddings → knowledge         │
│     Link via thingKnowledge                          │
└─────────────────────────────────────────────────────┘
```

---

## Ingestion Pipeline

### Step 1: Extract Text from Things

```typescript
// Which thing types have embeddable content?
const embeddableSources = [
  'blog_post',      // properties.content
  'video',          // properties.transcript
  'podcast',        // properties.transcript
  'social_post',    // properties.text
  'email',          // properties.content
  'course',         // properties.description + lessons
  'lesson',         // properties.content
  'livestream',     // properties.recording.transcript
  'website',        // properties.pages[].html (stripped)
];
```

### Step 2: Chunk Text

```typescript
// Chunking strategy
const chunkConfig = {
  size: 800,          // tokens
  overlap: 200,       // tokens
  boundaries: 'sentence',  // Don't split mid-sentence
  preserveCode: true,      // Keep code blocks intact
  preserveTables: true
};

// Chunker output
type Chunk = {
  text: string;
  index: number;
  tokenCount: number;
  start: number;      // Char offset in source
  end: number;
  field: string;      // Source field name
  labels?: string[];  // Inherited from thing
};
```

### Step 3: Generate Embeddings

```typescript
// Call embedding provider (OpenAI, Cohere, etc.)
const embedding = await embedText({
  text: chunk.text,
  model: 'text-embedding-3-large'
});

// Returns: { embedding: number[], model: string, dim: number }
```

### Step 4: Store Knowledge Items

```typescript
// Create knowledge item
const knowledgeId = await db.insert('knowledge', {
  knowledgeType: 'chunk',
  text: chunk.text,
  embedding: embedding.embedding,
  embeddingModel: embedding.model,
  embeddingDim: embedding.dim,
  sourceThingId: thingId,
  sourceField: chunk.field,
  chunk: {
    index: chunk.index,
    tokenCount: chunk.tokenCount,
    start: chunk.start,
    end: chunk.end,
    overlap: 200
  },
  labels: chunk.labels,
  metadata: {
    hash: sha256(chunk.text),
    language: 'en'
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Link to thing
await db.insert('thingKnowledge', {
  thingId,
  knowledgeId,
  role: 'chunk_of',
  createdAt: Date.now()
});
```

---

## Retrieval (RAG)

### Vector Search Query

```typescript
// User asks: "How do I grow on Instagram?"
const queryEmbedding = await embedText({
  text: "How do I grow on Instagram?",
  model: 'text-embedding-3-large'
});

// Vector search
const results = await vectorSearch('knowledge', {
  vectorField: 'embedding',
  query: queryEmbedding.embedding,
  filter: {
    knowledgeType: 'chunk',
    organizationId: currentOrgId,  // Multi-tenant isolation
    'labels': { $in: ['topic:social-media', 'technology:instagram'] }
  },
  k: 10,  // Top 10 results
  threshold: 0.7  // Min similarity score
});
```

### Hybrid Scoring

Combine semantic similarity with symbolic signals:

```typescript
// Boost by:
// 1. Label matches
// 2. Recency
// 3. Quality score
// 4. User feedback

const reranked = results.map(r => ({
  ...r,
  score: r.similarity * 0.6 +              // Vector similarity
         labelBoost(r.labels) * 0.2 +       // Label match
         recencyBoost(r.createdAt) * 0.1 +  // Newer is better
         qualityBoost(r.metadata.qualityScore) * 0.1
})).sort((a, b) => b.score - a.score);
```

### Context Assembly

```typescript
// Build context for LLM
const context = {
  chunks: reranked.slice(0, 5),  // Top 5 chunks
  totalTokens: sum(chunks.map(c => c.chunk.tokenCount)),
  sources: unique(chunks.map(c => c.sourceThingId)),
  labels: unique(chunks.flatMap(c => c.labels))
};

// Generate answer with citations
const answer = await llm.generate({
  system: "You are a creator business expert.",
  context: context.chunks.map(c => c.text).join('\n\n'),
  prompt: "How do I grow on Instagram?",
  citations: context.sources  // Link back to source things
});
```

---

## Inference Events

Track all AI generations in the ontology:

```typescript
// 1. Inference requested
await db.insert('events', {
  type: 'inference_request',
  actorId: userId,
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    organizationId,
    model: 'gpt-4',
    prompt: 'Create a fitness course...',
    contextChunks: 10,
    cost: 0.045,
    price: 0.10
  }
});

// 2. Inference completed
await db.insert('events', {
  type: 'inference_completed',
  actorId: 'system',
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    result: courseId,
    tokensGenerated: 2500,
    latency: 3.2,  // seconds
    revenue: 0.10
  }
});

// 3. Update org usage
const org = await db.get(organizationId);
await db.patch(organizationId, {
  properties: {
    ...org.properties,
    usage: {
      ...org.properties.usage,
      inferences: org.properties.usage.inferences + 1
    }
  }
});

// 4. Check quota
if (org.properties.usage.inferences >= org.properties.limits.inferences) {
  await db.insert('events', {
    type: 'inference_quota_exceeded',
    actorId: 'system',
    targetId: organizationId,
    timestamp: Date.now(),
    metadata: {
      limit: org.properties.limits.inferences,
      usage: org.properties.usage.inferences
    }
  });
}
```

---

## Inference Revenue Model

### Daily Revenue Collection

```typescript
// Collect all inference revenue for the day
const today = new Date().setHours(0, 0, 0, 0);
const inferenceEvents = await db
  .query('events')
  .withIndex('type_time', q =>
    q.eq('type', 'inference_completed')
     .gte('timestamp', today)
  )
  .collect();

const metrics = {
  totalInferences: inferenceEvents.length,
  totalRevenue: sum(inferenceEvents.map(e => e.metadata.revenue)),
  totalCosts: sum(inferenceEvents.map(e => e.metadata.cost)),
  netProfit: 0,  // Calculated below
  profitMargin: 0
};

metrics.netProfit = metrics.totalRevenue - metrics.totalCosts;
metrics.profitMargin = (metrics.netProfit / metrics.totalRevenue) * 100;

// Log revenue collection event
await db.insert('events', {
  type: 'inference_revenue_collected',
  actorId: 'system',
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    ...metrics,
    network: 'sui',
    treasuryAddress: process.env.PLATFORM_TREASURY_SUI,
    txDigest: '...'  // On-chain transaction
  }
});
```

### Revenue Share Distribution

If organizations have revenue share agreements:

```typescript
const org = await db.get(organizationId);

if (org.properties.revenueShare > 0) {
  const orgRevenue = metrics.totalRevenue * org.properties.revenueShare;
  const platformRevenue = metrics.totalRevenue - orgRevenue;

  // Log revenue generation
  await db.insert('events', {
    type: 'org_revenue_generated',
    actorId: organizationId,
    targetId: platformOwnerId,
    timestamp: Date.now(),
    metadata: {
      totalRevenue: metrics.totalRevenue,
      orgShare: orgRevenue,
      platformShare: platformRevenue,
      revenueSharePercentage: org.properties.revenueShare
    }
  });

  // Distribute to org
  await db.insert('events', {
    type: 'revenue_share_distributed',
    actorId: platformOwnerId,
    targetId: orgOwnerId,
    timestamp: Date.now(),
    metadata: {
      amount: orgRevenue,
      percentage: org.properties.revenueShare,
      network: 'sui',
      txDigest: '...'
    }
  });
}
```

---

## Inference Score

Track how many times AI modifies the ontology:

```markdown
# Inference Score

Measures ontology stability. Lower is better.

Current Score: 15
Last Hash: adbe7c5cd7e0d7bd1f17917054091b9b02204936aaeb2e60a395df39e7deb8cd
Updated: 2025-10-07T17:21:52Z

## History
- 2025-10-07T17:09:16Z: score=1 (initial)
- 2025-10-07T17:21:52Z: score=15 (current)

## Goal
Keep score < 20 per month. Stability = beauty.
```

---

## Lifecycle & Governance

### Versioning
- Store `metadata.hash` (SHA256 of text)
- Skip re-embedding if hash unchanged
- Track `metadata.modelVersion` for model upgrades

### Re-embedding Policy
- On content change: schedule re-embed
- On model upgrade: background reindex
- Debounce: wait 5 minutes before re-embedding

### Archival
- Mark old chunks `deletedAt` on major edits
- Keep for audit trail
- GC after 90 days

### Quality Tracking
```typescript
metadata: {
  qualityScore: 0.85,      // 0-1
  userFeedback: [
    { userId, rating: 5, comment: 'very helpful' }
  ],
  clickThrough: 0.42,      // CTR on citations
  bounceRate: 0.12
}
```

---

## Security & Privacy

### PII Redaction
Before embedding, strip:
- Email addresses
- Phone numbers
- Credit card numbers
- Social security numbers

Mark with `metadata.redacted = true`

### Sensitive Content
Use `knowledgeType: 'vector_only'`:
- No plaintext stored
- Only embeddings + hash
- Citations show source but not content

### Access Control
Vector search MUST filter by:
```typescript
filter: {
  organizationId: currentOrgId,  // Multi-tenant isolation
  // Only search content user can access
}
```

---

## Performance

### Indexes
```typescript
// Knowledge table
- by_type(knowledgeType)
- by_source(sourceThingId)
- by_created(createdAt)
- by_embedding (vector index - provider-specific)

// thingKnowledge junction
- by_thing(thingId)
- by_knowledge(knowledgeId)
```

### Query Optimization
- Use filters before vector search
- Limit k to 5-20
- Set similarity threshold (0.7+)
- Cache common queries

### Chunking Best Practices
- 800 tokens = sweet spot
- 200 token overlap = continuity
- Sentence boundaries = coherence
- Preserve structure (code, tables)

---

## The Beautiful Loop

```
Create Thing → Extract Text → Chunk → Embed → Store Knowledge
     ↑                                                    ↓
     └───────── Generate with RAG ← Vector Search ───────┘
```

Knowledge makes AI generation **context-aware**, **organization-scoped**, and **infinitely scalable**.

Every thing becomes searchable.
Every connection becomes discoverable.
Every event becomes learnable.

**This is how ONE grows beautifully.**
