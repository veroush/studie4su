import nodemailer from 'nodemailer'

const makeTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

function renderHtml(toName: string, resetUrl: string) {
  return `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f5fff7;color:#111827;border-radius:12px;overflow:hidden;border:1px solid #d7f0dd;">
      <div style="padding:32px 32px 24px;border-bottom:1px solid #d7f0dd;">
        <span style="font-family:Georgia,serif;font-size:1.4rem;color:#2fa84f;font-weight:700;">Studie<span style="color:#111827;">4SU</span></span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 12px;font-size:1.3rem;">Hoi ${toName},</h2>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
          We hebben een verzoek ontvangen om het wachtwoord van je Studie4SU-account opnieuw in te stellen.
          Klik op de knop hieronder om een nieuw wachtwoord te kiezen.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#2fa84f;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
          Wachtwoord opnieuw instellen
        </a>
        <p style="color:#9ca3af;font-size:0.8rem;margin:24px 0 0;line-height:1.5;">
          Deze link is 1 uur geldig. Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.
        </p>
      </div>
    </div>`
}

export async function sendResetPasswordEmail(toEmail: string, toName: string, resetUrl: string) {
  const transporter = makeTransporter()

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Studie4SU" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Wachtwoord opnieuw instellen — Studie4SU',
    html: renderHtml(toName, resetUrl),
  })
}