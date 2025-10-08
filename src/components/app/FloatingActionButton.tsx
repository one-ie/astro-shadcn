import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 right-6 z-40 md:bottom-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <span className="font-medium">New Message</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="font-medium">New Task</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="font-medium">New Agent</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="font-medium">New Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
