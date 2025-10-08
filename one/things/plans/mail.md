# COMPREHENSIVE PROMPT FOR CLAUDE CODE: Recreating shadcn Mail Layout in Astro

## Project Overview

Create a complete mail application layout using Astro with React 19, Tailwind CSS 4, and shadcn/ui. This implementation replicates the official shadcn mail example with adaptations for Astro's islands architecture, ensuring proper responsive behavior (sidebar pushes content on desktop/tablet, overlays on mobile) and full client-side interactivity.

---

## INTERACTIVE FEATURES IMPLEMENTATION

This section provides a comprehensive, step-by-step guide to making the mail app fully interactive with real-time filtering, dynamic state management, responsive navigation, and user feedback mechanisms.

### Architecture Overview

The interactive features rely on a multi-layered state management approach:

1. **Global State (Jotai)**: Selected email, active folder, search query, unread counts
2. **Local Component State (React useState)**: UI-specific states like dropdown open/closed, form values
3. **Persistent State (localStorage/cookies)**: Sidebar collapsed state, panel sizes, user preferences
4. **URL State (Astro routing)**: Current folder, search parameters, selected email ID

### 1. NAVIGATION FEATURES

#### 1.1 Clickable Folder Navigation with Active States

Create an enhanced state management hook that tracks the active folder:

```typescript
// src/components/mail/use-mail.ts
import { atom, useAtom } from "jotai"
import { Mail, mails } from "@/data/mail-data"

export type MailFolder =
  | "inbox"
  | "drafts"
  | "sent"
  | "junk"
  | "trash"
  | "archive"
  | "social"
  | "updates"
  | "forums"
  | "shopping"
  | "promotions"

type Config = {
  selected: Mail["id"] | null
  activeFolder: MailFolder
  searchQuery: string
}

const configAtom = atom<Config>({
  selected: mails[0].id,
  activeFolder: "inbox",
  searchQuery: "",
})

export function useMail() {
  return useAtom(configAtom)
}

// Computed atom for filtered mails based on folder and search
const filteredMailsAtom = atom((get) => {
  const config = get(configAtom)
  let filtered = mails

  // Filter by folder
  switch (config.activeFolder) {
    case "inbox":
      filtered = mails.filter(m => !m.labels.includes("draft") && !m.labels.includes("sent"))
      break
    case "drafts":
      filtered = mails.filter(m => m.labels.includes("draft"))
      break
    case "sent":
      filtered = mails.filter(m => m.labels.includes("sent"))
      break
    case "junk":
      filtered = mails.filter(m => m.labels.includes("junk"))
      break
    case "trash":
      filtered = mails.filter(m => m.labels.includes("trash"))
      break
    case "archive":
      filtered = mails.filter(m => m.labels.includes("archive"))
      break
    case "social":
      filtered = mails.filter(m => m.labels.includes("social"))
      break
    case "updates":
      filtered = mails.filter(m => m.labels.includes("updates"))
      break
    case "forums":
      filtered = mails.filter(m => m.labels.includes("forums"))
      break
    case "shopping":
      filtered = mails.filter(m => m.labels.includes("shopping"))
      break
    case "promotions":
      filtered = mails.filter(m => m.labels.includes("promotions"))
      break
  }

  // Filter by search query
  if (config.searchQuery) {
    const query = config.searchQuery.toLowerCase()
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.text.toLowerCase().includes(query)
    )
  }

  return filtered
})

export function useFilteredMails() {
  return useAtom(filteredMailsAtom)
}

// Helper to calculate badge counts
export function useBadgeCounts() {
  const counts = {
    inbox: mails.filter(m => !m.labels.includes("draft") && !m.labels.includes("sent")).length,
    drafts: mails.filter(m => m.labels.includes("draft")).length,
    sent: mails.filter(m => m.labels.includes("sent")).length,
    junk: mails.filter(m => m.labels.includes("junk")).length,
    trash: mails.filter(m => m.labels.includes("trash")).length,
    archive: mails.filter(m => m.labels.includes("archive")).length,
    social: mails.filter(m => m.labels.includes("social")).length,
    updates: mails.filter(m => m.labels.includes("updates")).length,
    forums: mails.filter(m => m.labels.includes("forums")).length,
    shopping: mails.filter(m => m.labels.includes("shopping")).length,
    promotions: mails.filter(m => m.labels.includes("promotions")).length,
  }
  return counts
}
```

#### 1.2 Enhanced Nav Component with Click Handlers

Update the Nav component to support click handlers and active states:

```tsx
// src/components/mail/Nav.tsx
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMail, MailFolder } from "./use-mail"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: LucideIcon
    variant: "default" | "ghost"
    folder: MailFolder
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  const [mail, setMail] = useMail()

  const handleFolderClick = (folder: MailFolder) => {
    setMail({
      ...mail,
      activeFolder: folder,
      selected: null, // Clear selection when switching folders
    })
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const isActive = mail.activeFolder === link.folder

          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFolderClick(link.folder)}
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "default" : "ghost",
                      size: "icon"
                    }),
                    "h-9 w-9 transition-all duration-200",
                    isActive &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <link.icon className="size-4" />
                  <span className="sr-only">{link.title}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              key={index}
              onClick={() => handleFolderClick(link.folder)}
              className={cn(
                buttonVariants({
                  variant: isActive ? "default" : "ghost",
                  size: "sm"
                }),
                "justify-start transition-all duration-200 hover:translate-x-0.5",
                isActive &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white"
              )}
            >
              <link.icon className="mr-2 size-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto text-xs",
                    isActive &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
```

