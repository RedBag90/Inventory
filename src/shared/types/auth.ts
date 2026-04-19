export type UserRole = 'USER' | 'ADMIN' | 'MASTER_ADMIN';

export const ROLES = {
  USER:         'USER',
  ADMIN:        'ADMIN',
  MASTER_ADMIN: 'MASTER_ADMIN',
} as const satisfies Record<string, UserRole>;
