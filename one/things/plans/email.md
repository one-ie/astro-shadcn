# Email Client Implementation Plan

**Goal:** Build a production-ready email system using Resend, starting with quick integration then evolving to a full-featured client with shadcn/ui Mail interface.

**Vision:** Combine backend email infrastructure (Resend API) with a beautiful frontend mail client (shadcn mail layout) to create a complete email experience in the ONE Platform.

## Phase 1: Quick Integration (Week 1)

### 1.1 Basic Setup
- [x] Resend component already configured in `convex/convex.config.ts`
- [x] Environment variables set (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- [ ] Verify domain configuration in Resend dashboard
- [ ] Test basic email sending capability

### 1.2 Core Email Patterns
**Files to create:**
- `convex/services/email/resend.ts` - Effect.ts service wrapper
- `convex/mutations/email.ts` - Public mutations for email operations
- `convex/actions/email.ts` - Internal actions for actual sending

**Pattern:**
```typescript
// mutation (creates email record) → scheduler → action (sends via Resend)
```

### 1.3 Essential Email Types
Implement minimal set:
1. **Password Reset** (already exists in auth flow)
2. **Welcome Email** (user onboarding)
3. **Transaction Receipt** (token purchases)
4. **Agent Notification** (agent actions)

### 1.4 Ontology Mapping
**Things:**
- `email_template` - Reusable email templates
- `email_log` - Sent email records (for tracking)

**Events:**
- `email_sent` - Email successfully sent
- `email_failed` - Email send failed
- `email_opened` - Recipient opened email
- `email_clicked` - Recipient clicked link

**Connections:**
- `user` → `email_log` (relationshipType: "received_email")

## Phase 2: Template System (Week 2)

### 2.1 Template Engine
**Files:**
- `convex/templates/email/` - Email template components
- `convex/services/email/templates.ts` - Template rendering service

**Template Types:**
- React Email components (`.tsx`)
- Handlebars templates (`.hbs`)
- Plain text versions (fallback)

### 2.2 Template Management
**Features:**
- Store templates in database (`things` table, type: "email_template")
- Version control for templates
- Preview system (render without sending)
- Variable interpolation (`{{user.name}}`, `{{resetLink}}`)

### 2.3 Core Templates
1. **Transactional:**
   - Password reset
   - Email verification
   - Purchase confirmation
   - Payment receipt

2. **Notifications:**
   - Agent activity
   - Course progress
   - Content updates
   - System alerts

3. **Marketing:**
   - Welcome series
   - Weekly digest
   - Feature announcements
   - Re-engagement

## Phase 3: Advanced Features (Week 3-4)

### 3.1 Email Tracking
**Resend webhook integration:**
- `email.sent` - Delivery confirmed
- `email.delivered` - Inbox delivery
- `email.opened` - Open tracking
- `email.clicked` - Link click tracking
- `email.bounced` - Bounce handling
- `email.complained` - Spam complaint

**Files:**
- `convex/http/webhooks/resend.ts` - Webhook handler
- `convex/services/email/tracking.ts` - Event processing

### 3.2 Batch & Scheduled Emails
**Features:**
- Bulk sending (multiple recipients)
- Scheduled delivery (send at specific time)
- Drip campaigns (automated sequences)
- Rate limiting (respect Resend limits)

**Implementation:**
```typescript
// Schedule email for later
ctx.scheduler.runAt(timestamp, internal.email.sendScheduledEmail, { ... })

// Batch processing
for (const user of users) {
  await ctx.scheduler.runAfter(delay, internal.email.send, {
    userId: user._id
  })
  delay += 100 // Rate limiting
}
```

### 3.3 Email Preferences
**Things:**
- `email_preference` - User email settings

**Properties:**
```typescript
{
  userId: Id<"things">,
  categories: {
    transactional: true,    // Always on
    notifications: boolean,  // Agent/content updates
    marketing: boolean,      // Newsletters, promotions
    digest: boolean,         // Weekly/daily summaries
  },
  frequency: "immediate" | "daily" | "weekly",
  unsubscribed: boolean,
  unsubscribedAt?: number,
}
```

### 3.4 Analytics Dashboard
**Queries:**
- Email delivery rate
- Open rate by template
- Click-through rate
- Bounce rate
- Unsubscribe rate

**UI Components:**
- `src/components/features/email/EmailAnalytics.tsx`
- `src/components/features/email/TemplatePerformance.tsx`

## Phase 4: Full Email Client (Week 5-6)

### 4.1 shadcn Mail UI Integration

**Implement the complete shadcn/ui mail interface from `mail.md` specification:**

**Core Components (from mail.md):**
- `src/components/mail/MailLayout.tsx` - Main resizable panel layout
- `src/components/mail/MailList.tsx` - Email list with virtual scrolling
- `src/components/mail/MailDisplay.tsx` - Email content viewer
- `src/components/mail/Nav.tsx` - Folder navigation with active states
- `src/components/mail/AccountSwitcher.tsx` - Multi-account support
- `src/components/mail/MailSearch.tsx` - Real-time search with debouncing
- `src/components/mail/use-mail.ts` - Jotai state management

**Interactive Features:**
- ✅ Clickable folder navigation (Inbox, Drafts, Sent, Junk, Trash, Archive)
- ✅ Real-time search across name, subject, body
- ✅ Tab switching (All mail / Unread)
- ✅ Selection highlighting with visual feedback
- ✅ Action buttons (Archive, Delete, Reply, Forward) with toast notifications
- ✅ Snooze functionality with calendar picker
- ✅ Collapsible sidebar with persistent state
- ✅ Responsive mobile layout with Sheet overlay

**State Management (Jotai):**
```typescript
type Config = {
  selected: Mail["id"] | null
  activeFolder: MailFolder
  searchQuery: string
  activeTab: "all" | "unread"
}
```

**Connect to Backend:**
- Replace mock data with Convex queries
- Use `useQuery(api.email.list)` for mail list
- Use `useMutation(api.email.send)` for sending
- Use `useMutation(api.email.archive)` for actions
- Real-time updates via Convex reactivity

**Files to Create:**
- `src/pages/mail.astro` - Main mail page with MailLayout client:load
- `src/components/mail/*` - All mail components (from mail.md spec)
- `src/hooks/use-media-query.ts` - Responsive breakpoint detection
- `convex/queries/email.ts` - Email list, folders, search queries
- `convex/mutations/email.ts` - Send, archive, delete, mark read/unread

**Performance:**
- Virtual scrolling for 1000+ emails (@tanstack/react-virtual)
- Debounced search (300ms)
- Memoized filtered results
- Optimistic UI updates

### 4.2 Broadcast System
**Features:**
- Campaign creation UI
- Audience segmentation
- A/B testing (subject lines, content)
- Send-time optimization
- Preview/test before sending

**Files:**
- `src/pages/admin/email/campaigns.astro`
- `src/components/features/email/CampaignBuilder.tsx`
- `convex/services/email/campaigns.ts`

### 4.3 Automation Workflows
**Trigger-based emails:**
```typescript
// Example: Welcome series
User signs up (event)
→ Send welcome email (immediate)
→ Wait 1 day
→ Send getting started guide
→ Wait 3 days
→ Send feature highlights
→ Wait 7 days
→ Send success stories
```

**Implementation:**
- State machine for workflows
- Event triggers from ontology
- Conditional logic (if/then)
- Exit conditions (user unsubscribes)

### 4.4 Personalization Engine
**Features:**
- Dynamic content blocks
- User-specific recommendations
- Behavioral targeting
- Timezone-aware delivery

**Data sources:**
- User profile (`things` type: "user")
- Connection graph (relationships)
- Event history (user actions)
- Tags (preferences, interests)

### 4.5 Deliverability Tools
**Features:**
- SPF/DKIM/DMARC verification
- Domain reputation monitoring
- Bounce management
- Complaint handling
- List hygiene (remove invalid emails)

## Technical Architecture

### Service Layer (Effect.ts)
```typescript
// convex/services/email/resend.ts
export class ResendService extends Effect.Service<ResendService>()("ResendService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase
    const resend = yield* ResendProvider

    return {
      // Core operations
      send: (args: SendEmailArgs) => Effect.gen(function* () {
        // 1. Get/render template
        // 2. Check user preferences
        // 3. Send via Resend
        // 4. Log event
        // 5. Return result
      }),

      // Template operations
      renderTemplate: (templateId: Id<"things">, data: any) =>
        Effect.gen(function* () { /* ... */ }),

      // Tracking operations
      processWebhook: (event: ResendWebhookEvent) =>
        Effect.gen(function* () { /* ... */ }),

      // Analytics
      getStats: (filters: EmailStatsFilters) =>
        Effect.gen(function* () { /* ... */ }),
    }
  }),
  dependencies: [ConvexDatabase.Default, ResendProvider.Default]
}) {}
```

### Convex Layer (Thin Wrappers)
```typescript
// convex/mutations/email.ts
export const send = confect.mutation({
  args: {
    templateId: v.id("things"),
    recipientId: v.id("things"),
    data: v.any(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* ResendService

      // Schedule async send
      const emailId = yield* emailService.createEmailRecord(args)

      yield* Effect.promise(() =>
        ctx.scheduler.runAfter(0, internal.email.sendAction, {
          emailId,
          ...args
        })
      )

      return { emailId }
    }).pipe(Effect.provide(MainLayer))
})

// convex/actions/email.ts (internal)
export const sendAction = internalAction({
  args: {
    emailId: v.id("things"),
    templateId: v.id("things"),
    recipientId: v.id("things"),
    data: v.any()
  },
  handler: async (ctx, args) => {
    const resend = new Resend(components.resend, { testMode: false })

    // Get template and recipient
    const template = await ctx.runQuery(internal.email.getTemplate, {
      id: args.templateId
    })
    const recipient = await ctx.runQuery(internal.email.getRecipient, {
      id: args.recipientId
    })

    // Render and send
    const html = renderTemplate(template, args.data)
    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL!,
      to: recipient.email,
      subject: interpolate(template.subject, args.data),
      html,
    })

    // Update email record
    await ctx.runMutation(internal.email.markSent, {
      emailId: args.emailId
    })
  }
})
```

### Frontend Layer (React + Astro)
```typescript
// src/components/features/email/EmailComposer.tsx
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

export function EmailComposer() {
  const send = useMutation(api.email.send)
  const templates = useQuery(api.email.listTemplates)

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      await send({
        templateId: formData.get("template") as Id<"things">,
        recipientId: formData.get("recipient") as Id<"things">,
        data: JSON.parse(formData.get("data") as string)
      })
    }}>
      <Select name="template" options={templates} />
      {/* Recipient selector */}
      {/* Data fields based on template */}
      <Button type="submit">Send Email</Button>
    </form>
  )
}
```

## File Structure

### Backend (Convex + Effect.ts)
```
convex/
├── services/
│   └── email/
│       ├── resend.ts          # Main Effect.ts service
│       ├── templates.ts        # Template rendering service
│       ├── tracking.ts         # Webhook processing service
│       ├── campaigns.ts        # Campaign management service
│       └── preferences.ts      # User preferences service
├── mutations/
│   └── email.ts               # Public mutations (confect wrappers)
├── actions/
│   └── email.ts               # Internal actions (Resend sending)
├── queries/
│   └── email.ts               # Email queries (list, search, folders)
├── http/
│   └── webhooks/
│       └── resend.ts          # Webhook endpoint (Hono)
└── templates/
    └── email/
        ├── welcome.tsx        # React Email templates
        ├── password-reset.tsx
        ├── receipt.tsx
        └── notification.tsx
```

### Frontend (Astro + React)
```
src/
├── components/
│   ├── mail/                  # shadcn Mail UI (from mail.md)
│   │   ├── MailLayout.tsx     # Main resizable layout (client:load)
│   │   ├── MailList.tsx       # Virtual scrolling email list
│   │   ├── MailDisplay.tsx    # Email content viewer
│   │   ├── Nav.tsx            # Folder navigation
│   │   ├── AccountSwitcher.tsx
│   │   ├── MailSearch.tsx     # Debounced search
│   │   └── use-mail.ts        # Jotai state management
│   └── features/
│       └── email/
│           ├── EmailComposer.tsx   # Rich text email composer
│           ├── TemplateEditor.tsx  # Template builder
│           ├── CampaignBuilder.tsx # Campaign creator
│           ├── EmailAnalytics.tsx  # Analytics dashboard
│           └── PreferenceManager.tsx # User settings
├── hooks/
│   └── use-media-query.ts     # Responsive breakpoints
├── data/
│   └── mail-data.ts           # Mock data (replaced by Convex)
└── pages/
    ├── mail.astro             # Main mail client (uses MailLayout)
    └── admin/
        └── email/
            ├── index.astro       # Email dashboard
            ├── templates.astro   # Template management
            ├── campaigns.astro   # Campaign builder
            └── analytics.astro   # Email analytics
```

### Key Integrations
- **Jotai**: State management across mail components
- **@tanstack/react-virtual**: Virtual scrolling for large lists
- **sonner**: Toast notifications for actions
- **React Email**: Template components (server-side rendering)
- **Convex**: Real-time queries, mutations, actions
- **Resend**: Email sending and tracking

## Resend Best Practices

### 1. Domain Setup
- Add SPF, DKIM, DMARC records
- Verify domain in Resend dashboard
- Use dedicated sending domain (e.g., `mail.one.ie`)
- Separate transactional vs. marketing domains

### 2. Rate Limits
- Free tier: 100 emails/day
- Pro tier: 50,000 emails/month
- Use `ctx.scheduler.runAfter()` with delays for batches
- Implement queue system for high volume

### 3. Email Design
- Mobile-first responsive design
- Plain text version always included
- Preheader text for inbox preview
- Clear unsubscribe link (required)
- Test across clients (Gmail, Outlook, Apple Mail)

### 4. Deliverability
- Warm up sending domain gradually
- Monitor bounce/complaint rates
- Clean list regularly (remove bounces)
- Authenticate with SPF/DKIM/DMARC
- Avoid spam trigger words

### 5. Tracking
- Use Resend's built-in tracking
- Custom tracking pixels for opens
- UTM parameters for click tracking
- Webhook for real-time events
- Store events in ontology

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/services/email.test.ts
describe("ResendService", () => {
  it("should render template with data", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* ResendService
        return yield* service.renderTemplate(templateId, {
          name: "Alice"
        })
      }).pipe(Effect.provide(TestLayer))
    )

    expect(result).toContain("Hello Alice")
  })

  it("should respect user email preferences", async () => {
    // Test that marketing emails are not sent if user opted out
  })
})
```

### Integration Tests
```typescript
// tests/integration/email-flow.test.ts
describe("Email Flow", () => {
  it("should complete full send flow", async () => {
    // 1. Create email via mutation
    // 2. Verify scheduled action
    // 3. Wait for action execution
    // 4. Verify email sent via Resend
    // 5. Verify event logged
  })
})
```

### E2E Tests
- Test webhook delivery
- Test email rendering in actual clients
- Test unsubscribe flow
- Test preference updates

## Success Metrics

### Phase 1 (Quick Integration)
- [ ] Send password reset emails
- [ ] Send welcome emails
- [ ] Send transaction receipts
- [ ] 95%+ delivery rate

### Phase 2 (Templates)
- [ ] 10+ email templates
- [ ] Template versioning working
- [ ] Preview system functional
- [ ] Plain text fallbacks

### Phase 3 (Advanced)
- [ ] Webhook tracking operational
- [ ] Open rate >20%
- [ ] Click rate >5%
- [ ] Batch sending working
- [ ] User preferences respected

### Phase 4 (Full Client)
- [ ] Campaign builder live
- [ ] A/B testing functional
- [ ] Automation workflows working
- [ ] Analytics dashboard complete
- [ ] Deliverability >98%

## Security Considerations

1. **API Key Management**
   - Store in environment variables
   - Rotate regularly
   - Use test mode for development
   - Never log API key

2. **Data Privacy**
   - GDPR compliance (export/delete)
   - CAN-SPAM compliance (unsubscribe)
   - Encrypt sensitive data
   - Anonymize analytics

3. **Rate Limiting**
   - Prevent abuse (limit per user)
   - Respect Resend limits
   - Queue system for overflow
   - Circuit breaker pattern

4. **Validation**
   - Verify email addresses
   - Sanitize template data
   - Validate webhook signatures
   - XSS prevention in templates

## Migration Path

### From Current State
1. ✅ Resend component configured
2. ✅ Password reset email working
3. ⏭️ Wrap in Effect.ts service
4. ⏭️ Create template system
5. ⏭️ Add tracking
6. ⏭️ Build UI

### Breaking Changes
- None expected (additive only)
- Existing auth flow continues to work
- New emails use new system
- Gradually migrate old patterns

## Resources

**Documentation:**
- [Resend Docs](https://resend.com/docs)
- [React Email](https://react.email)
- [@convex-dev/resend](https://github.com/get-convex/convex-resend)

**Examples:**
- `convex/auth.ts` - Current password reset pattern
- `convex/services/` - Effect.ts service patterns
- `src/components/ui/` - shadcn/ui components

**Tools:**
- [Litmus](https://litmus.com) - Email testing
- [Mail Tester](https://www.mail-tester.com) - Spam score
- [Resend Dashboard](https://resend.com/dashboard) - Analytics

## Implementation Roadmap

### Phase 1: Backend Foundation (Week 1)
**Goal:** Resend integration with Effect.ts service layer

- [ ] Create `convex/services/email/resend.ts` (Effect.ts service)
- [ ] Wrap existing password reset in service
- [ ] Add welcome email
- [ ] Add transaction receipt templates
- [ ] Test delivery rates (target: 95%+)

**Dependencies:**
- `@convex-dev/resend` (already installed)
- Effect.ts patterns from `one/connections/middleware.md`

### Phase 2: Template System (Week 2)
**Goal:** Reusable, versioned email templates

- [ ] Build template rendering service
- [ ] Create 10 core React Email templates
- [ ] Add preview functionality (render without sending)
- [ ] Implement version control in ontology
- [ ] Store templates in `things` table (type: "email_template")

**Dependencies:**
- `@react-email/components`
- Template patterns from `one/connections/patterns.md`

### Phase 3: Tracking & Webhooks (Week 3-4)
**Goal:** Full email lifecycle tracking

- [ ] Set up Resend webhook endpoint (`convex/http/webhooks/resend.ts`)
- [ ] Add tracking events to ontology (sent, delivered, opened, clicked, bounced)
- [ ] Build batch sending with rate limiting
- [ ] Create preference system (user opt-in/opt-out)
- [ ] Implement analytics queries

**Dependencies:**
- Hono HTTP routes (`one/things/hono.md`)
- Event patterns from `one/connections/ontology.md`

### Phase 4: Mail Client UI (Week 5)
**Goal:** shadcn/ui mail interface with Convex backend

- [ ] Install required packages: `jotai`, `sonner`, `@tanstack/react-virtual`
- [ ] Install shadcn components: `resizable`, `sheet`, `calendar` (if missing)
- [ ] Create `src/components/mail/*` components (from `mail.md` spec)
- [ ] Create `src/pages/mail.astro` with MailLayout client:load
- [ ] Replace mock data with Convex queries
- [ ] Add real-time updates via Convex reactivity
- [ ] Implement mobile responsive layout

**Key Files (from mail.md):**
1. `src/components/mail/MailLayout.tsx` - Main layout with ResizablePanels
2. `src/components/mail/use-mail.ts` - Jotai state (selected, folder, search)
3. `src/components/mail/MailList.tsx` - Virtual scrolling list
4. `src/components/mail/MailDisplay.tsx` - Email viewer with actions
5. `src/components/mail/Nav.tsx` - Folder navigation
6. `src/components/mail/MailSearch.tsx` - Debounced search
7. `src/hooks/use-media-query.ts` - Responsive breakpoints

**Backend Queries Needed:**
```typescript
// convex/queries/email.ts
export const list = query({
  args: { folder: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Query things table where type="email"
    // Filter by folder (metadata.folder)
    // Filter by search query (full-text search)
    // Return sorted by date
  }
})

export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // Get email by ID
    // Mark as read (create event)
  }
})
```

**State Management Pattern:**
```typescript
// Frontend: Jotai atoms
const mailAtom = atom({
  selected: null,
  activeFolder: "inbox",
  searchQuery: "",
  activeTab: "all"
})

// Connect to Convex
const mails = useQuery(api.email.list, {
  folder: mail.activeFolder,
  search: mail.searchQuery
})

// Mutations for actions
const archive = useMutation(api.email.archive)
const deleteMail = useMutation(api.email.delete)
```

### Phase 5: Advanced Features (Week 6)
**Goal:** Campaigns, automation, personalization

- [ ] Campaign builder UI (`src/pages/admin/email/campaigns.astro`)
- [ ] Audience segmentation (filter by tags, connections)
- [ ] Automation workflows (trigger → wait → send)
- [ ] A/B testing (subject lines, content variants)
- [ ] Personalization engine (dynamic blocks, recommendations)
- [ ] Analytics dashboard with charts

**Dependencies:**
- Recharts for analytics (already installed)
- Ontology queries for segmentation
- Scheduler for automation workflows

## Critical Path Dependencies

**From mail.md spec:**
1. ✅ Jotai for state management (install: `bun add jotai`)
2. ✅ Sonner for toast notifications (install: `bun add sonner`)
3. ✅ @tanstack/react-virtual for large lists (install: `bun add @tanstack/react-virtual`)
4. ✅ date-fns for date formatting (already installed)
5. ✅ lucide-react for icons (already installed)

**From email system:**
1. ✅ @convex-dev/resend component (already configured)
2. ⏭️ React Email for templates (install: `bun add @react-email/components`)
3. ⏭️ Effect.ts service layer (patterns in place)

## Testing Checklist (from mail.md)

### Mail UI Interactive Features
- [ ] Folder navigation works (Inbox, Drafts, Sent, etc.)
- [ ] Active folder highlights correctly
- [ ] Badge counts update dynamically
- [ ] Search filters emails in real-time
- [ ] Tab switching (All/Unread) works
- [ ] Email selection highlights item
- [ ] Action buttons trigger toasts
- [ ] Snooze calendar picker works
- [ ] Sidebar collapse/expand persists
- [ ] Mobile responsive layout works
- [ ] Virtual scrolling handles 1000+ emails
- [ ] No hydration errors in console

### Email Backend
- [ ] Send email via mutation
- [ ] Email appears in recipient inbox
- [ ] Tracking webhook receives events
- [ ] Templates render correctly
- [ ] Batch sending respects rate limits
- [ ] User preferences are honored
- [ ] Analytics queries are accurate

## Success Metrics

### Phase 1 (Backend)
- ✅ 95%+ delivery rate
- ✅ <500ms email send latency
- ✅ Password reset emails working

### Phase 2 (Templates)
- ✅ 10+ templates created
- ✅ Preview system functional
- ✅ Version control working

### Phase 3 (Tracking)
- ✅ Webhooks processing events
- ✅ Open rate >20%
- ✅ Click rate >5%

### Phase 4 (UI)
- ✅ Mail client fully functional
- ✅ Real-time updates working
- ✅ Mobile responsive
- ✅ Virtual scrolling smooth

### Phase 5 (Advanced)
- ✅ Campaigns sending successfully
- ✅ Automation workflows executing
- ✅ A/B tests completing
- ✅ 98%+ deliverability

## Final Architecture

```
┌──────────────────────────────────────────────────┐
│         FRONTEND (Astro + React)                 │
│  - Mail UI: shadcn/ui with Jotai state          │
│  - Components: MailLayout, MailList, etc.        │
│  - Hooks: useQuery, useMutation (Convex)         │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓ (Real-time queries & mutations)
┌──────────────────────────────────────────────────┐
│         BACKEND (Convex + Effect.ts)             │
│  - Services: ResendService (Effect.ts)           │
│  - Mutations: send, archive, delete (confect)    │
│  - Actions: sendAction (Resend API)              │
│  - Queries: list, search, folders                │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓ (Async email sending)
┌──────────────────────────────────────────────────┐
│         RESEND API                                │
│  - Email delivery                                │
│  - Tracking webhooks                             │
│  - Bounce/complaint handling                     │
└──────────────────────────────────────────────────┘
```

---

**Success = Production-ready email system that scales from 100 to 100,000 emails/day with 98%+ deliverability, beautiful UI, and full tracking.**
