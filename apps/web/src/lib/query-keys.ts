import type { CityListParams } from '@/features/cities/types';

/** Factories de query keys para React Query — una fuente de verdad por recurso. */
export const queryKeys = {
  me: ['me'] as const,
  cities: {
    all: ['cities'] as const,
    list: (params: CityListParams) => ['cities', 'list', params] as const,
    detail: (code: string) => ['cities', 'detail', code] as const,
  },
};
