import * as React from "react"
import { Home, FileText, Scale, Book, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/config/site"

const iconMap = {
  '/': Home,
  '/blog': Book,
  '/readme': FileText,
  '/mit-license': Scale,
} as const

const navItems = siteConfig.navigation.map((item) => ({
  title: item.title,
  url: item.path,
  icon: iconMap[item.path as keyof typeof iconMap],
}))

interface SimpleSidebarLayoutProps {
  children: React.ReactNode
}

export function SimpleSidebarLayout({ children }: SimpleSidebarLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState('')

  React.useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - fixed width, transitions smoothly */}
      <aside
        className="flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? '80px' : '256px' }}
      >
        {/* Header with logo */}
        <div className="flex h-16 items-center justify-center border-b px-4">
          <img src="/icon.svg" alt="Logo" className="w-10 h-10" />
          {!collapsed && <span className="ml-3 font-semibold">ONE</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.url
              return (
                <a
                  key={item.url}
                  href={item.url}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </a>
              )
            })}
          </div>
        </nav>

        {/* Footer with user */}
        <div className="border-t p-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
              U
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Guest</p>
                <p className="text-xs text-muted-foreground truncate">guest@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area - takes remaining space */}
      <div className="flex flex-1 flex-col">
        {/* Header with toggle */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-7 w-7"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
