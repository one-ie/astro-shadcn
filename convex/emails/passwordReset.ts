export function passwordResetEmail(resetLink: string, email: string) {
  return {
    subject: "Reset your password - ONE",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                We received a request to reset your password for your ONE account (<strong>${email}</strong>).
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 24px;">
                Click the button below to reset your password. This link will expire in 1 hour.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; word-break: break-all; color: #4b5563; font-size: 13px; line-height: 20px; font-family: 'Courier New', monospace;">
                ${resetLink}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 20px;">
                <strong>Didn't request this?</strong>
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; line-height: 18px; text-align: center;">
                This email was sent by ONE
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 16px; text-align: center;">
                © ${new Date().getFullYear()} ONE. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Reset Your Password

Hi there,

We received a request to reset your password for your ONE account (${email}).

Click the link below to reset your password. This link will expire in 1 hour:

${resetLink}

Didn't request this?
If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

---
This email was sent by ONE
© ${new Date().getFullYear()} ONE. All rights reserved.
    `.trim(),
  };
}
