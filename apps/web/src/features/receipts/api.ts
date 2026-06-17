import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { Receipt, ReceiptInput, ReceiptListParams, SendWhatsAppInput } from './types';

const INCLUDE = 'contract.owner,contract.tenant,contract.property,paymentMethod';

function buildParams(params: ReceiptListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
    include: INCLUDE,
  };
  if (params.sort) query.sort = params.sort;
  if (params.contractId) query['filter[contract_id]'] = params.contractId;
  if (params.paymentMethodId) query['filter[payment_method_id]'] = params.paymentMethodId;
  if (params.month) query['filter[month]'] = params.month;
  if (params.year) query['filter[year]'] = params.year;
  return query;
}

export async function listReceipts(params: ReceiptListParams): Promise<Paginated<Receipt>> {
  const { data } = await api.get<Paginated<Receipt>>('/receipts', { params: buildParams(params) });
  return data;
}

export async function createReceipt(input: ReceiptInput): Promise<Receipt> {
  const { data } = await api.post<{ data: Receipt }>('/receipts', input);
  return data.data;
}

export async function updateReceipt(number: number, input: ReceiptInput): Promise<Receipt> {
  const { data } = await api.patch<{ data: Receipt }>(`/receipts/${number}`, input);
  return data.data;
}

export async function deleteReceipt(number: number): Promise<void> {
  await api.delete(`/receipts/${number}`);
}

/** Encola el envío del recibo/rendición por WhatsApp. Devuelve 202. */
export async function sendReceiptWhatsApp(number: number, input: SendWhatsAppInput): Promise<void> {
  await api.post(`/receipts/${number}/whatsapp`, input);
}
