import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { Owner, OwnerInput, OwnerListParams } from './types';

function buildParams(params: OwnerListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
    include: 'city',
  };
  if (params.sort) query.sort = params.sort;
  if (params.q) query.q = params.q;
  return query;
}

export async function listOwners(params: OwnerListParams): Promise<Paginated<Owner>> {
  const { data } = await api.get<Paginated<Owner>>('/owners', { params: buildParams(params) });
  return data;
}

export async function createOwner(input: OwnerInput): Promise<Owner> {
  const { data } = await api.post<{ data: Owner }>('/owners', input);
  return data.data;
}

export async function updateOwner(id: number, input: OwnerInput): Promise<Owner> {
  const { data } = await api.patch<{ data: Owner }>(`/owners/${id}`, input);
  return data.data;
}

export async function deleteOwner(id: number): Promise<void> {
  await api.delete(`/owners/${id}`);
}
