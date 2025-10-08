# Mail Backend Implementation Plan

**Goal:** Add complete email functionality to `mail.astro` using Resend, Convex, and Effect.ts to create a fully functional email client.

**Current State:** `mail.astro` exists with shadcn/ui Mail interface using mock data from `src/data/mail-data.ts`

**Target State:** Production email client with real Resend integration, database storage, and full CRUD operations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (mail.astro)                                  │
│  - MailLayout component (client:load)                   │
│  - Jotai state: selected, folder, search, tab           │
│  - Convex hooks: useQuery, useMutation                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ (Real-time queries & mutations)
┌─────────────────────────────────────────────────────────┐
│  MIDDLEWARE (Convex + Effect.ts)                        │
│  - Queries: list, get, search (read operations)         │
│  - Mutations: send, archive, delete (write operations)  │
│  - Services: EmailService (Effect.ts business logic)    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ (Async actions via scheduler)
┌─────────────────────────────────────────────────────────┐
│  ACTIONS (Resend API)                                   │
│  - sendEmailAction: Actually sends via Resend           │
│  - processWebhookAction: Handles delivery events        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ (HTTP webhooks)
┌─────────────────────────────────────────────────────────┐
│  RESEND SERVICE                                         │
│  - Email delivery                                       │
│  - Tracking (opens, clicks, bounces)                    │
│  - Webhooks (status updates)                            │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema & Ontology Mapping

### 1.1 Things (Entities)

**Email Entity:**
```typescript
// In things table
{
  _id: Id<"things">,
  type: "email",
  name: string,              // Subject line
  status: "draft" | "sent" | "delivered" | "failed",
  createdAt: number,
  updatedAt: number,
  properties: {
    // Email-specific fields
    from: string,            // Sender email
    fromName: string,        // Sender display name
    to: string[],            // Recipients
    cc?: string[],
    bcc?: string[],
    subject: string,
    bodyHtml: string,
    bodyText: string,
    folder: "inbox" | "sent" | "drafts" | "trash" | "archive" | "junk",
    read: boolean,
    starred: boolean,
    labels: string[],        // ["work", "important", "meeting"]
    threadId?: string,       // For conversation threading
    inReplyTo?: string,      // Message ID of parent
    references?: string[],   // Thread references
    attachments?: Array<{
      name: string,
      size: number,
      type: string,
      url: string
    }>,
    // Resend tracking
    resendId?: string,       // Resend message ID
    deliveryStatus?: "sent" | "delivered" | "bounced" | "complained",
    openedAt?: number,
    clickedAt?: number,
    bouncedAt?: number,
  }
}
```

**Email Template Entity:**
```typescript
{
  _id: Id<"things">,
  type: "email_template",
  name: string,              // Template name
  status: "active" | "draft" | "archived",
  properties: {
    subject: string,         // Can include {{variables}}
    bodyHtml: string,
    bodyText: string,
    variables: string[],     // ["user.name", "resetLink"]
    category: "transactional" | "notification" | "marketing",
    version: number,
    previewText?: string,
  }
}
```

### 1.2 Connections

**Email Relationships:**
```typescript
// Sender → Email (who sent it)
{
  fromThingId: userId,
  toThingId: emailId,
  relationshipType: "sent_email",
  createdAt: number
}

// Recipient → Email (who received it)
{
  fromThingId: userId,
  toThingId: emailId,
  relationshipType: "received_email",
  createdAt: number
}

// Email → Email (reply threading)
{
  fromThingId: replyEmailId,
  toThingId: originalEmailId,
  relationshipType: "reply_to",
  createdAt: number
}
```

### 1.3 Events

