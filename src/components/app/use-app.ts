import { atom, useAtom } from "jotai"
import { type EntityId, type NavigationView, type StatusFilter, type JourneyStage, mockEntities } from "@/data/app-data"

type AppState = {
  // Left sidebar navigation
  activeView: NavigationView        // "messages" | "groups" | "agents" | "tools" | "people"

  // Middle panel filters
  statusFilter: StatusFilter        // "now" | "top" | "todo" | "done"
  journeyStages: JourneyStage[]     // ["Hook", "Gift", ...] selected pills
  searchQuery: string

  // Selected entity
  selectedEntityId: EntityId | null

  // UI state
  showDetail: boolean               // Show right panel (mobile)
}

const appStateAtom = atom<AppState>({
  activeView: "messages",
  statusFilter: "now",
  journeyStages: [],
  searchQuery: "",
  selectedEntityId: mockEntities[0]._id, // Select first entity by default
  showDetail: false,
})

export function useApp() {
  return useAtom(appStateAtom)
}
