import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"

export function SimpleSignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        const errorMessage = result.error.message || "Unable to sign in"
        let title = "Unable to sign in"
        let description = `Error: ${errorMessage}. Please check your credentials and try again.`

        if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no user") || errorMessage.toLowerCase().includes("doesn't exist")) {
          title = "Account not found"
          description = "No account exists with this email. Please sign up first or check your email address."
        } else if (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("incorrect") || errorMessage.toLowerCase().includes("invalid credentials")) {
          title = "Incorrect password"
          description = "The password you entered is incorrect. Please try again or use the 'Forgot password' option."
        } else if (errorMessage.toLowerCase().includes("email")) {
          title = "Invalid email"
          description = "Please enter a valid email address (e.g., yourname@example.com)."
        } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection")) {
          title = "Network error"
          description = "Unable to connect to the server. Please check your internet connection and try again."
        } else if (errorMessage.toLowerCase().includes("blocked") || errorMessage.toLowerCase().includes("suspended")) {
          title = "Account blocked"
          description = "Your account has been suspended. Please contact support at support@example.com for assistance."
        } else if (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("confirmation")) {
          title = "Email not verified"
          description = "Please verify your email address before signing in. Check your inbox for the verification link."
        }

        toast.error(title, {
          description: description
        })
        setLoading(false)
        return
      }

      // Success
      toast.success("Welcome back!", {
        description: "Successfully signed in. Redirecting to your dashboard..."
      })

      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      let title = "Sign in error"
      let description = `Error: ${errorMessage}. Please try again later or contact support if the issue persists.`

      if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
        title = "Connection failed"
        description = "Cannot reach the server. Please check your internet connection and try again."
      } else if (errorMessage.toLowerCase().includes("timeout")) {
        title = "Request timeout"
        description = "The server is taking too long to respond. Please try again in a moment."
      } else if (errorMessage.toLowerCase().includes("cors")) {
        title = "Configuration error"
        description = "There's a configuration issue preventing sign in. Please contact support."
      }

      toast.error(title, {
        description: description
      })
      setLoading(false)
    }
  }

  const handleGithubSignIn = () => {
    window.location.href = "/api/auth/github"
  }

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your account"
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </p>
      }
    >
      <SocialLoginButtons
        mode="signin"
        onGithubClick={handleGithubSignIn}
        onGoogleClick={handleGoogleSignIn}
      />

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
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
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
          <a href="/request-magic-link">Sign in with magic link</a>
        </Button>
      </form>
    </AuthCard>
  )
}
