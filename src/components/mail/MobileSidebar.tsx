"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AccountSwitcher } from "./AccountSwitcher"
import { Nav } from "./Nav"
import { Separator } from "@/components/ui/separator"
import type { LucideIcon } from "lucide-react"

interface MobileSidebarProps {
  accounts: Array<{
    label: string
    email: string
    icon: React.ReactNode
  }>
  navLinks: Array<{
    title: string
    label?: string
    icon: LucideIcon
    variant: "default" | "ghost"
    onClick?: () => void
  }>
  secondaryLinks: Array<{
    title: string
    label?: string
    icon: LucideIcon
    variant: "default" | "ghost"
    onClick?: () => void
  }>
}

export function MobileSidebar({ accounts, navLinks, secondaryLinks }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-[52px] items-center px-2">
            <AccountSwitcher isCollapsed={false} accounts={accounts} />
          </div>
          <Separator />
          <Nav isCollapsed={false} links={navLinks} />
          <Separator />
          <Nav isCollapsed={false} links={secondaryLinks} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
