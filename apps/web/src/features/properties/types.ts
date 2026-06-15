import type { City } from '@/features/cities/types';

export type Property = {
  id: number;
  address: string;
  city_code: string;
  type: string;
  services: string;
  price: number;
  features: string;
  photo_url: string | null;
  city?: City;
};

export type PropertyInput = {
  address: string;
  city_code: string;
  type: string;
  services: string;
  price: number;
  features: string;
};

export type PropertyListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
};
