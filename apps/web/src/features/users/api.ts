import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { AdminUser, AdminUserInput, UserSession, Role } from './types';

export async function listUsers(page = 1, perPage = 25): Promise<Paginated<AdminUser>> {
  const { data } = await api.get<Paginated<AdminUser>>('/users', { params: { page, per_page: perPage } });
  return data;
}

export async function createUser(input: AdminUserInput): Promise<AdminUser> {
  const { data } = await api.post<{ data: AdminUser }>('/users', input);
  return data.data;
}

export async function updateUser(id: number, input: AdminUserInput): Promise<AdminUser> {
  const { data } = await api.patch<{ data: AdminUser }>(`/users/${id}`, input);
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function listUserSessions(userId: number): Promise<UserSession[]> {
  const { data } = await api.get<{ data: UserSession[] }>(`/users/${userId}/sessions`);
  return data.data;
}

export async function revokeSession(userId: number, sessionId: string): Promise<void> {
  await api.delete(`/users/${userId}/sessions/${sessionId}`);
}

export async function revokeAllSessions(userId: number): Promise<void> {
  await api.delete(`/users/${userId}/sessions`);
}

export async function listRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>('/roles');
  return data;
}
