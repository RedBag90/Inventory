'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOlympiads,
  getOlympiadMembers,
} from '../services/olympiadRepository';
import {
  createOlympiad,
  updateOlympiad,
  archiveOlympiad,
  reactivateOlympiad,
  deleteOlympiad,
  assignUserToOlympiad,
  removeUserFromOlympiad,
  generateInviteToken,
  revokeInviteToken,
  generateJoinCode,
  revokeJoinCode,
  updateAutoAccept,
  submitJoinRequest,
  getMyJoinRequests,
} from '../actions/olympiadActions';

export const olympiadKeys = {
  all:     ['olympiads'] as const,
  members: (id: string) => ['olympiads', id, 'members'] as const,
};

export function useOlympiads() {
  return useQuery({ queryKey: olympiadKeys.all, queryFn: getOlympiads, staleTime: 30_000 });
}

export function useOlympiadMembers(instanceId: string) {
  return useQuery({
    queryKey: olympiadKeys.members(instanceId),
    queryFn:  () => getOlympiadMembers(instanceId),
    staleTime: 30_000,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: olympiadKeys.all });
}

export function useCreateOlympiad() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createOlympiad, onSuccess: invalidate });
}

export function useUpdateOlympiad() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateOlympiad>[1] }) =>
      updateOlympiad(id, data),
    onSuccess: invalidate,
  });
}

export function useArchiveOlympiad() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: archiveOlympiad, onSuccess: invalidate });
}

export function useReactivateOlympiad() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: reactivateOlympiad, onSuccess: invalidate });
}

export function useDeleteOlympiad() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteOlympiad, onSuccess: invalidate });
}

export function useAssignUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, instanceId }: { email: string; instanceId: string }) =>
      assignUserToOlympiad(email, instanceId),
    onSuccess: (_data, { instanceId }) => {
      qc.invalidateQueries({ queryKey: olympiadKeys.members(instanceId) });
    },
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, instanceId }: { userId: string; instanceId: string }) =>
      removeUserFromOlympiad(userId, instanceId),
    onSuccess: (_data, { instanceId }) => {
      qc.invalidateQueries({ queryKey: olympiadKeys.members(instanceId) });
    },
  });
}

export function useGenerateInviteToken() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: generateInviteToken, onSuccess: invalidate });
}

export function useRevokeInviteToken() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: revokeInviteToken, onSuccess: invalidate });
}

export function useGenerateJoinCode() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: generateJoinCode, onSuccess: invalidate });
}

export function useRevokeJoinCode() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: revokeJoinCode, onSuccess: invalidate });
}

export function useUpdateAutoAccept() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ instanceId, autoAccept }: { instanceId: string; autoAccept: boolean }) =>
      updateAutoAccept(instanceId, autoAccept),
    onSuccess: invalidate,
  });
}

export function useSubmitJoinRequest() {
  return useMutation({ mutationFn: submitJoinRequest });
}

export function useMyJoinRequests() {
  return useQuery({
    queryKey: ['joinRequests', 'mine'],
    queryFn:  getMyJoinRequests,
    staleTime: 30_000,
  });
}
