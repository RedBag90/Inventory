// Email sending via SMTP (Supabase SMTP relay or any SMTP provider).
// Configure via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in env.

import nodemailer from 'nodemailer';
import { env } from '@/shared/config/env';

function createTransport() {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: pass } = env;
  const port = parseInt(env.SMTP_PORT ?? '587', 10);

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
  const from = env.SMTP_FROM ?? env.SMTP_USER ?? 'noreply@example.com';
  const transport = createTransport();

  if (!transport) {
    console.log('[mailer] SMTP not configured — email would have been sent to:', to);
    console.log('[mailer] Subject:', subject);
    return;
  }

  await transport.sendMail({ from, to, subject, html, text });
}