#### 1.3 Collapsible Sidebar with Persistent State

The sidebar state is already managed by the ResizablePanel's `onCollapse` and `onExpand` callbacks, which save to cookies. For localStorage persistence, enhance this:

```tsx
// In MailLayout.tsx, add this effect:
React.useEffect(() => {
  // Load collapsed state from localStorage on mount
  const savedCollapsed = localStorage.getItem('mail-sidebar-collapsed')
  if (savedCollapsed !== null) {
    setIsCollapsed(JSON.parse(savedCollapsed))
  }
}, [])

// Update the onCollapse callback:
onCollapse={() => {
  setIsCollapsed(true)
  localStorage.setItem('mail-sidebar-collapsed', 'true')
  document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
}}

// Update the onExpand callback:
onExpand={() => {
  setIsCollapsed(false)
  localStorage.setItem('mail-sidebar-collapsed', 'false')
  document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`
}}
```

#### 1.4 Dynamic Badge Counts

Update the MailLayout to use dynamic badge counts:

```tsx
// In MailLayout.tsx
import { useBadgeCounts } from "./use-mail"

export function MailLayout({ ... }: MailLayoutProps) {
  const badgeCounts = useBadgeCounts()

  // Update the Nav links to use dynamic counts:
  <Nav
    isCollapsed={isCollapsed}
    links={[
      {
        title: "Inbox",
        label: badgeCounts.inbox.toString(),
        icon: Inbox,
        variant: "default",
        folder: "inbox",
      },
      {
        title: "Drafts",
        label: badgeCounts.drafts.toString(),
        icon: File,
        variant: "ghost",
        folder: "drafts",
      },
      // ... continue for all folders
    ]}
  />
}
```

### 2. MAIL LIST FEATURES

#### 2.1 Real-Time Search Implementation

Create a search component with debouncing:

```tsx
// src/components/mail/MailSearch.tsx
import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMail } from "./use-mail"

export function MailSearch() {
  const [mail, setMail] = useMail()
  const [localQuery, setLocalQuery] = React.useState(mail.searchQuery)

  // Debounce search updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMail({ ...mail, searchQuery: localQuery })
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery])

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, subject, or content..."
        className="pl-8"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
    </div>
  )
}
```

Update MailLayout to use the search component:

```tsx
// In MailLayout.tsx, replace the search form with:
import { MailSearch } from "./MailSearch"

<div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <MailSearch />
</div>
```

#### 2.2 Enhanced Mail List with Selection Highlighting

Update MailList to use filtered mails:

```tsx
// src/components/mail/MailList.tsx
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail } from "@/data/mail-data"
import { useMail, useFilteredMails } from "./use-mail"

