import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/ModeToggle'
import {
  Home,
  FileText,
  Scale,
  Book
} from 'lucide-react'

const navigation = [
  { title: "Home", path: "/", icon: Home },
  { title: "Blog", path: "/blog", icon: Book },
  { title: "README", path: "/readme", icon: FileText },
  { title: "License", path: "/mit-license", icon: Scale }
] as const

// Components
const DesktopSidebar = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [activePath, setActivePath] = useState('')

  useEffect(() => {
    setActivePath(window.location.pathname)
    const handleRouteChange = () => setActivePath(window.location.pathname)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return (
    <aside
      className={cn(
        "fixed left-0 h-screen bg-[var(--sidebar-bg)] z-[60]",
        "transition-all duration-300 ease-out flex flex-col group",
        "w-[64px] hover:w-64" // Fixed width for non-open state
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-16 flex items-center justify-center">
        <img
          src={isHovered ? "/logo.svg" : "/icon.svg"}
          alt="Logo"
          className="h-8 transition-opacity duration-300"
        />
      </div>

      <nav className="flex-1 pl-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center h-12 px-4 gap-4",
                "hover:bg-[var(--sidebar-hover)] text-[hsl(var(--sidebar-fg))]",
                "transition-colors duration-200",
                activePath === item.path && "bg-[var(--sidebar-active)]"
              )}
            >
              <Icon className="w-5 h-5 min-w-[20px]" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.title}
              </span>
            </a>
          )
        })}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-4">
          <ModeToggle />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Toggle Theme
          </span>
        </div>
      </div>
    </aside>
  )
}

export function Sidebar() {
  return <DesktopSidebar />
}