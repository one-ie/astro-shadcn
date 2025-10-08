# ONE Vectors — RAG Design and Implementation Guide

Version: 1.0.0
Scope: Complements one/connections/ontology.md by detailing how vectors (embeddings) and knowledge items power search and generation.

## Overview

- Knowledge is a first‑class primitive in the ontology (replaces legacy tags).
- `knowledge` stores both taxonomy labels and semantic chunks with vectors.
- `thingKnowledge` links knowledge items to entities (things) with roles.
- Goal: attach vectors to every relevant piece of content and enable hybrid (semantic + symbolic) retrieval across the platform.

## Data Model

Knowledge table (see Ontology):

```typescript
type KnowledgeType = 'label' | 'document' | 'chunk' | 'vector_only';

type Knowledge = {
  _id: Id<'knowledge'>;
  knowledgeType: KnowledgeType;
  text?: string;                   // omitted for vector_only
  embedding?: number[];            // Float32 vector
  embeddingModel?: string;         // e.g., 'text-embedding-3-large'
  embeddingDim?: number;           // e.g., 3072
  sourceThingId?: Id<'things'>;
  sourceField?: string;            // e.g., 'content', 'transcript', 'title'
  chunk?: { index: number; start?: number; end?: number; tokenCount?: number; overlap?: number };
  labels?: string[];               // lightweight taxonomy (label knowledge also exists)
  metadata?: Record<string, any>;  // language, mime, hash, version, protocol, etc.
  createdAt: number; updatedAt: number; deletedAt?: number;
}
```

Junction table:

```typescript
type ThingKnowledge = {
  _id: Id<'thingKnowledge'>;
  thingId: Id<'things'>;
  knowledgeId: Id<'knowledge'>;
  role?: 'label' | 'summary' | 'chunk_of' | 'caption' | 'keyword';
  metadata?: Record<string, any>;  // confidence, section, etc.
  createdAt: number;
}
```

Recommended indexes:
- `knowledge.by_type(knowledgeType)`
- `knowledge.by_source(sourceThingId)`
- `knowledge.by_created(createdAt)`
- Vector index (provider‑specific) on `knowledge.embedding`
- `thingKnowledge.by_thing(thingId)`, `thingKnowledge.by_knowledge(knowledgeId)`

## Chunking Strategy

- Window: ~800 tokens; Overlap: ~200 tokens.
- Boundaries: sentence/paragraph aware; avoid splitting code blocks or tables mid‑chunk.
- Normalize: strip HTML → text, preserve headings, code fences, alt text; set `metadata.language`.
- Track: `chunk.index`, `chunk.tokenCount`, `chunk.start/end` (char offsets) for provenance.
- Titles/summaries: embed separately as small chunks to improve retrieval precision.

## Embedding Strategy

- Model: configurable (env) default `text-embedding-3-large`.
- Store: `embedding`, `embeddingModel`, `embeddingDim` per knowledge item.
- Privacy: use `knowledgeType: 'vector_only'` for sensitive text; include content hash in `metadata.hash`.
- Dedup: compute `metadata.hash` (e.g., SHA256 of normalized text); skip re‑embedding if unchanged.
- Refresh: on model change, lazily re‑embed on next access or schedule a background reindex.

## Ingestion Pipeline (Convex)

Events/triggers:
- On content write/update, log `content_changed` and schedule ingestion for affected fields.
- Manual backfill via admin mutation.

APIs (pseudo‑code):

```typescript
// internal action: provider call
export const embedText = internalAction({
  args: { text: v.string(), model: v.optional(v.string()) },
  handler: async (ctx, { text, model }) => {
    const res = await callEmbedProvider(text, model);
    return { embedding: res.vector, model: res.model, dim: res.vector.length };
  },
});

// mutation: schedule embedding work
export const scheduleEmbeddingForThing = mutation({
  args: { id: v.id('things'), fields: v.optional(v.array(v.string())) },
  handler: async (ctx, { id, fields }) => {
    await ctx.scheduler.runAfter(0, internal.rag.ingestThing, { id, fields });
  },
});

// internal action: ingest a thing => chunks + vectors + links
export const ingestThing = internalAction({
  args: { id: v.id('things'), fields: v.optional(v.array(v.string())) },
  handler: async (ctx, { id, fields }) => {
    const thing = await ctx.runQuery(internal.entities.get, { id });
    const texts = extractTexts(thing, fields); // [{ field, text, labels? }]
    let index = 0;
    for (const piece of chunk(texts, { size: 800, overlap: 200 })) {
      const { embedding, model, dim } = await ctx.runAction(internal.rag.embedText, { text: piece.text });
      const knowledgeId = await ctx.runMutation(internal.rag.upsertKnowledge, {
        item: {
          knowledgeType: 'chunk', text: piece.text, embedding, embeddingModel: model, embeddingDim: dim,
          sourceThingId: id, sourceField: piece.field,
          chunk: { index, tokenCount: piece.tokens, overlap: 200 },
          labels: piece.labels,
        },
      });
      await ctx.runMutation(internal.rag.linkThingKnowledge, { thingId: id, knowledgeId, role: 'chunk_of' });
      index++;
    }
  },
});
```

Required helpers:
- `extractTexts(thing, fields?)`: normalize and select text fields by type (posts, lessons, transcripts, titles, descriptions).
- `chunk(texts, opts)`: tokenization‑aware chunker with overlap.
- `upsertKnowledge(item)`: dedupe by `metadata.hash` if present; update timestamps.
- `linkThingKnowledge({ thingId, knowledgeId, role })`: idempotent link.

## Retrieval

Vector search:
- Filter: `knowledgeType: 'chunk'`, `sourceThingId` in org scope, optional content types.
- ANN search by `embedding`, k=5–20; score threshold configurable.
- Hybrid: boost by label matches (industry/skill/topic) and recency.

Answer assembly:
- De‑duplicate overlapping chunks from same source; merge adjacents.
- Respect token budget for downstream LLM; include citations via `sourceThingId` + offsets.

Example (pseudo‑code):

```typescript
const topK = await vectorSearch('knowledge', {
  vectorField: 'embedding',
  query: queryEmbedding,
  filter: { knowledgeType: 'chunk', orgId },
  k: 12,
});
return rerank(topK, { labelsBoost: ['industry:fitness', 'topic:seo'] });
```

## Governance & Lifecycle

- Versioning: store `metadata.modelVersion` and `metadata.hash`.
- Re‑embed policy: on significant content change or model upgrade.
- Archival: mark old chunks deletedAt; keep for audit until GC.
- GC: periodic job to remove orphaned knowledge and old chunk versions.
- Quality: track `metadata.qualityScore`, user feedback, and click‑through.

## Security & Privacy

- Redaction: remove PII before embedding; mark with `metadata.redacted=true`.
- Sensitive content: use `vector_only` items; keep plaintext out of DB.
- Access control: vector search must respect org/user permissions on `sourceThingId`.

## Backfill Plan

1) Enumerate content things (posts, lessons, videos, podcasts, emails, pages).
2) Extract text and labels; build chunks; embed; write `knowledge` + `thingKnowledge`.
3) Schedule nightly drift detection to re‑embed changed sources.

## Environment

```bash
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_PROVIDER=openai|other
EMBEDDING_API_KEY=...
```

## Notes

- Prefer knowledge labels over new enums for taxonomy changes.
- Keep the ontology stable; push variance into `properties`, labels, and metadata.

