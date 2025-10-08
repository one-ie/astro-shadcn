import { cn } from "@/lib/utils"
import { type EntityCard as EntityCardType } from "@/data/app-data"

interface EntityCardProps {
  entity: EntityCardType
  selected: boolean
  onClick: () => void
}

export function EntityCard({ entity, selected, onClick }: EntityCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-lg border bg-white p-4 text-left transition-all duration-200",
        "hover:bg-gray-50 hover:shadow-md hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        selected && "bg-muted border-l-4 border-l-black shadow-md ring-1 ring-gray-200"
      )}
    >
      {/* Unread dot */}
      {entity.unread && (
        <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-100 animate-pulse" />
      )}

      {/* Title + Timestamp Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-base leading-tight text-gray-900 group-hover:text-black transition-colors">
          {entity.title}
        </h3>
        <time className="text-xs text-gray-500 whitespace-nowrap mt-0.5 font-medium tabular-nums">
          {formatTimestamp(entity.timestamp)}
        </time>
      </div>

      {/* Character Code */}
      {entity.characterCode && (
        <div className="text-sm text-gray-600 mb-2 font-mono">
          Character {entity.characterCode}
        </div>
      )}

      {/* Subtitle */}
      <div className="text-sm font-medium text-gray-700 mb-2.5">{entity.subtitle}</div>

      {/* Preview */}
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
        {entity.preview}
      </p>

      {/* Tags */}
      {entity.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entity.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center bg-black text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
}
