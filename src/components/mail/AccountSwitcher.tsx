import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountSwitcher({
  accounts,
  isCollapsed,
}: {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  isCollapsed: boolean
}) {
  const [selectedAccount, setSelectedAccount] = React.useState(accounts[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            "w-full px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground rounded-md",
            isCollapsed && "justify-center px-2"
          )}
        >
          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col text-left text-sm leading-tight">
                <span className="truncate font-semibold">{selectedAccount.label}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedAccount.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </>
          )}
          {isCollapsed && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {selectedAccount.label[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side={isCollapsed ? "right" : "bottom"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Accounts
        </DropdownMenuLabel>
        {accounts.map((account, index) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => setSelectedAccount(account)}
            className="gap-2 p-2"
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              {account.label[0]}
            </div>
            <div className="flex flex-col">
              <div className="line-clamp-1 font-medium">{account.label}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{account.email}</div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Add account</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
