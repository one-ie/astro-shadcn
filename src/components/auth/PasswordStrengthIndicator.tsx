import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordRequirement {
  label: string
  met: boolean
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = React.useMemo(() => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "Contains number",
        met: /[0-9]/.test(password),
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ]
  }, [password])

  const strength = React.useMemo(() => {
    const metCount = requirements.filter(r => r.met).length
    return (metCount / requirements.length) * 100
  }, [requirements])

  const getStrengthLabel = () => {
    if (strength === 0) return { label: "No password", color: "text-muted-foreground" }
    if (strength <= 40) return { label: "Weak", color: "text-destructive" }
    if (strength <= 60) return { label: "Fair", color: "text-orange-500" }
    if (strength <= 80) return { label: "Good", color: "text-yellow-500" }
    return { label: "Strong", color: "text-green-500" }
  }

  const strengthInfo = getStrengthLabel()

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password strength</span>
        <span className={`text-sm font-medium ${strengthInfo.color}`}>
          {strengthInfo.label}
        </span>
      </div>
      <Progress value={strength} className="h-2" />
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
