import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { BatchStatus, MessageFilters, PaymentRemindersResult, WhatsAppMessage } from './types';

export async function sendPaymentReminders(
  tenantIds: number[],
  deadline: string,
): Promise<PaymentRemindersResult> {
  const { data } = await api.post<PaymentRemindersResult>('/whatsapp/payment-reminders', {
    tenant_ids: tenantIds,
    deadline,
  });
  return data;
}

export async function sendMissingItems(tenantId: number, message: string): Promise<WhatsAppMessage> {
  const { data } = await api.post<{ data: WhatsAppMessage }>('/whatsapp/missing-items', {
    tenant_id: tenantId,
    message,
  });
  return data.data;
}

export async function getBatch(batchId: string): Promise<BatchStatus> {
  const { data } = await api.get<BatchStatus>(`/whatsapp/batches/${batchId}`);
  return data;
}

export async function retryBatch(batchId: string): Promise<{ batch_id: string; total: number }> {
  const { data } = await api.post<{ batch_id: string; total: number }>(
    `/whatsapp/batches/${batchId}/retry`,
  );
  return data;
}

export async function listMessages(
  page: number,
  perPage: number,
  filters: MessageFilters = {},
): Promise<Paginated<WhatsAppMessage>> {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (filters.q) params['filter[q]'] = filters.q;
  if (filters.type) params['filter[type]'] = filters.type;
  if (filters.status) params['filter[status]'] = filters.status;
  if (filters.from) params['filter[from]'] = filters.from;
  if (filters.to) params['filter[to]'] = filters.to;
  if (filters.receiptId) params['filter[receipt_id]'] = filters.receiptId;
  const { data } = await api.get<Paginated<WhatsAppMessage>>('/whatsapp/messages', { params });
  return data;
}
