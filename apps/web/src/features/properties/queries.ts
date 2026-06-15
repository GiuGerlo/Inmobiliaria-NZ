import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createProperty,
  deleteProperty,
  deletePropertyPhoto,
  listProperties,
  updateProperty,
  uploadPropertyPhoto,
} from './api';
import type { PropertyInput, PropertyListParams } from './types';

export function useProperties(params: PropertyListParams) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => listProperties(params),
    placeholderData: keepPreviousData,
  });
}

// create/update NO invalidan acá: el form encadena el guardado con la foto y
// hace una sola invalidación al final para evitar un refetch intermedio sin foto.
export function useCreateProperty() {
  return useMutation({
    mutationFn: (input: PropertyInput) => createProperty(input),
  });
}

export function useUpdateProperty() {
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PropertyInput }) => updateProperty(id, input),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProperty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.properties.all }),
  });
}

export function useUploadPropertyPhoto() {
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadPropertyPhoto(id, file),
  });
}

export function useDeletePropertyPhoto() {
  return useMutation({
    mutationFn: (id: number) => deletePropertyPhoto(id),
  });
}
