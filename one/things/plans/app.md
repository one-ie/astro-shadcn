# App Interface Plan: Matching Figma Design

## Vision

Transform the mail UI into `src/pages/app/index.astro` - matching the exact Figma design at `/public/screenshots/App.png`. A clean, minimal 3-panel interface where users interact with **things, connections, events, and tags**.

## Design Analysis (from Figma)

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┬────────────────────────┬──────────────────────────────┐    │
│  │             │                        │                              │    │
│  │  LEFT       │   MIDDLE PANEL         │   RIGHT PANEL                │    │
│  │  SIDEBAR    │   (List View)          │   (Detail View)              │    │
│  │             │                        │                              │    │
│  │  Profile    │   [Now|Top|ToDo|Done]  │   ┌────────────────────┐    │    │
│  │  + Avatar   │                        │   │ 📧 Company         │    │    │
│  │             │   [Search............] │   │    Subtitle        │    │    │
│  │  ● Messages │                        │   └────────────────────┘    │    │
│  │    128      │   [Hook] [Gift]        │                              │    │
│  │             │                        │   [Avatar Group]             │    │
│  │  □ Groups   │   ┌─────────────────┐  │   Message content...         │    │
│  │    9        │   │ Company     1min│  │   Message content...         │    │
│  │             │   │ Character CHS   │  │   Message content...         │    │
│  │  👥 Agents  │   │ Gather insight..│  │                              │    │
│  │    20       │   │ [Found][Company]│  │   Thanks, Emily              │    │
│  │             │   └─────────────────┘  │                              │    │
│  │  ⚙ Tools    │   ┌─────────────────┐  │   [Add][Reply][Forward]...   │    │
│  │    10       │   │ Welcome    2days│  │                              │    │
│  │             │   │ Weekend Plans   │  │   @Teacher One @Anthony      │    │
│  │  👤 People  │   │ Any plans for...│  │                              │    │
│  │    128      │   │ [Weekend][Work] │  │   [Add][Invite][Share]...    │    │
│  │             │   └─────────────────┘  │                              │    │
│  │             │   ┌─────────────────┐  │                              │    │
│  │             │   │ Marketer ●  3day│  │                              │    │
│  │             │   │ Re: Question... │  │                              │    │
│  │             │   │ [Budget][About] │  │                              │    │
│  └─────────────┴────────────────────────┴──────────────────────────────┘    │
│                                                                              │
│  Bottom Categories: Hook, Gift, Identify, Engage, Sell, Nurture, Upsell... │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Elements to Match

### 1. Left Sidebar (Narrow, Icon + Text)

**Design:**
- Fixed narrow width (~250px)
- White background with subtle borders
- Profile section at top with avatar + name + dropdown
- Navigation items with:
  - Icon on left
  - Label in middle
  - Count badge on right
  - Active state: black background, white text, rounded
  - Inactive: gray text, hover effect

**Navigation Items:**
```
- Messages (128)    [active: black bg]
- Groups (9)
- Agents (20)
- Tools (10)
- People (128)
```

**Ontology Mapping:**
```
Messages → Things     (all entities)
Groups   → Org View   (organization-scoped)
Agents   → AI Agents  (type: "agent")
Tools    → Protocols  (integrations/services)
People   → Users      (type: "user")
```

### 2. Middle Panel (List View)

**Top Section:**
- **Tabs:** `Now | Top | ToDo | Done` (horizontal tabs, subtle)
- **Search:** Full-width search input with icon
- **Filter Pills:** Black rounded pills (e.g., "Hook", "Gift")

**List Items Design:**
```
┌─────────────────────────────────────┐
│ Title                    timestamp  │
│ Character Code (e.g., CHS)          │
│ Subtitle/description                │
│ Preview text truncated...           │
│ [Tag1] [Tag2] [Tag3]               │  ← Black rounded pills
└─────────────────────────────────────┘
```

**Features:**
- Blue dot (●) for unread/new items
- White background cards with border
- Hover effect
- Selected state: subtle background change
- Timestamp on top right
- Tags as black pills at bottom

### 3. Right Panel (Detail View)

**Header:**
```
┌──────────────────────────────┐
│ 📧 Title                     │
│    Subtitle/description      │
└──────────────────────────────┘
```