export function MailList() {
  const [mail, setMail] = useMail()
  const [filteredMails] = useFilteredMails()

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {filteredMails.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
            No emails found
          </div>
        ) : (
          filteredMails.map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent active:scale-[0.99]",
                mail.selected === item.id && "bg-muted ring-2 ring-primary/20"
              )}
              onClick={() =>
                setMail({
                  ...mail,
                  selected: item.id,
                })
              }
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "font-semibold",
                      !item.read && "text-primary"
                    )}>
                      {item.name}
                    </div>
                    {!item.read && (
                      <span className="flex size-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      mail.selected === item.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  !item.read && "text-primary"
                )}>
                  {item.subject}
                </div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.text.substring(0, 300)}
              </div>
              {item.labels.length ? (
                <div className="flex items-center gap-2">
                  {item.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
```

#### 2.3 Tab Switching with Filtered Results

Update the tabs in MailLayout to filter by read status:

```tsx
// In MailLayout.tsx
<TabsContent value="all" className="m-0">
  <MailList />
</TabsContent>
<TabsContent value="unread" className="m-0">
  <MailList />
</TabsContent>

// But we need to add tab state to our config:
// Update use-mail.ts:
type Config = {
  selected: Mail["id"] | null
  activeFolder: MailFolder
  searchQuery: string
  activeTab: "all" | "unread"
}

const configAtom = atom<Config>({
  selected: mails[0].id,
  activeFolder: "inbox",
  searchQuery: "",
  activeTab: "all",
})

// Update filteredMailsAtom to consider activeTab:
const filteredMailsAtom = atom((get) => {
  const config = get(configAtom)
  let filtered = mails

  // ... existing folder filtering ...

  // Filter by tab
  if (config.activeTab === "unread") {
    filtered = filtered.filter(m => !m.read)
  }

  // ... existing search filtering ...

  return filtered
})

// In MailLayout.tsx, connect tabs to state:
const [mail, setMail] = useMail()

<Tabs
  value={mail.activeTab}
  onValueChange={(value) => setMail({ ...mail, activeTab: value as "all" | "unread" })}
>
```

### 3. MAIL DISPLAY FEATURES

#### 3.1 Action Buttons with Toast Feedback

Install sonner for toast notifications:

```bash
npm install sonner
```

Create a toast-enabled mail display:

```tsx
// src/components/mail/MailDisplay.tsx
import * as React from "react"
import { toast } from "sonner"
import { Archive, ArchiveX, Trash2, Reply, ReplyAll, Forward, Clock, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMail } from "./use-mail"
import { Mail } from "@/data/mail-data"

interface MailDisplayProps {
  mail: Mail | null
}

export function MailDisplay({ mail: currentMail }: MailDisplayProps) {
  const [mail, setMail] = useMail()
  const [replyText, setReplyText] = React.useState("")

  const handleArchive = () => {
    if (!currentMail) return
    // In a real app, this would make an API call
    toast.success("Email archived", {
      description: `"${currentMail.subject}" has been moved to archive.`,
    })
  }

  const handleDelete = () => {
    if (!currentMail) return
    toast.success("Email deleted", {
      description: `"${currentMail.subject}" has been moved to trash.`,
    })
  }

  const handleJunk = () => {
    if (!currentMail) return
    toast.success("Email marked as junk", {
      description: `"${currentMail.subject}" has been moved to junk.`,
    })
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty")
      return
    }
    toast.success("Reply sent", {
      description: `Your reply to "${currentMail?.name}" has been sent.`,
    })
    setReplyText("")
  }

  const handleMarkUnread = () => {
    if (!currentMail) return
    toast.info("Marked as unread", {
      description: `"${currentMail.subject}" has been marked as unread.`,
    })
  }

  // ... rest of component remains the same but with onClick handlers

  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" disabled={!currentMail} onClick={handleArchive}>
        <Archive className="size-4" />
        <span className="sr-only">Archive</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>Archive</TooltipContent>
  </Tooltip>

  // Update the reply form:
  <form onSubmit={handleReply}>
    <div className="grid gap-4">
      <Textarea
        className="p-4"
        placeholder={`Reply ${currentMail?.name}...`}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <div className="flex items-center">
        <Label
          htmlFor="mute"
          className="flex items-center gap-2 text-xs font-normal"
        >
          <Switch id="mute" aria-label="Mute thread" /> Mute this thread
        </Label>
        <Button type="submit" size="sm" className="ml-auto">
          Send
        </Button>
      </div>
    </div>
  </form>
}
```

Add the Toaster component to the layout:

```tsx
// In MailLayout.tsx
import { Toaster } from "sonner"

export function MailLayout({ ... }: MailLayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Toaster position="top-right" richColors />
      <ResizablePanelGroup ...>
        {/* existing content */}
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
```

#### 3.2 Snooze Functionality with Calendar Picker

Enhance the snooze popover with actual functionality:

```tsx
// In MailDisplay.tsx
const [snoozeDate, setSnoozeDate] = React.useState<Date>()

const handleSnooze = (date: Date) => {
  if (!currentMail) return
  toast.success("Email snoozed", {
    description: `"${currentMail.subject}" will reappear on ${format(date, "PPpp")}.`,
  })
  setSnoozeDate(date)
}

// Update the snooze buttons:
<Button
  variant="ghost"
  className="justify-start font-normal"
  onClick={() => handleSnooze(addHours(today, 4))}
>
  Later today{" "}
  <span className="ml-auto text-muted-foreground">
    {format(addHours(today, 4), "E, h:m b")}
  </span>
</Button>

// Update the calendar:
<Calendar
  mode="single"
  selected={snoozeDate}
  onSelect={(date) => date && handleSnooze(date)}
/>
```

### 4. MOBILE RESPONSIVE FEATURES

#### 4.1 Sheet Component for Mobile Sidebar

Create a mobile-responsive wrapper:

```tsx
// src/components/mail/MailLayoutMobile.tsx
"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AccountSwitcher } from "./AccountSwitcher"
import { Nav } from "./Nav"
import { Separator } from "@/components/ui/separator"
import { accounts } from "@/data/mail-data"

interface MobileSidebarProps {
  navLinks: Array<{
    title: string
    label?: string
    icon: any
    variant: "default" | "ghost"
    folder: any
  }>
  secondaryLinks: Array<{
    title: string
    label?: string
    icon: any
    variant: "default" | "ghost"
    folder: any
  }>
}

export function MobileSidebar({ navLinks, secondaryLinks }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-[52px] items-center px-2">
            <AccountSwitcher isCollapsed={false} accounts={accounts} />
          </div>
          <Separator />
          <Nav isCollapsed={false} links={navLinks} />
          <Separator />
          <Nav isCollapsed={false} links={secondaryLinks} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

#### 4.2 Responsive Layout Switching

Update MailLayout to be fully responsive:

```tsx
// In MailLayout.tsx
import { MobileSidebar } from "./MailLayoutMobile"
import { useMediaQuery } from "@/hooks/use-media-query"

export function MailLayout({ ... }: MailLayoutProps) {
  const [mail] = useMail()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showMailDisplay, setShowMailDisplay] = React.useState(false)

  // On mobile, show mail display as overlay when email is selected
  React.useEffect(() => {
    if (isMobile && mail.selected) {
      setShowMailDisplay(true)
    }
  }, [mail.selected, isMobile])

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <Toaster position="top-right" richColors />
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <MobileSidebar navLinks={primaryLinks} secondaryLinks={secondaryLinks} />
            <h1 className="text-lg font-bold">Inbox</h1>
          </div>

          {/* Show either mail list or mail display */}
          {!showMailDisplay ? (
            <>
              <div className="border-b p-4">
                <MailSearch />
              </div>
              <Tabs value={mail.activeTab} onValueChange={(value) => setMail({ ...mail, activeTab: value as "all" | "unread" })}>
                <TabsList className="mx-4 mt-2">
                  <TabsTrigger value="all">All mail</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="m-0">
                  <MailList />
                </TabsContent>
                <TabsContent value="unread" className="m-0">
                  <MailList />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex h-full flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="m-2"
                onClick={() => setShowMailDisplay(false)}
              >
                ← Back to list
              </Button>
              <MailDisplay mail={mails.find((item) => item.id === mail.selected) || null} />
            </div>
          )}
        </div>
      </TooltipProvider>
    )
  }

  // Desktop layout (existing code)
  return (
    <TooltipProvider delayDuration={0}>
      {/* existing desktop layout */}
    </TooltipProvider>
  )
}
```

Create the media query hook:

```tsx
// src/hooks/use-media-query.ts
import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}
```

### 5. DRAG AND DROP (FUTURE ENHANCEMENT)

#### 5.1 Setup @dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 5.2 Draggable Mail Items

```tsx
// src/components/mail/DraggableMailList.tsx
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Mail } from "@/data/mail-data"

function DraggableMailItem({ mail }: { mail: Mail }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mail.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Existing mail item UI */}
    </div>
  )
}
```

#### 5.3 Droppable Folder Navigation

```tsx
// src/components/mail/DroppableNav.tsx
import { useDroppable } from "@dnd-kit/core"

function DroppableFolder({ folder, children }: { folder: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: folder,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isOver && "bg-accent"
      )}
    >
      {children}
    </div>
  )
}
```

#### 5.4 Drag Context Wrapper

```tsx
// In MailLayout.tsx
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

export function MailLayout({ ... }: MailLayoutProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Handle moving email to folder
    const mailId = active.id
    const targetFolder = over.id

    toast.success("Email moved", {
      description: `Email moved to ${targetFolder}`,
    })

    // Update mail data (in real app, make API call)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* existing layout */}
    </DndContext>
  )
}
```

### 6. STATE PERSISTENCE STRATEGIES

#### 6.1 LocalStorage for UI Preferences

```tsx
// src/lib/storage.ts
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
}

// Usage in components:
const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() =>
  storage.get('mail-sidebar-collapsed', false)
)

React.useEffect(() => {
  storage.set('mail-sidebar-collapsed', sidebarCollapsed)
}, [sidebarCollapsed])
```

#### 6.2 Cookie Persistence for Panel Sizes

Already implemented in the ResizablePanelGroup's `onLayout` callback.

#### 6.3 URL State for Navigation

```tsx
// src/lib/use-url-state.ts
import * as React from "react"

export function useUrlState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    const params = new URLSearchParams(window.location.search)
    const value = params.get(key)
    return value ? (JSON.parse(value) as T) : defaultValue
  })

  const setUrlState = React.useCallback((value: T) => {
    setState(value)
    const params = new URLSearchParams(window.location.search)
    params.set(key, JSON.stringify(value))
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
  }, [key])

  return [state, setUrlState]
}

// Usage:
const [activeFolder, setActiveFolder] = useUrlState<MailFolder>('folder', 'inbox')
```

### 7. PERFORMANCE OPTIMIZATIONS

#### 7.1 Virtualized Mail List for Large Datasets

```bash
npm install @tanstack/react-virtual
```

```tsx
// src/components/mail/VirtualMailList.tsx
import { useVirtualizer } from "@tanstack/react-virtual"
import * as React from "react"

export function VirtualMailList() {
  const [filteredMails] = useFilteredMails()
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filteredMails.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const mail = filteredMails[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {/* Mail item UI */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

#### 7.2 Memoization for Expensive Computations

```tsx
// In MailList.tsx
const MailItem = React.memo(({ mail, isSelected, onClick }: MailItemProps) => {
  // Mail item UI
})

// In use-mail.ts
import { useMemo } from "react"

export function useFilteredMails() {
  const [mail] = useMail()

  const filtered = useMemo(() => {
    // Expensive filtering logic
  }, [mail.activeFolder, mail.searchQuery, mail.activeTab])

  return filtered
}
```

#### 7.3 Debounced Search

Already implemented in the MailSearch component with a 300ms debounce.

### 8. TESTING INTERACTIVE FEATURES

Create a comprehensive test checklist:

```markdown
## Interactive Features Test Checklist

### Navigation
- [ ] Click each folder in primary nav
- [ ] Verify active state highlights current folder
- [ ] Check badge counts update correctly
- [ ] Test sidebar collapse/expand
- [ ] Verify collapsed state shows icons only
- [ ] Test hover tooltips in collapsed mode
- [ ] Check persistence across page refreshes

### Mail List
- [ ] Click mail items to select
- [ ] Verify selection highlighting
- [ ] Test unread indicator (blue dot)
- [ ] Check "All mail" tab shows all emails
- [ ] Check "Unread" tab filters correctly
- [ ] Verify empty state message
- [ ] Test smooth scrolling

### Search
- [ ] Type in search box
- [ ] Verify 300ms debounce (no lag)
- [ ] Test search by name
- [ ] Test search by subject
- [ ] Test search by email
- [ ] Test search by body content
- [ ] Clear search and verify reset

### Mail Display
- [ ] Click Archive button
- [ ] Verify toast notification appears
- [ ] Click Delete button
- [ ] Click Junk button
- [ ] Test Reply button
- [ ] Type reply and submit
- [ ] Verify reply sent toast
- [ ] Test empty reply validation
- [ ] Click snooze presets
- [ ] Select date from calendar
- [ ] Verify snooze toast with date

### Mobile Responsive
- [ ] Open on mobile viewport
- [ ] Click hamburger menu
- [ ] Verify sidebar slides in
- [ ] Click folder from mobile menu
- [ ] Select email
- [ ] Verify email display overlays list
- [ ] Click back button
- [ ] Return to list view

### State Persistence
- [ ] Collapse sidebar
- [ ] Refresh page
- [ ] Verify sidebar stays collapsed
- [ ] Resize panels
- [ ] Refresh page
- [ ] Verify panel sizes persist
- [ ] Select folder
- [ ] Check URL updates (if implemented)

### Performance
- [ ] Load page with 1000+ emails
- [ ] Scroll through list smoothly
- [ ] Type in search without lag
- [ ] Switch folders instantly
- [ ] No console errors
- [ ] No hydration warnings
```

### 9. ACCESSIBILITY ENHANCEMENTS

```tsx
// Add keyboard navigation to mail list
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setMail({ ...mail, selected: item.id })
    }
  }}
  aria-selected={mail.selected === item.id}
  aria-label={`Email from ${item.name}: ${item.subject}`}
>

// Add screen reader announcements
import { toast } from "sonner"

const announce = (message: string) => {
  toast.info(message, { duration: 1000 })
  // Also update live region
  const liveRegion = document.getElementById('live-region')
  if (liveRegion) {
    liveRegion.textContent = message
  }
}

// In layout, add live region:
<div id="live-region" className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
```

### 10. FINAL IMPLEMENTATION CHECKLIST

```markdown
## Implementation Steps Summary

1. [ ] Update use-mail.ts with enhanced state management
2. [ ] Add MailFolder type and activeFolder state
3. [ ] Implement filteredMailsAtom with folder + search filtering
4. [ ] Add useBadgeCounts hook
5. [ ] Update Nav.tsx with click handlers and active states
6. [ ] Create MailSearch.tsx with debounced search
7. [ ] Update MailList.tsx to use filtered results
8. [ ] Add selection highlighting and empty states
9. [ ] Install sonner: `npm install sonner`
10. [ ] Update MailDisplay.tsx with action handlers
11. [ ] Add toast notifications for all actions
12. [ ] Implement working reply form
13. [ ] Add snooze functionality with calendar
14. [ ] Install sheet component: `npx shadcn@latest add sheet`
15. [ ] Create MobileSidebar component
16. [ ] Add useMediaQuery hook
17. [ ] Update MailLayout.tsx with responsive logic
18. [ ] Add Toaster component to layout
19. [ ] Test all features on desktop
20. [ ] Test all features on mobile
21. [ ] Test state persistence (localStorage + cookies)
22. [ ] Test search functionality
23. [ ] Test folder navigation
24. [ ] Verify accessibility (keyboard nav, screen readers)
25. [ ] Check performance with large datasets
26. [ ] Review console for errors/warnings
27. [ ] Deploy and test in production
```

This comprehensive guide provides everything needed to make the mail app fully interactive with professional-grade features, smooth animations, real-time feedback, and responsive design. Each section includes detailed code snippets and implementation notes that can be followed step-by-step.

---

## PREREQUISITES CONFIGURATION

### 1. Astro Configuration (astro.config.mjs)

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    react({
      // Enable React children as React nodes (needed for shadcn/ui components)
      experimentalReactChildren: true,
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### 2. TypeScript Configuration (tsconfig.json)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Tailwind CSS Setup

Create `src/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-card: 0 0% 100%;
  --color-card-foreground: 222.2 84% 4.9%;
  --color-popover: 0 0% 100%;
  --color-popover-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96.1%;
  --color-secondary-foreground: 222.2 47.4% 11.2%;
  --color-muted: 210 40% 96.1%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-accent: 210 40% 96.1%;
  --color-accent-foreground: 222.2 47.4% 11.2%;
  --color-destructive: 0 84.2% 60.2%;
  --color-destructive-foreground: 210 40% 98%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
  --color-card: 222.2 84% 4.9%;
  --color-card-foreground: 210 40% 98%;
  --color-popover: 222.2 84% 4.9%;
  --color-popover-foreground: 210 40% 98%;
  --color-primary: 210 40% 98%;
  --color-primary-foreground: 222.2 47.4% 11.2%;
  --color-secondary: 217.2 32.6% 17.5%;
  --color-secondary-foreground: 210 40% 98%;
  --color-muted: 217.2 32.6% 17.5%;
  --color-muted-foreground: 215 20.2% 65.1%;
  --color-accent: 217.2 32.6% 17.5%;
  --color-accent-foreground: 210 40% 98%;
  --color-destructive: 0 62.8% 30.6%;
  --color-destructive-foreground: 210 40% 98%;
  --color-border: 217.2 32.6% 17.5%;
  --color-input: 217.2 32.6% 17.5%;
  --color-ring: 212.7 26.8% 83.9%;
}

