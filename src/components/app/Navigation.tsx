import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { type NavigationView } from "@/data/app-data"

export interface NavigationItem {
  id: NavigationView
  icon: LucideIcon
  label: string
  count: number
}

interface NavigationProps {
  items: NavigationItem[]
  activeView: NavigationView
  onViewChange: (view: NavigationView) => void
}

export function Navigation({ items, activeView, onViewChange }: NavigationProps) {
  return (
    <div className="flex-1 px-4 py-4">
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="flex-1 text-left font-semibold">{item.label}</span>
              <span className={cn(
                "text-xs tabular-nums font-semibold px-2 py-0.5 rounded-full transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
              )}>
                {item.count}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
