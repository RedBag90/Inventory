'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';
import { useCurrentDbUser } from './useCurrentDbUser';
import { updateDisplayName } from '../actions/updateDisplayName';
import { useActiveOlympiad } from '@/features/olympiad';
import { useTutorial } from '@/features/tutorial';
import { useMyBadgeCount, badgeKeys, BadgeToast } from '@/features/badges';
import type { AwardedBadge } from '@/features/badges';

export function useUserMenuData() {
  const { user, isLoading }              = useCurrentUser();
  const { data: dbUser }                 = useCurrentDbUser();
  const { active, all: memberships, setActive } = useActiveOlympiad();
  const { data: badgeCount }             = useMyBadgeCount();
  const { restart: restartTutorial }     = useTutorial();
  const queryClient                      = useQueryClient();

  async function saveName(displayName: string): Promise<void> {
    const { newBadges } = await updateDisplayName(displayName);
    await queryClient.invalidateQueries({ queryKey: ['auth', 'currentDbUser'] });
    await queryClient.invalidateQueries({ queryKey: ['admin', 'leaderboard'] });
    if (newBadges.length > 0) {
      queryClient.invalidateQueries({ queryKey: badgeKeys.all });
      for (const badge of newBadges as AwardedBadge[]) {
        toast.custom(() => <BadgeToast badge={badge} />, { duration: 6000 });
      }
    }
  }

  return { user, isLoading, dbUser, active, memberships, setActive, badgeCount, restartTutorial, saveName };
}
