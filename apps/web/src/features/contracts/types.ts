import type { Owner } from '@/features/owners/types';
import type { Tenant } from '@/features/tenants/types';
import type { Property } from '@/features/properties/types';

export type Certification = 'Si' | 'No';

export type Contract = {
  id: number;
  owner_id: number;
  tenant_id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  balance: number;
  certification: Certification;
  owner?: Owner;
  tenant?: Tenant;
  property?: Property;
};

export type ContractInput = {
  owner_id: number;
  tenant_id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  balance?: number;
  certification: Certification;
};

export type ContractListParams = {
  page: number;
  perPage: number;
  sort?: string;
  certification?: Certification;
  ownerId?: number;
  tenantId?: number;
  startFrom?: string;
  startTo?: string;
};

/** Estado de filtros de la página de contratos. */
export type ContractFilters = {
  certification: 'all' | Certification;
  ownerId: number | null;
  tenantId: number | null;
  startFrom: string;
  startTo: string;
};

export const emptyContractFilters: ContractFilters = {
  certification: 'all',
  ownerId: null,
  tenantId: null,
  startFrom: '',
  startTo: '',
};
