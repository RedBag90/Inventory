import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { sendMail } from '@/shared/lib/mailer';
import { computeLeaderboardForInstance, thisSundayMidnightUTC } from '@/features/leaderboard/services/computeLeaderboard';
import { buildWeeklyDigestEmail } from '@/features/leaderboard/emails/weeklyDigestEmail';
import { signOptOutToken } from '@/features/leaderboard/services/digestToken';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekOf = thisSundayMidnightUTC();
  const now    = new Date();

  // Only active, running olympiads with digest enabled
  const instances = await prisma.olympiadInstance.findMany({
    where: {
      isActive:           true,
      weeklyDigestEnabled: true,
      startsAt:           { lte: now },
      endsAt:             { gte: now },
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

  let sent = 0;
  let skipped = 0;

  for (const instance of instances) {
    // Idempotency: skip if digest already sent this week for this instance
    const existing = await prisma.digestLog.findUnique({
      where: { instanceId_weekOf: { instanceId: instance.id, weekOf } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const { entries } = await computeLeaderboardForInstance(instance.id);

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

      await sendMail({ to: membership.user.email, subject, html, text });
      sent++;
    }

    // Record that this week's digest was sent for this instance
    await prisma.digestLog.create({
      data: { instanceId: instance.id, weekOf },
    });
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
