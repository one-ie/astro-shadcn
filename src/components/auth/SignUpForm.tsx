import { AuthUIProvider } from "@/components/auth/AuthUIProvider"
import { AuthView } from "@daveyplate/better-auth-ui"

export function SignUpForm() {
  return (
    <AuthUIProvider>
      <AuthView view="SIGN_UP" />
    </AuthUIProvider>
  )
}
