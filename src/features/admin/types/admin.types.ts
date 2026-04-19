// Admin module types — user management and per-user stats.

import type { UserRole } from '@/shared/types/auth';
export type { UserRole };

export type AdminUserRecord = {
  id:          string;
  email:       string;
  role:        UserRole;
  isActive:    boolean;
  createdAt:   Date;
  itemCount:   number;   // total items in their inventory
  soldCount:   number;   // total items sold
  totalProfit: number;   // all-time profit (computed, not stored)
};
