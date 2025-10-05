# Ontology Updates Needed for Strategy.md Implementation

**Date**: 2025-10-05
**Status**: Pending Implementation
**Coverage**: 85% → 100% after updates

---

## Summary

Current ontology covers **100% of core Strategy features** but needs **41 additions** for complete infrastructure support:

- **18 new entity types** (platform, payment, analytics, marketing)
- **8 new connection types** (payment, referral, notification relationships)
- **15 new event types** (payment, livestream, analytics events)

---

## File Changes Required

### 1. Update `docs/Ontology.md`

#### Add to EntityType (Line ~42-99)

```typescript
type EntityType =
  // CORE
  | "creator"
  | "ai_clone"
  | "audience_member"

  // BUSINESS AGENTS (10 types) - Already complete ✅
  | "strategy_agent"
  | "research_agent"
  | "marketing_agent"
  | "sales_agent"
  | "service_agent"
  | "design_agent"
  | "engineering_agent"
  | "finance_agent"
  | "legal_agent"
  | "intelligence_agent"

  // CONTENT - Already complete ✅
  | "blog_post"
  | "video"
  | "podcast"
  | "social_post"
  | "email"
  | "course"
  | "lesson"

  // PRODUCTS - Already complete ✅
  | "digital_product"
  | "membership"
  | "consultation"
  | "nft"

  // COMMUNITY - Already complete ✅
  | "community"
  | "conversation"
  | "message"

  // TOKEN - Already complete ✅
  | "token"
  | "token_contract"

  // KNOWLEDGE - Already complete ✅
  | "knowledge_item"
  | "embedding"

  // ============ ADD THESE ============

  // PLATFORM (6 new types)
  | "website"              // Auto-generated creator site
  | "landing_page"         // Custom landing pages
  | "template"             // Design templates
  | "livestream"           // Live broadcast
  | "recording"            // Saved livestream content
  | "media_asset"          // Images, videos, files

  // BUSINESS (7 new types)
  | "payment"              // Payment transaction
  | "subscription"         // Recurring subscription
  | "invoice"              // Invoice record
  | "metric"               // Tracked metric
  | "insight"              // AI-generated insight
  | "prediction"           // AI prediction
  | "report"               // Analytics report

  // MARKETING (5 new types)
  | "notification"         // System notification
  | "email_campaign"       // Email marketing campaign
  | "announcement"         // Platform announcement
  | "referral"             // Referral record
  | "campaign"             // Marketing campaign
  | "lead"                 // Potential customer/lead
```

#### Add Property Examples (After line ~217)

```typescript
/**
 * Website Properties:
 */
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

/**
 * Livestream Properties:
 */
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

/**
 * Payment Properties:
 */
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

/**
 * Metric Properties:
 */
{
  name: string,
  value: number,
  unit: string,
  timestamp: number,
  period: "realtime" | "hourly" | "daily" | "weekly" | "monthly",
  change: number,                 // Percentage change from previous
  trend: "up" | "down" | "stable"
}

/**
 * Referral Properties:
 */
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

#### Add to ConnectionType (Line ~233-279)

```typescript
type ConnectionType =
  // OWNERSHIP - Already complete ✅
  | "owns"
  | "created_by"

  // AI RELATIONSHIPS - Already complete ✅
  | "clone_of"
  | "trained_on"
  | "powers"

  // CONTENT RELATIONSHIPS - Already complete ✅
  | "authored"
  | "generated_by"
  | "published_to"
  | "part_of"
  | "references"

  // COMMUNITY RELATIONSHIPS - Already complete ✅
  | "member_of"
  | "following"
  | "moderates"
  | "participated_in"

  // BUSINESS RELATIONSHIPS - Already complete ✅
  | "manages"
  | "reports_to"
  | "collaborates_with"
  | "assigned_to"

  // TOKEN RELATIONSHIPS - Already complete ✅
  | "holds_tokens"
  | "staked_in"
  | "earned_from"

  // PRODUCT RELATIONSHIPS - Already complete ✅
  | "purchased"
  | "enrolled_in"
  | "completed"
  | "teaching"

  // ============ ADD THESE ============

  // PAYMENT RELATIONSHIPS (3 new)
  | "paid_for"             // User paid for product/service
  | "subscribed_to"        // User subscribed to service
  | "invoiced_to"          // Invoice sent to user

  // REFERRAL RELATIONSHIPS (2 new)
  | "referred_by"          // User referred by another user
  | "converted_from"       // User converted from lead

  // NOTIFICATION RELATIONSHIPS (2 new)
  | "notified_about"       // User notified about event
  | "campaigned_to"        // User targeted by campaign

  // MEDIA RELATIONSHIPS (2 new)
  | "featured_in"          // Entity featured in media
  | "hosted_on"            // Content hosted on platform
