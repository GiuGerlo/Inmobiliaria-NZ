import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createUser,
  deleteUser,
  listRoles,
  listUserSessions,
  listUsers,
  revokeAllSessions,
  revokeSession,
  updateUser,
} from './api';
import type { AdminUserInput } from './types';

export function useUsers(page = 1, perPage = 25) {
  return useQuery({
    queryKey: queryKeys.users.list(page, perPage),
    queryFn: () => listUsers(page, perPage),
    placeholderData: keepPreviousData,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: listRoles,
    staleTime: Infinity,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUserInput) => createUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminUserInput }) => updateUser(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUserSessions(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.sessions(userId),
    queryFn: () => listUserSessions(userId),
    enabled,
  });
}

export function useRevokeSession(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(userId, sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.sessions(userId) }),
  });
}

export function useRevokeAllSessions(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeAllSessions(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.sessions(userId) }),
  });
}