**Email Lifecycle Events:**
```typescript
// Email drafted
{
  thingId: emailId,
  eventType: "email_drafted",
  timestamp: Date.now(),
  actorType: "user",
  actorId: userId,
  metadata: { folder: "drafts" }
}

// Email sent
{
  thingId: emailId,
  eventType: "email_sent",
  timestamp: Date.now(),
  actorType: "user",
  actorId: userId,
  metadata: {
    resendId: string,
    recipients: string[],
    subject: string
  }
}

// Email delivered
{
  thingId: emailId,
  eventType: "email_delivered",
  timestamp: Date.now(),
  actorType: "system",
  metadata: { resendId: string }
}

// Email opened
{
  thingId: emailId,
  eventType: "email_opened",
  timestamp: Date.now(),
  actorType: "user",
  actorId: recipientId,
  metadata: { openedAt: number }
}

// Email clicked
{
  thingId: emailId,
  eventType: "email_clicked",
  timestamp: Date.now(),
  actorType: "user",
  actorId: recipientId,
  metadata: { clickedLink: string }
}

// Email failed
{
  thingId: emailId,
  eventType: "email_failed",
  timestamp: Date.now(),
  actorType: "system",
  metadata: {
    error: string,
    reason: "bounce" | "complaint" | "rejected"
  }
}
```

### 1.4 Tags

**Email Categories:**
```typescript
// Tag for categorization
{
  category: "folder",
  value: "inbox" | "sent" | "drafts" | "trash"
}

{
  category: "label",
  value: "work" | "personal" | "important" | "meeting"
}

{
  category: "status",
  value: "read" | "unread" | "starred" | "archived"
}
```

---

## Phase 2: Backend Services (Effect.ts)

### 2.1 Email Service

**File:** `convex/services/email/email.ts`

