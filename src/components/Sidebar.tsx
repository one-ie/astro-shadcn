import * as React from "react"
import { Scale, Book, PanelLeft, ChevronsUpDown, LogOut, UserPlus, LogIn, LayoutDashboard, Settings, Palette, Code2, Network, FileText } from "lucide-react"
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
import { ModeToggle } from "@/components/ModeToggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { siteConfig } from "@/config/site"

const iconMap = {
  '/ontology': Network,
  '/software': Code2,
  '/design': Palette,
  '/blog': Book,
  '/readme': FileText,
  'https://one.ie/free-license': Scale,
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
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState('')
  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = React.useState(false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    setCurrentPath(window.location.pathname)

    fetch('/api/auth/get-session')
      .then(async (res) => {
        // Check if response is OK and has content
        if (!res.ok) {
          return null
        }

        // Check if response has JSON content
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          return null
        }

        // Get response text first to handle empty responses
        const text = await res.text()
        if (!text) {
          return null
        }

        try {
          return JSON.parse(text)
        } catch (e) {
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
      .catch(() => {
        // Silently handle session fetch errors
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

  const handleMobileUserMenuToggle = () => {
    if (!isMobile) {
      return
    }
    setMobileUserMenuOpen((prev) => !prev)
  }

  const handleMobileNavigate = () => {
    setMobileUserMenuOpen(false)
    setMobileOpen(false)
  }

  const handleMobileSignOut = async () => {
    setMobileUserMenuOpen(false)
    setMobileOpen(false)
    await handleSignOut()
  }

  React.useEffect(() => {
    if (!isMobile) {
      setMobileUserMenuOpen(false)
    }
  }, [isMobile])

  React.useEffect(() => {
    if (!mobileOpen) {
      setMobileUserMenuOpen(false)
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixed width on desktop, overlay on mobile */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col border-r bg-[hsl(var(--color-sidebar))] text-sidebar-foreground transition-all duration-300 ease-in-out z-50 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          width: collapsed ? '80px' : '256px',
        }}
      >
        {/* Header with logo */}
        <div className="flex h-16 items-center justify-center border-b px-4 shrink-0 relative z-10">
          <img src="/icon.svg" alt="Logo" className="w-10 h-10" />
          {!collapsed && <span className="ml-3 font-semibold">ONE</span>}
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.url
              const isExternal = item.url.startsWith('http')
              return (
                <a
                  key={item.url}
                  href={item.url}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  }`}
                  title={collapsed ? item.title : undefined}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </a>
              )
            })}
          </div>
        </nav>

        {/* Footer with user - sticks to bottom of viewport */}
        <div className="border-t shrink-0">
          {/* Theme toggle */}
          <div className="p-2 border-b">
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-start px-2'}`}>
              <ModeToggle />
            </div>
          </div>

          {/* User menu */}
          <div className="p-2">
            {isMobile ? (
              <>
                <button
                  className={`flex items-center gap-3 rounded-md p-2 w-full text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  aria-label="User menu"
                  onClick={handleMobileUserMenuToggle}
                  type="button"
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
                      <ChevronsUpDown className={`h-4 w-4 shrink-0 transition-transform ${mobileUserMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {mobileUserMenuOpen && (
                  <div className="mt-2 space-y-3 rounded-md border border-border bg-background/80 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 rounded-md bg-muted/50 p-2">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                        <Separator className="bg-border/70" />
                        <div className="space-y-1">
                          <a
                            href="/account"
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                            onClick={handleMobileNavigate}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </a>
                          <a
                            href="/account/settings"
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                            onClick={handleMobileNavigate}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </a>
                        </div>
                        <Separator className="bg-border/70" />
                        <button
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-destructive/10 hover:text-destructive"
                          onClick={handleMobileSignOut}
                          type="button"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 rounded-md bg-muted/50 p-2">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">Guest</p>
                            <p className="text-xs text-muted-foreground">Not signed in</p>
                          </div>
                        </div>
                        <Separator className="bg-border/70" />
                        <div className="space-y-1">
                          <a
                            href="/account/signin"
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                            onClick={handleMobileNavigate}
                          >
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </a>
                          <a
                            href="/account/signup"
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                            onClick={handleMobileNavigate}
                          >
                            <UserPlus className="h-4 w-4" />
                            Sign Up
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-3 rounded-md p-2 w-full text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    aria-label="User menu"
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
                  className="w-56 rounded-lg bg-popover/100"
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
                          <a href="/account" className="flex items-center">
                            <LayoutDashboard className="mr-2" />
                            Dashboard
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="/account/settings" className="flex items-center">
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
                          <a href="/account/signin" className="flex items-center">
                            <LogIn className="mr-2" />
                            Sign In
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="/account/signup" className="flex items-center">
                            <UserPlus className="mr-2" />
                            Sign Up
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer to push content - matches sidebar width on desktop, hidden on mobile */}
      <div
        className="hidden lg:block shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? '80px' : '256px' }}
      />

      {/* Main content area - takes remaining space */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header with toggle */}
        <header className="flex h-16 shrink-0 items-center border-b px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // On mobile, toggle mobileOpen; on desktop, toggle collapsed
                if (window.innerWidth < 1024) {
                  setMobileOpen(!mobileOpen)
                } else {
                  setCollapsed(!collapsed)
                }
              }}
              className="h-7 w-7"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src="/logo.svg" alt="Logo" className="h-8" />
          </a>

          <div className="ml-auto">
            <Button variant="default" size="sm" asChild>
              <a href="/account">Get Started</a>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
