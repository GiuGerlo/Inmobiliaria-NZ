import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { updatePassword, updateProfile } from './api';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    // Refleja el nombre/email nuevos en el header al instante (mismo patrón que useLogin).
    onSuccess: (user) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useUpdatePassword() {
  return useMutation({ mutationFn: updatePassword });
}