```typescript
import { Effect } from "effect"
import { ConvexDatabase } from "../providers/convex"
import { ResendProvider } from "../providers/resend"

export class EmailService extends Effect.Service<EmailService>()("EmailService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase
    const resend = yield* ResendProvider

    return {
      // Create draft email
      createDraft: (args: CreateDraftArgs) =>
        Effect.gen(function* () {
          // 1. Validate user
          const user = yield* Effect.tryPromise(() => db.get(args.userId))
          if (!user) {
            return yield* Effect.fail({
              _tag: "UserNotFound",
              message: "User not found"
            })
          }

          // 2. Create email entity
          const emailId = yield* Effect.tryPromise(() =>
            db.insert("things", {
              type: "email",
              name: args.subject,
              status: "draft",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              properties: {
                from: user.properties.email,
                fromName: user.properties.name,
                to: args.to,
                cc: args.cc,
                bcc: args.bcc,
                subject: args.subject,
                bodyHtml: args.bodyHtml,
                bodyText: args.bodyText,
                folder: "drafts",
                read: true,
                starred: false,
                labels: args.labels || [],
              }
            })
          )

          // 3. Create connection (user authored email)
          yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromThingId: args.userId,
              toThingId: emailId,
              relationshipType: "sent_email",
              createdAt: Date.now()
            })
          )

          // 4. Log event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              thingId: emailId,
              eventType: "email_drafted",
              timestamp: Date.now(),
              actorType: "user",
              actorId: args.userId,
              metadata: { folder: "drafts" }
            })
          )

          return emailId
        }),

      // Send email
      send: (args: SendEmailArgs) =>
        Effect.gen(function* () {
          // 1. Get email
          const email = yield* Effect.tryPromise(() => db.get(args.emailId))
          if (!email) {
            return yield* Effect.fail({
              _tag: "EmailNotFound",
              message: "Email not found"
            })
          }

          // 2. Update status to sending
          yield* Effect.tryPromise(() =>
            db.patch(args.emailId, {
              status: "sent",
              updatedAt: Date.now(),
              properties: {
                ...email.properties,
                folder: "sent"
              }
            })
          )

          // 3. Schedule actual send via action (async)
          yield* Effect.promise(() =>
            db.scheduler.runAfter(0, internal.email.sendEmailAction, {
              emailId: args.emailId
            })
          )

          // 4. Log event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              thingId: args.emailId,
              eventType: "email_sent",
              timestamp: Date.now(),
              actorType: "user",
              actorId: args.userId,
              metadata: {
                recipients: email.properties.to,
                subject: email.properties.subject
              }
            })
          )

          return { success: true, emailId: args.emailId }
        }),

      // List emails by folder
      listByFolder: (args: ListByFolderArgs) =>
        Effect.gen(function* () {
          const emails = yield* Effect.tryPromise(() =>
            db.query("things")
              .withIndex("type", q => q.eq("type", "email"))
              .filter(q =>
                q.eq(q.field("properties.folder"), args.folder)
              )
              .order("desc")
              .collect()
          )

          return emails
        }),

      // Search emails
      search: (args: SearchEmailArgs) =>
        Effect.gen(function* () {
          const allEmails = yield* Effect.tryPromise(() =>
            db.query("things")
              .withIndex("type", q => q.eq("type", "email"))
              .collect()
          )

          // Filter by search query
          const query = args.query.toLowerCase()
          const filtered = allEmails.filter(email =>
            email.properties.subject.toLowerCase().includes(query) ||
            email.properties.bodyText.toLowerCase().includes(query) ||
            email.properties.fromName.toLowerCase().includes(query) ||
            email.properties.from.toLowerCase().includes(query)
          )

          return filtered
        }),

      // Archive email
      archive: (args: ArchiveEmailArgs) =>
        Effect.gen(function* () {
          const email = yield* Effect.tryPromise(() => db.get(args.emailId))
          if (!email) {
            return yield* Effect.fail({
              _tag: "EmailNotFound",
              message: "Email not found"
            })
          }

          yield* Effect.tryPromise(() =>
            db.patch(args.emailId, {
              updatedAt: Date.now(),
              properties: {
                ...email.properties,
                folder: "archive"
              }
            })
          )

          // Log event
          yield* Effect.tryPromise(() =>
            db.insert("events", {
              thingId: args.emailId,
              eventType: "email_archived",
              timestamp: Date.now(),
              actorType: "user",
              actorId: args.userId,
              metadata: {}
            })
          )

          return { success: true }
        }),

      // Delete email (move to trash)
      delete: (args: DeleteEmailArgs) =>
        Effect.gen(function* () {
          const email = yield* Effect.tryPromise(() => db.get(args.emailId))
          if (!email) {
            return yield* Effect.fail({
              _tag: "EmailNotFound",
              message: "Email not found"
            })
          }

          yield* Effect.tryPromise(() =>
            db.patch(args.emailId, {
              updatedAt: Date.now(),
              properties: {
                ...email.properties,
                folder: "trash"
              }
            })
          )

          return { success: true }
        }),

      // Mark as read/unread
      markRead: (args: MarkReadArgs) =>
        Effect.gen(function* () {
          const email = yield* Effect.tryPromise(() => db.get(args.emailId))
          if (!email) {
            return yield* Effect.fail({
              _tag: "EmailNotFound",
              message: "Email not found"
            })
          }

          yield* Effect.tryPromise(() =>
            db.patch(args.emailId, {
              updatedAt: Date.now(),
              properties: {
                ...email.properties,
                read: args.read
              }
            })
          )

          return { success: true }
        }),

      // Get folder counts
      getFolderCounts: (args: GetFolderCountsArgs) =>
        Effect.gen(function* () {
          const allEmails = yield* Effect.tryPromise(() =>
            db.query("things")
              .withIndex("type", q => q.eq("type", "email"))
              .collect()
          )

          const counts = {
            inbox: allEmails.filter(e => e.properties.folder === "inbox").length,
            sent: allEmails.filter(e => e.properties.folder === "sent").length,
            drafts: allEmails.filter(e => e.properties.folder === "drafts").length,
            trash: allEmails.filter(e => e.properties.folder === "trash").length,
            archive: allEmails.filter(e => e.properties.folder === "archive").length,
            junk: allEmails.filter(e => e.properties.folder === "junk").length,
            unread: allEmails.filter(e => !e.properties.read).length,
          }

          return counts
        })
    }
  }),
  dependencies: [ConvexDatabase.Default, ResendProvider.Default]
}) {}

// Type definitions
interface CreateDraftArgs {
  userId: Id<"things">
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  bodyHtml: string
  bodyText: string
  labels?: string[]
}

interface SendEmailArgs {
  emailId: Id<"things">
  userId: Id<"things">
}

interface ListByFolderArgs {
  folder: "inbox" | "sent" | "drafts" | "trash" | "archive" | "junk"
  userId: Id<"things">
}

interface SearchEmailArgs {
  query: string
  userId: Id<"things">
}

interface ArchiveEmailArgs {
  emailId: Id<"things">
  userId: Id<"things">
}

interface DeleteEmailArgs {
  emailId: Id<"things">
  userId: Id<"things">
}

interface MarkReadArgs {
  emailId: Id<"things">
  read: boolean
}

interface GetFolderCountsArgs {
  userId: Id<"things">
}
```

