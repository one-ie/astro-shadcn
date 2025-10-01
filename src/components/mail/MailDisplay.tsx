import * as React from "react"
import { addDays, addHours, format, nextSaturday } from "date-fns"
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type Mail } from "@/data/mail-data"

interface MailDisplayProps {
  mail: Mail | null
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const today = new Date()
  const [replyText, setReplyText] = React.useState("")
  const [selectedSnoozeDate, setSelectedSnoozeDate] = React.useState<Date | undefined>(undefined)

  // Action handlers
  const handleArchive = () => {
    if (!mail) return
    toast.success("Email archived", {
      description: mail.subject,
    })
  }

  const handleDelete = () => {
    if (!mail) return
    toast.success("Email deleted", {
      description: mail.subject,
    })
  }

  const handleJunk = () => {
    if (!mail) return
    toast.success("Email marked as junk", {
      description: mail.subject,
    })
  }

  const handleMarkUnread = () => {
    if (!mail) return
    toast.info("Marked as unread", {
      description: mail.subject,
    })
  }

  const handleSnooze = (date: Date, label: string) => {
    if (!mail) return
    toast.success("Email snoozed", {
      description: `${mail.subject} - Until ${label}`,
    })
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mail) return

    if (!replyText.trim()) {
      toast.error("Cannot send empty reply", {
        description: "Please enter a message",
      })
      return
    }

    toast.success("Reply sent", {
      description: `Reply to "${mail.subject}"`,
    })
    setReplyText("")
  }

  return (
    <div className="flex h-full flex-col">
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={handleArchive}>
                    <Archive className="size-4" />
                    <span className="sr-only">Archive</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={handleJunk}>
                    <ArchiveX className="size-4" />
                    <span className="sr-only">Move to junk</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to junk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail} onClick={handleDelete}>
                    <Trash2 className="size-4" />
                    <span className="sr-only">Move to trash</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="size-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-[535px] p-0">
                  <div className="flex flex-col gap-2 border-r px-2 py-4">
                    <div className="px-4 text-sm font-medium">Snooze until</div>
                    <div className="grid min-w-[250px] gap-1">
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={() => {
                          const date = addHours(today, 4)
                          handleSnooze(date, format(date, "E, h:m b"))
                        }}
                      >
                        Later today{" "}
                        <span className="ml-auto text-muted-foreground">
                          {format(addHours(today, 4), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={() => {
                          const date = addDays(today, 1)
                          handleSnooze(date, format(date, "E, h:m b"))
                        }}
                      >
                        Tomorrow
                        <span className="ml-auto text-muted-foreground">
                          {format(addDays(today, 1), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={() => {
                          const date = nextSaturday(today)
                          handleSnooze(date, format(date, "E, h:m b"))
                        }}
                      >
                        This weekend
                        <span className="ml-auto text-muted-foreground">
                          {format(nextSaturday(today), "E, h:m b")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={() => {
                          const date = addDays(today, 7)
                          handleSnooze(date, format(date, "E, h:m b"))
                        }}
                      >
                        Next week
                        <span className="ml-auto text-muted-foreground">
                          {format(addDays(today, 7), "E, h:m b")}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <Calendar
                      mode="single"
                      selected={selectedSnoozeDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedSnoozeDate(date)
                          handleSnooze(date, format(date, "PPP"))
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Reply className="size-4" />
                    <span className="sr-only">Reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <ReplyAll className="size-4" />
                    <span className="sr-only">Reply all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Forward className="size-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mail}>
                  <MoreVertical className="size-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkUnread}>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col">
            <div className="flex items-start p-4">
              <div className="flex items-start gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt={mail.name} />
                  <AvatarFallback>
                    {mail.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-semibold">{mail.name}</div>
                  <div className="line-clamp-1 text-xs">{mail.subject}</div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">Reply-To:</span> {mail.email}
                  </div>
                </div>
              </div>
              {mail.date && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(mail.date), "PPpp")}
                </div>
              )}
            </div>
            <Separator />
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
              {mail.text}
            </div>
            <Separator className="mt-auto" />
            <div className="p-4">
              <form onSubmit={handleReply}>
                <div className="grid gap-4">
                  <Textarea
                    className="p-4"
                    placeholder={`Reply ${mail.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Switch id="mute" aria-label="Mute thread" /> Mute this
                      thread
                    </Label>
                    <Button
                      type="submit"
                      size="sm"
                      className="ml-auto"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
