"use client"

import { useState, useEffect, useMemo } from 'react';
import { Home, FileText, Scale, Book } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { siteConfig } from '@/config/site';

// Map navigation items to their corresponding icons
const iconMap = {
  '/': Home,
  '/blog': Book,
  '/readme': FileText,
  '/mit-license': Scale,
} as const;

// Memoize navigation items outside component for performance
const navigationItems = siteConfig.navigation.map((item) => ({
  ...item,
  icon: iconMap[item.path as keyof typeof iconMap],
}));

export function AppSidebar() {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Set current path
    setCurrentPath(window.location.pathname);

    // Fetch current user session from Better Auth
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
          });
        }
      })
      .catch((error) => {
        console.error('Session fetch error:', error)
      });
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2">
          {/* Icon only - shown when collapsed */}
          <div className="group-data-[collapsible=icon]:flex hidden items-center justify-center w-8 h-8">
            <img
              src="/icon.svg"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          {/* Full logo - shown when expanded */}
          <div className="group-data-[collapsible=icon]:hidden flex items-center justify-start w-full px-2">
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-8 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-8 w-auto object-contain hidden dark:block"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <a href={item.path}>
                        <Icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
