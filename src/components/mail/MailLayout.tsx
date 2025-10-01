"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  ArrowLeft,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react"
import { Toaster } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "./AccountSwitcher"
import { MailDisplay } from "./MailDisplay"
import { MailList } from "./MailList"
import { Nav } from "./Nav"
import { MobileSidebar } from "./MobileSidebar"
import { accounts, mails } from "@/data/mail-data"
import { useMail, type MailFolder } from "./use-mail"
import { useMediaQuery } from "@/hooks/use-media-query"

interface MailLayoutProps {
  defaultLayout?: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize?: number
}

export function MailLayout({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize = 4,
}: MailLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail, setMail] = useMail()
  const [filteredMails, setFilteredMails] = React.useState(mails)
  const [showMailDisplay, setShowMailDisplay] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter mails based on active folder and search query
  const filterMailsByFolder = React.useCallback((folder: MailFolder) => {
    switch (folder) {
      case "inbox":
        // Inbox shows all emails except drafts, sent, junk, trash, archive, and category folders
        return mails.filter(
          (m) =>
            !m.labels.includes("draft") &&
            !m.labels.includes("sent") &&
            !m.labels.includes("junk") &&
            !m.labels.includes("trash") &&
            !m.labels.includes("archive") &&
            !m.labels.includes("social") &&
            !m.labels.includes("updates") &&
            !m.labels.includes("forums") &&
            !m.labels.includes("shopping") &&
            !m.labels.includes("promotions")
        )
      case "drafts":
        return mails.filter((m) => m.labels.includes("draft"))
      case "sent":
        return mails.filter((m) => m.labels.includes("sent"))
      case "junk":
        return mails.filter((m) => m.labels.includes("junk"))
      case "trash":
        return mails.filter((m) => m.labels.includes("trash"))
      case "archive":
        return mails.filter((m) => m.labels.includes("archive"))
      case "social":
        return mails.filter((m) => m.labels.includes("social"))
      case "updates":
        return mails.filter((m) => m.labels.includes("updates"))
      case "forums":
        return mails.filter((m) => m.labels.includes("forums"))
      case "shopping":
        return mails.filter((m) => m.labels.includes("shopping"))
      case "promotions":
        return mails.filter((m) => m.labels.includes("promotions"))
      default:
        return mails
    }
  }, [])

  // Apply folder filtering and search query
  React.useEffect(() => {
    let filtered = filterMailsByFolder(mail.activeFolder)

    if (mail.searchQuery.trim() !== "") {
      const query = mail.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.text.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      )
    }

    setFilteredMails(filtered)
  }, [mail.activeFolder, mail.searchQuery, filterMailsByFolder])

  // Handler for folder navigation
  const handleFolderClick = (folder: MailFolder) => {
    setMail({ ...mail, activeFolder: folder })
  }

  // Get folder display name
  const getFolderDisplayName = (folder: MailFolder): string => {
    return folder.charAt(0).toUpperCase() + folder.slice(1)
  }

  // Calculate badge counts for each folder
  const folderCounts = React.useMemo(() => {
    return {
      inbox: filterMailsByFolder("inbox").length,
      drafts: filterMailsByFolder("drafts").length,
      sent: filterMailsByFolder("sent").length,
      junk: filterMailsByFolder("junk").length,
      trash: filterMailsByFolder("trash").length,
      archive: filterMailsByFolder("archive").length,
      social: filterMailsByFolder("social").length,
      updates: filterMailsByFolder("updates").length,
      forums: filterMailsByFolder("forums").length,
      shopping: filterMailsByFolder("shopping").length,
      promotions: filterMailsByFolder("promotions").length,
    }
  }, [filterMailsByFolder])

  // On mobile, show mail display when email is selected
  React.useEffect(() => {
    if (isMobile && mail.selected) {
      setShowMailDisplay(true)
    } else if (!isMobile) {
      setShowMailDisplay(false)
    }
  }, [mail.selected, isMobile])

  // Prepare navigation links for reuse
  const primaryLinks = [
    {
      title: "Inbox",
      label: String(folderCounts.inbox),
      icon: Inbox,
      variant: mail.activeFolder === "inbox" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("inbox"),
    },
    {
      title: "Drafts",
      label: String(folderCounts.drafts),
      icon: File,
      variant: mail.activeFolder === "drafts" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("drafts"),
    },
    {
      title: "Sent",
      label: String(folderCounts.sent),
      icon: Send,
      variant: mail.activeFolder === "sent" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("sent"),
    },
    {
      title: "Junk",
      label: String(folderCounts.junk),
      icon: ArchiveX,
      variant: mail.activeFolder === "junk" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("junk"),
    },
    {
      title: "Trash",
      label: String(folderCounts.trash),
      icon: Trash2,
      variant: mail.activeFolder === "trash" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("trash"),
    },
    {
      title: "Archive",
      label: String(folderCounts.archive),
      icon: Archive,
      variant: mail.activeFolder === "archive" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("archive"),
    },
  ]

  const secondaryLinks = [
    {
      title: "Social",
      label: String(folderCounts.social),
      icon: Users2,
      variant: mail.activeFolder === "social" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("social"),
    },
    {
      title: "Updates",
      label: String(folderCounts.updates),
      icon: AlertCircle,
      variant: mail.activeFolder === "updates" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("updates"),
    },
    {
      title: "Forums",
      label: String(folderCounts.forums),
      icon: MessagesSquare,
      variant: mail.activeFolder === "forums" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("forums"),
    },
    {
      title: "Shopping",
      label: String(folderCounts.shopping),
      icon: ShoppingCart,
      variant: mail.activeFolder === "shopping" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("shopping"),
    },
    {
      title: "Promotions",
      label: String(folderCounts.promotions),
      icon: Archive,
      variant: mail.activeFolder === "promotions" ? ("default" as const) : ("ghost" as const),
      onClick: () => handleFolderClick("promotions"),
    },
  ]

  // Mobile layout - show either list or detail
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <Toaster position="top-right" richColors />
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <MobileSidebar
              accounts={accounts}
              navLinks={primaryLinks}
              secondaryLinks={secondaryLinks}
            />
            <h1 className="text-lg font-bold">{getFolderDisplayName(mail.activeFolder)}</h1>
          </div>

          {/* Show either mail list or mail display */}
          {!showMailDisplay ? (
            <>
              <div className="border-b p-4">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search mail..."
                      className="pl-8"
                      value={mail.searchQuery}
                      onChange={(e) => setMail({ ...mail, searchQuery: e.target.value })}
                    />
                  </div>
                </form>
              </div>
              <Tabs defaultValue="all" className="flex-1">
                <TabsList className="mx-4 mt-2">
                  <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">
                    All mail
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">
                    Unread
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="m-0">
                  <MailList items={filteredMails} />
                </TabsContent>
                <TabsContent value="unread" className="m-0">
                  <MailList items={filteredMails.filter((item) => !item.read)} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex h-full flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="m-2 w-fit gap-2"
                onClick={() => {
                  setShowMailDisplay(false)
                  setMail({ ...mail, selected: null })
                }}
              >
                <ArrowLeft className="size-4" />
                Back to list
              </Button>
              <MailDisplay
                mail={filteredMails.find((item) => item.id === mail.selected) || mails.find((item) => item.id === mail.selected) || null}
              />
            </div>
          )}
        </div>
      </TooltipProvider>
    )
  }

  // Desktop layout (existing code)
  return (
    <TooltipProvider delayDuration={0}>
      <Toaster position="top-right" richColors />
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
          }}
          onExpand={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher
              isCollapsed={isCollapsed}
              accounts={accounts}
            />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={primaryLinks}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={secondaryLinks}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">{getFolderDisplayName(mail.activeFolder)}</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mail..."
                    className="pl-8"
                    value={mail.searchQuery}
                    onChange={(e) => setMail({ ...mail, searchQuery: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={filteredMails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={filteredMails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay
            mail={filteredMails.find((item) => item.id === mail.selected) || mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
