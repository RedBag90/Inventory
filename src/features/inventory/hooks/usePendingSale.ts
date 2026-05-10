'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryKeys } from './inventoryKeys';
import { showBadgeToasts } from '@/features/badges';
import { invalidateForMutation } from '@/shared/lib/queryInvalidation';
import {
  createPendingSale,
  confirmPendingSale,
  cancelPendingSale,
  updatePendingSale,
  createQuickPendingSale,
} from '../services/PendingSaleRepository';
import type { CreatePendingSaleInput, UpdatePendingSaleInput, QuickPendingSaleInput } from '@/features/sales';

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
      invalidateForMutation(queryClient, 'pending_sale_confirmed', { hasBadges: newBadges.length > 0 });
      if (newBadges.length > 0) showBadgeToasts(newBadges);
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
      invalidateForMutation(queryClient, 'pending_sale_cancelled');
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
