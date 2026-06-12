import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createCity, deleteCity, listCities, updateCity } from './api';
import type { CityInput, CityListParams } from './types';

export function useCities(params: CityListParams) {
  return useQuery({
    queryKey: queryKeys.cities.list(params),
    queryFn: () => listCities(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CityInput) => createCity(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cities.all }),
  });
}

export function useUpdateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, input }: { code: string; input: CityInput }) => updateCity(code, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cities.all }),
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => deleteCity(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cities.all }),
  });
}