* {
  border-color: hsl(var(--color-border));
}

body {
  background: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
}
```

### 4. Package Dependencies

Install required packages:

```bash
# Core packages
npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest

# State management
npm install jotai

# Utilities
npm install date-fns lucide-react clsx tailwind-merge

# shadcn/ui components - install these:
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add tabs
npx shadcn@latest add resizable
npx shadcn@latest add separator
npx shadcn@latest add tooltip
npx shadcn@latest add badge
npx shadcn@latest add scroll-area
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add switch
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add select
```

Create `src/lib/utils.ts` if not exists:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## FILE STRUCTURE TO CREATE

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   ├── resizable.tsx
│   │   ├── separator.tsx
│   │   ├── tooltip.tsx
│   │   ├── badge.tsx
│   │   ├── scroll-area.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── calendar.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   └── mail/
│       ├── MailLayout.tsx           # Main layout wrapper (React)
│       ├── AccountSwitcher.tsx      # Account selector
│       ├── Nav.tsx                  # Sidebar navigation
│       ├── MailList.tsx             # Mail list component
│       ├── MailDisplay.tsx          # Mail content display
│       └── use-mail.ts              # State management hook
├── data/
│   └── mail-data.ts                 # Mock data
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── mail.astro                   # Mail page
└── styles/
    └── globals.css
```

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Create Mail Data (src/data/mail-data.ts)

