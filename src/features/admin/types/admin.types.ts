// Admin module types — user management and per-user stats.

export type UserRole = 'USER' | 'ADMIN' | 'MASTER_ADMIN';

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
