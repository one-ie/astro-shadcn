import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

interface VerifyEmailFormProps {
  token: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [loading, setLoading] = useState(false)
  const [verifySuccess, setVerifySuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // Auto-verify on mount if token exists
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        setVerifying(false)
        toast.error("No verification token", {
          description: "This verification link is missing a token."
        })
        return
      }

      setLoading(true)
      try {
        const result = await convex.mutation(api.auth.verifyEmail, { token })

        if (result?.success) {
          setVerifySuccess(true)
          toast.success("Email verified successfully!", {
            description: "Your email has been verified. You can now access all features."
          })
        }
      } catch (err: any) {
        setTokenValid(false)
        const errorMessage = err.message || "Unable to verify email"
        let title = "Verification failed"
        let description = errorMessage

        if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
          title = "Invalid or expired link"
          description = "This verification link has expired or is invalid."
        }

        toast.error(title, {
          description
        })
      } finally {
        setLoading(false)
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  if (verifying || loading) {
    return (
      <AuthCard
        title="Verifying your email"
        description="Please wait while we verify your email address"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthCard>
    )
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Verification failed"
        description="This verification link is no longer valid"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/dashboard" className="text-primary hover:underline">Go to dashboard</a>
          </p>
        }
      >
        <Alert variant="destructive">
          <Mail className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This verification link has expired or is invalid. If you need a new verification email, please contact support.
          </AlertDescription>
        </Alert>

        <Button variant="outline" className="w-full" asChild>
          <a href="/dashboard">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  if (verifySuccess) {
    return (
      <AuthCard
        title="Email verified!"
        description="Your email has been successfully verified"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/dashboard" className="text-primary hover:underline">Go to dashboard</a>
          </p>
        }
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            Your email has been successfully verified. You can now access all features.
          </AlertDescription>
        </Alert>

        <Button className="w-full" asChild>
          <a href="/dashboard">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  return null
}