```typescript
export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
}

export interface Account {
  label: string
  email: string
  icon: React.ReactNode
}

export const accounts: Account[] = [
  {
    label: "Alicia Koch",
    email: "alicia@example.com",
    icon: null,
  },
  {
    label: "Alicia Koch",
    email: "alicia@gmail.com",
    icon: null,
  },
  {
    label: "Alicia Koch",
    email: "alicia@me.com",
    icon: null,
  },
]

export const mails: Mail[] = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.",
    date: "2023-10-22T09:00:00",
    read: true,
    labels: ["meeting", "work", "important"],
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project Update",
    text: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.",
    date: "2023-10-22T10:30:00",
    read: true,
    labels: ["work", "important"],
  },
  {
    id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend Plans",
    text: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun.",
    date: "2023-04-10T11:45:00",
    read: true,
    labels: ["personal"],
  },
  {
    id: "61c35085-72d7-42b4-8d62-738f700d4b92",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Re: Question about Budget",
    text: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources.",
    date: "2023-03-25T13:15:00",
    read: false,
    labels: ["work", "budget"],
  },
  {
    id: "8f7b5c3d-6a9e-4f5d-a329-35f5a8d80607",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Important Announcement",
    text: "I have an important announcement to make during our next meeting. It pertains to a strategic shift in our approach to the upcoming quarter.",
    date: "2023-03-10T15:00:00",
    read: false,
    labels: ["meeting", "work", "important"],
  },
  {
    id: "1f0f2c02-e299-40de-9b1d-86ef9e42126b",
    name: "Sarah Brown",
    email: "sarahbrown@example.com",
    subject: "Re: Feedback on Proposal",
    text: "Thank you for your feedback on the proposal. I'm pleased to hear that you found it promising. I've made some revisions based on your suggestions.",
    date: "2023-02-15T16:30:00",
    read: true,
    labels: ["work"],
  },
]
```

