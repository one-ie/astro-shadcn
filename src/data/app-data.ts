import type {
  EntityCard,
  EntityId,
  JourneyStage,
  NavigationView,
  StatusFilter,
} from "./types"
import { JOURNEY_STAGES } from "./types"

export type {
  EntityCard,
  EntityId,
  JourneyStage,
  NavigationView,
  StatusFilter,
}
export { JOURNEY_STAGES }

const HOUR = 60 * 60 * 1000
const now = Date.now()

const baseSource: Record<NavigationView, string> = {
  people: "one/people",
  things: "one/things",
  connections: "one/connections",
  events: "one/events",
  knowledge: "one/knowledge",
}

const defaultCreator: EntityId = "people:anthony-oconnell"

function resolveSourceFile(
  kind: NavigationView,
  fileName: string,
): string {
  return `${baseSource[kind]}/${fileName}`.replace(/\/+/g, "/")
}

function characterCodeFromSlug(slug: string, fallback: string): string {
  const slugLetters = slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase()
  const base = slugLetters || fallback.slice(0, 3).toUpperCase()
  return base.padEnd(3, fallback[0]?.toUpperCase() ?? "X")
}

type CardConfig = {
  title: string
  subtitle: string
  preview: string
  status: StatusFilter
  tags: string[]
  type: string
  source: string
  updatedAgoHours: number
  createdAgoHours?: number
  unread?: boolean
  characterCode?: string
  createdBy?: EntityId
  connectionCount?: number
  recentActivityCount?: number
  relatedIds?: EntityId[]
  properties?: Record<string, unknown>
}

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)))
}

function createCard(
  kind: NavigationView,
  slug: string,
  config: CardConfig,
): EntityCard {
  const updatedAt = now - config.updatedAgoHours * HOUR
  const createdAt =
    now - (config.createdAgoHours ?? config.updatedAgoHours + 24) * HOUR

  return {
    _id: `${kind}:${slug}`,
    kind,
    title: config.title,
    characterCode:
      config.characterCode ??
      characterCodeFromSlug(slug, kind.slice(0, 3).toUpperCase()),
    subtitle: config.subtitle,
    preview: config.preview,
    timestamp: updatedAt,
    unread: Boolean(config.unread),
    tags: uniqueTags(config.tags),
    type: config.type,
    status: config.status,
    properties: {
      sourceFile: config.source,
      folder: config.source.replace(/\/[^/]+$/, ""),
      relatedIds: config.relatedIds ?? [],
      ...config.properties,
    },
    createdAt,
    updatedAt,
    createdBy: config.createdBy ?? defaultCreator,
    connectionCount: config.connectionCount ?? config.relatedIds?.length ?? 0,
    recentActivityCount:
      config.recentActivityCount ??
      Math.max(1, config.status === "now" ? 4 : 2),
  }
}

type OntologyCollection = {
  kind: NavigationView
  label: string
  description: string
  focus: JourneyStage[]
  cards: EntityCard[]
}

const peopleCards: EntityCard[] = [
  createCard("people", "anthony-oconnell", {
    title: "Anthony O'Connell",
    subtitle: "Stewarding vision and human intent",
    preview:
      "Anthony translates creator intent into clear mandates so autonomous teammates execute with confidence and accountability.",
    status: "now",
    tags: ["Intent", "Governance", "Hook"],
    type: "person",
    source: resolveSourceFile("people", "anthony-o-connell.md"),
    updatedAgoHours: 1,
    unread: true,
    createdBy: "people:anthony-oconnell",
    connectionCount: 6,
    recentActivityCount: 5,
    relatedIds: [
      "things:agent-atlas",
      "connections:intent-to-execution",
      "knowledge:vision-constellation",
    ],
    properties: {
      role: "Chief Steward",
      focus: ["Vision", "Governance", "Creator Outcomes"],
      quote: "Humans set the mandate. Agents compound the work.",
    },
  }),
  createCard("people", "steward-collective", {
    title: "Steward Collective",
    subtitle: "Rotating council of trusted creators",
    preview:
      "The collective approves major launches, allocates resources, and keeps the ontology aligned with ONE’s five pillars.",
    status: "top",
    tags: ["Engage", "Governance"],
    type: "collective",
    source: resolveSourceFile("people", "organisation.md"),
    updatedAgoHours: 6,
    connectionCount: 4,
    relatedIds: [
      "things:audience-graph",
      "connections:audience-flywheel",
      "events:autonomous-sprint-kickoff",
    ],
    properties: {
      charter: "Ensure every workflow keeps people in command.",
      cadence: "Weekly synthesis",
    },
  }),
  createCard("people", "creator-in-residence", {
    title: "Creator in Residence",
    subtitle: "Designing new journeys with the audience team",
    preview:
      "Pairs lived experience with ontology primitives to prototype new community loops and measure compounding engagement.",
    status: "todo",
    tags: ["Nurture", "Share"],
    type: "role",
    source: resolveSourceFile("people", "people.md"),
    updatedAgoHours: 18,
    connectionCount: 3,
    relatedIds: [
      "knowledge:pillar-playbook",
      "events:community-onboarding",
    ],
    properties: {
      focus: ["Audience Design", "Journey Experimentation"],
      deliverable: "Weekly journey report",
    },
  }),
]

