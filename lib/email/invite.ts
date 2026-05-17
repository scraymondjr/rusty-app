import { Resend } from 'resend'
import type { AccessRole } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const ROLE_LABELS: Record<AccessRole, string> = {
  owner: 'Owner',
  family: 'Family',
  vet: 'Vet',
  sitter: 'Sitter',
}

export async function sendInviteEmail(email: string, role: AccessRole) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rusty.scrjr.com'
  const from = process.env.RESEND_FROM ?? 'Rusty <rusty@scrjr.com>'

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: "You've been invited to Rusty's care dashboard",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">You're invited 🐾</h2>
        <p style="color:#555;margin:0 0 16px">
          You've been given <strong>${ROLE_LABELS[role]}</strong> access to Rusty's care dashboard.
        </p>
        <a href="${appUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:600">
          Sign in with Google
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          Use the Google account associated with this email address (${email}).
          If you weren't expecting this invitation, you can ignore this message.
        </p>
      </div>
    `,
    })
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: 'Failed to send email' };
  }
}
