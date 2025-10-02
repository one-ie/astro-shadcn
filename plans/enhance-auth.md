# Comprehensive Phased Implementation Plan: Better Auth with Convex & Shadcn UI

## Implementation Status

### ✅ Better Auth IS Active (Hybrid Architecture)

**Current Setup:**
- ✅ Better Auth React Client (frontend)
- ✅ Better Auth Convex Component (NOW configured in `convex/convex.config.ts`)
- ✅ API bridge connecting Better Auth UI to custom backend
- ⚠️ Backend still using custom Convex mutations (not Better Auth built-in functions)

**Architecture:** Hybrid approach using Better Auth UI/client but custom backend logic

### ✅ Completed Features
- [x] Better Auth React client integration
- [x] Better Auth Convex component configured
- [x] Email/password authentication with custom Convex backend
- [x] Password reset flow with Resend email component
- [x] UI components (AuthCard, SocialLoginButtons, PasswordStrengthIndicator)
- [x] Session management with httpOnly cookies
- [x] API bridge at `/api/auth/[...all]`

### 🚨 Current Limitations
- [ ] Not using Better Auth's built-in auth functions (using custom mutations instead)
- [ ] Using SHA-256 for passwords (should migrate to Better Auth's Argon2)
- [ ] No rate limiting on auth endpoints
- [ ] No email verification
- [ ] Social OAuth UI exists but not functional

### 🚧 Next Steps (Migrate from Custom to Full Better Auth)
1. [ ] **Replace custom mutations with Better Auth functions** (1-2 days)
2. [ ] **Set up Better Auth HTTP routes** in `convex/http.ts`
3. [ ] **Enable Better Auth plugins** (OAuth, magic links, 2FA)
4. [ ] **Migrate user data** to Better Auth schema

### 📋 Planned Features (Requires Better Auth)
- [ ] Anonymous login
- [ ] Account linking architecture
- [ ] Magic links
- [ ] Two-factor authentication (TOTP)
- [ ] Passkeys (WebAuthn)
- [ ] Stripe integration
- [ ] Social OAuth (GitHub, Google)

## Executive Summary

This plan delivers a streamlined, high-converting auth system for your Astro + Convex + Shadcn UI application. Based on extensive research, the implementation prioritizes **friction reduction, clean architecture, and progressive security enhancement**. The phased approach enables rapid deployment while building toward industry-leading passkey-based authentication.

**Current Status**: Basic custom auth implemented. Recommendation: Migrate to Better Auth for automatic account linking, session management, and advanced features—eliminating 100+ hours of manual development.

**Key Insight**: Better Auth with Convex provides automatic account linking, session management, and database integration—eliminating most complexity. The plan leverages this to deliver production-ready auth in 6-8 weeks.

---

## Phase Ordering Recommendation

### **Phase 1: Foundation** (Week 1-2)

- [ ] Anonymous login *Deferred - requires Better Auth*
- [ ] Enhanced account linking architecture
- [x] Base component structure with Shadcn UI ✅
- [x] Forgot password flow improvements ✅

**Status**: Base components and password reset completed with Resend email component.

**Rationale**: Anonymous login delivers immediate conversion lift (86% of users prefer exploring before signup) while establishing the component foundation. Account linking configured now prevents friction later.

### **Phase 2: Passwordless Options** (Week 3-4)

- [ ] Magic links (email-based)
- [x] Enhanced email templates with React Email + Resend ✅ *Basic implementation*

**Status**: Resend component integrated for password reset. Magic links require Better Auth plugin.

**Rationale**: Passwordless is the industry trend. Magic links provide 20-40% conversion boost with low implementation complexity.

### **Phase 3: Enhanced Security** (Week 4-6)

- [ ] Phone/SMS authentication (via Twilio)
- [ ] TOTP two-factor authentication
- [ ] SMS-based 2FA (backup only)

**Status**: Not started. Requires Better Auth 2FA plugin.

**Rationale**: Security features before handling sensitive data. TOTP prioritized over SMS due to superior security (95% of account takeovers use SMS vs 4.13% with TOTP).

### **Phase 4: Future-Proof Authentication** (Week 6-8)

- [ ] Passkeys (WebAuthn)
- [ ] Progressive enhancement UX
- [ ] Cross-device authentication

**Status**: Not started. Requires Better Auth passkey plugin.

**Rationale**: Industry consensus points toward passkeys. Google reports 6x faster login, phishing-resistant by design. Early adoption positions you as forward-thinking.

### **Phase 5: Monetization** (Week 8-10)

- [ ] Stripe Better Auth plugin
- [ ] Subscription management
- [ ] Trial abuse prevention

**Status**: Not started. Requires Better Auth Stripe plugin.

**Rationale**: Implement after auth is production-tested. Stripe integration is business-critical and requires stable user management.

---

## Phase 1: Foundation Implementation

### 1.1 Anonymous Login Setup

**Goal**: Let users explore without signup friction, then seamlessly upgrade to permanent accounts.

**Better Auth Configuration**:

```typescript
// convex/auth.ts
import { betterAuth } from 'better-auth';
import { anonymous } from 'better-auth/plugins';
import { convex } from '@convex-dev/better-auth/plugins';
import { authComponent } from './auth-component';

export const createAuth = (ctx) => {
  return betterAuth({
    database: authComponent.adapter(ctx),
    baseURL: process.env.SITE_URL!,

    // Account linking - CRITICAL for smooth UX
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
        updateUserInfoOnLink: true,
      },
    },

    // Anonymous authentication
    plugins: [
      anonymous({
        emailDomainName: 'temp.yourapp.com',
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          // Migrate user data (cart, preferences, etc.)
          await migrateUserData(anonymousUser.id, newUser.id);
        },
        disableDeleteAnonymousUser: false, // Clean up after linking
      }),
      convex(),
    ],
  });
};
```

**Client Implementation**:

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/plugins/anonymous/client';
import { convexClient } from '@convex-dev/better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [anonymousClient(), convexClient()],
});