### STEP 2: Create State Management Hook (src/components/mail/use-mail.ts)

```typescript
import { atom, useAtom } from "jotai"
import { Mail, mails } from "@/data/mail-data"

type Config = {
  selected: Mail["id"] | null
}

const configAtom = atom<Config>({
  selected: mails[0].id,
})

export function useMail() {
  return useAtom(configAtom)
}
```

### STEP 3: Create Navigation Component (src/components/mail/Nav.tsx)

```tsx
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: LucideIcon
    variant: "default" | "ghost"
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href="#"
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    "h-9 w-9",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <link.icon className="size-4" />
                  <span className="sr-only">{link.title}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              key={index}
              href="#"
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start"
              )}
            >
              <link.icon className="mr-2 size-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </a>
          )
        )}
      </nav>
    </div>
  )
}
```

### STEP 4: Create Account Switcher (src/components/mail/AccountSwitcher.tsx)

```tsx
import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AccountSwitcher({
  accounts,
  isCollapsed,
}: {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  isCollapsed: boolean
}) {
  const [selectedAccount, setSelectedAccount] = React.useState(accounts[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            "w-full px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground rounded-md",
            isCollapsed && "justify-center px-2"
          )}
        >
          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col text-left text-sm leading-tight">
                <span className="truncate font-semibold">{selectedAccount.label}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedAccount.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </>
          )}
          {isCollapsed && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {selectedAccount.label[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side={isCollapsed ? "right" : "bottom"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Accounts
        </DropdownMenuLabel>
        {accounts.map((account, index) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => setSelectedAccount(account)}
            className="gap-2 p-2"
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              {account.label[0]}
            </div>
            <div className="flex flex-col">
              <div className="line-clamp-1 font-medium">{account.label}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{account.email}</div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Add account</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### STEP 5: Create Mail List Component (src/components/mail/MailList.tsx)

```tsx
import { formatDistanceToNow } from "date-fns"
import { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mail } from "@/data/mail-data"
import { useMail } from "./use-mail"

