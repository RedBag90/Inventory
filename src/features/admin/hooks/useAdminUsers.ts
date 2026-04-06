'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import { getAllUsers, setUserRole, setUserActive } from '../services/AdminRepository';
import type { UserRole } from '../types/admin.types';

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn:  getAllUsers,
    staleTime: 30_000,
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      setUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() }),
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setUserActive(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() }),
  });
}
