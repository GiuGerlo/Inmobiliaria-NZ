import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { PaymentMethod, PaymentMethodInput, PaymentMethodListParams } from './types';

function buildParams(params: PaymentMethodListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
  };
  if (params.sort) query.sort = params.sort;
  if (params.q) query.q = params.q;
  return query;
}

export async function listPaymentMethods(
  params: PaymentMethodListParams,
): Promise<Paginated<PaymentMethod>> {
  const { data } = await api.get<Paginated<PaymentMethod>>('/payment-methods', {
    params: buildParams(params),
  });
  return data;
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethod> {
  const { data } = await api.post<{ data: PaymentMethod }>('/payment-methods', input);
  return data.data;
}

export async function updatePaymentMethod(
  id: number,
  input: PaymentMethodInput,
): Promise<PaymentMethod> {
  const { data } = await api.patch<{ data: PaymentMethod }>(`/payment-methods/${id}`, input);
  return data.data;
}

export async function deletePaymentMethod(id: number): Promise<void> {
  await api.delete(`/payment-methods/${id}`);
}

/** Opciones para el EntityCombobox de forma de pago (value = id, label = descripción). */
export async function fetchPaymentMethodOptions(query: string) {
  const { data } = await listPaymentMethods({ page: 1, perPage: 20, q: query || undefined });
  return data.map((pm) => ({ value: pm.id, label: pm.description }));
}
