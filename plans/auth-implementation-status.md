# Authentication Implementation Status

## Current Architecture (Custom Convex Auth)

### ✅ Implemented Features

1. **Email/Password Authentication**
   - Sign up with email/password
   - Sign in with email/password
   - Password hashing (SHA-256, should migrate to Argon2/bcrypt)
   - Session management with httpOnly cookies (30-day expiry)
   - Sign out functionality

2. **Password Reset Flow**
   - Forgot password request
   - Email sending via @convex-dev/resend component
   - Token validation
   - Password reset with automatic session invalidation
   - Secure token generation using crypto.getRandomValues

3. **UI Components**
   - `AuthCard` - Reusable auth card wrapper
   - `SocialLoginButtons` - GitHub and Google buttons (UI only)
   - `PasswordStrengthIndicator` - Real-time password requirements
   - `SimpleSignInForm` / `SimpleSignUpForm` - Basic auth forms
   - `ForgotPasswordForm` / `ResetPasswordForm` - Password reset forms

4. **API Integration**
   - Custom API routes at `/api/auth/[...all]`
   - Session endpoint for Better Auth UI compatibility
   - Convex HTTP client integration

### ❌ Missing Features (from enhance-auth.md plan)

1. **Phase 1: Foundation**
   - [ ] Anonymous login
   - [ ] Account linking architecture
   - [ ] Enhanced password requirements (currently basic SHA-256)
   - [ ] Improved error handling and user feedback

2. **Phase 2: Passwordless**
   - [ ] Magic links
   - [ ] Enhanced email templates with React Email

3. **Phase 3: Enhanced Security**
   - [ ] Phone/SMS authentication (Twilio)
   - [ ] TOTP two-factor authentication
   - [ ] Backup codes

4. **Phase 4: Future-Proof Auth**
   - [ ] Passkeys (WebAuthn)
   - [ ] Progressive enhancement UX
   - [ ] Cross-device authentication

5. **Phase 5: Monetization**
   - [ ] Stripe Better Auth plugin
   - [ ] Subscription management
   - [ ] Trial abuse prevention

### 🔧 Current Implementation Issues

1. **Security Concerns**
   - Using SHA-256 for password hashing (should use Argon2 or bcrypt)
   - No rate limiting on auth endpoints
   - No email verification
   - No session rotation
   - No CSRF protection beyond SameSite cookies

2. **UX Gaps**
   - Social OAuth buttons are non-functional
   - No loading states in forms
   - No account linking when email exists
   - Generic error messages (good for security, but could be better UX)
   - No "remember me" option

3. **Architecture Limitations**
   - Custom auth instead of Better Auth (misses automatic features)
   - No built-in account linking
   - Manual session management
   - No webhook support for auth events

## Migration Options

### Option A: Continue with Custom Auth (Current Path)
**Pros:**
- Already implemented and working
- Full control over implementation
- No migration needed
- Convex-native

**Cons:**
- Need to build all advanced features manually
- More security concerns to handle
- Reinventing the wheel
- Harder to add passkeys, 2FA, etc.

### Option B: Migrate to Better Auth + Convex
**Pros:**
- Automatic account linking
- Built-in 2FA, passkeys, magic links
- Better security defaults
- Webhook support
- Stripe integration
- Industry-standard patterns

**Cons:**
- Migration effort required
- Need to update all auth UI components
- Learning curve
- Possible breaking changes

## Recommended Path Forward

### Short-term Improvements (Current System)

1. **Immediate Security Fixes**
   ```typescript
   // Switch to Argon2 for password hashing
   import { hash, verify } from '@node-rs/argon2';

   async function hashPassword(password: string): Promise<string> {
     return await hash(password, {
       memoryCost: 19456,
       timeCost: 2,
       outputLen: 32,
       parallelism: 1,
     });
   }
   ```

2. **Add Loading States**
   - Create `LoadingButton` component
   - Add form submission states
   - Show spinners during API calls

3. **Implement Social OAuth**
   - Set up GitHub OAuth app
   - Set up Google OAuth app
   - Implement OAuth callback handlers
   - Add account linking logic

4. **Email Verification**
   - Add `emailVerified` field to users table
   - Send verification email on signup
   - Create verification endpoint
   - Restrict features for unverified users

### Long-term Plan (Better Auth Migration)

1. **Phase 1: Preparation** (Week 1)
   - Install Better Auth Convex component
   - Set up parallel auth system
   - Test with new users only

2. **Phase 2: Migration** (Week 2-3)
   - Migrate user data to Better Auth schema
   - Update all UI components
   - Switch API endpoints

3. **Phase 3: Enhanced Features** (Week 4+)
   - Add anonymous login
   - Implement magic links
   - Add 2FA support
   - Enable passkeys

## Immediate Next Steps

### 1. Enhance Current Implementation
- [ ] Fix password hashing (SHA-256 → Argon2)
- [ ] Add email verification flow
- [ ] Implement functional social OAuth
- [ ] Add rate limiting
- [ ] Improve error messages

### 2. Create New Components
- [ ] `LoadingButton.tsx` - Button with loading state
- [ ] `AccountLinkingPrompt.tsx` - Handle duplicate emails
- [ ] `EmailVerificationBanner.tsx` - Prompt unverified users
- [ ] `OTPInput.tsx` - 6-digit code input (for future 2FA)

### 3. Database Schema Updates
```typescript
// Add to users table
{
  emailVerified: boolean,
  emailVerifiedAt: number | null,
  verificationToken: string | null,
  verificationTokenExpiresAt: number | null,
  lastLoginAt: number | null,
  failedLoginAttempts: number,
  lockedUntil: number | null,
}

// Add new table for OAuth accounts
{
  userId: Id<"users">,
  provider: "github" | "google",
  providerId: string,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: number,
  createdAt: number,
}
```

## Decision Point

**Question for team:** Should we:
1. Continue enhancing the custom auth (faster, but limited)
2. Migrate to Better Auth (more effort, but future-proof)

My recommendation: **Option 2 - Migrate to Better Auth** because:
- Saves 100+ hours of development time
- Industry-standard security
- Built-in passkeys, 2FA, magic links
- Automatic account linking
- Stripe integration ready
- Lower maintenance burden

The migration can be done incrementally without breaking existing users.
