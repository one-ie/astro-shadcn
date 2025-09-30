import { UserButton as BetterAuthUserButton } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"

export function UserButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
  }

  if (!session) {
    return (
      <a href="/auth">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Sign In
        </button>
      </a>
    )
  }

  return <BetterAuthUserButton />
}