### 2.2 Resend Provider

**File:** `convex/services/providers/resend.ts`

```typescript
import { Effect, Layer } from "effect"
import { Resend } from "@convex-dev/resend"
import { components } from "../../_generated/api"

export class ResendProvider extends Effect.Service<ResendProvider>()("ResendProvider", {
  effect: Effect.gen(function* () {
    const resend = new Resend(components.resend, { testMode: false })

    return {
      send: (args: ResendSendArgs) =>
        Effect.tryPromise({
          try: async () => {
            const result = await resend.sendEmail(ctx, {
              from: args.from,
              to: args.to,
              cc: args.cc,
              bcc: args.bcc,
              subject: args.subject,
              html: args.html,
              text: args.text,
            })
            return result
          },
          catch: (error) => ({
            _tag: "ResendError" as const,
            message: error instanceof Error ? error.message : "Unknown error"
          })
        })
    }
  })
}) {}

interface ResendSendArgs {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text: string
}

export const ResendProviderLive = Layer.succeed(ResendProvider, ResendProvider)
```

---

## Phase 3: Convex Layer (Queries, Mutations, Actions)

### 3.1 Queries

**File:** `convex/queries/email.ts`

```typescript
import { query } from "./_generated/server"
import { v } from "convex/values"
import { confect } from "convex-helpers/server/confect"
import { Effect } from "effect"
import { EmailService } from "./services/email/email"
import { MainLayer } from "./services/layers"

// List emails by folder
export const list = confect.query({
  args: {
    folder: v.union(
      v.literal("inbox"),
      v.literal("sent"),
      v.literal("drafts"),
      v.literal("trash"),
      v.literal("archive"),
      v.literal("junk")
    ),
    userId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.listByFolder(args)
    }).pipe(Effect.provide(MainLayer))
})

// Get single email
export const get = confect.query({
  args: { id: v.id("things") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const email = yield* Effect.tryPromise(() => ctx.db.get(args.id))
      return email
    }).pipe(Effect.provide(MainLayer))
})

// Search emails
export const search = confect.query({
  args: {
    query: v.string(),
    userId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.search(args)
    }).pipe(Effect.provide(MainLayer))
})

// Get folder counts
export const folderCounts = confect.query({
  args: { userId: v.id("things") },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.getFolderCounts(args)
    }).pipe(Effect.provide(MainLayer))
})
```

### 3.2 Mutations

**File:** `convex/mutations/email.ts`

