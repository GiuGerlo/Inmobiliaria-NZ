import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type { City, CityInput, CityListParams } from './types';

function buildParams(params: CityListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.perPage,
  };
  if (params.sort) query.sort = params.sort;
  if (params.q) query.q = params.q;
  if (params.province) query['filter[province]'] = params.province;
  return query;
}

export async function listCities(params: CityListParams): Promise<Paginated<City>> {
  const { data } = await api.get<Paginated<City>>('/cities', { params: buildParams(params) });
  return data;
}

export async function createCity(input: CityInput): Promise<City> {
  const { data } = await api.post<{ data: City }>('/cities', input);
  return data.data;
}

export async function updateCity(code: string, input: CityInput): Promise<City> {
  const { data } = await api.patch<{ data: City }>(`/cities/${encodeURIComponent(code)}`, input);
  return data.data;
}

export async function deleteCity(code: string): Promise<void> {
  await api.delete(`/cities/${encodeURIComponent(code)}`);
}

/** Opciones para el EntityCombobox de ciudad (value = código postal). */
export async function fetchCityOptions(query: string) {
  const { data } = await listCities({ page: 1, perPage: 20, q: query || undefined });
  return data.map((city) => ({
    value: city.code,
    label: `${city.name} — ${city.province} (${city.code})`,
  }));
}
