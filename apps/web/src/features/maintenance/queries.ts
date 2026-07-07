import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  disableMaintenance,
  enableMaintenance,
  getMaintenance,
  getMaintenanceStatus,
  updateMaintenanceIp,
} from './api';
import type { MaintenanceState } from './types';

/** Detalle completo (estado + IPs) para la página del superadmin. */
export function useMaintenance() {
  return useQuery({ queryKey: queryKeys.maintenance.detail, queryFn: getMaintenance });
}

/** Estado liviano para el gate global del SPA (endpoint público, siempre accesible). */
export function useMaintenanceStatus() {
  return useQuery({
    queryKey: queryKeys.maintenance.status,
    queryFn: getMaintenanceStatus,
    staleTime: 30_000,
  });
}

function useMaintenanceMutation(mutationFn: () => Promise<MaintenanceState>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    // Refresca detalle + status (prefijo ['maintenance']) tras cambiar el estado.
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.maintenance.all }),
  });
}

export const useEnableMaintenance = () => useMaintenanceMutation(enableMaintenance);
export const useDisableMaintenance = () => useMaintenanceMutation(disableMaintenance);
export const useUpdateMaintenanceIp = () => useMaintenanceMutation(updateMaintenanceIp);