const thingsCards: EntityCard[] = [
  createCard("things", "agent-atlas", {
    title: "Agent Atlas",
    subtitle: "Reusable blueprints for autonomous teammates",
    preview:
      "Curated templates that map roles, prompts, and knowledge inputs so every agent behaves like a trained teammate.",
    status: "now",
    tags: ["Engage", "Agents", "Educate"],
    type: "system",
    source: resolveSourceFile("things", "agent-clone.md"),
    updatedAgoHours: 2,
    unread: true,
    connectionCount: 7,
    relatedIds: [
      "people:anthony-oconnell",
      "knowledge:vision-constellation",
      "connections:intent-to-execution",
    ],
    properties: {
      release: "v0.6",
      blueprintCount: 12,
      highlights: ["Role prompts", "Shared memory adapters", "MCP ready"],
    },
  }),
  createCard("things", "audience-graph", {
    title: "Audience Graph",
    subtitle: "Living map of every member and mandate",
    preview:
      "Models members, partners, and incentives as `things` so journeys, rewards, and governance stay transparent.",
    status: "top",
    tags: ["Identify", "Nurture"],
    type: "data-product",
    source: resolveSourceFile("things", "organisation.md"),
    updatedAgoHours: 9,
    connectionCount: 5,
    relatedIds: [
      "connections:audience-flywheel",
      "events:community-onboarding",
    ],
    properties: {
      metrics: {
        totalMembers: 1280,
        activeSegments: 12,
      },
      ontologyPrimitives: ["member", "mandate", "token"],
    },
  }),
  createCard("things", "knowledge-vault", {
    title: "Knowledge Vault",
    subtitle: "Curated insights bundled for resale",
    preview:
      "Bundles of validated knowledge linked to tokens so creators can license playbooks and agents can subscribe in real time.",
    status: "todo",
    tags: ["Sell", "Knowledge"],
    type: "asset",
    source: resolveSourceFile("things", "files.md"),
    updatedAgoHours: 20,
    connectionCount: 4,
    relatedIds: [
      "connections:knowledge-market",
      "knowledge:pillar-playbook",
      "events:knowledge-drop",
    ],
    properties: {
      packagesLive: 6,
      upcoming: ["Creator Flywheel", "Edge Deployment SOP"],
    },
  }),
  createCard("things", "edge-app-studio", {
    title: "Edge App Studio",
    subtitle: "Deploy frontends and automations to the edge",
    preview:
      "Composable starter kits for shipping audience apps, admin panels, and protocol integrations straight to Cloudflare.",
    status: "done",
    tags: ["Share", "Build"],
    type: "platform",
    source: resolveSourceFile("things", "frontend.md"),
    updatedAgoHours: 32,
    connectionCount: 3,
    relatedIds: [
      "events:edge-deploy",
      "knowledge:protocol-cheatsheet",
    ],
    properties: {
      starterKits: [
        "Audience Portal",
        "Agent Console",
        "Knowledge Marketplace",
      ],
      hosting: "Cloudflare Edge",
    },
  }),
]

