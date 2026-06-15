import type { Contract } from '@/features/contracts/types';
import type { PaymentMethod } from '@/features/payment-methods/types';
import type { Month } from './schema';

export type Receipt = {
  number: number;
  contract_id: number;
  payment_method_id: number;
  paid_at: string;
  property_amount: number;
  municipal_amount: number;
  water_amount: number;
  electricity_amount: number;
  gas_amount: number;
  repairs_amount: number;
  funeral_amount: number;
  fees_amount: number;
  month: Month;
  year: number;
  comments: string | null;
  contract?: Contract;
  payment_method?: PaymentMethod;
};

export type ReceiptInput = {
  contract_id: number;
  payment_method_id: number;
  paid_at: string;
  property_amount: number;
  municipal_amount?: number;
  water_amount?: number;
  electricity_amount?: number;
  gas_amount?: number;
  repairs_amount?: number;
  funeral_amount?: number;
  fees_amount?: number;
  month: Month;
  year: number;
  comments?: string | null;
};

export type ReceiptListParams = {
  page: number;
  perPage: number;
  sort?: string;
  contractId?: number;
  paymentMethodId?: number;
  month?: string;
  year?: number;
};

/** Estado de filtros de la página de recibos. */
export type ReceiptFilters = {
  contractId: number | null;
  paymentMethodId: number | null;
  month: 'all' | string;
  year: string;
};

export const emptyReceiptFilters: ReceiptFilters = {
  contractId: null,
  paymentMethodId: null,
  month: 'all',
  year: '',
};
