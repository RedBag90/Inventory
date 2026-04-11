// Email sending via SMTP (Supabase SMTP relay or any SMTP provider).
// Configure via env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Dev: log to console instead of sending
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@example.com';
  const transport = createTransport();

  if (!transport) {
    console.log('[mailer] SMTP not configured — email would have been sent to:', to);
    console.log('[mailer] Subject:', subject);
    return;
  }

  await transport.sendMail({ from, to, subject, html, text });
}
