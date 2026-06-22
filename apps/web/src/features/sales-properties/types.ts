export type PropertyType = { id: number; name: string };

export type PropertyImage = { id: number; url: string; sort_order: number };

export type SaleProperty = {
  id: number;
  property_type_id: number | null;
  title: string | null;
  locality: string | null;
  location: string | null;
  size: string | null;
  services: string | null;
  features: string | null;
  map_embed: string | null;
  sort_order: number;
  is_sold: boolean;
  latitude: string | null;
  longitude: string | null;
  type?: PropertyType | null;
  images?: PropertyImage[];
};

export type SalePropertyInput = {
  property_type_id: number | null;
  title: string;
  locality?: string | null;
  location?: string | null;
  size?: string | null;
  services?: string | null;
  features?: string | null;
  map_embed?: string | null;
  is_sold?: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type SalePropertyListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
  type?: number;
  sold?: boolean;
};