**Content Area:**
- Avatar groups (overlapping circles)
- Message threads/content
- Clean typography
- Spacious padding

**Action Buttons:**
- **Primary row:** `Add | Reply | Forward | Share | Save | Copy | Complete`
- **Secondary row:** `Add | Invite | Share | Save | Complete`
- All buttons are subtle, minimal style

**@Mentions Section:**
- Pills with @ symbol
- e.g., `@Teacher One` `@Anthony O'Connell`

### 4. Bottom Categories

**Design:**
- Horizontal list of category names
- Subtle text, minimal style
- Categories: Hook, Gift, Identify, Engage, Sell, Nurture, Upsell, Educate, Share

## Figma → Ontology Mapping

```
┌─────────────────────────────────────────────────────────────┐
│  FIGMA DESIGN            →         ONTOLOGY APP             │
├─────────────────────────────────────────────────────────────┤
│  Profile + Avatar        →    User Context + Org Switcher   │
│  "Anthony O'Connell"          Current user + active org     │
├─────────────────────────────────────────────────────────────┤
│  Messages (128)          →    Things View                   │
│  Groups (9)              →    Org Things / Workspaces       │
│  Agents (20)             →    AI Agents (type: "agent")     │
│  Tools (10)              →    Protocols / Integrations      │
│  People (128)            →    Users (type: "user")          │
├─────────────────────────────────────────────────────────────┤
│  Now | Top | ToDo | Done →    Entity Filters                │
│                               - Now: Recent/active           │
│                               - Top: Most important/starred  │
│                               - ToDo: Status = "pending"     │
│                               - Done: Status = "completed"   │
├─────────────────────────────────────────────────────────────┤
│  Hook, Gift pills        →    Ontology Stages               │
│  (filter buttons)             Hook → Identify → Engage...   │
│                               (The 8 customer journey stages)│
├─────────────────────────────────────────────────────────────┤
│  Card: Company           →    Thing Entity Card             │
│  - Character CHS              - Type indicator               │
│  - "Gather insight..."        - Name + description           │
│  - [Foundation][Company]      - Tags from `tags` table       │
├─────────────────────────────────────────────────────────────┤
│  Detail: Message thread  →    Entity Detail + Activity      │
│  - Avatar groups              - Connected users              │
│  - Content                    - Properties + data            │
│  - Actions                    - CRUD operations              │
│  - @mentions                  - Related entities             │
└─────────────────────────────────────────────────────────────┘
```

## File Cloning Strategy

### Phase 1: Clone Core Structure

```bash
# 1. Create app directory structure
mkdir -p src/pages/app
mkdir -p src/components/app
mkdir -p src/data/app-data.ts
mkdir -p src/layouts/AppLayout.astro

# 2. Clone files with new names
src/pages/mail.astro                  → src/pages/app/index.astro
src/layouts/MailLayout.astro          → src/layouts/AppLayout.astro
src/components/mail/MailLayout.tsx    → src/components/app/AppLayout.tsx
src/components/mail/MailList.tsx      → src/components/app/EntityList.tsx
src/components/mail/MailDisplay.tsx   → src/components/app/EntityDisplay.tsx
src/components/mail/use-mail.ts       → src/components/app/use-app.ts
src/data/mail-data.ts                 → src/data/app-data.ts
```

### Phase 2: Data Layer (Match Figma Design)

**Card Data Structure:**
```typescript
import { type Id } from "@/convex/_generated/dataModel"

export interface EntityCard {
  _id: Id<"things">

  // Card display
  title: string                    // e.g., "Company"
  characterCode?: string            // e.g., "CHS" (Character High Status?)
  subtitle: string                  // e.g., "Gather insight and data for your company"
  preview: string                   // First line of content/description

  // Metadata
  timestamp: number                 // For "1 min ago", "2 days ago"
  unread: boolean                   // Blue dot indicator

  // Tags (black pills)
  tags: string[]                    // e.g., ["Foundation", "Company"]

  // Ontology data
  type: string                      // "company", "agent", "course", etc.
  status: "now" | "top" | "todo" | "done"

  // Full entity data
  properties: Record<string, any>
  createdAt: number
  updatedAt: number
  createdBy?: Id<"things">

  // Computed fields
  connectionCount?: number
  recentActivityCount?: number
}

// Left sidebar navigation
export type NavigationView =
  | "messages"    // All things
  | "groups"      // Org-scoped things
  | "agents"      // type: "agent"
  | "tools"       // Protocols/integrations
  | "people"      // type: "user"

// Top tabs in middle panel
export type StatusFilter = "now" | "top" | "todo" | "done"

// Customer journey stages (filter pills)
export const JOURNEY_STAGES = [
  "Hook",
  "Gift",
  "Identify",
  "Engage",
  "Sell",
  "Nurture",
  "Upsell",
  "Educate",
  "Share"
] as const

export type JourneyStage = typeof JOURNEY_STAGES[number]
```

