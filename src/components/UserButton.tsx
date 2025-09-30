import { authClient } from "@/lib/auth-client"

export function UserButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
  }

  if (!session) {
    return (
      <a href="/auth/sign-in">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Sign In
        </button>
      </a>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{session.user.name || session.user.email}</span>
      <button
        onClick={() => authClient.signOut()}
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
      >
        Sign Out
      </button>
    </div>
  )
}
