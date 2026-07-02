import { api } from '@/lib/api';
import type { User } from '@/features/auth/types';
import type { PasswordFormValues, ProfileFormValues } from './schema';

export async function updateProfile(input: ProfileFormValues): Promise<User> {
  const { data } = await api.patch<{ data: User }>('/me', input);
  return data.data;
}

export async function updatePassword(input: PasswordFormValues): Promise<void> {
  await api.put('/me/password', input);
}
