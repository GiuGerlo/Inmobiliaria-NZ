import { api } from '@/lib/api';
import type { Dashboard } from './types';

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await api.get<{ data: Dashboard }>('/dashboard');
  return data.data;
}
