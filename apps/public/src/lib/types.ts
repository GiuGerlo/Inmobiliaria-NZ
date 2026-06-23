/** Tipos espejo de los API Resources de Laravel (apps/api). */

export interface PropertyType {
  id: number;
  name: string;
}

export interface PropertyImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface SaleProperty {
  id: number;
  slug: string;
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
  type: PropertyType | null;
  images: PropertyImage[];
}

/** Portada = primera imagen por sort_order (el backend ya las ordena). */
export function coverImage(property: SaleProperty): string | null {
  return property.images[0]?.url ?? null;
}

/** "servicios"/"caracteristicas" se guardan como texto separado por comas. */
export function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
