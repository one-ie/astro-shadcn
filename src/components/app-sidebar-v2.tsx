"use client"

import * as React from "react"
import { Home, FileText, Scale, Book, ChevronsUpDown, LogOut, BadgeCheck, CreditCard, Bell, Sparkles } from "lucide-react"

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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { siteConfig } from "@/config/site"

const iconMap = {
  '/': Home,
  '/blog': Book,
  '/readme': FileText,
  '/mit-license': Scale,
} as const

const navMain = siteConfig.navigation.map((item) => ({
  title: item.title,
  url: item.path,
  icon: iconMap[item.path as keyof typeof iconMap],
}))

export function AppSidebarV2({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [currentPath, setCurrentPath] = React.useState('')
  const { isMobile } = useSidebar()

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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10">
            <img
              src="/icon.svg"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} asChild isActive={isActive}>
                      <a href={item.url}>
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || 'Guest'}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || ''}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || 'Guest'}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || ''}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
