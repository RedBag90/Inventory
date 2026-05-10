import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendMail } from '@/shared/lib/mailer';
import { env } from '@/shared/config/env';
import { getLeaderboardData, thisSundayMidnightUTC, buildWeeklyDigestEmail, signOptOutToken } from '@/features/leaderboard';

// NEXT_PUBLIC_APP_URL → set manually in Vercel per environment
// VERCEL_URL         → set automatically by Vercel for every deployment (preview + prod)
const APP_URL =
  env.NEXT_PUBLIC_APP_URL ??
  (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000');

export async function GET(req: NextRequest) {
  try {
  const secret = env.CRON_SECRET;
  const auth   = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekOf = thisSundayMidnightUTC();
  const now    = new Date();

  const instances = await prisma.olympiadInstance.findMany({
    where: {
      isActive:            true,
      weeklyDigestEnabled: true,
      startsAt:            { lte: now },
      endsAt:              { gte: now },
    },
    select: {
      id:          true,
      name:        true,
      memberships: {
        where:  { digestOptOut: false },
        select: {
          id:   true,
          user: { select: { id: true, email: true } },
        },
      },
    },
  });

  // Test mode: send to a single address using the first active instance
  const testEmail = req.nextUrl.searchParams.get('testEmail') ?? null;
  if (testEmail) {
    const instance = instances[0];
    if (!instance) return NextResponse.json({ ok: true, sent: 0, note: 'no active instance' });

    const { entries } = await getLeaderboardData(instance.id);
    const optOutUrl   = `${APP_URL}/api/digest/opt-out?token=test`;

    const { subject, html, text } = buildWeeklyDigestEmail({
      entries,
      instanceName:    instance.name,
      recipientUserId: '',
      optOutUrl,
      appUrl:          APP_URL,
    });

    await sendMail({
      to:      testEmail,
      subject: `[TEST] ${subject}`,
      html,
      text,
      headers: {
        'List-Unsubscribe':      `<${optOutUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    return NextResponse.json({ ok: true, sent: 1, testEmail });
  }

  let sent    = 0;
  let skipped = 0;

  for (const instance of instances) {
    const existing = await prisma.digestLog.findUnique({
      where: { instanceId_weekOf: { instanceId: instance.id, weekOf } },
    });
    if (existing) { skipped++; continue; }

    const { entries } = await getLeaderboardData(instance.id);

    for (const membership of instance.memberships) {
      const optOutToken = signOptOutToken(membership.id);
      const optOutUrl   = `${APP_URL}/api/digest/opt-out?token=${optOutToken}`;

      const { subject, html, text } = buildWeeklyDigestEmail({
        entries,
        instanceName:    instance.name,
        recipientUserId: membership.user.id,
        optOutUrl,
        appUrl:          APP_URL,
      });

      await sendMail({
        to:      membership.user.email,
        subject,
        html,
        text,
        headers: {
          'List-Unsubscribe':      `<${optOutUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      sent++;
    }

    await prisma.digestLog.create({ data: { instanceId: instance.id, weekOf } });
  }

  return NextResponse.json({ ok: true, sent, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