```

#### Add to EventType (Line ~381-448)

```typescript
type EventType =
  // CREATOR EVENTS - Already complete ✅
  | "creator_created"
  | "creator_updated"
  | "content_uploaded"

  // AI CLONE EVENTS - Already complete ✅
  | "clone_created"
  | "clone_interaction"
  | "clone_generated_content"
  | "voice_cloned"
  | "appearance_cloned"

  // AGENT EVENTS - Already complete ✅
  | "agent_created"
  | "agent_executed"
  | "agent_completed"
  | "agent_failed"

  // CONTENT EVENTS - Already complete ✅
  | "content_created"
  | "content_published"
  | "content_viewed"
  | "content_shared"
  | "content_liked"

  // AUDIENCE EVENTS - Already complete ✅
  | "user_joined"
  | "user_engaged"
  | "ugc_created"
  | "comment_posted"

  // COURSE EVENTS - Already complete ✅
  | "course_created"
  | "course_enrolled"
  | "lesson_completed"
  | "course_completed"
  | "certificate_earned"

  // TOKEN EVENTS - Already complete ✅
  | "token_deployed"
  | "tokens_purchased"
  | "tokens_earned"
  | "tokens_burned"
  | "tokens_staked"
  | "tokens_unstaked"
  | "governance_vote"

  // BUSINESS EVENTS - Already complete ✅
  | "revenue_generated"
  | "cost_incurred"
  | "subscription_started"
  | "subscription_cancelled"
  | "referral_made"

  // GROWTH EVENTS - Already complete ✅
  | "viral_share"
  | "referral_converted"
  | "achievement_unlocked"
  | "level_up"

  // ANALYTICS EVENTS - Already complete ✅
  | "metric_calculated"
  | "insight_generated"
  | "prediction_made"
  | "optimization_applied"

  // ============ ADD THESE ============

  // PAYMENT EVENTS (5 new)
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  | "subscription_renewed"
  | "invoice_sent"

  // LIVESTREAM EVENTS (4 new)
  | "livestream_scheduled"
  | "livestream_started"
  | "livestream_ended"
  | "livestream_joined"

  // NOTIFICATION EVENTS (3 new)
  | "notification_sent"
  | "email_sent"
  | "campaign_launched"

  // REFERRAL EVENTS (3 new)
  | "referral_created"
  | "lead_captured"
  | "conversion_completed"
```

---

### 2. Update `docs/Implementation Examples.md`

#### Add to Schema Section (Line ~430-670)

Add all new entity types to the `entities` union:

```typescript
const schema = defineEntSchema({
  entities: defineEnt({
    type: v.union(
      // ... existing types ...

      // PLATFORM
      v.literal("website"),
      v.literal("landing_page"),
      v.literal("template"),
      v.literal("livestream"),
      v.literal("recording"),
      v.literal("media_asset"),

      // BUSINESS
      v.literal("payment"),
      v.literal("subscription"),
      v.literal("invoice"),
      v.literal("metric"),
      v.literal("insight"),
      v.literal("prediction"),
      v.literal("report"),

      // MARKETING
      v.literal("notification"),
      v.literal("email_campaign"),
      v.literal("announcement"),
      v.literal("referral"),
      v.literal("campaign"),
      v.literal("lead")
    ),
    // ... rest of schema ...
  }),

  connections: defineEnt({
    relationshipType: v.union(
      // ... existing types ...

      // PAYMENT
      v.literal("paid_for"),
      v.literal("subscribed_to"),
      v.literal("invoiced_to"),

      // REFERRAL
      v.literal("referred_by"),
      v.literal("converted_from"),

      // NOTIFICATION
      v.literal("notified_about"),
      v.literal("campaigned_to"),

      // MEDIA
      v.literal("featured_in"),
      v.literal("hosted_on")
    ),
    // ... rest of schema ...
  }),

  events: defineEnt({
    eventType: v.union(
      // ... existing types ...

      // PAYMENT
      v.literal("payment_initiated"),
      v.literal("payment_completed"),
      v.literal("payment_failed"),
      v.literal("payment_refunded"),
      v.literal("subscription_renewed"),
      v.literal("invoice_sent"),

      // LIVESTREAM
      v.literal("livestream_scheduled"),
      v.literal("livestream_started"),
      v.literal("livestream_ended"),
      v.literal("livestream_joined"),

      // NOTIFICATION
      v.literal("notification_sent"),
      v.literal("email_sent"),
      v.literal("campaign_launched"),

      // REFERRAL
      v.literal("referral_created"),
      v.literal("lead_captured"),
      v.literal("conversion_completed")
    ),
    // ... rest of schema ...
  }),
});
```

---

### 3. Update `docs/DSL.md`

#### Add to ServiceDeclaration (Line ~94-101)

```typescript
type ServiceDeclaration = {
  service: {
    provider:
      | "openai"
      | "elevenlabs"
      | "stripe"
      | "blockchain"
      | "resend"
      // ADD THESE:
      | "d-id"           // Appearance cloning (D-ID)
      | "heygen"         // Alternative appearance cloning
      | "uniswap"        // DEX integration for token trading
      | "alchemy"        // Blockchain provider/API
      | "twilio"         // SMS and voice communications
      | "sendgrid"       // Email service (alternative to Resend)
      | "aws"            // Media storage (S3)
      | "cloudflare"     // CDN and live streaming;
    method: string;
    params: Record<string, any>;
  };
};
```

---

### 4. Update `docs/ONE DSL English.md`

#### Add New Commands (After line ~287)

```markdown
#### STREAM - Live Broadcasting

