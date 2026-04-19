'use client';

import { toast } from 'sonner';
import { BadgeToast } from '../components/BadgeToast';
import type { AwardedBadge } from '../types/badge.types';

export function showBadgeToasts(newBadges: AwardedBadge[]): void {
  for (const badge of newBadges) {
    toast.custom(() => BadgeToast({ badge }), { duration: 6000 });
  }
}
