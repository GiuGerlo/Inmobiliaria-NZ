import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createTenant, deleteTenant, listTenants, updateTenant } from './api';
import type { TenantInput, TenantListParams } from './types';

export function useTenants(params: TenantListParams) {
  return useQuery({
    queryKey: queryKeys.tenants.list(params),
    queryFn: () => listTenants(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantInput) => createTenant(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants.all }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TenantInput }) => updateTenant(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants.all }),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTenant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants.all }),
  });
}
