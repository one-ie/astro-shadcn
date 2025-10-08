import { MessageSquare, Grid3x3, Bot, Wrench, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { type NavigationView } from "@/data/app-data"

interface MobileNavProps {
  activeView: NavigationView
  onViewChange: (view: NavigationView) => void
}

const navItems = [
  { id: "messages" as NavigationView, icon: MessageSquare, label: "Messages" },
  { id: "groups" as NavigationView, icon: Grid3x3, label: "Groups" },
  { id: "agents" as NavigationView, icon: Bot, label: "Agents" },
  { id: "tools" as NavigationView, icon: Wrench, label: "Tools" },
  { id: "people" as NavigationView, icon: Users, label: "People" },
]

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-inset-bottom">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 active:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