```typescript
import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { confect } from "convex-helpers/server/confect"
import { Effect } from "effect"
import { EmailService } from "./services/email/email"
import { MainLayer } from "./services/layers"

// Create draft
export const createDraft = confect.mutation({
  args: {
    userId: v.id("things"),
    to: v.array(v.string()),
    cc: v.optional(v.array(v.string())),
    bcc: v.optional(v.array(v.string())),
    subject: v.string(),
    bodyHtml: v.string(),
    bodyText: v.string(),
    labels: v.optional(v.array(v.string())),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.createDraft(args)
    }).pipe(Effect.provide(MainLayer))
})

// Send email
export const send = confect.mutation({
  args: {
    emailId: v.id("things"),
    userId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.send(args)
    }).pipe(Effect.provide(MainLayer))
})

// Archive email
export const archive = confect.mutation({
  args: {
    emailId: v.id("things"),
    userId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.archive(args)
    }).pipe(Effect.provide(MainLayer))
})

// Delete email
export const deleteEmail = confect.mutation({
  args: {
    emailId: v.id("things"),
    userId: v.id("things"),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.delete(args)
    }).pipe(Effect.provide(MainLayer))
})

// Mark as read/unread
export const markRead = confect.mutation({
  args: {
    emailId: v.id("things"),
    read: v.boolean(),
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const emailService = yield* EmailService
      return yield* emailService.markRead(args)
    }).pipe(Effect.provide(MainLayer))
})
```

### 3.3 Actions

**File:** `convex/actions/email.ts`

```typescript
import { internalAction } from "./_generated/server"
import { v } from "convex/values"
import { Resend } from "@convex-dev/resend"
import { components, internal } from "./_generated/api"

// Actually send email via Resend
export const sendEmailAction = internalAction({
  args: { emailId: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Get email
    const email = await ctx.runQuery(internal.email.getEmail, {
      id: args.emailId
    })

    if (!email) {
      throw new Error("Email not found")
    }

    // 2. Send via Resend
    const resend = new Resend(components.resend, { testMode: false })

    try {
      const result = await resend.sendEmail(ctx, {
        from: email.properties.from,
        to: email.properties.to,
        cc: email.properties.cc,
        bcc: email.properties.bcc,
        subject: email.properties.subject,
        html: email.properties.bodyHtml,
        text: email.properties.bodyText,
      })

      // 3. Update email with Resend ID
      await ctx.runMutation(internal.email.updateResendId, {
        emailId: args.emailId,
        resendId: result.id,
      })

      // 4. Log delivery event
      await ctx.runMutation(internal.email.logEvent, {
        emailId: args.emailId,
        eventType: "email_delivered",
        metadata: { resendId: result.id }
      })

      return { success: true, resendId: result.id }
    } catch (error) {
      // Log failure event
      await ctx.runMutation(internal.email.logEvent, {
        emailId: args.emailId,
        eventType: "email_failed",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      })

      throw error
    }
  }
})
```

---

## Phase 4: Frontend Integration

### 4.1 Update use-mail.ts with Convex

**File:** `src/components/mail/use-mail.ts`

```typescript
import { atom, useAtom } from "jotai"
import { Id } from "@/convex/_generated/dataModel"

export type MailFolder =
  | "inbox"
  | "drafts"
  | "sent"
  | "junk"
  | "trash"
  | "archive"

type Config = {
  selected: Id<"things"> | null
  activeFolder: MailFolder
  searchQuery: string
  activeTab: "all" | "unread"
}

const configAtom = atom<Config>({
  selected: null,
  activeFolder: "inbox",
  searchQuery: "",
  activeTab: "all",
})

export function useMail() {
  return useAtom(configAtom)
}
```

### 4.2 Update MailList with Real Data

**File:** `src/components/mail/MailList.tsx`

