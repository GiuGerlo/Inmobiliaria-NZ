import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getBatch, listMessages, retryBatch, sendMissingItems, sendPaymentReminders } from './api';
import type { Paginated } from '@/lib/types';
import type { BatchStatus, WhatsAppMessage } from './types';

export function useSendPaymentReminders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantIds, deadline }: { tenantIds: number[]; deadline: string }) =>
      sendPaymentReminders(tenantIds, deadline),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.whatsapp.all }),
  });
}

export function useSendMissingItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, message }: { tenantId: number; message: string }) =>
      sendMissingItems(tenantId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.whatsapp.all }),
  });
}

export function useRetryBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => retryBatch(batchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.whatsapp.all }),
  });
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
    // Mientras haya mensajes en cola, poll-eá para reflejar cuándo el worker los envía.
    refetchInterval: (query) => {
      const data = query.state.data as Paginated<WhatsAppMessage> | undefined;
      return data?.data.some((m) => m.status === 'queued') ? 5000 : false;
    },
  });
}
