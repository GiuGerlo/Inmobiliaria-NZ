import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getDashboard, type DashboardParams } from './api';

export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.list(params),
    queryFn: () => getDashboard(params),
  });
}
