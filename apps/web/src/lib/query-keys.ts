import type { CityListParams } from '@/features/cities/types';
import type { PaymentMethodListParams } from '@/features/payment-methods/types';
import type { OwnerListParams } from '@/features/owners/types';
import type { TenantListParams } from '@/features/tenants/types';
import type { PropertyListParams } from '@/features/properties/types';
import type { ContractListParams } from '@/features/contracts/types';
import type { ReceiptListParams } from '@/features/receipts/types';

/** Factories de query keys para React Query — una fuente de verdad por recurso. */
export const queryKeys = {
  me: ['me'] as const,
  cities: {
    all: ['cities'] as const,
    list: (params: CityListParams) => ['cities', 'list', params] as const,
    detail: (code: string) => ['cities', 'detail', code] as const,
  },
  paymentMethods: {
    all: ['payment-methods'] as const,
    list: (params: PaymentMethodListParams) => ['payment-methods', 'list', params] as const,
  },
  owners: {
    all: ['owners'] as const,
    list: (params: OwnerListParams) => ['owners', 'list', params] as const,
  },
  tenants: {
    all: ['tenants'] as const,
    list: (params: TenantListParams) => ['tenants', 'list', params] as const,
  },
  properties: {
    all: ['properties'] as const,
    list: (params: PropertyListParams) => ['properties', 'list', params] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: (params: ContractListParams) => ['contracts', 'list', params] as const,
  },
  receipts: {
    all: ['receipts'] as const,
    list: (params: ReceiptListParams) => ['receipts', 'list', params] as const,
  },
};
