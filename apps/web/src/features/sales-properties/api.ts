import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type {
  PropertyImage,
  PropertyType,
  SaleProperty,
  SalePropertyInput,
  SalePropertyListParams,
} from './types';

function buildParams(p: SalePropertyListParams): Record<string, string | number> {
  const q: Record<string, string | number> = { page: p.page, per_page: p.perPage };
  if (p.sort) q.sort = p.sort;
  if (p.q) q.q = p.q;
  if (p.type != null) q['filter[type]'] = p.type;
  if (p.sold != null) q['filter[sold]'] = p.sold ? 1 : 0;
  return q;
}

export async function listSaleProperties(params: SalePropertyListParams): Promise<Paginated<SaleProperty>> {
  const { data } = await api.get<Paginated<SaleProperty>>('/sale-properties', {
    params: buildParams(params),
  });
  return data;
}

export async function getSaleProperty(id: number): Promise<SaleProperty> {
  const { data } = await api.get<{ data: SaleProperty }>(`/sale-properties/${id}`);
  return data.data;
}

export async function createSaleProperty(input: SalePropertyInput): Promise<SaleProperty> {
  const { data } = await api.post<{ data: SaleProperty }>('/sale-properties', input);
  return data.data;
}

export async function updateSaleProperty(id: number, input: SalePropertyInput): Promise<SaleProperty> {
  const { data } = await api.patch<{ data: SaleProperty }>(`/sale-properties/${id}`, input);
  return data.data;
}

export async function deleteSaleProperty(id: number): Promise<void> {
  await api.delete(`/sale-properties/${id}`);
}

export async function reorderSaleProperties(ids: number[]): Promise<void> {
  await api.patch('/sale-properties/reorder', { ids });
}

/** Sube varias imágenes (multipart). El backend las convierte a WebP. */
export async function uploadImages(id: number, files: File[]): Promise<PropertyImage[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('images[]', f));
  const { data } = await api.post<{ data: PropertyImage[] }>(`/sale-properties/${id}/images`, fd);
  return data.data;
}

export async function deleteImage(imageId: number): Promise<void> {
  await api.delete(`/sale-property-images/${imageId}`);
}

export async function reorderImages(ids: number[]): Promise<void> {
  await api.patch('/sale-property-images/reorder', { ids });
}

export async function listPropertyTypes(): Promise<PropertyType[]> {
  const { data } = await api.get<{ data: PropertyType[] }>('/property-types');
  return data.data;
}

export async function createPropertyType(name: string): Promise<PropertyType> {
  const { data } = await api.post<{ data: PropertyType }>('/property-types', { name });
  return data.data;
}

export async function updatePropertyType(id: number, name: string): Promise<PropertyType> {
  const { data } = await api.patch<{ data: PropertyType }>(`/property-types/${id}`, { name });
  return data.data;
}

export async function deletePropertyType(id: number): Promise<void> {
  await api.delete(`/property-types/${id}`);
}

/** Opciones para el EntityCombobox de categoría (value = id, label = nombre). */
export async function fetchPropertyTypeOptions(query?: string) {
  const types = await listPropertyTypes();
  const q = query?.trim().toLowerCase();
  const filtered = q ? types.filter((t) => t.name.toLowerCase().includes(q)) : types;
  return filtered.map((t) => ({ value: t.id, label: t.name }));
}
