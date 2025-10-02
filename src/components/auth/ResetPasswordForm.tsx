import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Validate token on mount
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
        if (!response.ok) {
          setTokenValid(false)
          toast.error("Invalid or expired token", {
            description: "This password reset link is invalid or has expired. Please request a new one."
          })
        }
      } catch (err) {
        setTokenValid(false)
      }
    }

    if (token) {
      validateToken()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match."
      })
      return
    }

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long."
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Unable to reset password"
        let title = "Unable to reset password"
        let description = `Error: ${errorMessage}. Please try again.`

        if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
          title = "Invalid or expired token"
          description = "This password reset link is invalid or has expired. Please request a new password reset email."
        } else if (errorMessage.toLowerCase().includes("password")) {
          title = "Invalid password"
          description = "Password must be at least 8 characters long and contain letters and numbers."
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

      setResetSuccess(true)
      toast.success("Password reset successful!", {
        description: "Your password has been updated. Redirecting to sign in..."
      })

      setTimeout(() => {
        window.location.href = "/signin"
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      toast.error("Request failed", {
        description: `Error: ${errorMessage}. Please try again later.`
      })
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="This password reset link is no longer valid"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/forgot-password" className="text-primary hover:underline">Request a new password reset</a>
          </p>
        }
      >
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            This password reset link has expired or is invalid. Please request a new password reset email to continue.
          </AlertDescription>
        </Alert>

        <Button variant="outline" className="w-full" asChild>
          <a href="/forgot-password">Request new reset link</a>
        </Button>
      </AuthCard>
    )
  }

  if (resetSuccess) {
    return (
      <AuthCard
        title="Password reset successful"
        description="Your password has been updated"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/signin" className="text-primary hover:underline">Go to sign in</a>
          </p>
        }
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            Your password has been successfully reset. You can now sign in with your new password.
          </AlertDescription>
        </Alert>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your new password"
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Remember your password? <a href="/signin" className="text-primary hover:underline">Sign in</a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords don't match</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  )
}
