import { ChevronDown } from "lucide-react"

interface ProfileHeaderProps {
  name: string
  initial: string
}

export function ProfileHeader({ name, initial }: ProfileHeaderProps) {
  return (
    <div className="flex h-16 items-center px-4 border-b bg-white">
      <button className="group flex w-full items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 -mx-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-sm font-semibold shadow-sm ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all">
          {initial}
        </div>
        <span className="flex-1 text-left text-sm font-semibold text-gray-900">{name}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
    </div>
  )
}
