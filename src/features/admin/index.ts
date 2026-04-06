// Public API — only import from here, never from internal paths

export { AdminPage } from './components/AdminPage';
export { useAdminUsers, useSetUserRole, useSetUserActive } from './hooks/useAdminUsers';
export { adminKeys } from './hooks/adminKeys';
export type { AdminUserRecord, UserRole } from './types/admin.types';