### Phase 3: State Management (Figma-Aligned)

**New:** `src/components/app/use-app.ts`
```typescript
import { atom, useAtom } from "jotai"
import { type Id } from "@/convex/_generated/dataModel"
import { type NavigationView, type StatusFilter, type JourneyStage } from "@/data/app-data"

type AppState = {
  // Left sidebar navigation
  activeView: NavigationView        // "messages" | "groups" | "agents" | "tools" | "people"

  // Middle panel filters
  statusFilter: StatusFilter        // "now" | "top" | "todo" | "done"
  journeyStages: JourneyStage[]     // ["Hook", "Gift", ...] selected pills
  searchQuery: string

  // Selected entity
  selectedEntityId: Id<"things"> | null

  // UI state
  showDetail: boolean               // Show right panel (mobile)
}

const appStateAtom = atom<AppState>({
  activeView: "messages",
  statusFilter: "now",
  journeyStages: [],
  searchQuery: "",
  selectedEntityId: null,
  showDetail: false,
})

export function useApp() {
  return useAtom(appStateAtom)
}
```

### Phase 4: Component Transformations (Exact Figma Match)

#### 4.1 ProfileHeader (Top of Left Sidebar)

**Design from Figma:**
```
┌─────────────────────────┐
│ M  Anthony O'Connell ▼  │  ← Avatar + Name + Dropdown
└─────────────────────────┘
```

**Component:** `src/components/app/ProfileHeader.tsx`
```typescript
interface ProfileHeaderProps {
  user: {
    name: string
    avatar?: string
    email: string
  }
  orgs: { id: string; name: string }[]
  activeOrg?: string
  onOrgChange: (orgId: string) => void
}

// Renders:
// - Avatar with first initial
// - User name
// - Dropdown for org switching
// - Dropdown styling matches Figma exactly
```

#### 4.2 Navigation (Left Sidebar Items)

**Design from Figma:**
```
● Messages      128   ← Active: black bg, white text
□ Groups          9
👥 Agents         20
⚙ Tools          10
👤 People        128
```

**Component:** `src/components/app/Navigation.tsx`
```typescript
const navigationItems = [
  {
    id: "messages",
    icon: MessageSquare,   // or custom message icon
    label: "Messages",
    count: 128,            // Total things count
    active: true,          // Black background style
  },
  {
    id: "groups",
    icon: Grid3x3,         // or folder icon
    label: "Groups",
    count: 9,              // Orgs/workspaces count
  },
  {
    id: "agents",
    icon: Bot,             // AI agent icon
    label: "Agents",
    count: 20,             // Agents count
  },
  {
    id: "tools",
    icon: Wrench,          // Tools/integrations icon
    label: "Tools",
    count: 10,             // Protocols count
  },
  {
    id: "people",
    icon: Users,           // People icon
    label: "People",
    count: 128,            // Users count
  },
]

// Styling:
// Active: bg-black text-white rounded-lg
// Inactive: text-gray-600 hover:bg-gray-100
// Count badge: text-sm text-gray-500 ml-auto
```

#### 4.3 EntityCard (Middle Panel List Items)

**Design from Figma:**
```
┌──────────────────────────────────┐
│ Company              1 min ago   │  ← Title + Timestamp
│ Character CHS                    │  ← Subtitle/code
│ Gather insight and data for...  │  ← Description/preview
│ [Foundation] [Company]           │  ← Black pill tags
│                              ●   │  ← Blue dot if unread
└──────────────────────────────────┘
```