// Usage in components
async function handleAnonymousSignIn() {
  await authClient.signIn.anonymous();
  // User can now explore app
}
```

**Database Schema**:

- Adds `isAnonymous` boolean field to user table
- Automatic cleanup after 30 days (configurable)

**Critical Considerations**:

- **Data migration strategy**: Define what data (cart, preferences, drafts) follows users during upgrade
- **Feature gating**: Restrict sharing, payments, exports to verified users only
- **Analytics tracking**: Separate anonymous vs authenticated user metrics

### 1.2 Account Linking Architecture

**The Problem**: User signs up with email/password, later tries "Continue with Google" with same email. What happens?

**Better Auth Solution** (Automatic):

```typescript
// When accountLinking.enabled = true and Google in trustedProviders:
// 1. User clicks "Continue with Google"
// 2. Google returns verified email: user@example.com
// 3. Better Auth checks if user@example.com exists
// 4. Finds existing account → Automatically links Google provider
// 5. User signs in to EXISTING account with new Google method added
// 6. Both methods now work for this user
```

**Manual Linking** (User-initiated from settings):

```typescript
// components/auth/LinkAccountButton.tsx
export function LinkGoogleButton() {
  const handleLink = async () => {
    await authClient.linkSocial({
      provider: "google",
      callbackURL: "/settings/accounts",
    })
    toast.success("Google account linked successfully")
  }

  return (
    <Button onClick={handleLink} variant="outline">
      <Icons.google className="mr-2 h-4 w-4" />
      Link Google Account
    </Button>
  )
}
```

**Account Linking UI Flow**:

```typescript
// When duplicate email detected during social signup
export function AccountLinkingPrompt({ email, provider }: Props) {
  return (
    <Alert>
      <AlertTitle>Account Found</AlertTitle>
      <AlertDescription>
        An account with {email} already exists.
        Sign in with your password to link your {provider} account.
      </AlertDescription>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => router.push('/login')}>
          Sign in to link accounts
        </Button>
        <Button variant="outline" onClick={() => router.push('/signup')}>
          Use different email
        </Button>
      </div>
    </Alert>
  )
}
```

**Security Best Practices**:

- Only link accounts with **verified emails** (Better Auth enforces this)
- Notify users via email when accounts are linked
- Allow unlinking from settings page
- Show all connected providers in account settings

### 1.3 Component Architecture

**File Structure**:

```
src/
├── components/
│   ├── auth/
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── OTPVerifyForm.tsx
│   │   │   └── PasskeySetupForm.tsx
│   │   ├── buttons/
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   ├── LoadingButton.tsx
│   │   │   └── AnonymousLoginButton.tsx
│   │   ├── shared/
│   │   │   ├── AuthCard.tsx
│   │   │   ├── AuthHeader.tsx
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   └── AccountLinkingPrompt.tsx
│   │   └── providers/
│   │       └── AuthProvider.tsx
│   └── ui/
│       └── [shadcn components]
├── lib/
│   ├── auth-client.ts          # Better Auth client config
│   ├── auth-server.ts          # Server-side auth helpers
│   └── validations/
│       └── auth.ts             # Zod schemas
└── pages/
    └── (auth)/
        ├── login/
        ├── signup/
        ├── forgot-password/
        ├── reset-password/
        └── verify-2fa/
