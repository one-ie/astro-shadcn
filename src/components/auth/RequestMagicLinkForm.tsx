import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

export function RequestMagicLinkForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use production URL in production, localhost in dev
      const baseUrl = import.meta.env.PROD
        ? "https://stack.one.ie"
        : window.location.origin

      await convex.mutation(api.auth.requestMagicLink, {
        email,
        baseUrl,
      })

      setEmailSent(true)
      toast.success("Magic link sent!", {
        description: "Check your email for a link to sign in. The link expires in 15 minutes."
      })
    } catch (err: any) {
      const errorMessage = err.message || "Unable to send magic link"
      let title = "Request failed"
      let description = errorMessage

      if (errorMessage.toLowerCase().includes("rate limit")) {
        title = "Too many requests"
        description = "Please wait a few minutes before requesting another magic link."
      } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection")) {
        title = "Network error"
        description = "Unable to connect to the server. Please check your internet connection and try again."
      }

      toast.error(title, {
        description
      })
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent you a magic link"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            Didn't receive the email? <button onClick={() => setEmailSent(false)} className="text-primary hover:underline">Try again</button>
          </p>
        }
      >
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Mail className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
            The link expires in 15 minutes.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your spam folder if you don't see it</li>
            <li>The link can only be used once</li>
            <li>Make sure to open it on this device</li>
          </ul>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/signin">Back to sign in</a>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Sign in with magic link"
      description="Enter your email to receive a passwordless sign-in link"
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Prefer to use password? <a href="/account/signin" className="text-primary hover:underline">Sign in</a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            We'll send you a magic link to sign in without a password
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending link..." : "Send magic link"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/signin">Sign in with password</a>
        </Button>
      </form>
    </AuthCard>
  )
}
