export type EntityId = string

export type NavigationView =
  | "people"
  | "things"
  | "connections"
  | "events"
  | "knowledge"

export type StatusFilter = "now" | "top" | "todo" | "done"

export const JOURNEY_STAGES = [
  "Hook",
  "Gift",
  "Identify",
  "Engage",
  "Sell",
  "Nurture",
  "Upsell",
  "Educate",
  "Share",
] as const

export type JourneyStage = (typeof JOURNEY_STAGES)[number]

export interface EntityCard {
  _id: EntityId
  kind: NavigationView

  title: string
  characterCode?: string
  subtitle: string
  preview: string

  timestamp: number
  unread: boolean

  tags: string[]

  type: string
  status: StatusFilter

  properties: Record<string, unknown>
  createdAt: number
  updatedAt: number
  createdBy?: EntityId

  connectionCount?: number
  recentActivityCount?: number
}