const connectionsCards: EntityCard[] = [
  createCard("connections", "intent-to-execution", {
    title: "Intent → Execution Bridge",
    subtitle: "Every mission approved before an agent acts",
    preview:
      "Maps steward sign-off to agent workflows so governance is embedded in prompts, guards, and telemetry.",
    status: "now",
    tags: ["Hook", "Governance"],
    type: "relationship",
    source: resolveSourceFile("connections", "relationships.md"),
    updatedAgoHours: 3,
    unread: true,
    connectionCount: 6,
    relatedIds: [
      "people:anthony-oconnell",
      "things:agent-atlas",
      "events:autonomous-sprint-kickoff",
    ],
    properties: {
      guardrails: ["Mandate approval", "Escalation hooks", "Audit log"],
    },
  }),
  createCard("connections", "audience-flywheel", {
    title: "Audience Flywheel",
    subtitle: "Value loops across content, community, commerce",
    preview:
      "Connects member milestones to rewards, referrals, and tokenized knowledge so participation compounds organically.",
    status: "top",
    tags: ["Engage", "Nurture"],
    type: "workflow",
    source: resolveSourceFile("connections", "workflow.md"),
    updatedAgoHours: 12,
    connectionCount: 8,
    recentActivityCount: 6,
    relatedIds: [
      "things:audience-graph",
      "events:community-onboarding",
      "knowledge:pillar-playbook",
    ],
    properties: {
      loops: [
        "Content → Community",
        "Community → Commerce",
        "Commerce → Insight",
      ],
    },
  }),
  createCard("connections", "knowledge-market", {
    title: "Knowledge Marketplace",
    subtitle: "Tokenized insights with programmable rights",
    preview:
      "Records licensing terms, payment flows, and delivery automations so knowledge assets stay verifiable and liquid.",
    status: "todo",
    tags: ["Sell", "Knowledge"],
    type: "integration",
    source: resolveSourceFile("connections", "protocols.md"),
    updatedAgoHours: 26,
    connectionCount: 4,
    relatedIds: [
      "things:knowledge-vault",
      "knowledge:protocol-cheatsheet",
      "events:knowledge-drop",
    ],
    properties: {
      supportedProtocols: ["AP2", "X402", "MCP"],
      settlement: "USDC & fiat",
    },
  }),
]

const eventsCards: EntityCard[] = [
  createCard("events", "autonomous-sprint-kickoff", {
    title: "Autonomous Sprint Kickoff",
    subtitle: "Mission briefing for the creator ops agents",
    preview:
      "Defined the sprint mandate, handed agents knowledge packs, and assigned human reviewers before automation goes live.",
    status: "now",
    tags: ["Hook", "Engage"],
    type: "event",
    source: resolveSourceFile("events", "events.md"),
    updatedAgoHours: 4,
    unread: true,
    connectionCount: 5,
    relatedIds: [
      "people:steward-collective",
      "things:agent-atlas",
      "connections:intent-to-execution",
    ],
    properties: {
      agenda: [
        "Intent alignment",
        "Agent assignment",
        "Success metrics",
      ],
    },
  }),
  createCard("events", "community-onboarding", {
    title: "Community Onboarding Wave",
    subtitle: "Guided welcome for new members and partners",
    preview:
      "Delivered personalized missions, unlocked starter knowledge, and invited members into their first co-creation loop.",
    status: "top",
    tags: ["Gift", "Nurture"],
    type: "event",
    source: resolveSourceFile("events", "events.md"),
    updatedAgoHours: 15,
    connectionCount: 6,
    relatedIds: [
      "people:creator-in-residence",
      "things:audience-graph",
      "connections:audience-flywheel",
    ],
    properties: {
      cohortSize: 120,
      completionRate: "82%",
    },
  }),
  createCard("events", "edge-deploy", {
    title: "Edge Deploy Release",
    subtitle: "New app experience shipped to Cloudflare",
    preview:
      "Deployed the latest audience portal, verified observability hooks, and rolled out progressive enhancement to cohorts.",
    status: "done",
    tags: ["Share", "Build"],
    type: "milestone",
    source: resolveSourceFile("events", "events.md"),
    updatedAgoHours: 40,
    connectionCount: 3,
    relatedIds: [
      "things:edge-app-studio",
      "knowledge:protocol-cheatsheet",
    ],
    properties: {
      rollout: "Canary then global",
      metrics: ["<200ms TTFB", "0 errors"],
    },
  }),
  createCard("events", "knowledge-drop", {
    title: "Knowledge Drop: Creator Flywheel",
    subtitle: "New premium insight bundle published",
    preview:
      "Packaged audience growth experiments, lift metrics, and dynamic prompts into a tokenized knowledge product.",
    status: "todo",
    tags: ["Sell", "Educate"],
    type: "release",
    source: resolveSourceFile("events", "events.md"),
    updatedAgoHours: 28,
    connectionCount: 4,
    relatedIds: [
      "things:knowledge-vault",
      "connections:knowledge-market",
      "knowledge:pillar-playbook",
    ],
    properties: {
      includes: [
        "Journey instrumentation guide",
        "Prompt library",
        "Revenue forecast model",
      ],
    },
  }),
]

