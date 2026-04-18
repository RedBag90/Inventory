'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

export async function updateDisplayName(displayName: string): Promise<{ newBadges: AwardedBadge[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const trimmed = displayName.trim();
  if (trimmed.length > 50) throw new Error('Name darf max. 50 Zeichen haben');

  const dbUser = await prisma.user.update({
    where: { supabaseId: user.id },
    data:  { displayName: trimmed || null },
  });

  const newBadges = trimmed
    ? await checkAndAwardBadges({ type: 'engagement', userId: dbUser.id, event: 'display_name_set' })
    : [];

  return { newBadges };
}
