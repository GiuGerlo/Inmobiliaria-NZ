import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getBatch, listMessages, retryBatch, sendMissingItems, sendPaymentReminders } from './api';
import type { BatchStatus } from './types';

export function useSendPaymentReminders() {
  return useMutation({
    mutationFn: ({ tenantIds, deadline }: { tenantIds: number[]; deadline: string }) =>
      sendPaymentReminders(tenantIds, deadline),
  });
}

export function useSendMissingItems() {
  return useMutation({
    mutationFn: ({ tenantId, message }: { tenantId: number; message: string }) =>
      sendMissingItems(tenantId, message),
  });
}

export function useRetryBatch() {
  return useMutation({ mutationFn: (batchId: string) => retryBatch(batchId) });
}

/** Poll-ea el estado del lote hasta que no queden mensajes en cola. */
export function useBatch(batchId: string | null) {
  return useQuery({
    queryKey: queryKeys.whatsapp.batch(batchId ?? 'none'),
    queryFn: () => getBatch(batchId as string),
    enabled: batchId !== null,
    refetchInterval: (query) => {
      const data = query.state.data as BatchStatus | undefined;
      return data && data.queued === 0 ? false : 1500;
    },
  });
}

export function useMessages(page: number, perPage: number) {
  return useQuery({
    queryKey: queryKeys.whatsapp.messages({ page, perPage }),
    queryFn: () => listMessages(page, perPage),
  });
}
