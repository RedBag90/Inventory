'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryKeys } from './inventoryKeys';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { reportingKeys } from '@/features/reporting/hooks/reportingKeys';
import { showBadgeToasts } from '@/features/badges/lib/badgeToasts';
import {
  createPendingSale,
  confirmPendingSale,
  cancelPendingSale,
  updatePendingSale,
  createQuickPendingSale,
} from '../services/PendingSaleRepository';
import type { CreatePendingSaleInput, UpdatePendingSaleInput, QuickPendingSaleInput } from '@/features/sales/types/sales.types';

export function useCreatePendingSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePendingSaleInput) => createPendingSale(data),
    onSuccess: () => {
      toast.success('Inserat erstellt');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Inserieren'),
  });
}

export function useConfirmPendingSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, overrides }: { itemId: string; overrides?: UpdatePendingSaleInput }) =>
      confirmPendingSale(itemId, overrides),
    onSuccess: ({ newBadges }) => {
      toast.success('Verkauf bestätigt');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.dashboardAll() });
      queryClient.invalidateQueries({ queryKey: reportingKeys.rangeAll() });
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        showBadgeToasts(newBadges);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Bestätigen'),
  });
}

export function useCancelPendingSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cancelPendingSale(itemId),
    onSuccess: () => {
      toast.success('Inserat aufgehoben');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Aufheben'),
  });
}

export function useUpdatePendingSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdatePendingSaleInput }) =>
      updatePendingSale(itemId, data),
    onSuccess: () => {
      toast.success('Inserat aktualisiert');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Aktualisieren'),
  });
}

export function useCreateQuickPendingSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuickPendingSaleInput) => createQuickPendingSale(data),
    onSuccess: () => {
      toast.success('Schnellverkauf inseriert');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Inserieren'),
  });
}
