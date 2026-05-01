'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBadgesPageData, getMyBadgeCount, getMyUnnotifiedBadges, markMyBadgesNotified, getMyXP } from '../actions/badgeActions';
import { badgeKeys } from './badgeKeys';

export function useMyBadgesPageData() {
  return useQuery({
    queryKey: badgeKeys.pageData(),
    queryFn:  getMyBadgesPageData,
    staleTime: 60_000,
  });
}

export function useMyBadgeCount() {
  return useQuery({
    queryKey: badgeKeys.myCount(),
    queryFn:  getMyBadgeCount,
    staleTime: 60_000,
  });
}

export function useMyXP() {
  return useQuery({
    queryKey: badgeKeys.myXP(),
    queryFn:  getMyXP,
    staleTime: 60_000,
  });
}

export function useMarkBadgesNotified() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMyBadgesNotified,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.all });
    },
  });
}