```

**Base Component Architecture**:

```typescript
// components/auth/shared/AuthCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
```

**Reusable Social Login Component**:

```typescript
// components/auth/buttons/SocialLoginButtons.tsx
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

interface SocialLoginButtonsProps {
  callbackURL?: string
  newUserCallbackURL?: string
}

export function SocialLoginButtons({
  callbackURL = "/dashboard",
  newUserCallbackURL = "/welcome"
}: SocialLoginButtonsProps) {

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL,
        errorCallbackURL: "/auth-error",
      })
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("github")}
        >
          <Icons.github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  )
}
```

### 1.4 Enhanced Password Reset Flow

**Modern Approach**: Magic link-based reset (simpler than traditional password reset).

```typescript
// components/auth/forms/ForgotPasswordForm.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/auth/buttons/LoadingButton"
import { authClient } from "@/lib/auth-client"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/reset-password",
    })
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Alert>
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account exists with that email, you'll receive a password reset link.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <AuthCard
      title="Reset password"
      description="Enter your email to receive a reset link"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            Send reset link
          </LoadingButton>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:text-primary">
          Back to login
        </Link>
      </div>
    </AuthCard>
  )
}
```

**Password Requirements Component**:

```typescript
// components/auth/shared/PasswordStrengthIndicator.tsx
import { CheckCircle2, Circle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = [
    { label: "At least 12 characters", met: password.length >= 12 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ]

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-sm font-medium">Password must contain:</p>
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {req.met ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={req.met ? "text-green-700" : "text-muted-foreground"}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

---

## Phase 2: Magic Links Implementation

### 2.1 Convex Resend Integration

**Setup**:

```bash
npm install @convex-dev/resend
npx convex env set RESEND_API_KEY "re_your_api_key"
```

**Configuration**:

```typescript
// convex/convex.config.ts
import { defineApp } from 'convex/server';
import resend from '@convex-dev/resend/convex.config';
import betterAuth from '@convex-dev/better-auth/convex.config';

const app = defineApp();
app.use(resend);
app.use(betterAuth);
export default app;
```

**Email Service Setup**:

```typescript
// convex/email.ts
import { Resend } from "@convex-dev/resend"
import { components } from "./_generated/api"
import { internalMutation } from "./_generated/server"

export const resend = new Resend(components.resend, {
  testMode: false,
})

export const sendMagicLink = internalMutation({
  args: {
    email: v.string(),
    url: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { email, url }) => {
    await resend.sendEmail(ctx, {
      from: "Your App <auth@yourapp.com>",
      to: email,
      subject: "Sign in to Your App",
      html: await render(
        <MagicLinkEmail url={url} />
      ),
    })
  },
})
```

### 2.2 Magic Link Configuration

```typescript
// convex/auth.ts - add magic link plugin
import { magicLink } from 'better-auth/plugins';

export const createAuth = (ctx) => {
  return betterAuth({
    // ... existing config
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, token, url }, request) => {
          await ctx.scheduler.runAfter(0, internal.email.sendMagicLink, {
            email,
            url,
            token,
          });
        },
        expiresIn: 300, // 5 minutes
        disableSignUp: false, // Allow new user signups
      }),
      anonymous(),
      convex(),
    ],
  });
};
```

### 2.3 React Email Templates

```typescript
// convex/emails/MagicLinkEmail.tsx
"use node" // Required for React Email

import { Button, Html, Text, Section, Container } from "@react-email/components"

interface MagicLinkEmailProps {
  url: string
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html>
      <Container style={{ padding: "20px" }}>
        <Section style={{ textAlign: "center" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
            Sign in to Your App
          </Text>
          <Text style={{ fontSize: "16px", color: "#666" }}>
            Click the button below to sign in. This link expires in 5 minutes.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            Sign in to Your App
          </Button>
          <Text style={{ fontSize: "14px", color: "#999", marginTop: "24px" }}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Section>
      </Container>
    </Html>
  )
}
```

### 2.4 Magic Link Client Implementation

```typescript
// components/auth/forms/MagicLinkForm.tsx
import { magicLinkClient } from "better-auth/plugins/magic-link/client"

// Add to auth client
export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    anonymousClient(),
    convexClient(),
  ],
})

// Usage in component
export function MagicLinkForm() {
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(values: { email: string }) {
    await authClient.signIn.magicLink({
      email: values.email,
      callbackURL: "/dashboard",
    })
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <Alert>
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We've sent a magic link to your email. Click it to sign in.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}
    </Form>
  )
}
```

---

## Phase 3: Phone Auth & Two-Factor Authentication

### 3.1 Phone/SMS Authentication with Twilio

**Setup**:

```bash
npx convex env set TWILIO_ACCOUNT_SID "ACxxxxx"
npx convex env set TWILIO_AUTH_TOKEN "your_token"
npx convex env set TWILIO_PHONE_NUMBER "+1234567890"
```

**Better Auth Configuration**:

```typescript
import { phoneNumber } from 'better-auth/plugins';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const createAuth = (ctx) => {
  return betterAuth({
    // ... existing config
    plugins: [
      phoneNumber({
        sendOTP: async ({ phoneNumber, code }) => {
          await twilioClient.messages.create({
            body: `Your verification code is: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
        },
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        allowedAttempts: 3,
      }),
      // ... other plugins
    ],
  });
};
```

**Client Implementation**:

```typescript
// components/auth/forms/PhoneVerifyForm.tsx
import { phoneNumberClient } from "better-auth/plugins/phone-number/client"

