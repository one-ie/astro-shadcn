import { Users, Package, Share2, Sparkles, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { type NavigationView } from "@/data/app-data"

interface MobileNavProps {
  activeView: NavigationView
  onViewChange: (view: NavigationView) => void
}

const navItems = [
  { id: "people" as NavigationView, icon: Users, label: "People" },
  { id: "things" as NavigationView, icon: Package, label: "Things" },
  { id: "connections" as NavigationView, icon: Share2, label: "Connections" },
  { id: "events" as NavigationView, icon: Sparkles, label: "Events" },
  { id: "knowledge" as NavigationView, icon: BookOpen, label: "Knowledge" },
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
