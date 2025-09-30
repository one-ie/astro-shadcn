import type { ReactNode } from "react"
import { AuthUIProvider as BetterAuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const navigate = (path: string) => {
    window.location.href = path
  }

  return (
    <BetterAuthUIProvider
      authClient={authClient}
      navigate={navigate}
      social={{
        providers: ["github", "google"],
      }}
      credentials={{
        passwordValidation: {
          minLength: 8,
        },
        confirmPassword: true,
      }}
      signUp={{
        fields: ["name"],
      }}
    >
      {children}
    </BetterAuthUIProvider>
  )
}
