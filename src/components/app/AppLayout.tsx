"use client"

import * as React from "react"
import { Search, MessageSquare, Grid3x3, Bot, Wrench, Users } from "lucide-react"
import { Toaster } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useApp } from "./use-app"
import { ProfileHeader } from "./ProfileHeader"
import { Navigation, type NavigationItem } from "./Navigation"
import { EntityCard } from "./EntityCard"
import { StatusTabs } from "./StatusTabs"
import { MobileNav } from "./MobileNav"
import { FloatingActionButton } from "./FloatingActionButton"
import { CommandPalette } from "./CommandPalette"
import { mockEntities, type NavigationView, JOURNEY_STAGES } from "@/data/app-data"
import { useMediaQuery } from "@/hooks/use-media-query"

interface AppLayoutProps {
  defaultLayout?: number[] | undefined
}

export function AppLayout({
  defaultLayout = [20, 32, 48],
}: AppLayoutProps) {
  const [app, setApp] = useApp()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  // Navigation items matching Figma
  const navigationItems: NavigationItem[] = [
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      count: 128,
    },
    {
      id: "groups",
      icon: Grid3x3,
      label: "Groups",
      count: 9,
    },
    {
      id: "agents",
      icon: Bot,
      label: "Agents",
      count: 20,
    },
    {
      id: "tools",
      icon: Wrench,
      label: "Tools",
      count: 10,
    },
    {
      id: "people",
      icon: Users,
      label: "People",
      count: 128,
    },
  ]

  // Filter entities based on current state
  const filteredEntities = React.useMemo(() => {
    let filtered = mockEntities

    // Filter by navigation view
    switch (app.activeView) {
      case "messages":
        // Show all entities (default)
        break
      case "groups":
        // Show organization/group related entities
        filtered = filtered.filter(e =>
          e.type === "project" || e.type === "meeting" || e.type === "strategy"
        )
        break
      case "agents":
        // Show only AI agents
        filtered = filtered.filter(e => e.type === "agent")
        break
      case "tools":
        // Show tools, integrations, technical items
        filtered = filtered.filter(e =>
          e.type === "task" || e.tags.includes("Technical")
        )
        break
      case "people":
        // Show people-related entities
        filtered = filtered.filter(e =>
          e.type === "message" || e.type === "meeting"
        )
        break
    }

    // Filter by status
    filtered = filtered.filter(e => e.status === app.statusFilter)

    // Filter by journey stages (if any selected)
    if (app.journeyStages.length > 0) {
      filtered = filtered.filter(e =>
        e.tags.some(tag => app.journeyStages.includes(tag as any))
      )
    }

    // Filter by search
    if (app.searchQuery.trim()) {
      const query = app.searchQuery.toLowerCase()
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.subtitle.toLowerCase().includes(query) ||
        e.preview.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [app.activeView, app.statusFilter, app.journeyStages, app.searchQuery])

  const selectedEntity = filteredEntities.find(e => e._id === app.selectedEntityId) || filteredEntities[0]

  // Keyboard navigation (j/k for next/prev, esc to deselect)
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Don't trigger when typing in inputs
      }

      const currentIndex = filteredEntities.findIndex(e => e._id === app.selectedEntityId)

      if (e.key === 'j' && currentIndex < filteredEntities.length - 1) {
        // Next item
        setApp({ ...app, selectedEntityId: filteredEntities[currentIndex + 1]._id })
      } else if (e.key === 'k' && currentIndex > 0) {
        // Previous item
        setApp({ ...app, selectedEntityId: filteredEntities[currentIndex - 1]._id })
      } else if (e.key === 'Escape') {
        // Deselect (select first item)
        if (filteredEntities.length > 0) {
          setApp({ ...app, selectedEntityId: filteredEntities[0]._id })
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [filteredEntities, app, setApp])

  return (
    <TooltipProvider delayDuration={0}>
      <Toaster position="top-right" richColors />

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex h-full flex-col pb-16">
          {/* Mobile Header */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <ProfileHeader name="Anthony O'Connell" initial="M" />
          </div>

          {/* Status Tabs */}
          <StatusTabs
            activeStatus={app.statusFilter}
            onStatusChange={(status) => setApp({ ...app, statusFilter: status })}
          />

          {/* Search */}
          <div className="border-b px-6 py-4 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, tasks, and more..."
                className="pl-10 h-10 shadow-sm"
                value={app.searchQuery}
                onChange={(e) => setApp({ ...app, searchQuery: e.target.value })}
              />
            </div>
          </div>

          {/* Journey Stage Filters */}
          <div className="flex gap-2 overflow-x-auto border-b px-6 py-4 scrollbar-hide bg-gray-50">
            {JOURNEY_STAGES.map((stage) => {
              const isSelected = app.journeyStages.includes(stage)
              return (
                <button
                  key={stage}
                  onClick={() => {
                    if (isSelected) {
                      setApp({
                        ...app,
                        journeyStages: app.journeyStages.filter(s => s !== stage)
                      })
                    } else {
                      setApp({
                        ...app,
                        journeyStages: [...app.journeyStages, stage]
                      })
                    }
                  }}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-black text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm active:bg-gray-50"
                  )}
                >
                  {stage}
                </button>
              )
            })}
          </div>

          {/* Entity List - Mobile */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredEntities.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <div className="text-4xl">📭</div>
                  <p className="text-base font-semibold text-gray-900">No entities found</p>
                  <p className="text-sm text-gray-600">
                    Try adjusting your filters or search query
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <EntityCard
                    key={entity._id}
                    entity={entity}
                    selected={app.selectedEntityId === entity._id}
                    onClick={() => setApp({ ...app, selectedEntityId: entity._id, showDetail: true })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile Bottom Nav */}
          <MobileNav
            activeView={app.activeView}
            onViewChange={(view) => setApp({ ...app, activeView: view })}
          />
        </div>
      ) : (
        // Desktop Layout
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full items-stretch"
        >
          {/* LEFT PANEL - Navigation */}
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            minSize={15}
            maxSize={20}
            className="border-r"
          >
            <div className="flex h-full flex-col">
              <ProfileHeader name="Anthony O'Connell" initial="M" />
              <Navigation
                items={navigationItems}
                activeView={app.activeView}
                onViewChange={(view) => setApp({ ...app, activeView: view })}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

        {/* MIDDLE PANEL - Entity List */}
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <div className="flex h-full flex-col">
            <StatusTabs
              activeStatus={app.statusFilter}
              onStatusChange={(status) => setApp({ ...app, statusFilter: status })}
            />

            {/* Search */}
            <div className="border-b px-6 py-4 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages, tasks, and more..."
                  className="pl-10 h-10 shadow-sm"
                  value={app.searchQuery}
                  onChange={(e) => setApp({ ...app, searchQuery: e.target.value })}
                />
              </div>
            </div>

            {/* Journey Stage Filters - All 9 stages */}
            <div className="flex gap-2 overflow-x-auto border-b px-6 py-4 scrollbar-hide bg-gray-50">
              {JOURNEY_STAGES.map((stage) => {
                const isSelected = app.journeyStages.includes(stage)
                return (
                  <button
                    key={stage}
                    onClick={() => {
                      if (isSelected) {
                        setApp({
                          ...app,
                          journeyStages: app.journeyStages.filter(s => s !== stage)
                        })
                      } else {
                        setApp({
                          ...app,
                          journeyStages: [...app.journeyStages, stage]
                        })
                      }
                    }}
                    className={cn(
                      "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                      isSelected
                        ? "bg-black text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                    )}
                  >
                    {stage}
                  </button>
                )
              })}
            </div>

            {/* Entity List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredEntities.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center p-8">
                  <div className="space-y-3">
                    <div className="text-4xl">📭</div>
                    <p className="text-base font-semibold text-gray-900">No entities found</p>
                    <p className="text-sm text-gray-600">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntities.map((entity) => (
                    <EntityCard
                      key={entity._id}
                      entity={entity}
                      selected={app.selectedEntityId === entity._id}
                      onClick={() => setApp({ ...app, selectedEntityId: entity._id })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT PANEL - Entity Display */}
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <div className="flex h-full flex-col">
            {selectedEntity ? (
              <>
                {/* Header */}
                <div className="border-b p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-lg">
                      📧
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{selectedEntity.title}</h2>
                      <p className="text-sm text-gray-600">{selectedEntity.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* Avatar Group Placeholder */}
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <p>{selectedEntity.preview}</p>
                      <p>{selectedEntity.preview}</p>
                      <p>{selectedEntity.preview}</p>
                      <p className="font-medium">Thanks, Emily</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t p-4">
                  <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    <button className="hover:text-black">Add</button>
                    <span>|</span>
                    <button className="hover:text-black">Reply</button>
                    <span>|</span>
                    <button className="hover:text-black">Forward</button>
                    <span>|</span>
                    <button className="hover:text-black">Share</button>
                    <span>|</span>
                    <button className="hover:text-black">Save</button>
                    <span>|</span>
                    <button className="hover:text-black">Copy</button>
                    <span>|</span>
                    <button className="hover:text-black">Complete</button>
                  </div>
                </div>

                {/* @Mentions */}
                <div className="border-t px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-muted rounded-full px-3 py-1 text-sm">
                      @Teacher One
                    </span>
                    <span className="bg-muted rounded-full px-3 py-1 text-sm">
                      @Anthony O'Connell
                    </span>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="border-t p-4">
                  <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    <button className="hover:text-black">Add</button>
                    <span>|</span>
                    <button className="hover:text-black">Invite</button>
                    <span>|</span>
                    <button className="hover:text-black">Share</button>
                    <span>|</span>
                    <button className="hover:text-black">Save</button>
                    <span>|</span>
                    <button className="hover:text-black">Complete</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No entity selected
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Bottom Category Bar - Desktop Only */}
      {!isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-8 px-6 py-2 text-xs text-muted-foreground overflow-x-auto scrollbar-hide">
            {JOURNEY_STAGES.map((stage) => (
              <button
                key={stage}
                className="whitespace-nowrap hover:text-foreground transition-colors"
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
