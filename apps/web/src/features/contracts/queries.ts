import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  archiveContract,
  createContract,
  deleteContract,
  listContracts,
  unarchiveContract,
  updateContract,
} from './api';
import type { ContractInput, ContractListParams } from './types';

export function useContracts(params: ContractListParams) {
  return useQuery({
    queryKey: queryKeys.contracts.list(params),
    queryFn: () => listContracts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContractInput) => createContract(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contracts.all }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ContractInput }) => updateContract(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contracts.all }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteContract(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contracts.all }),
  });
}

/** Archivar / reactivar: cambia qué contratos ven el dashboard y los recordatorios. */
export function useSetContractArchived() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      archived ? archiveContract(id) : unarchiveContract(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contracts.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
