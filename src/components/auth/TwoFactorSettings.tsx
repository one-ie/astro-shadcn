import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, Copy, CheckCircle2 } from "lucide-react"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../convex/_generated/api"
import * as OTPAuth from "otpauth"
import QRCode from "qrcode"

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

export function TwoFactorSettings() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ enabled: boolean; hasSetup: boolean }>({ enabled: false, hasSetup: false })
  const [showSetup, setShowSetup] = useState(false)
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) return

      const result = await convex.query(api.auth.get2FAStatus, { token })
      setStatus(result)
    } catch (err) {
      console.error("Failed to load 2FA status:", err)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      const result = await convex.mutation(api.auth.setup2FA, { token })
      setSecret(result.secret)
      setBackupCodes(result.backupCodes)

      // Generate TOTP URI
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(result.secret.toUpperCase().padEnd(32, 'A')),
      })

      const uri = totp.toString()

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(uri)
      setQrCodeUrl(qrUrl)
      setShowSetup(true)

      toast.success("2FA setup initiated", {
        description: "Scan the QR code with your authenticator app"
      })
    } catch (err: any) {
      toast.error("Setup failed", {
        description: err.message || "Failed to setup 2FA"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      // Verify TOTP code client-side
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.toUpperCase().padEnd(32, 'A')),
      })

      const delta = totp.validate({ token: verificationCode, window: 1 })
      if (delta === null) {
        toast.error("Invalid code", {
          description: "The verification code is incorrect. Please try again."
        })
        setLoading(false)
        return
      }

      await convex.mutation(api.auth.verify2FA, { token })

      toast.success("2FA enabled!", {
        description: "Two-factor authentication has been enabled for your account"
      })

      setShowSetup(false)
      loadStatus()
    } catch (err: any) {
      toast.error("Verification failed", {
        description: err.message || "Failed to verify code"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      await convex.mutation(api.auth.disable2FA, { token, password: disablePassword })

      toast.success("2FA disabled", {
        description: "Two-factor authentication has been disabled"
      })

      setDisablePassword("")
      loadStatus()
    } catch (err: any) {
      toast.error("Failed to disable 2FA", {
        description: err.message || "Incorrect password"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  if (showSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
          <CardDescription>Scan the QR code with your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Download an authenticator app like Google Authenticator, Authy, or 1Password before continuing.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>1. Scan QR Code</Label>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or enter this key manually:</Label>
            <div className="flex gap-2">
              <Input value={secret} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(secret)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>2. Backup Codes</Label>
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <Key className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                Save these backup codes in a safe place. You can use them to access your account if you lose your device.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{code}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification">3. Enter Verification Code</Label>
            <Input
              id="verification"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={loading || !verificationCode}>
              {loading ? "Verifying..." : "Enable 2FA"}
            </Button>
            <Button variant="outline" onClick={() => setShowSetup(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.enabled ? (
          <>
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Two-factor authentication is <strong>enabled</strong> for your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disablePassword">Enter password to disable 2FA</Label>
              <Input
                id="disablePassword"
                type="password"
                placeholder="Your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>

            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={loading || !disablePassword}
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
              </AlertDescription>
            </Alert>

            <Button onClick={handleSetup} disabled={loading}>
              {loading ? "Setting up..." : "Enable 2FA"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