**Component:** `src/components/app/EntityCard.tsx`
```typescript
interface EntityCardProps {
  title: string              // "Company"
  characterCode?: string      // "CHS"
  subtitle: string           // "Gather insight and data for your company"
  preview?: string           // First line of description
  timestamp: number          // For "1 min ago"
  tags: string[]             // ["Foundation", "Company"]
  unread?: boolean           // Blue dot
  selected?: boolean         // Background highlight
  onClick: () => void
}

// Styling:
// - White bg with border, rounded corners
// - Hover: slight background change
// - Selected: bg-muted
// - Title: font-semibold
// - Timestamp: text-xs text-muted-foreground, top-right
// - Character code: text-sm
// - Tags: BLACK pills (bg-black text-white rounded-full px-2 py-1 text-xs)
// - Blue dot: absolute top-right, bg-blue-500 w-2 h-2 rounded-full
```

#### 4.4 EntityDisplay (Right Panel)

**Design from Figma:**
```
┌────────────────────────────────┐
│ 📧 Company                     │  ← Icon + Title
│    Gather insight and data...  │  ← Subtitle
├────────────────────────────────┤
│ [Avatar Group - 3 people]      │  ← Overlapping avatars
│                                │
│ Hi, let's have a meeting...    │  ← Message/content thread
│ Hi, let's have a meeting...    │
│ Hi, let's have a meeting...    │
│                                │
│ Thanks, Emily                  │
├────────────────────────────────┤
│ Add Reply Forward Share Save   │  ← Action buttons row
│ Copy Complete                  │
├────────────────────────────────┤
│ @Teacher One @Anthony O'Connell│  ← @mentions
├────────────────────────────────┤
│ Add Invite Share Save Complete │  ← Secondary actions
└────────────────────────────────┘
```

**Component:** `src/components/app/EntityDisplay.tsx`
```typescript
interface EntityDisplayProps {
  entity: EntityCard | null
}

// Structure:
// 1. Header (icon + title + subtitle)
// 2. Content area:
//    - Avatar group (connected users/agents)
//    - Message thread / entity activity
//    - Properties display
// 3. Action bar 1: Add | Reply | Forward | Share | Save | Copy | Complete
// 4. @Mentions section (related entities)
// 5. Action bar 2: Add | Invite | Share | Save | Complete

// Styling:
// - Clean, minimal
// - Spacious padding
// - Action buttons: text-only, subtle hover
// - @mentions: bg-muted rounded-full px-3 py-1 text-sm
```

#### 4.5 StatusTabs (Middle Panel Top)

**Design from Figma:**
```
[Now] [Top] [ToDo] [Done]
```

**Component:** `src/components/app/StatusTabs.tsx`
```typescript
const statusTabs = [
  { value: "now", label: "Now" },
  { value: "top", label: "Top" },
  { value: "todo", label: "ToDo" },
  { value: "done", label: "Done" },
]

// Renders:
// - Horizontal tabs (subtle style)
// - Active tab: underline or subtle background
// - Changes `statusFilter` in app state
```

#### 4.6 JourneyStageFilters (Black Pills)

**Design from Figma:**
```
[Hook] [Gift] [more pills...]
```

**Component:** `src/components/app/JourneyStageFilters.tsx`
```typescript
const JOURNEY_STAGES = [
  "Hook", "Gift", "Identify", "Engage",
  "Sell", "Nurture", "Upsell", "Educate", "Share"
]

// Renders:
// - Horizontal scrollable list of pills
// - Selected pills: bg-black text-white
// - Unselected pills: bg-white text-black border
// - Multiple selection allowed
// - Updates `journeyStages` array in app state
```

## Implementation Phases (Figma-Aligned)

### Phase 1: Foundation (2 hours)
- [ ] Clone mail files to `src/pages/app/`, `src/components/app/`
- [ ] Create `app-data.ts` with EntityCard, NavigationView, StatusFilter types
- [ ] Create `use-app.ts` with Jotai state management
- [ ] Verify basic 3-panel layout renders

### Phase 2: Left Sidebar (2-3 hours)
- [ ] Build ProfileHeader component (avatar + name + dropdown)
- [ ] Build Navigation component with 5 items (Messages, Groups, Agents, Tools, People)
- [ ] Style active/inactive states (black bg for active)
- [ ] Wire up view switching

