import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { Contract, ContractInput, ContractListParams } from './types';

const INCLUDE = 'owner,tenant,property';

function buildParams(params: ContractListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
    include: INCLUDE,
  };
  if (params.sort) query.sort = params.sort;
  if (params.archived) query['filter[archived]'] = params.archived;
  if (params.certification) query['filter[certification]'] = params.certification;
  if (params.ownerId) query['filter[owner_id]'] = params.ownerId;
  if (params.tenantId) query['filter[tenant_id]'] = params.tenantId;
  if (params.startFrom) query['filter[start_from]'] = params.startFrom;
  if (params.startTo) query['filter[start_to]'] = params.startTo;
  return query;
}

export async function listContracts(params: ContractListParams): Promise<Paginated<Contract>> {
  const { data } = await api.get<Paginated<Contract>>('/contracts', { params: buildParams(params) });
  return data;
}

export async function createContract(input: ContractInput): Promise<Contract> {
  const { data } = await api.post<{ data: Contract }>('/contracts', input);
  return data.data;
}

export async function updateContract(id: number, input: ContractInput): Promise<Contract> {
  const { data } = await api.patch<{ data: Contract }>(`/contracts/${id}`, input);
  return data.data;
}

export async function deleteContract(id: number): Promise<void> {
  await api.delete(`/contracts/${id}`);
}

export async function archiveContract(id: number): Promise<Contract> {
  const { data } = await api.post<{ data: Contract }>(`/contracts/${id}/archive`);
  return data.data;
}

export async function unarchiveContract(id: number): Promise<Contract> {
  const { data } = await api.delete<{ data: Contract }>(`/contracts/${id}/archive`);
  return data.data;
}

/**
 * Opciones para el EntityCombobox de contrato (value = id, label = "Dueño - Inquilino", espejo del legacy).
 * Solo vigentes; para filtrar sobre el histórico usar fetchAllContractOptions.
 */
export async function fetchContractOptions(query: string, archived?: 'all') {
  const { data } = await listContracts({ page: 1, perPage: 20, archived });
  const q = query.toLowerCase();
  return data
    .filter(
      (c) =>
        !q ||
        c.owner?.name.toLowerCase().includes(q) ||
        c.tenant?.name.toLowerCase().includes(q) ||
        c.property?.address.toLowerCase().includes(q) ||
        String(c.id).includes(q),
    )
    .map((c) => ({
      value: c.id,
      label: `${c.owner?.name ?? 'Dueño'} - ${c.tenant?.name ?? 'Inquilino'}`,
    }));
}

/** Incluye archivados: para filtrar recibos viejos (histórico). */
export function fetchAllContractOptions(query: string) {
  return fetchContractOptions(query, 'all');
}
