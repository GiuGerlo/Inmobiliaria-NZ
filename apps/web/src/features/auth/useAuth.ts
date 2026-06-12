import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ensureCsrf, resetCsrf } from '@/lib/csrf';
import { queryKeys } from '@/lib/query-keys';
import { errorStatus } from '@/lib/api-error';
import type { LoginCredentials, User } from './types';

/** Lee la sesión actual. 401 = no logueado (no reintenta). */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async (): Promise<User> => {
      const { data } = await api.get<{ data: User }>('/me');
      return data.data;
    },
    retry: (failureCount, error) => errorStatus(error) !== 401 && failureCount < 1,
    staleTime: 5 * 60_000,
  });
}

/** Estado derivado de auth para guards y UI. */
export function useAuth() {
  const me = useMe();
  return {
    user: me.data ?? null,
    isAuthenticated: !!me.data,
    isLoading: me.isLoading,
    isUnauthenticated: errorStatus(me.error) === 401,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<User> => {
      await ensureCsrf();
      const { data } = await api.post<{ data: User }>('/auth/login', credentials);
      return data.data;
    },
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      resetCsrf();
      qc.clear();
    },
  });
}
