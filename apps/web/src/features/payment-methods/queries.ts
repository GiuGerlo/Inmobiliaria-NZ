import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createPaymentMethod,
  deletePaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
} from './api';
import type { PaymentMethodInput, PaymentMethodListParams } from './types';

export function usePaymentMethods(params: PaymentMethodListParams) {
  return useQuery({
    queryKey: queryKeys.paymentMethods.list(params),
    queryFn: () => listPaymentMethods(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentMethodInput) => createPaymentMethod(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods.all }),
  });
}

export function useUpdatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PaymentMethodInput }) =>
      updatePaymentMethod(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods.all }),
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePaymentMethod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentMethods.all }),
  });
}
