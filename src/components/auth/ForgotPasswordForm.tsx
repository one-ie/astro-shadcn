import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Unable to send reset email"
        let title = "Unable to send reset email"
        let description = `Error: ${errorMessage}. Please try again.`

        if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no user")) {
          title = "Email not found"
          description = "No account exists with this email address. Please check your email or sign up for a new account."
        } else if (errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("too many")) {
          title = "Too many requests"
          description = "You've requested too many password resets. Please wait a few minutes and try again."
        } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection")) {
          title = "Network error"
          description = "Unable to connect to the server. Please check your internet connection and try again."
        }

        toast.error(title, {
          description: description
        })
        setLoading(false)
        return
      }

      setEmailSent(true)
      toast.success("Reset email sent!", {
        description: "Check your inbox for password reset instructions."
      })
      setLoading(false)
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      toast.error("Request failed", {
        description: `Error: ${errorMessage}. Please try again later.`
      })
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent password reset instructions"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            Remember your password? <a href="/signin" className="text-primary hover:underline">Sign in</a>
          </p>
        }
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            If an account exists with <strong>{email}</strong>, you will receive an email with instructions to reset your password.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Didn't receive the email?</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes for the email to arrive</li>
          </ul>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setEmailSent(false)
              setEmail("")
            }}
          >
            Try another email
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email to receive reset instructions"
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Remember your password? <a href="/signin" className="text-primary hover:underline">Sign in</a>
        </p>
      }
    >
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          We'll send you an email with instructions to reset your password.
        </AlertDescription>
      </Alert>

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset email"}
        </Button>
      </form>
    </AuthCard>
  )
}
