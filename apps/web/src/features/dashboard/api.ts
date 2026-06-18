import { api } from '@/lib/api';
import type { Dashboard } from './types';

/** Período opcional para mirar pendientes/totales de otro mes (lo usa el panel de Recibos). */
export type DashboardParams = { month?: string; year?: number };

export async function getDashboard(params: DashboardParams = {}): Promise<Dashboard> {
  const { data } = await api.get<{ data: Dashboard }>('/dashboard', { params });
  return data.data;
}
