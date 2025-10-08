# Next Features to Implement

## Current Status
✅ Working: Email/password auth, password reset, session management, OAuth (GitHub & Google), Rate limiting, Email verification, Magic Links, Two-Factor Auth (TOTP)
❌ Missing: Passkeys (WebAuthn)

## Priority Implementation Order

### 1. OAuth (GitHub & Google) - ✅ COMPLETED
**Status:** Social login buttons now fully functional!
**Implementation:**
- ✅ `src/pages/api/auth/github.ts` - GitHub OAuth initiation
- ✅ `src/pages/api/auth/github/callback.ts` - GitHub OAuth callback
- ✅ `src/pages/api/auth/google.ts` - Google OAuth initiation
- ✅ `src/pages/api/auth/google/callback.ts` - Google OAuth callback
- ✅ `convex/auth.ts` - signInWithOAuth mutation
- ✅ OAuth credentials configured in `.env.local`
- ✅ Social login buttons wired in SimpleSignInForm and SimpleSignUpForm

### 2. Rate Limiting - ✅ COMPLETED
**Status:** Brute force protection now active!
**Implementation:**
- ✅ Installed `@convex-dev/rate-limiter` component
- ✅ Configured in `convex/convex.config.ts`
- ✅ Added to signIn (5 attempts per 15 minutes)
- ✅ Added to signUp (3 attempts per hour)
- ✅ Added to requestPasswordReset (3 attempts per hour)
- ✅ Rate limits per email address

### 3. Email Verification - ✅ COMPLETED
**Status:** Email verification system now active!
**Implementation:**
- ✅ Updated `convex/schema.ts` to add emailVerifications table and emailVerified field
- ✅ Added `createEmailVerificationToken` internal mutation
- ✅ Added `sendVerificationEmailAction` to send verification emails via Resend
- ✅ Added `verifyEmail` mutation to verify email tokens
- ✅ Added `isEmailVerified` query to check verification status
- ✅ Updated `signUp` mutation to optionally send verification email
- ✅ Created `/verify-email` page with auto-verification
- ✅ Created `VerifyEmailForm` component
- ✅ Verification link expires in 24 hours

### 4. Magic Links - ✅ COMPLETED
**Status:** Passwordless authentication now available!
**Implementation:**
- ✅ Updated `convex/schema.ts` to add magicLinks table
- ✅ Added `createMagicLinkToken` internal mutation
- ✅ Added `sendMagicLinkEmailAction` to send magic links via Resend
- ✅ Added `requestMagicLink` mutation with rate limiting (3 per hour)
- ✅ Added `signInWithMagicLink` mutation for authentication
- ✅ Created `/request-magic-link` page for requesting links
- ✅ Created `/auth/magic-link` page with auto-authentication
- ✅ Created `RequestMagicLinkForm` component
- ✅ Created `MagicLinkAuth` component
- ✅ Added magic link option to sign-in page
- ✅ Magic links expire after 15 minutes and can only be used once

### 5. Two-Factor Auth (TOTP) - ✅ COMPLETED
**Status:** Enhanced security with Google Authenticator-style 2FA!
**Implementation:**
- ✅ Installed `otpauth` and `qrcode` packages
- ✅ Updated `convex/schema.ts` to add twoFactorAuth table
- ✅ Added `setup2FA` mutation (generates secret + 10 backup codes)
- ✅ Added `verify2FA` mutation to enable 2FA
- ✅ Added `disable2FA` mutation with password verification
- ✅ Added `get2FAStatus` query to check status
- ✅ Created `TwoFactorSettings` component with QR code generation
- ✅ Client-side TOTP verification with 30-second window
- ✅ Backup codes for account recovery
- ✅ Secure secret generation (32 characters)
- ✅ Compatible with Google Authenticator, Authy, 1Password

### 6. Passkeys (WebAuthn) - LOW PRIORITY
**Why:** Future-proof, but complex
**Effort:** 4-6 hours
**Implementation:**
- WebAuthn registration
- WebAuthn authentication
- Passkey management UI

## Let's Start: OAuth Implementation

Since social login buttons already exist, let's make them functional!
