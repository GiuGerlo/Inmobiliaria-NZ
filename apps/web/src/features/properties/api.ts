import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { Property, PropertyInput, PropertyListParams } from './types';

function buildParams(params: PropertyListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
    include: 'city',
  };
  if (params.sort) query.sort = params.sort;
  if (params.q) query.q = params.q;
  return query;
}

export async function listProperties(params: PropertyListParams): Promise<Paginated<Property>> {
  const { data } = await api.get<Paginated<Property>>('/properties', {
    params: buildParams(params),
  });
  return data;
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  const { data } = await api.post<{ data: Property }>('/properties', input);
  return data.data;
}

export async function updateProperty(id: number, input: PropertyInput): Promise<Property> {
  const { data } = await api.patch<{ data: Property }>(`/properties/${id}`, input);
  return data.data;
}

export async function deleteProperty(id: number): Promise<void> {
  await api.delete(`/properties/${id}`);
}

/** Sube la foto (multipart). El backend la convierte a WebP y devuelve la propiedad. */
export async function uploadPropertyPhoto(id: number, file: File): Promise<Property> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await api.post<{ data: Property }>(`/properties/${id}/photo`, formData);
  return data.data;
}

export async function deletePropertyPhoto(id: number): Promise<void> {
  await api.delete(`/properties/${id}/photo`);
}

/** Opciones para el EntityCombobox de propiedad (value = id, label = dirección). */
export async function fetchPropertyOptions(query: string) {
  const { data } = await listProperties({ page: 1, perPage: 20, q: query || undefined });
  return data.map((property) => ({ value: property.id, label: property.address }));
}
