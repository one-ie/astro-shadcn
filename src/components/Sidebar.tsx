import * as React from "react"
import { Home, FileText, Scale, Book, Mail, PanelLeft, ChevronsUpDown, LogOut, BadgeCheck, CreditCard, Bell, Sparkles, UserPlus, LogIn, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { siteConfig } from "@/config/site"

const iconMap = {
  '/': Home,
  '/blog': Book,
  '/mail': Mail,
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

export function Sidebar({ children }: SimpleSidebarLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState('')
  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null)

  React.useEffect(() => {
    setCurrentPath(window.location.pathname)

    fetch('/api/auth/get-session')
      .then(async (res) => {
        // Check if response is OK and has content
        if (!res.ok) {
          console.error('Session fetch failed:', res.status)
          return null
        }

        // Check if response has JSON content
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid response type:', contentType)
          return null
        }

        // Get response text first to handle empty responses
        const text = await res.text()
        if (!text) {
          console.error('Empty response body')
          return null
        }

        try {
          return JSON.parse(text)
        } catch (e) {
          console.error('JSON parse error:', e, 'Response:', text)
          return null
        }
      })
      .then(data => {
        if (data?.user) {
          setUser({
            name: data.user.name || data.user.email,
            email: data.user.email,
            avatar: data.user.image,
          })
        }
      })
      .catch((error) => {
        console.error('Session fetch error:', error)
      })
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - fixed width, transitions smoothly, fixed to viewport */}
      <aside
        className="fixed left-0 top-0 h-screen flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-50"
        style={{ width: collapsed ? '80px' : '256px' }}
      >
        {/* Header with logo */}
        <div className="flex h-16 items-center justify-center border-b px-4 shrink-0">
          <img src="/icon.svg" alt="Logo" className="w-10 h-10" />
          {!collapsed && <span className="ml-3 font-semibold">ONE</span>}
        </div>

        {/* Navigation - scrollable */}
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

        {/* Footer with user - sticks to bottom of viewport */}
        <div className="border-t p-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-3 rounded-md p-2 w-full text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Avatar className="h-10 w-10 rounded-lg shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || 'guest@example.com'}</p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              {user ? (
                <>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <a href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2" />
                        Dashboard
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/settings" className="flex items-center">
                        <Settings className="mr-2" />
                        Settings
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Guest</span>
                        <span className="truncate text-xs text-muted-foreground">Not signed in</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <a href="/signin" className="flex items-center">
                        <LogIn className="mr-2" />
                        Sign In
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/signup" className="flex items-center">
                        <UserPlus className="mr-2" />
                        Sign Up
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Spacer to push content - matches sidebar width */}
      <div
        className="shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? '80px' : '256px' }}
      />

      {/* Main content area - takes remaining space */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header with toggle */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-40">
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
