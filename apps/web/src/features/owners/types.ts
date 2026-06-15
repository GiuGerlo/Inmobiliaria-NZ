import type { City } from '@/features/cities/types';

export type Owner = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city_code: string;
  city?: City;
};

export type OwnerInput = {
  name: string;
  phone: string;
  email: string;
  city_code: string;
};

export type OwnerListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
};
