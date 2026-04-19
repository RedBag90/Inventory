'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentDbUser } from '../actions/getCurrentDbUser';
import { authKeys } from './authKeys';

export function useCurrentDbUser() {
  return useQuery({
    queryKey: authKeys.currentDbUser(),
    queryFn:  getCurrentDbUser,
    staleTime: 5 * 60_000,
  });
}