const knowledgeCards: EntityCard[] = [
  createCard("knowledge", "vision-constellation", {
    title: "Vision: Agents, Apps, Audience",
    subtitle: "ONE’s five pillars articulated for builders",
    preview:
      "Plain-language charter describing how people, things, connections, events, and knowledge compound together.",
    status: "now",
    tags: ["Hook", "Educate"],
    type: "narrative",
    source: "one/things/vision.md",
    updatedAgoHours: 2,
    unread: true,
    createdBy: "people:anthony-oconnell",
    connectionCount: 7,
    recentActivityCount: 6,
    relatedIds: [
      "people:anthony-oconnell",
      "things:agent-atlas",
      "connections:intent-to-execution",
    ],
    properties: {
      summary: "Keeps the ontology grounded in people-led outcomes.",
      keySections: [
        "Five Pillars Led by People",
        "Agents as teammates",
        "Tokenize and trade knowledge",
      ],
    },
  }),
  createCard("knowledge", "pillar-playbook", {
    title: "Five Pillar Playbook",
    subtitle: "Guided implementation for each pillar",
    preview:
      "Step-by-step worksheets that translate the ontology into launch plans, governance cadences, and metrics.",
    status: "top",
    tags: ["Engage", "Educate"],
    type: "playbook",
    source: resolveSourceFile("knowledge", "knowledge.md"),
    updatedAgoHours: 11,
    connectionCount: 5,
    relatedIds: [
      "people:creator-in-residence",
      "connections:audience-flywheel",
      "events:knowledge-drop",
    ],
    properties: {
      format: ["Worksheet", "Decision tree", "Metrics tracker"],
    },
  }),
  createCard("knowledge", "tagging-guide", {
    title: "Ontology Tag Guide",
    subtitle: "Shared language for every entity",
    preview:
      "Defines canonical tags and embeddings so agents, apps, and people speak the same taxonomy across journeys.",
    status: "todo",
    tags: ["Identify", "Educate"],
    type: "guide",
    source: resolveSourceFile("knowledge", "tags.md"),
    updatedAgoHours: 22,
    connectionCount: 4,
    relatedIds: [
      "things:audience-graph",
      "connections:intent-to-execution",
    ],
    properties: {
      tagCount: 64,
      embeddingModel: "text-embedding-3-large",
    },
  }),
  createCard("knowledge", "protocol-cheatsheet", {
    title: "Protocol Cheatsheet",
    subtitle: "Quick reference for AP2, MCP, and X402",
    preview:
      "Highlights required schema, auth patterns, and best practices to plug external protocols into ONE without friction.",
    status: "done",
    tags: ["Share", "Technical"],
    type: "reference",
    source: resolveSourceFile("knowledge", "knowledge.md"),
    updatedAgoHours: 36,
    connectionCount: 3,
    relatedIds: [
      "things:edge-app-studio",
      "connections:knowledge-market",
      "events:edge-deploy",
    ],
    properties: {
      protocols: ["AP2", "MCP", "X402"],
      lastReviewedBy: "people:steward-collective",
    },
  }),
]

export const ontologyCollections: OntologyCollection[] = [
  {
    kind: "people",
    label: "People",
    description:
      "Who sets intent, approves missions, and nurtures the community.",
    focus: ["Hook", "Engage"],
    cards: peopleCards,
  },
  {
    kind: "things",
    label: "Things",
    description: "Agents, apps, and assets that act on the plan.",
    focus: ["Engage", "Educate"],
    cards: thingsCards,
  },
  {
    kind: "connections",
    label: "Connections",
    description: "Relationships, flows, and protocols that bind the system.",
    focus: ["Engage", "Nurture"],
    cards: connectionsCards,
  },
  {
    kind: "events",
    label: "Events",
    description: "Moments in time where outcomes are observed and logged.",
    focus: ["Gift", "Share"],
    cards: eventsCards,
  },
  {
    kind: "knowledge",
    label: "Knowledge",
    description: "Living library of insights, playbooks, and data products.",
    focus: ["Educate", "Sell"],
    cards: knowledgeCards,
  },
]

export const mockEntities: EntityCard[] = ontologyCollections
  .flatMap(collection => collection.cards)
  .sort((a, b) => b.timestamp - a.timestamp)

export const viewCounts: Record<NavigationView, number> = mockEntities.reduce(
  (acc, entity) => {
    acc[entity.kind] = (acc[entity.kind] ?? 0) + 1
    return acc
  },
  {
    people: 0,
    things: 0,
    connections: 0,
    events: 0,
    knowledge: 0,
  } as Record<NavigationView, number>,
)
