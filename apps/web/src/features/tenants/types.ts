import type { City } from '@/features/cities/types';

export type Tenant = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city_code: string;
  city?: City;
};

export type TenantInput = {
  name: string;
  phone: string;
  email: string;
  city_code: string;
};

export type TenantListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
};
