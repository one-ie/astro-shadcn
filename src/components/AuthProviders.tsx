"use client"

import { ReactNode } from "react"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"

export function AuthProviders({ children }: { children: ReactNode }) {
  const navigate = (path: string) => {
    window.location.href = path
  }

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={navigate}

      // Social login configuration
      social={{
        providers: ["github", "google"],
        signIn: "optional"
      }}

      // Password requirements
      credentials={{
        passwordValidation: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
        },
        confirmPassword: true
      }}

      // Sign up customization
      signUp={{
        fields: ["name"]
      }}

      // Two-factor authentication
      twoFactor={{
        enabled: true,
        methods: ["totp"]
      }}

      // Custom view paths
      viewPaths={{
        SIGN_IN: "sign-in",
        SIGN_UP: "sign-up",
        FORGOT_PASSWORD: "forgot-password",
        RESET_PASSWORD: "reset-password",
      }}
    >
      {children}
    </AuthUIProvider>
  )
}
