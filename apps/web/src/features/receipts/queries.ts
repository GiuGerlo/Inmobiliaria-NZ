import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createReceipt, deleteReceipt, listReceipts, updateReceipt } from './api';
import type { ReceiptInput, ReceiptListParams } from './types';

export function useReceipts(params: ReceiptListParams) {
  return useQuery({
    queryKey: queryKeys.receipts.list(params),
    queryFn: () => listReceipts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReceiptInput) => createReceipt(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.receipts.all }),
  });
}

export function useUpdateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ number, input }: { number: number; input: ReceiptInput }) =>
      updateReceipt(number, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.receipts.all }),
  });
}

export function useDeleteReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (number: number) => deleteReceipt(number),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.receipts.all }),
  });
}
