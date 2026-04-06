'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentDbUser } from '../actions/getCurrentDbUser';

export function useCurrentDbUser() {
  return useQuery({
    queryKey: ['auth', 'currentDbUser'],
    queryFn:  getCurrentDbUser,
    staleTime: 5 * 60_000,
  });
}
