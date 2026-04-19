'use client';

import React from 'react';
import { toast } from 'sonner';
import { BadgeToast } from '../components/BadgeToast';
import type { AwardedBadge } from '../types/badge.types';

export function showBadgeToasts(newBadges: AwardedBadge[]): void {
  for (const badge of newBadges) {
    toast.custom(() => React.createElement(BadgeToast, { badge }), { duration: 6000 });
  }
}
