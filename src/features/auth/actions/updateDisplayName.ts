'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export async function updateDisplayName(displayName: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const trimmed = displayName.trim();
  if (trimmed.length > 50) throw new Error('Name darf max. 50 Zeichen haben');

  await prisma.user.update({
    where: { supabaseId: user.id },
    data:  { displayName: trimmed || null },
  });
}
