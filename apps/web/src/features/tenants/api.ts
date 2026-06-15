import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { Tenant, TenantInput, TenantListParams } from './types';

function buildParams(params: TenantListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
    include: 'city',
  };
  if (params.sort) query.sort = params.sort;
  if (params.q) query.q = params.q;
  return query;
}

export async function listTenants(params: TenantListParams): Promise<Paginated<Tenant>> {
  const { data } = await api.get<Paginated<Tenant>>('/tenants', { params: buildParams(params) });
  return data;
}

export async function createTenant(input: TenantInput): Promise<Tenant> {
  const { data } = await api.post<{ data: Tenant }>('/tenants', input);
  return data.data;
}

export async function updateTenant(id: number, input: TenantInput): Promise<Tenant> {
  const { data } = await api.patch<{ data: Tenant }>(`/tenants/${id}`, input);
  return data.data;
}

export async function deleteTenant(id: number): Promise<void> {
  await api.delete(`/tenants/${id}`);
}

/** Opciones para el EntityCombobox de inquilino (value = id, label = nombre). */
export async function fetchTenantOptions(query: string) {
  const { data } = await listTenants({ page: 1, perPage: 20, q: query || undefined });
  return data.map((tenant) => ({ value: tenant.id, label: tenant.name }));
}