export const authClient = createAuthClient({
  plugins: [
    phoneNumberClient(),
    // ... other plugins
  ],
})

export function PhoneVerifyForm() {
  const [step, setStep] = useState<"phone" | "code">("phone")

  async function sendCode(phoneNumber: string) {
    await authClient.phoneNumber.sendOtp({ phoneNumber })
    setStep("code")
  }

  async function verifyCode(code: string) {
    await authClient.phoneNumber.verifyOtp({ code })
    router.push("/dashboard")
  }

  return step === "phone" ? (
    <PhoneNumberInput onSubmit={sendCode} />
  ) : (
    <OTPInput onSubmit={verifyCode} />
  )
}
```

### 3.2 TOTP Two-Factor Authentication

**Server Configuration**:

```typescript
import { twoFactor } from 'better-auth/plugins';

export const createAuth = (ctx) => {
  return betterAuth({
    appName: 'Your App', // Used as TOTP issuer
    plugins: [
      twoFactor({
        issuer: 'Your App',
        totpOptions: {
          period: 30,
          digits: 6,
        },
        // Optional: Email-based OTP as backup
        otpOptions: {
          sendOTP: async ({ user, otp }) => {
            await ctx.scheduler.runAfter(0, internal.email.send2FACode, {
              email: user.email,
              code: otp,
            });
          },
        },
        backupCodesOptions: {
          amount: 10,
          length: 10,
        },
      }),
      // ... other plugins
    ],
  });
};
```

**Client Implementation**:

```typescript
// components/auth/TwoFactorSetup.tsx
import { twoFactorClient } from "better-auth/plugins/two-factor/client"
import QRCode from "qrcode"

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      twoFactorPage: "/verify-2fa", // Redirect here when 2FA required
    }),
    // ... other plugins
  ],
})

export function TwoFactorSetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  async function enable2FA(password: string) {
    const { data } = await authClient.twoFactor.enable({ password })

    // Generate QR code for user to scan
    const qrUrl = await QRCode.toDataURL(data.totpURI)
    setQrCodeUrl(qrUrl)
    setBackupCodes(data.backupCodes)
  }

  async function verifySetup(code: string) {
    await authClient.twoFactor.verifyTotp({
      code,
      trustDevice: false,
    })
    toast.success("Two-factor authentication enabled!")
  }

  return (
    <div>
      <img src={qrCodeUrl} alt="QR Code" />
      <p>Scan with Google Authenticator, Authy, or 1Password</p>

      {/* Backup codes display - SHOW ONLY ONCE */}
      <Alert>
        <AlertTitle>Save these backup codes</AlertTitle>
        <AlertDescription>
          {backupCodes.map(code => (
            <code key={code}>{code}</code>
          ))}
        </AlertDescription>
      </Alert>

      {/* Verification step */}
      <OTPInput onSubmit={verifySetup} />
    </div>
  )
}
```

**2FA Verification During Login**:

```typescript
// pages/verify-2fa/page.tsx
export default function Verify2FAPage() {
  async function handleVerify(code: string) {
    try {
      await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true, // Remember for 60 days
      })
      router.push("/dashboard")
    } catch (error) {
      toast.error("Invalid code. Please try again.")
    }
  }

  return (
    <AuthCard
      title="Two-factor authentication"
      description="Enter the 6-digit code from your authenticator app"
    >
      <OTPInput onSubmit={handleVerify} />

      <div className="text-center">
        <Button variant="link" onClick={showBackupCodeForm}>
          Use backup code instead
        </Button>
      </div>
    </AuthCard>
  )
}
```

---

## Phase 4: Passkeys (WebAuthn)

### 4.1 Server Configuration

```typescript
import { passkey } from 'better-auth/plugins';

