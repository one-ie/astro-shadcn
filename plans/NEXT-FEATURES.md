# Next Features to Implement

## Current Status
✅ Working: Email/password auth, password reset, session management, OAuth (GitHub & Google), Rate limiting
❌ Missing: Email verification, 2FA, passkeys, magic links

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

### 3. Email Verification - MEDIUM PRIORITY
**Why:** Security best practice
**Effort:** 1-2 hours
**Files to create:**
- Convex mutation for sending verification email
- Convex query for verifying email token
- Email template for verification
- `/verify-email` page

### 4. Magic Links - MEDIUM PRIORITY
**Why:** Passwordless auth trend
**Effort:** 2 hours
**Files to create:**
- Convex mutation for magic link generation
- Email template for magic link
- Magic link verification endpoint

### 5. Two-Factor Auth (TOTP) - MEDIUM PRIORITY
**Why:** Enhanced security
**Effort:** 3-4 hours
**Implementation:**
- TOTP setup mutation
- QR code generation
- Backup codes
- 2FA verification flow

### 6. Passkeys (WebAuthn) - LOW PRIORITY
**Why:** Future-proof, but complex
**Effort:** 4-6 hours
**Implementation:**
- WebAuthn registration
- WebAuthn authentication
- Passkey management UI

## Let's Start: OAuth Implementation

Since social login buttons already exist, let's make them functional!
