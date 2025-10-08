# Tags (Categories)

This folder contains documentation about **tag categories** in the ONE Platform ontology.

## What Goes Here

Documentation about categorization and taxonomy - how we classify and filter things.

**Future Additions:**
- `NetworkTags.md` - Blockchain network tags (sui, solana, base)
- `ProtocolTags.md` - Protocol tags (a2a, acp, ap2, x402, ag-ui)
- `SkillTags.md` - Skill tags (programming, video-editing, design)
- `IndustryTags.md` - Industry tags (fitness, business, art)
- `CapabilityTags.md` - Agent capability tags (image_gen, analysis, trading)

## The 12 Tag Categories

From the ontology:

1. **skill** - Programming, video-editing, design, etc.
2. **industry** - Fitness, business, art, education, etc.
3. **topic** - AI, blockchain, marketing, sales, etc.
4. **format** - Video, text, audio, interactive
5. **goal** - Learn, earn, build, grow
6. **audience** - Beginners, professionals, students
7. **technology** - React, Python, Figma, SUI, Solana, etc.
8. **status** - Featured, trending, new, verified
9. **capability** - Agent capabilities (image_gen, analysis, trading, etc.)
10. **protocol** - a2a, acp, ap2, x402, ag-ui
11. **payment_method** - stripe, crypto, x402, ap2
12. **network** - sui, solana, base, ethereum

## Tag Structure

Every tag has:

```typescript
{
  _id: Id<"tags">,
  name: string,              // e.g., "fitness", "video-editing"
  category: TagCategory,     // One of the 12 categories
  description?: string,
  color?: string,            // Hex color for UI
  icon?: string,             // Icon name/URL
  usageCount: number,        // How many entities have this tag
  createdAt: number
}
```

## Thing-Tag Association

Tags connect to things via the `entityTags` junction table:

```typescript
{
  _id: Id<"entityTags">,
  entityId: Id<"entities">,
  tagId: Id<"tags">,
  createdAt: number
}
```

## Examples

**Creator with multiple tags:**
```typescript
const tags = [
  { name: 'fitness', category: 'industry' },
  { name: 'video-editing', category: 'skill' },
  { name: 'youtube', category: 'technology' },
  { name: 'beginners', category: 'audience' },
];

for (const tag of tags) {
  const tagId = await getOrCreateTag(tag);
  await db.insert('entityTags', {
    entityId: creatorId,
    tagId,
    createdAt: Date.now(),
  });
}
```

**Blockchain entity with network tag:**
```typescript
// SUI token contract
const tags = [
  { name: 'sui', category: 'network' },
  { name: 'sui-move', category: 'protocol' },
  { name: 'token', category: 'capability' },
];
```

**Search by tags:**
```typescript
// Find all fitness content
const fitnessTags = await db
  .query('tags')
  .filter(q => q.eq(q.field('name'), 'fitness'))
  .collect();

const fitnessContent = await db
  .query('entityTags')
  .filter(q => q.eq(q.field('tagId'), fitnessTags[0]._id))
  .collect()
  .then(assocs => assocs.map(a => a.entityId));
```

## Rules

- **Free-form** - Users can create new tags (with moderation)
- **Curated categories** - 12 categories are fixed
- **Uniqueness** - Tag names are unique within a category
- **Usage tracking** - usageCount incremented when tag applied
- **Hygiene** - Periodically consolidate duplicates
- **Never delete** - Mark deprecated instead

## Tag Governance

**Default:** Free-form, user-extensible tags for maximum flexibility.

**Policy:**
- Platform/org owners can curate official tags
- Users can apply ad-hoc tags
- Periodic consolidation of low-usage duplicates
- Deprecated tags remain for historical data

## Reference

See `../ontology.md` for the complete canonical specification.