### Phase 3: Middle Panel - Top Section (2 hours)
- [ ] Build StatusTabs component (Now, Top, ToDo, Done)
- [ ] Add search bar with icon
- [ ] Build JourneyStageFilters component (black pills)
- [ ] Wire up all filters to state

### Phase 4: Middle Panel - Entity Cards (3-4 hours)
- [ ] Build EntityCard component matching Figma design
  - Title + timestamp layout
  - Character code display
  - Subtitle + preview
  - Black pill tags
  - Blue dot for unread
  - Selected state styling
- [ ] Build EntityList with scrollable area
- [ ] Connect to Convex queries
- [ ] Add filtering logic (status + journey stages + search)

### Phase 5: Right Panel - Entity Display (3-4 hours)
- [ ] Build EntityDisplay header (icon + title + subtitle)
- [ ] Add avatar group display
- [ ] Add content/activity area
- [ ] Build action button rows
  - Primary: Add | Reply | Forward | Share | Save | Copy | Complete
  - Secondary: Add | Invite | Share | Save | Complete
- [ ] Add @mentions section
- [ ] Style to match Figma spacing and typography

### Phase 6: Convex Integration (3-4 hours)
- [ ] Create queries for entities filtered by view + status + stages
- [ ] Add count queries for navigation badges
- [ ] Implement real-time subscriptions
- [ ] Add loading and error states
- [ ] Add optimistic updates

### Phase 7: Mobile Responsiveness (2 hours)
- [ ] Test mobile layout (show/hide panels)
- [ ] Add back button on mobile detail view
- [ ] Ensure touch-friendly tap targets
- [ ] Test horizontal scroll for filter pills

### Phase 8: Polish (2-3 hours)
- [ ] Perfect spacing to match Figma pixel-perfect
- [ ] Add transitions and hover effects
- [ ] Test dark mode
- [ ] Add keyboard shortcuts (j/k navigation, esc to close)
- [ ] Add empty states

## Key Design Principles

### 1. Visual Hierarchy from Figma

The design has 3 clear levels:
1. **Navigation** (left sidebar) - 5 main views with counts
2. **Filtering** (middle panel top) - Status tabs + journey stage pills + search
3. **Content** (cards + detail) - Clean, minimal, action-oriented

### 2. Black Pills as Visual Anchor

Black rounded pills appear in two key places:
- **Filter pills** (Hook, Gift, etc.) - selectable journey stages
- **Tag pills** (on cards) - entity categorization

This creates visual consistency and makes filtering/categorization intuitive.

### 3. Minimal Action Buttons

Action buttons are text-only with subtle styling:
- **Not** icon buttons with heavy backgrounds
- **Simple** text labels with spacing
- **Consistent** between primary and secondary action rows

### 4. Status via Color Coding

- **Blue dot** = unread/new
- **Black background** = active navigation item
- **Black pills** = selected filters/tags
- **White pills** = unselected filters
- **Muted text** = timestamps and metadata

### 5. Three-Column Responsive Layout

The mail UI's resizable 3-panel system is perfect:
- **Left:** Fixed ~250px for navigation
- **Middle:** Flexible for card list
- **Right:** Flexible for detail view
- **Mobile:** Stacked with smart show/hide

## Example User Flows (Based on Figma)

### Flow 1: View and Filter Entities

1. User lands on app → **Messages** view active (shows all things)
2. Click **Top** tab → see most important/starred entities
3. Click **Hook** filter pill → see only entities in "Hook" journey stage
4. Type "company" in search → see filtered results
5. Click entity card → see detail in right panel
6. Click **Complete** → entity moves to "Done" status

### Flow 2: Navigate Between Views

1. User clicks **Groups** in left sidebar
2. Middle panel shows org-scoped entities
3. Click an org entity → see details + team members
4. Click **@Teacher One** mention → navigate to that person's entity
5. Click **People** in left sidebar → see all users
6. Click user → see their profile and activity

### Flow 3: Multi-Stage Filtering

1. User clicks **ToDo** tab → see pending items
2. Select multiple journey stage pills: **[Hook]** **[Gift]** **[Identify]**
3. Search "marketing" → results filtered by status + stages + search
4. Click through cards to process them
5. Click **Complete** on each → they move to "Done"

## Technical Architecture (Simplified)