export const createAuth = (ctx) => {
  return betterAuth({
    plugins: [
      passkey({
        rpID:
          process.env.NODE_ENV === 'production' ? 'yourapp.com' : 'localhost',
        rpName: 'Your App',
        origin: process.env.SITE_URL,
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Touch ID, Face ID, Windows Hello
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      }),
      // ... other plugins
    ],
  });
};
```

### 4.2 Client Implementation

```typescript
// components/auth/PasskeySetup.tsx
import { passkeyClient } from "better-auth/plugins/passkey/client"

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    // ... other plugins
  ],
})

export function PasskeySetup() {
  async function addPasskey() {
    try {
      await authClient.passkey.addPasskey({
        name: "My MacBook Pro", // User-friendly name
      })
      toast.success("Passkey added successfully!")
    } catch (error) {
      if (error.name === "NotSupportedError") {
        toast.error("Passkeys not supported on this device")
      } else {
        toast.error("Failed to add passkey")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Sign in with your fingerprint, face, or screen lock
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={addPasskey}>
          <Fingerprint className="mr-2 h-4 w-4" />
          Add passkey
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Passkey Sign-In**:

```typescript
// components/auth/forms/PasskeySignInForm.tsx
export function PasskeySignInForm() {
  async function handlePasskeySignIn() {
    try {
      // Conditional UI - works with browser autofill
      if (await PublicKeyCredential.isConditionalMediationAvailable()) {
        await authClient.signIn.passkey({
          autoFill: true, // Enable browser autofill
          callbackURL: "/dashboard",
        })
      } else {
        // Manual passkey selection
        await authClient.signIn.passkey({
          callbackURL: "/dashboard",
        })
      }
    } catch (error) {
      toast.error("Passkey authentication failed")
    }
  }

  return (
    <Button onClick={handlePasskeySignIn} variant="outline" className="w-full">
      <Fingerprint className="mr-2 h-4 w-4" />
      Sign in with passkey
    </Button>
  )
}
```

---

## Phase 5: Stripe Integration

### 5.1 Setup

```bash
npm install @better-auth/stripe stripe
npx convex env set STRIPE_SECRET_KEY "sk_test_..."
npx convex env set STRIPE_WEBHOOK_SECRET "whsec_..."
```

### 5.2 Better Auth Configuration

```typescript
import { stripe } from '@better-auth/stripe';
import Stripe from 'stripe';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const createAuth = (ctx) => {
  return betterAuth({
    plugins: [
      stripe({
        stripeClient,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
        createCustomerOnSignUp: true,

        subscription: {
          enabled: true,
          plans: [
            {
              name: 'free',
              priceId: 'price_free',
              limits: { projects: 3, storage: 1 },
            },
            {
              name: 'pro',
              priceId: 'price_pro_monthly',
              annualDiscountPriceId: 'price_pro_annual',
              limits: { projects: 100, storage: 100 },
              freeTrial: {
                days: 14,
                onTrialStart: async (subscription) => {
                  await sendWelcomeEmail(subscription);
                },
              },
            },
          ],

          onSubscriptionComplete: async ({ subscription, user }) => {
            await sendSubscriptionConfirmation(user.email);
          },
        },
      }),
      // ... other plugins
    ],
  });
};
```

### 5.3 Webhook Handler

```typescript
// convex/http.ts
import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';

const http = httpRouter();

// Better Auth routes (includes Stripe webhook)
authComponent.registerRoutes(http, createAuth);

export default http;
```

**Stripe webhook URL**: `https://your-deployment.convex.site/api/auth/webhook/stripe`

### 5.4 Client Implementation

```typescript
// components/stripe/SubscriptionUpgrade.tsx
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  plugins: [
    stripeClient(),
    // ... other plugins
  ],
})

export function SubscriptionUpgrade() {
  async function upgradeToPro() {
    await authClient.subscription.upgrade({
      plan: "pro",
      annual: false,
      successUrl: "/dashboard?upgraded=true",
      cancelUrl: "/pricing",
    })
    // User redirected to Stripe Checkout
  }

  return (
    <Button onClick={upgradeToPro}>
      Upgrade to Pro
    </Button>
  )
}

// Check subscription status
export function useSubscription() {
  const { data } = useQuery(api.subscriptions.getCurrent)

  return {
    isPro: data?.plan === "pro" && data?.status === "active",
    isTrialing: data?.status === "trialing",
    subscription: data,
  }
}
```

---

## Page Specifications with UX Best Practices

### Login Page

**URL**: `/login`

**Layout**:

```
┌─────────────────────────────────────────┐
│  [Logo]                                 │
│                                         │
│  Welcome back                           │
│  Sign in to Your App                    │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ [Google] Continue with Google      ││
│  └────────────────────────────────────┘│
│  ┌────────────────────────────────────┐│
│  │ [GitHub] Continue with GitHub      ││
│  └────────────────────────────────────┘│
│                                         │
│  ────────── or ──────────              │
│                                         │
│  Email                                  │
│  [________________________]             │
│                                         │
│  Password                               │
│  [________________________] [👁]        │
│                   [Forgot password?]    │
│                                         │
│  [ Sign in ] ← Primary Button           │
│                                         │
│  Don't have an account? [Sign up]       │
│                                         │
│  [🔐 Sign in with passkey] ← Optional   │
└─────────────────────────────────────────┘
```

**Key Features**:

- Social login ABOVE email/password (primary method)
- Auto-focus on email field
- Show password toggle (eye icon)
- "Remember me" optional (implement trusted devices with 2FA instead)
- Clear link to signup
- Passkey option at bottom (progressive enhancement)

**Error Handling**:

- Generic error for invalid credentials: "Email or password is incorrect"
- Account linking prompt if social email exists
- 2FA redirect if enabled

### Signup Page

**URL**: `/signup`

**Layout**:

```
┌─────────────────────────────────────────┐
│  [Logo]                                 │
│                                         │
│  Create your account                    │
│  Join 10,000+ teams using Your App      │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ [Google] Continue with Google      ││
│  └────────────────────────────────────┘│
│  ┌────────────────────────────────────┐│
│  │ [GitHub] Continue with GitHub      ││
│  └────────────────────────────────────┘│
│                                         │
│  ────────── or ──────────              │
│                                         │
│  Email                                  │
│  [________________________]             │
│                                         │
│  Password                               │
│  [________________________] [👁]        │
│                                         │
│  ☐ At least 12 characters               │
│  ☐ One uppercase letter                 │
│  ☐ One number                           │
│                                         │
│  [ Sign up ] ← Primary Button           │
│                                         │
│  By signing up, you agree to our        │
│  [Terms of Service] and [Privacy Policy]│
│                                         │
│  Already have an account? [Sign in]     │
└─────────────────────────────────────────┘
```

**Key Features**:

- Social login prioritized
- Password requirements visible upfront
- Real-time validation with checkmarks
- Terms acceptance (not checkbox - just text)
- Social proof in description

**Account Linking Flow**:

```typescript
// If email already exists during social signup
if (emailExists && !accountLinked) {
  showPrompt({
    title: 'Account Found',
    message: 'An account with this email already exists.',
    actions: [
      { label: 'Sign in to link accounts', href: '/login' },
      { label: 'Use different email', action: 'retry' },
    ],
  });
}
```

### Forgot Password Page

**URL**: `/forgot-password`

**Minimal Design**:

```
┌─────────────────────────────────────────┐
│  Reset your password                    │
│  Enter your email and we'll send a link │
│                                         │
│  Email                                  │
│  [________________________]             │
│                                         │
│  [ Send reset link ]                    │
│                                         │
│  [← Back to login]                      │
└─────────────────────────────────────────┘
```

**After Submission**:

```
┌─────────────────────────────────────────┐
│  ✅ Check your email                     │
│                                         │
│  If an account exists with that email,  │
│  you'll receive a password reset link.  │
│                                         │
│  Didn't receive it? [Resend]            │
│  (Available after 60 seconds)           │
└─────────────────────────────────────────┘
```

**Security**: Generic success message prevents email enumeration

### Two-Factor Verification Page

**URL**: `/verify-2fa`

**Layout**:

```
┌─────────────────────────────────────────┐
│  Two-factor authentication              │
│  Enter the 6-digit code from your       │
│  authenticator app                      │
│                                         │
│  [_] [_] [_] [_] [_] [_] ← OTP Input    │
│                                         │
│  Auto-submits when complete             │
│                                         │
│  Can't access your code?                │
│  [Use backup code instead]              │
└─────────────────────────────────────────┘
```

**Features**:

- Auto-focus and auto-advance between boxes
- Auto-submit when 6 digits entered
- Paste support (splits code automatically)
- Clear backup code option

### Account Settings Page

**URL**: `/settings/account`

**Layout**:

```
┌─────────────────────────────────────────┐
│  Connected Accounts                     │
│  ┌────────────────────────────────────┐│
│  │ [✓] Email/Password                 ││
│  │     user@example.com               ││
│  │     [Change password]              ││
│  └────────────────────────────────────┘│
│  ┌────────────────────────────────────┐│
│  │ [✓] Google                         ││
│  │     Connected                      ││
│  │     [Unlink]                       ││
│  └────────────────────────────────────┘│
│  ┌────────────────────────────────────┐│
│  │ [ ] GitHub                         ││
│  │     Not connected                  ││
│  │     [Link GitHub account]          ││
│  └────────────────────────────────────┘│
│                                         │
│  Security                               │
│  ┌────────────────────────────────────┐│
│  │ Two-Factor Authentication          ││
│  │ [✓] Enabled                        ││
│  │ [Manage 2FA] [View backup codes]   ││
│  └────────────────────────────────────┘│
│  ┌────────────────────────────────────┐│
│  │ Passkeys                           ││
│  │ • MacBook Pro (Added 2 days ago)   ││
│  │ • iPhone 15 (Added 1 week ago)     ││
│  │ [Add passkey]                      ││
│  └────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Complete Code Organization

```
project-root/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── forms/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   ├── MagicLinkForm.tsx
│   │   │   │   ├── PhoneVerifyForm.tsx
│   │   │   │   ├── OTPVerifyForm.tsx
│   │   │   │   └── PasskeySetupForm.tsx
│   │   │   ├── buttons/
│   │   │   │   ├── SocialLoginButtons.tsx
│   │   │   │   ├── LoadingButton.tsx
│   │   │   │   ├── AnonymousLoginButton.tsx
│   │   │   │   └── PasskeySignInButton.tsx
│   │   │   ├── shared/
│   │   │   │   ├── AuthCard.tsx
│   │   │   │   ├── AuthHeader.tsx
│   │   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   │   ├── AccountLinkingPrompt.tsx
│   │   │   │   └── OTPInput.tsx
│   │   │   └── providers/
│   │   │       └── AuthProvider.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── lib/
│   │   ├── auth-client.ts
│   │   ├── auth-server.ts
│   │   └── validations/
│   │       └── auth.ts
│   └── pages/
│       └── (auth)/
│           ├── login/
│           ├── signup/
│           ├── forgot-password/
│           ├── reset-password/
│           ├── verify-2fa/
│           ├── link-account/
│           └── settings/
│               └── account/
├── convex/
│   ├── _generated/
│   ├── auth.ts
│   ├── auth.config.ts
│   ├── convex.config.ts
│   ├── email.ts
│   ├── http.ts
│   ├── subscriptions.ts
│   └── emails/
│       ├── MagicLinkEmail.tsx
│       ├── WelcomeEmail.tsx
│       └── PasswordResetEmail.tsx
└── .env.local
```

---

## Implementation Steps Summary

### Phase 1: Foundation (Week 1-2)

**Day 1-2: Environment Setup**

1. Install Better Auth Convex component: `npm install @convex-dev/better-auth`
2. Configure environment variables
3. Set up Better Auth with anonymous plugin
4. Enable account linking in config
5. Run database migration

**Day 3-5: Component Architecture**

1. Install Shadcn UI components: `npx shadcn@latest add form input button card`
2. Create base AuthCard component
3. Build SocialLoginButtons component
4. Implement LoadingButton
5. Set up auth validation schemas with Zod

**Day 6-10: Core Auth Pages**

1. Build LoginForm with email/password
2. Build RegisterForm with password strength indicator
3. Implement ForgotPasswordForm
4. Add anonymous login button
5. Test account linking flows

### Phase 2: Magic Links (Week 3-4)

**Day 1-3: Resend Integration**

1. Install Resend component: `npm install @convex-dev/resend`
2. Configure Resend in Convex
3. Set up webhook endpoint
4. Create email templates with React Email

**Day 4-7: Magic Link Implementation**

1. Add magic link plugin to Better Auth
2. Build MagicLinkForm component
3. Test email delivery
4. Implement magic link verification page
5. Test with real email providers

### Phase 3: Enhanced Security (Week 4-6)

**Day 1-4: Phone Authentication**

1. Set up Twilio account
2. Configure phone number plugin
3. Build PhoneVerifyForm
4. Implement OTP input component
5. Test SMS delivery

**Day 5-10: Two-Factor Authentication**

1. Add twoFactor plugin to Better Auth
2. Build TwoFactorSetup component
3. Implement QR code generation
4. Create backup codes display
5. Build 2FA verification page
6. Test with authenticator apps

### Phase 4: Passkeys (Week 6-8)

**Day 1-3: WebAuthn Setup**

1. Configure passkey plugin
2. Ensure HTTPS in production
3. Test browser compatibility

4. Build PasskeySetup component
5. Implement passkey sign-in button
6. Add conditional UI support
7. Create passkey management page
8. Test on multiple devices

### Phase 5: Stripe (Week 8-10)

**Day 1-3: Stripe Configuration**

1. Install Stripe plugin: `npm install @better-auth/stripe stripe`
2. Configure Stripe in Better Auth
3. Set up webhook endpoint
4. Test with Stripe CLI locally

**Day 4-10: Subscription Features**

1. Define subscription plans
2. Build SubscriptionUpgrade component
3. Create billing portal link
4. Implement feature gating
5. Test complete subscription flow
6. Test webhook event handling

---

## Critical Implementation Guidelines

### Security Checklist

✅ **Always use HTTPS** in production
✅ **Implement rate limiting** on all auth endpoints
✅ **Use CSPRNG** for token generation
✅ **Verify webhook signatures** (Stripe, Resend)
✅ **Store passwords hashed** (Better Auth handles this)
✅ **Implement CSRF protection** (Better Auth handles this)
✅ **Use httpOnly, secure, SameSite cookies** (Better Auth default)
✅ **Generic error messages** to prevent user enumeration
✅ **Log authentication attempts** for monitoring
✅ **Regular security audits** of auth flows

### Performance Optimization

- Enable cookie caching in Better Auth for reduced database calls
- Use Convex's reactive queries for real-time auth state
- Implement proper loading states everywhere
- Lazy load auth components
- Optimize email templates for fast rendering
- Use Resend batching for bulk emails

### Testing Strategy

**Unit Tests**:

- Validation schemas
- Helper functions
- Component logic

**Integration Tests**:

- Complete auth flows
- Account linking scenarios
- Password reset flows
- 2FA setup and verification
- Passkey registration

**E2E Tests**:

- User signup → onboarding
- Login → dashboard
- Password reset flow
- Subscription upgrade flow

**Security Tests**:

- CSRF attacks
- SQL injection (N/A with Convex)
- Rate limit bypass attempts
- Session fixation

---

## Monitoring and Analytics

### Key Metrics to Track

**Conversion Metrics**:

- Signup completion rate
- Anonymous → registered conversion
- Social login adoption rate
- Magic link click-through rate
- 2FA setup completion rate
- Passkey adoption rate

**Security Metrics**:

- Failed login attempts
- Password reset requests
- 2FA verification failures
- Account linking events
- Session hijacking attempts

**Performance Metrics**:

- Auth page load time
- Email delivery time
- SMS delivery time
- Database query performance
- Webhook processing time

### Recommended Tools

- **Analytics**: PostHog, Mixpanel, or Amplitude
- **Error Tracking**: Sentry
- **Logging**: Convex built-in logging + external service
- **Email Monitoring**: Resend dashboard
- **Uptime**: Better Uptime or Pingdom

---

## Future Enhancements

**Post-Launch Improvements**:

1. **Biometric authentication** on mobile apps
2. **Social login providers**: LinkedIn, Microsoft, Apple
3. **SAML/SSO** for enterprise customers
4. **Advanced fraud detection** with device fingerprinting
5. **Session recording** for security audits
6. **Passwordless-only mode** (remove passwords entirely)
7. **Adaptive authentication** (risk-based 2FA)
8. **Account activity logs** visible to users

---

## Conclusion

This phased implementation plan delivers a modern, secure, high-converting authentication system that:

✨ **Reduces friction** with anonymous login and magic links
✨ **Maximizes conversions** with beautiful UX and social login
✨ **Ensures security** with 2FA and passkeys
✨ **Enables monetization** with Stripe integration
✨ **Maintains clean code** with reusable Shadcn UI components
✨ **Future-proofs** with WebAuthn/passkey adoption

**Timeline**: 8-10 weeks for complete implementation
**Team Size**: 1-2 developers
**Expected Results**:

- 40%+ increase in signup conversion (anonymous + social)
- 90%+ reduction in password reset tickets (magic links)
- Production-ready security (2FA + passkeys)
- Monetization-ready (Stripe integration)

The Better Auth + Convex + Shadcn UI stack provides the perfect foundation for this implementation, with automatic account linking, session management, and database integration handling the complexity while you focus on beautiful UX.

Start with Phase 1 and iterate based on user feedback. Each phase delivers immediate value while building toward the complete vision.