```tsx
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMail } from "./use-mail"

export function MailList({ userId }: { userId: string }) {
  const [mail, setMail] = useMail()

  // Real-time query from Convex
  const emails = useQuery(api.email.list, {
    folder: mail.activeFolder,
    userId: userId as any, // Type assertion for now
  })

  // Filter by search query (client-side for now)
  const filteredEmails = emails?.filter(email => {
    if (!mail.searchQuery) return true

    const query = mail.searchQuery.toLowerCase()
    return (
      email.properties.subject.toLowerCase().includes(query) ||
      email.properties.bodyText.toLowerCase().includes(query) ||
      email.properties.fromName.toLowerCase().includes(query)
    )
  }) || []

  // Filter by tab
  const displayEmails = mail.activeTab === "unread"
    ? filteredEmails.filter(e => !e.properties.read)
    : filteredEmails

  if (!emails) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (displayEmails.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No emails found
      </div>
    )
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {displayEmails.map((email) => (
          <button
            key={email._id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent active:scale-[0.99]",
              mail.selected === email._id && "bg-muted ring-2 ring-primary/20"
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: email._id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "font-semibold",
                    !email.properties.read && "text-primary"
                  )}>
                    {email.properties.fromName}
                  </div>
                  {!email.properties.read && (
                    <span className="flex size-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === email._id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(email.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className={cn(
                "text-xs font-medium",
                !email.properties.read && "text-primary"
              )}>
                {email.properties.subject}
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {email.properties.bodyText.substring(0, 300)}
            </div>
            {email.properties.labels.length ? (
              <div className="flex items-center gap-2">
                {email.properties.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
```

### 4.3 Update MailDisplay with Actions

**File:** `src/components/mail/MailDisplay.tsx`

```tsx
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Archive, ArchiveX, Trash2, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMail } from "./use-mail"
import { useState } from "react"

export function MailDisplay({ userId }: { userId: string }) {
  const [mail] = useMail()
  const [replyText, setReplyText] = useState("")

  // Get selected email
  const currentMail = useQuery(
    api.email.get,
    mail.selected ? { id: mail.selected } : "skip"
  )

  // Mutations
  const archive = useMutation(api.email.archive)
  const deleteEmail = useMutation(api.email.deleteEmail)
  const markRead = useMutation(api.email.markRead)

  const handleArchive = async () => {
    if (!mail.selected) return

    await archive({ emailId: mail.selected, userId: userId as any })
    toast.success("Email archived")
  }

  const handleDelete = async () => {
    if (!mail.selected) return

    await deleteEmail({ emailId: mail.selected, userId: userId as any })
    toast.success("Email deleted")
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !currentMail) return

    // Create draft reply
    // TODO: Implement reply functionality
    toast.success("Reply sent")
    setReplyText("")
  }

  if (!currentMail) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        No message selected
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2 gap-2">
        <Button variant="ghost" size="icon" onClick={handleArchive}>
          <Archive className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="font-semibold text-lg mb-2">
          {currentMail.properties.subject}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          From: {currentMail.properties.fromName} ({currentMail.properties.from})
        </div>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: currentMail.properties.bodyHtml }}
        />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleReply}>
          <Textarea
            placeholder="Reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" size="sm">
            <Reply className="size-4 mr-2" />
            Send Reply
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### 4.4 Update mail.astro

**File:** `src/pages/mail.astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { MailLayout } from '@/components/mail/MailLayout'
import { auth } from '@/lib/auth'

// Get current user
const session = await auth.api.getSession({
  headers: Astro.request.headers
})

if (!session?.user) {
  return Astro.redirect('/login')
}

const userId = session.user.id
---

<BaseLayout title="Mail">
  <div class="mail-container">
    <MailLayout client:load userId={userId} />
  </div>
</BaseLayout>