```
src/pages/app/index.astro
  └─> AppLayout.tsx (client:only="react")
       ├─> Left Panel
       │    ├─> ProfileHeader
       │    └─> Navigation (5 items)
       │
       ├─> Middle Panel
       │    ├─> StatusTabs (Now/Top/ToDo/Done)
       │    ├─> Search
       │    ├─> JourneyStageFilters (pills)
       │    └─> EntityList
       │         └─> EntityCard (repeated)
       │
       └─> Right Panel
            └─> EntityDisplay
                 ├─> Header
                 ├─> Content/Activity
                 ├─> Action Buttons
                 └─> @Mentions

State: Jotai (use-app.ts)
Data: Convex queries (real-time)
Styling: Tailwind v4 (matches Figma exactly)
```

## File Structure (Figma-Based)

```
src/
├── pages/app/
│   └── index.astro                  # Main app page
│
├── components/app/
│   ├── AppLayout.tsx                # Main 3-panel layout (from MailLayout)
│   │
│   ├── ProfileHeader.tsx            # Avatar + name + org dropdown
│   ├── Navigation.tsx               # 5 nav items (Messages, Groups, Agents, Tools, People)
│   │
│   ├── StatusTabs.tsx               # Now | Top | ToDo | Done
│   ├── JourneyStageFilters.tsx      # Black pills (Hook, Gift, etc.)
│   │
│   ├── EntityList.tsx               # Scrollable list of cards
│   ├── EntityCard.tsx               # Individual card matching Figma
│   │
│   ├── EntityDisplay.tsx            # Right panel detail view
│   │
│   └── use-app.ts                   # Jotai state management
│
├── data/
│   └── app-data.ts                  # Types: EntityCard, NavigationView, StatusFilter, JourneyStage
│
└── layouts/
    └── AppLayout.astro              # Wrapper layout (optional)

convex/
└── queries/
    └── app.ts                       # Queries for entities by view/status/stages
```

## Critical Styling Details (Match Figma Exactly)

### Left Sidebar
- Width: ~250px fixed
- Active item: `bg-black text-white rounded-lg px-3 py-2`
- Inactive item: `text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2`
- Count badge: `ml-auto text-sm text-gray-500`
- Profile dropdown: subtle border, centered text

### Entity Cards
- White background with subtle border
- Padding: `p-4`
- Title: `font-semibold text-base`
- Character code: `text-sm text-gray-600`
- Timestamp: `text-xs text-gray-500 absolute top-4 right-4`
- Tags: `bg-black text-white text-xs px-2 py-1 rounded-full`
- Blue dot: `w-2 h-2 bg-blue-500 rounded-full absolute top-2 right-2`
- Hover: `hover:bg-gray-50`
- Selected: `bg-muted border-l-4 border-l-black`

### Filter Pills (Journey Stages)
- Selected: `bg-black text-white px-3 py-1 rounded-full text-sm`
- Unselected: `bg-white text-black border border-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-50`

### Action Buttons
- Simple text buttons with spacing
- No heavy backgrounds or borders
- `text-sm text-gray-700 hover:text-black px-2`
- Separated by `|` divider or subtle gap

## Next Steps

1. ✅ **Plan approved** - Figma design analyzed and mapped
2. 🚀 **Start Phase 1:** Clone mail files to `src/components/app/`
3. 🎨 **Build component by component** following the 8 phases
4. 🔍 **Pixel-perfect matching** - compare with Figma screenshot
5. 📊 **Connect Convex data** - use ontology queries
6. 🎯 **Test each view** - Messages, Groups, Agents, Tools, People

## Why This Works

The mail UI is **the perfect foundation**:

✅ **Already has** 3-panel resizable layout
✅ **Already has** mobile-responsive behavior
✅ **Already has** state management with Jotai
✅ **Already has** shadcn/ui components
✅ **Already has** search and filtering
✅ **Already has** card-based list view

We're **adapting existing patterns**, not reinventing the wheel.

**The genius move:** Using mail.astro as the base means we inherit all the polish and functionality for free. We just need to:
1. Change the data shape (Mail → EntityCard)
2. Update the styling (match Figma colors/spacing)
3. Add ontology-specific features (journey stages, navigation views)

**Estimated total time:** 16-24 hours to complete all 8 phases.
