// Using plain string IDs for now (no Convex dependency)
export type EntityId = string

export interface EntityCard {
  _id: EntityId

  // Card display (matching Figma)
  title: string                    // e.g., "Company"
  characterCode?: string            // e.g., "CHS"
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
  createdBy?: EntityId

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

// Mock data for initial development
export const mockEntities: EntityCard[] = [
  // NOW status entities
  {
    _id: "entity_1",
    title: "Company",
    characterCode: "CHS",
    subtitle: "Character One",
    preview: "Gather insight and data for your company",
    timestamp: Date.now() - 60000, // 1 min ago
    unread: true,
    tags: ["Foundation", "Company"],
    type: "company",
    status: "now",
    properties: {},
    createdAt: Date.now() - 60000,
    updatedAt: Date.now() - 60000,
  },
  {
    _id: "entity_2",
    title: "Welcome",
    subtitle: "Weekend Plans",
    preview: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since...",
    timestamp: Date.now() - 172800000, // 2 days ago
    unread: false,
    tags: ["Weekend", "Work"],
    type: "message",
    status: "now",
    properties: {},
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
  },
  {
    _id: "entity_5",
    title: "New Agent",
    characterCode: "AGT",
    subtitle: "AI Assistant Configuration",
    preview: "Configure the new AI agent for customer support automation. This will help reduce response times significantly...",
    timestamp: Date.now() - 3600000, // 1 hour ago
    unread: true,
    tags: ["Hook", "AI"],
    type: "agent",
    status: "now",
    properties: {},
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },

  // TOP status entities
  {
    _id: "entity_6",
    title: "Q4 Revenue Goals",
    subtitle: "Strategic Planning",
    preview: "Review and update our Q4 revenue targets based on current market conditions and pipeline analysis...",
    timestamp: Date.now() - 7200000, // 2 hours ago
    unread: true,
    tags: ["Sell", "Strategy"],
    type: "message",
    status: "top",
    properties: {},
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
  {
    _id: "entity_7",
    title: "Product Launch",
    characterCode: "PRD",
    subtitle: "Marketing Campaign",
    preview: "Finalize the marketing campaign for our new product launch next month. Need to coordinate with design team...",
    timestamp: Date.now() - 86400000, // 1 day ago
    unread: false,
    tags: ["Engage", "Marketing"],
    type: "project",
    status: "top",
    properties: {},
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },

  // TODO status entities
  {
    _id: "entity_3",
    title: "Marketer",
    subtitle: "Re: Question about Budget",
    preview: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the alloc...",
    timestamp: Date.now() - 259200000, // 3 days ago
    unread: true,
    tags: ["Budget", "About", "Work"],
    type: "message",
    status: "todo",
    properties: {},
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
  },
  {
    _id: "entity_8",
    title: "Customer Onboarding",
    characterCode: "ONB",
    subtitle: "New Enterprise Client",
    preview: "Complete onboarding documentation for our new enterprise client. They need training materials by end of week...",
    timestamp: Date.now() - 432000000, // 5 days ago
    unread: false,
    tags: ["Nurture", "Educate"],
    type: "task",
    status: "todo",
    properties: {},
    createdAt: Date.now() - 432000000,
    updatedAt: Date.now() - 432000000,
  },
  {
    _id: "entity_9",
    title: "Integration Setup",
    subtitle: "API Configuration",
    preview: "Set up the new payment gateway integration for our e-commerce platform. Test in sandbox environment first...",
    timestamp: Date.now() - 518400000, // 6 days ago
    unread: true,
    tags: ["Gift", "Technical"],
    type: "task",
    status: "todo",
    properties: {},
    createdAt: Date.now() - 518400000,
    updatedAt: Date.now() - 518400000,
  },

  // DONE status entities
  {
    _id: "entity_4",
    title: "David Lee",
    subtitle: "New Project Idea",
    preview: "I have an exciting new project idea to discuss with you. It involves expanding our services to target a niche m...",
    timestamp: Date.now() - 259200000, // 3 days ago
    unread: false,
    tags: ["Identify", "Project"],
    type: "message",
    status: "done",
    properties: {},
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
  },
  {
    _id: "entity_10",
    title: "Website Redesign",
    characterCode: "WEB",
    subtitle: "Homepage Updates",
    preview: "Successfully completed the homepage redesign with new branding and improved conversion funnel. Analytics look great...",
    timestamp: Date.now() - 604800000, // 7 days ago
    unread: false,
    tags: ["Share", "Complete"],
    type: "project",
    status: "done",
    properties: {},
    createdAt: Date.now() - 604800000,
    updatedAt: Date.now() - 604800000,
  },
  {
    _id: "entity_11",
    title: "Team Meeting",
    subtitle: "Weekly Sync",
    preview: "Great discussion on Q3 performance and planning for Q4. Everyone is aligned on priorities and excited about upcoming...",
    timestamp: Date.now() - 691200000, // 8 days ago
    unread: false,
    tags: ["Upsell", "Team"],
    type: "meeting",
    status: "done",
    properties: {},
    createdAt: Date.now() - 691200000,
    updatedAt: Date.now() - 691200000,
  },

  // Additional varied entities
  {
    _id: "entity_12",
    title: "Content Strategy",
    characterCode: "CNT",
    subtitle: "Blog & Social Media",
    preview: "Develop comprehensive content strategy for Q4 including blog posts, social media campaigns, and email newsletters...",
    timestamp: Date.now() - 10800000, // 3 hours ago
    unread: true,
    tags: ["Hook", "Share"],
    type: "strategy",
    status: "now",
    properties: {},
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now() - 10800000,
  },
  {
    _id: "entity_13",
    title: "Partnership Proposal",
    subtitle: "Tech Startup Collaboration",
    preview: "Exciting opportunity to partner with a growing tech startup in the AI space. They're looking for integration possibilities...",
    timestamp: Date.now() - 21600000, // 6 hours ago
    unread: false,
    tags: ["Identify", "Engage"],
    type: "opportunity",
    status: "top",
    properties: {},
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 21600000,
  },
  {
    _id: "entity_14",
    title: "Bug Fix",
    characterCode: "BUG",
    subtitle: "Payment Gateway Issue",
    preview: "Critical bug in payment processing needs immediate attention. Some customers reporting failed transactions...",
    timestamp: Date.now() - 1800000, // 30 min ago
    unread: true,
    tags: ["Gift", "Technical"],
    type: "task",
    status: "todo",
    properties: {},
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
  {
    _id: "entity_15",
    title: "Customer Survey",
    subtitle: "Feedback Collection",
    preview: "Completed customer satisfaction survey. Results show 94% satisfaction rate with room for improvement in support response times...",
    timestamp: Date.now() - 777600000, // 9 days ago
    unread: false,
    tags: ["Nurture", "Feedback"],
    type: "report",
    status: "done",
    properties: {},
    createdAt: Date.now() - 777600000,
    updatedAt: Date.now() - 777600000,
  },
]