interface MailListProps {
  items: Mail[]
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail()

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && (
                    <span className="flex size-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant="secondary">
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

### STEP 6: Create Mail Display Component (src/components/mail/MailDisplay.tsx)

```tsx
import { addDays, addHours, format, nextSaturday } from "date-fns"
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Mail } from "@/data/mail-data"

interface MailDisplayProps {
  mail: Mail | null
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const today = new Date()

  return (
    <div className="flex h-full flex-col">
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Archive className="size-4" />
                    <span className="sr-only">Archive</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <ArchiveX className="size-4" />
                    <span className="sr-only">Move to junk</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to junk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Trash2 className="size-4" />
                    <span className="sr-only">Move to trash</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="size-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-[535px] p-0">
                  <div className="flex flex-col gap-2 border-r px-2 py-4">
                    <div className="px-4 text-sm font-medium">Snooze until</div>
                    <div className="grid min-w-[250px] gap-1">
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Later today{" "}
                        <span className="ml-auto text-muted-foreground">
                          {format(addHours(today, 4), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Tomorrow
                        <span className="ml-auto text-muted-foreground">
                          {format(addDays(today, 1), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        This weekend
                        <span className="ml-auto text-muted-foreground">
                          {format(nextSaturday(today), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                      >
                        Next week
                        <span className="ml-auto text-muted-foreground">
                          {format(addDays(today, 7), "E, h:m b")}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <Calendar />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Reply className="size-4" />
                    <span className="sr-only">Reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <ReplyAll className="size-4" />
                    <span className="sr-only">Reply all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Forward className="size-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mail}>
                  <MoreVertical className="size-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col">
            <div className="flex items-start p-4">
              <div className="flex items-start gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt={mail.name} />
                  <AvatarFallback>
                    {mail.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-semibold">{mail.name}</div>
                  <div className="line-clamp-1 text-xs">{mail.subject}</div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">Reply-To:</span> {mail.email}
                  </div>
                </div>
              </div>
              {mail.date && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(mail.date), "PPpp")}
                </div>
              )}
            </div>
            <Separator />
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
              {mail.text}
            </div>
            <Separator className="mt-auto" />
            <div className="p-4">
              <form>
                <div className="grid gap-4">
                  <Textarea
                    className="p-4"
                    placeholder={`Reply ${mail.name}...`}
                  />
                  <div className="flex items-center">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Switch id="mute" aria-label="Mute thread" /> Mute this
                      thread
                    </Label>
                    <Button
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                      className="ml-auto"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
```

### STEP 7: Create Main Mail Layout Component (src/components/mail/MailLayout.tsx)

**CRITICAL: This is the main wrapper that uses resizable panels and manages the entire layout. It MUST be used with `client:load` in Astro for full interactivity.**

```tsx
"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "./AccountSwitcher"
import { MailDisplay } from "./MailDisplay"
import { MailList } from "./MailList"
import { Nav } from "./Nav"
import { type Mail, accounts, mails } from "@/data/mail-data"
import { useMail } from "./use-mail"

interface MailLayoutProps {
  defaultLayout?: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize?: number
}

export function MailLayout({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize = 4,
}: MailLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useMail()

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          // You can save to localStorage here if needed
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onExpand={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher
              isCollapsed={isCollapsed}
              accounts={accounts}
            />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: "128",
                icon: Inbox,
                variant: "default",
              },
              {
                title: "Drafts",
                label: "9",
                icon: File,
                variant: "ghost",
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: "ghost",
              },
              {
                title: "Junk",
                label: "23",
                icon: ArchiveX,
                variant: "ghost",
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: "ghost",
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Social",
                label: "972",
                icon: Users2,
                variant: "ghost",
              },
              {
                title: "Updates",
                label: "342",
                icon: AlertCircle,
                variant: "ghost",
              },
              {
                title: "Forums",
                label: "128",
                icon: MessagesSquare,
                variant: "ghost",
              },
              {
                title: "Shopping",
                label: "8",
                icon: ShoppingCart,
                variant: "ghost",
              },
              {
                title: "Promotions",
                label: "21",
                icon: Archive,
                variant: "ghost",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay
            mail={mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
```

### STEP 8: Create Base Layout (src/layouts/BaseLayout.astro)

```astro
---
import '@/styles/globals.css'

interface Props {
  title: string
}

const { title } = Astro.props
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

<style is:global>
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>
```

### STEP 9: Create Mail Page (src/pages/mail.astro)

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { MailLayout } from '@/components/mail/MailLayout'
---

<BaseLayout title="Mail App">
  <div class="mail-container">
    <MailLayout client:load />
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

## CRITICAL FIXES FOR SIDEBAR LAYOUT ISSUES

### Issue 1: Sidebar Not Pushing Content

**Problem**: Using CSS transforms causes visual movement but doesn't affect layout flow.

**Solution**: The resizable panels from shadcn/ui handle this automatically using flexbox. The `ResizablePanelGroup` component with `direction="horizontal"` ensures proper layout behavior where panels push each other.

### Issue 2: Hydration Timing Issues

**Problem**: Components rendering at different times cause layout shifts.

**Solution Applied**:
1. Use `client:load` on the MailLayout component to ensure immediate hydration
2. Wrapped entire interactive section in single React component
3. All state management happens within React context (Jotai)

### Issue 3: Mobile Responsive Overlay

**Solution**: Add responsive wrapper in mail.astro:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { MailLayout } from '@/components/mail/MailLayout'
---

<BaseLayout title="Mail App">
  <!-- Mobile: Show simplified view -->
  <div class="md:hidden flex items-center justify-center h-screen p-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4">Mail App</h2>
      <p class="text-muted-foreground">
        This layout is optimized for desktop. Please view on a larger screen.
      </p>
    </div>
  </div>

  <!-- Desktop/Tablet: Show full mail interface -->
  <div class="hidden md:block mail-container">
    <MailLayout client:load />
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

### Issue 4: CSS Not Applying to React Islands

**Solution**: Already handled by:
1. Using Tailwind classes directly in React components
2. Global styles in `globals.css` apply to all components
3. shadcn/ui components have styles built-in

---

## ASTRO-SPECIFIC CLIENT DIRECTIVES USAGE

### Why `client:load` for MailLayout?

The MailLayout component MUST use `client:load` because:

1. **Resizable panels require immediate interactivity** - Users need to drag handles on page load
2. **State management needs to be active** - Mail selection state via Jotai
3. **All child components share context** - TooltipProvider wraps everything
4. **Complex interactions throughout** - Dropdowns, popovers, calendars all need full React context

### Alternative Directives (DO NOT USE for this case):

- ❌ `client:idle` - Would delay resizable functionality
- ❌ `client:visible` - Would break above-fold layout
- ❌ `client:only="react"` - Unnecessary (SSR is fine for initial render)
- ❌ `client:media` - Not appropriate for main layout

---

## HANDLING STATE MANAGEMENT

### Why Jotai?

1. **Lightweight** - Minimal bundle size
2. **React 19 Compatible** - Full support for latest React
3. **Astro Islands Friendly** - Works across React islands when wrapped properly
4. **Simple API** - Easy atom-based state

### State Flow:

```
User clicks mail item
  → MailList updates useMail state
  → MailDisplay reads useMail state
  → UI updates instantly
```

All state lives within the React island (MailLayout), so no cross-island communication issues.

---

## TESTING CHECKLIST

After implementation, verify:

- [ ] Page loads without errors
- [ ] Sidebar is collapsible by dragging resize handle
- [ ] Sidebar collapses to icon-only mode
- [ ] Mail list is scrollable
- [ ] Clicking a mail item shows it in the display panel
- [ ] All icons render correctly (lucide-react)
- [ ] Tooltips appear on hover in collapsed sidebar
- [ ] Search bar is present and styled
- [ ] Tabs switch between "All mail" and "Unread"
- [ ] Action buttons (Archive, Trash, etc.) are visible
- [ ] Avatar shows initials fallback
- [ ] Date formatting works (date-fns)
- [ ] Reply textarea is functional
- [ ] All resizable panels can be dragged
- [ ] Layout state persists (saved to cookies)
- [ ] No hydration errors in console
- [ ] No layout shift on load
- [ ] Full height layout (no scrolling on body)

---

## COMMON ISSUES & TROUBLESHOOTING

### Issue: "Cannot find module '@/components/ui/...'"

**Solution**: Ensure shadcn/ui components are installed:
```bash
npx shadcn@latest add [component-name]
```

### Issue: Icons not rendering

**Solution**: Install lucide-react:
```bash
npm install lucide-react
```

### Issue: Date formatting errors

**Solution**: Install date-fns:
```bash
npm install date-fns
```

### Issue: Hydration mismatch warnings

**Solution**: Ensure MailLayout has `"use client"` directive at top of file (already included in code above)

### Issue: Panels not resizing

**Solution**: Verify that:
1. Parent container has fixed height (`height: 100vh`)
2. `overflow: hidden` is set on html and body
3. ResizablePanelGroup has `className="h-full"`

### Issue: Sidebar not collapsing properly

**Solution**: Check that:
1. `collapsible={true}` is set on ResizablePanel
2. `collapsedSize` prop is provided
3. `onCollapse` and `onExpand` callbacks are present

---

## PERFORMANCE OPTIMIZATIONS

### Already Implemented:

1. **Single React Island** - Entire mail layout is one island, reducing hydration overhead
2. **Lazy Loading** - Only mail layout loads React; other pages can be static
3. **Minimal JavaScript** - Only interactive components get JS
4. **CSS-First Styling** - Tailwind compiles to CSS, no runtime cost
5. **Proper Client Directive** - `client:load` ensures immediate interactivity without delay

### Optional Enhancements:

**Add loading state**:
```astro
<MailLayout client:load>
  <div slot="fallback" class="flex items-center justify-center h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
</MailLayout>
```

---

## NEXT STEPS & EXTENSIONS

### Add Routing:

Convert mail selection to use Astro routing:

```typescript
// In MailList.tsx, replace onClick with:
<a href={`/mail/${item.id}`} className={...}>
  {/* Mail item content */}
</a>
```

Create dynamic route at `src/pages/mail/[id].astro`

### Add Real Data:

Replace mock data with API calls:

```typescript
// src/lib/api.ts
export async function fetchMails() {
  const response = await fetch('https://api.example.com/mails')
  return response.json()
}

// In mail.astro
---
import { fetchMails } from '@/lib/api'
const mails = await fetchMails()
---
```

### Add Authentication:

Integrate with Astro's auth helpers:

```astro
---
const session = await Astro.locals.auth()
if (!session) {
  return Astro.redirect('/login')
}
---
```

### Persist Sidebar State:

Already implemented via cookies in MailLayout:
- Panel sizes saved automatically
- Collapsed state saved automatically

---

## FINAL NOTES

This implementation provides a **production-ready** mail layout that:

✅ Uses React 19 features (no forwardRef needed)  
✅ Uses Tailwind CSS 4 with CSS-first configuration  
✅ Properly integrates with Astro's islands architecture  
✅ Handles responsive behavior correctly  
✅ Manages state efficiently with Jotai  
✅ Provides collapsible, resizable sidebar  
✅ Prevents all common layout issues  
✅ Uses proper hydration strategies  
✅ Follows shadcn/ui patterns exactly  
✅ Is fully type-safe with TypeScript  

The key insight is that complex interactive layouts like this should be **wrapped in a single React component** and hydrated with `client:load` to ensure all interactive features work immediately and all child components can share React context properly.

Execute this implementation step-by-step, and you'll have a fully functional shadcn mail layout in your Astro project.