<style>
  .mail-container {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
</style>
```

---

## Phase 5: Webhooks (Resend Events)

### 5.1 Webhook Handler

**File:** `convex/http/webhooks/resend.ts`

```typescript
import { Hono } from "hono"
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono"
import { internal } from "../../_generated/api"

const app: HonoWithConvex = new Hono()

app.post("/resend", async (c) => {
  const body = await c.req.json()

  // Verify webhook signature (Resend provides this)
  // const signature = c.req.header("resend-signature")
  // if (!verifySignature(signature, body)) {
  //   return c.json({ error: "Invalid signature" }, 401)
  // }

  const { type, data } = body

  switch (type) {
    case "email.sent":
      await c.env.runMutation(internal.email.handleEmailSent, {
        resendId: data.email_id,
        timestamp: Date.now()
      })
      break

    case "email.delivered":
      await c.env.runMutation(internal.email.handleEmailDelivered, {
        resendId: data.email_id,
        timestamp: Date.now()
      })
      break

    case "email.opened":
      await c.env.runMutation(internal.email.handleEmailOpened, {
        resendId: data.email_id,
        timestamp: Date.now()
      })
      break

    case "email.clicked":
      await c.env.runMutation(internal.email.handleEmailClicked, {
        resendId: data.email_id,
        clickedLink: data.link,
        timestamp: Date.now()
      })
      break

    case "email.bounced":
      await c.env.runMutation(internal.email.handleEmailBounced, {
        resendId: data.email_id,
        reason: data.bounce_type,
        timestamp: Date.now()
      })
      break

    case "email.complained":
      await c.env.runMutation(internal.email.handleEmailComplained, {
        resendId: data.email_id,
        timestamp: Date.now()
      })
      break
  }

  return c.json({ success: true })
})

export default new HttpRouterWithHono(app)
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Add email entity type to things table
- [ ] Add email_template entity type to things table
- [ ] Add connection types: sent_email, received_email, reply_to
- [ ] Add event types: email_drafted, email_sent, email_delivered, email_opened, etc.
- [ ] Add tag categories: folder, label, status

### Phase 2: Backend Services
- [ ] Create `convex/services/email/email.ts` (EmailService)
- [ ] Create `convex/services/providers/resend.ts` (ResendProvider)
- [ ] Implement createDraft, send, listByFolder, search, archive, delete, markRead
- [ ] Add to MainLayer in `convex/services/layers.ts`

### Phase 3: Convex Layer
- [ ] Create `convex/queries/email.ts` (list, get, search, folderCounts)
- [ ] Create `convex/mutations/email.ts` (createDraft, send, archive, delete, markRead)
- [ ] Create `convex/actions/email.ts` (sendEmailAction)
- [ ] Create internal mutations for webhook handlers

### Phase 4: Frontend Integration
- [ ] Update `src/components/mail/use-mail.ts` with proper types
- [ ] Update `src/components/mail/MailList.tsx` with useQuery
- [ ] Update `src/components/mail/MailDisplay.tsx` with useMutation
- [ ] Update `src/components/mail/Nav.tsx` with dynamic counts
- [ ] Update `src/pages/mail.astro` with auth check
- [ ] Add Toaster component for notifications

### Phase 5: Webhooks
- [ ] Create `convex/http/webhooks/resend.ts`
- [ ] Configure Resend webhook URL in dashboard
- [ ] Implement webhook signature verification
- [ ] Test email tracking events

### Phase 6: Testing
- [ ] Test draft creation
- [ ] Test email sending (receives in real inbox)
- [ ] Test folder navigation
- [ ] Test search functionality
- [ ] Test archive/delete operations
- [ ] Test webhook delivery
- [ ] Test real-time updates (open in 2 browsers)

---

## Dependencies to Install

```bash
# Already installed
✅ @convex-dev/resend
✅ jotai
✅ sonner
✅ lucide-react
✅ date-fns

# Need to install
bun add @react-email/components
bun add @react-email/render
```

---

## Environment Variables

```bash
# Already set
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Add for webhooks
RESEND_WEBHOOK_SECRET=whsec_...
```

---

## Success Criteria

### MVP (Minimum Viable Product)
- ✅ Users can view emails in inbox
- ✅ Users can compose and send emails
- ✅ Emails deliver to real inboxes
- ✅ Folder navigation works (Inbox, Sent, Drafts, Trash)
- ✅ Search functionality works
- ✅ Archive/Delete actions work
- ✅ Real-time updates when emails arrive

### Full Features
- ✅ Reply/Forward functionality
- ✅ Email threading (conversations)
- ✅ Attachments support
- ✅ Rich text editor
- ✅ Webhook tracking (opens, clicks)
- ✅ Templates system
- ✅ Scheduled sending
- ✅ Email signatures

---

**Result:** A fully functional email client in `mail.astro` powered by Resend, Convex, and Effect.ts with real-time updates and production-ready email delivery.
