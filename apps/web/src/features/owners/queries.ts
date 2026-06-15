import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createOwner, deleteOwner, listOwners, updateOwner } from './api';
import type { OwnerInput, OwnerListParams } from './types';

export function useOwners(params: OwnerListParams) {
  return useQuery({
    queryKey: queryKeys.owners.list(params),
    queryFn: () => listOwners(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerInput) => createOwner(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.owners.all }),
  });
}

export function useUpdateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: OwnerInput }) => updateOwner(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.owners.all }),
  });
}

export function useDeleteOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOwner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.owners.all }),
  });
}
