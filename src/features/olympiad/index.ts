// Public API — only import from here, never from internal paths.

// Components
export { OlympiadDetail } from './components/OlympiadDetail';
export { OlympiadPanel }  from './components/OlympiadPanel';

// Hooks & query keys
export {
  olympiadKeys,
  useOlympiads,
  useOlympiadMembers,
  useCreateOlympiad,
  useUpdateOlympiad,
  useArchiveOlympiad,
  useReactivateOlympiad,
  useDeleteOlympiad,
  useAssignUser,
  useRemoveUser,
  useGenerateInviteToken,
  useRevokeInviteToken,
  useGenerateJoinCode,
  useRevokeJoinCode,
  useUpdateAutoAccept,
  useUpdateInviteLinkAutoAccept,
  useSubmitJoinRequest,
  useMyJoinRequests,
  useMyMemberships,
} from './hooks/useOlympiads';

// Active olympiad context
export { useActiveOlympiad }   from './hooks/useActiveOlympiad';
export type { ActiveOlympiadState } from './hooks/useActiveOlympiad';

// Services (server actions)
export { getOlympiads, getOlympiadMembers, getCurrentUserInstanceId } from './services/olympiadRepository';
export type { OlympiadRecord, OlympiadMember } from './services/olympiadRepository';

// Actions
export { joinViaToken, storePendingEmailInvite, checkHasMembership, submitInstanceRequest, getMyInstanceRequest } from './actions/olympiadActions';

// Context provider
export { ActiveOlympiadProvider } from './context/ActiveOlympiadContext';
