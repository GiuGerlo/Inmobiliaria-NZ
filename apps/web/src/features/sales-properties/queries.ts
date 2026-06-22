import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createPropertyType,
  createSaleProperty,
  deleteImage,
  deletePropertyType,
  deleteSaleProperty,
  listPropertyTypes,
  listSaleProperties,
  reorderImages,
  reorderSaleProperties,
  updatePropertyType,
  updateSaleProperty,
  uploadImages,
} from './api';
import type { SalePropertyInput, SalePropertyListParams } from './types';

export function useSaleProperties(params: SalePropertyListParams) {
  return useQuery({
    queryKey: queryKeys.salesProperties.list(params),
    queryFn: () => listSaleProperties(params),
    placeholderData: keepPreviousData,
  });
}

export function usePropertyTypes() {
  return useQuery({ queryKey: queryKeys.propertyTypes.all, queryFn: listPropertyTypes });
}

// create/update NO invalidan acá: el form encadena el guardado con las imágenes
// y hace una sola invalidación al final.
export function useCreateSaleProperty() {
  return useMutation({ mutationFn: (input: SalePropertyInput) => createSaleProperty(input) });
}

export function useUpdateSaleProperty() {
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SalePropertyInput }) =>
      updateSaleProperty(id, input),
  });
}

export function useDeleteSaleProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSaleProperty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.salesProperties.all }),
  });
}

export function useReorderSaleProperties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => reorderSaleProperties(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.salesProperties.all }),
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) => uploadImages(id, files),
  });
}

export function useDeleteImage() {
  return useMutation({ mutationFn: (imageId: number) => deleteImage(imageId) });
}

export function useReorderImages() {
  return useMutation({ mutationFn: (ids: number[]) => reorderImages(ids) });
}

export function useCreatePropertyType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createPropertyType(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });
}

export function useUpdatePropertyType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updatePropertyType(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });
}

export function useDeletePropertyType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePropertyType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.propertyTypes.all }),
  });
}