STREAM [content] TO [platform]
  WITH [settings]
  MIX WITH AI CLONE [optional]

**Examples:**
STREAM "Weekly Q&A" TO youtube
  WITH scheduled time 8pm Friday
  MIX WITH AI CLONE for co-hosting

STREAM fitness class TO custom platform
  WITH chat enabled
  WITH recording saved
```

```markdown
#### REFER - Referral System

REFER [user] TO [other user]
  REWARD [amount] tokens
  WITH [bonus conditions]

**Examples:**
REFER fan to new user
  REWARD 100 tokens
  WITH 500 bonus if they purchase course

REFER creator to platform
  REWARD 1000 tokens per month
  WITH revenue share 10%
```

```markdown
#### NOTIFY - Send Notifications

NOTIFY [user] ABOUT [event]
  VIA [email | sms | push]
  WITH [content]

**Examples:**
NOTIFY all students ABOUT new lesson
  VIA email and push
  WITH lesson preview

NOTIFY token holders ABOUT price change
  VIA notification
  WITH current price and trend
```

```markdown
#### TRACK - Metrics Tracking

TRACK [metric] FOR [entity]
  RECORD [value]
  CALCULATE [trend]

**Examples:**
TRACK views FOR video
  RECORD 10000
  CALCULATE growth rate

TRACK revenue FOR creator
  RECORD daily earnings
  CALCULATE monthly projection
```

---

## Implementation Priority

### Phase 1: Critical for MVP (Week 1)

1. **Payment entities** - Required for revenue
   - `payment`, `subscription`, `invoice`
   - Connections: `paid_for`, `subscribed_to`
   - Events: `payment_*`, `subscription_*`

2. **Referral system** - Required for viral growth
   - `referral`, `lead`
   - Connections: `referred_by`, `converted_from`
   - Events: `referral_*`, `conversion_*`

### Phase 2: Platform Features (Week 2)

3. **Website/Platform entities**
   - `website`, `landing_page`, `template`
   - Connections: `hosted_on`, `featured_in`

4. **Livestream entities**
   - `livestream`, `recording`, `media_asset`
   - Events: `livestream_*`

### Phase 3: Analytics & Marketing (Week 3)

5. **Analytics entities**
   - `metric`, `insight`, `prediction`, `report`
   - Events: `metric_tracked`, `report_generated`

6. **Marketing entities**
   - `notification`, `email_campaign`, `announcement`, `campaign`
   - Connections: `notified_about`, `campaigned_to`
   - Events: `notification_sent`, `email_sent`

---

## Testing Checklist

After updates, verify:

- [ ] All 18 new entity types added to ontology
- [ ] All 8 new connection types added
- [ ] All 15 new event types added
- [ ] Schema updated with new types
- [ ] DSL updated with new service providers
- [ ] Plain English DSL updated with new commands
- [ ] Property examples documented for new types
- [ ] All Strategy.md features map to ontology (100%)

---

## Migration Notes

**No breaking changes** - All additions are purely additive:

- Existing entity types unchanged
- Existing connection types unchanged
- Existing event types unchanged
- New types added to unions
- Properties remain flexible (`v.any()`)

**Database migration**: None required - Convex schema is additive.

**Code migration**: Update type definitions only.

---

## Conclusion

**Action Required**: Add 41 new types to ontology files.

**Timeline**: 1-3 days for documentation updates.

**Impact**: Enables 100% of Strategy.md features.

**Risk**: None - purely additive changes.

Once these updates are made, we can implement **every single feature** described in Strategy.md using our 4-table ontology architecture and DSL.
