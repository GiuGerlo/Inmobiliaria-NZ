import { api } from '@/lib/api';
import type { MaintenanceState, MaintenanceStatus } from './types';

export async function getMaintenance(): Promise<MaintenanceState> {
  const { data } = await api.get<MaintenanceState>('/maintenance');
  return data;
}

export async function enableMaintenance(): Promise<MaintenanceState> {
  const { data } = await api.post<MaintenanceState>('/maintenance');
  return data;
}

export async function disableMaintenance(): Promise<MaintenanceState> {
  const { data } = await api.delete<MaintenanceState>('/maintenance');
  return data;
}

export async function updateMaintenanceIp(): Promise<MaintenanceState> {
  const { data } = await api.post<MaintenanceState>('/maintenance/ip');
  return data;
}

/** Estado liviano y público: lo lee el SPA para decidir si muestra la pantalla de mantenimiento. */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const { data } = await api.get<MaintenanceStatus>('/maintenance/status');
  return data;
}
