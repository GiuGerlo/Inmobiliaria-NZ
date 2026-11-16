import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { AuditFilters, AuditLog } from './types';

export async function listAuditLogs(page: number, filters: AuditFilters): Promise<Paginated<AuditLog>> {
  const params: Record<string, string | number> = { page, per_page: 50 };
  if (filters.userId) params['filter[user_id]'] = filters.userId;
  if (filters.event) params['filter[event]'] = filters.event;
  if (filters.type) params['filter[auditable_type]'] = filters.type;
  if (filters.from) params['filter[from]'] = filters.from;
  if (filters.to) params['filter[to]'] = filters.to;
  const { data } = await api.get<Paginated<AuditLog>>('/audit-logs', {
    params,
  });
  return data;
}

export function useAuditLogs(page: number, filters: AuditFilters) {
  return useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: () => listAuditLogs(page, filters),
    placeholderData: keepPreviousData,
    // Es un log en vivo: siempre traer lo último al entrar a la página.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
