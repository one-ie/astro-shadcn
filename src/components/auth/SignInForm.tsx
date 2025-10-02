import { AuthUIProvider } from "@/components/auth/AuthUIProvider"
import { AuthView } from "@daveyplate/better-auth-ui"

export function SignInForm() {
  return (
    <AuthUIProvider>
      <AuthView view="SIGN_IN" />
    </AuthUIProvider>
  )
}
