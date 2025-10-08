import { cn } from "@/lib/utils"
import { type StatusFilter } from "@/data/app-data"

interface StatusTabsProps {
  activeStatus: StatusFilter
  onStatusChange: (status: StatusFilter) => void
}

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "now", label: "Now" },
  { value: "top", label: "Top" },
  { value: "todo", label: "ToDo" },
  { value: "done", label: "Done" },
]

export function StatusTabs({ activeStatus, onStatusChange }: StatusTabsProps) {
  return (
    <div className="flex items-center gap-8 border-b px-6 py-3 bg-white">
      {statusTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onStatusChange(tab.value)}
          className={cn(
            "relative px-2 py-2 text-sm font-semibold transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md",
            activeStatus === tab.value
              ? "text-black"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {tab.label}
          {activeStatus === tab.value && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full shadow-sm" />
          )}
        </button>
      ))}
    </div>
  )
}
