// Public API — only import from here, never from internal paths

export { AdminPage } from './components/AdminPage';
export { LeaderboardPage } from './components/LeaderboardPage';
export { useAdminUsers, useSetUserRole, useSetUserActive } from './hooks/useAdminUsers';
export { adminKeys } from './hooks/adminKeys';
export { useJoinRequests, usePendingJoinRequestCount, useResolveJoinRequest } from './hooks/useJoinRequests';
export { useInstanceRequests, usePendingInstanceRequestCount, useMyInstanceRequest, useSubmitInstanceRequest, useResolveInstanceRequest } from './hooks/useInstanceRequests';
export type { AdminUserRecord, UserRole } from './types/admin.types';
