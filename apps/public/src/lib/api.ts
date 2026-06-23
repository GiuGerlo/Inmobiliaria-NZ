import { cache } from 'react';
import type { PropertyType, SaleProperty } from './types';

// Fetch SOLO en build/server (SSG). El browser no llama a esta API → ver nextjs-ssg.md.
const API = process.env.API_INTERNAL_URL ?? 'http://nginx/api/v1';

interface Paginated<T> {
  data: T[];
  meta?: { current_page: number; last_page: number };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json' },
    // `output: export` exige fetch estático: los datos se traen una vez en build.
    cache: 'force-cache',
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Trae el catálogo completo paginando hasta agotar (≈decenas de propiedades). */
export async function fetchAllSaleProperties(): Promise<SaleProperty[]> {
  const all: SaleProperty[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const body = await getJson<Paginated<SaleProperty>>(
      `/sale-properties?per_page=100&sort=sort_order&page=${page}`,
    );
    all.push(...body.data);
    lastPage = body.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);

  return all;
}

export async function fetchPropertyTypes(): Promise<PropertyType[]> {
  const body = await getJson<{ data: PropertyType[] }>('/property-types');
  return body.data;
}

// Versiones cacheadas: dedupean el fetch dentro de un mismo render (p.ej. el
// page + su generateMetadata en una página de detalle comparten la llamada).
export const getCatalog = cache(fetchAllSaleProperties);
export const getTypes = cache(fetchPropertyTypes);

export async function findBySlug(slug: string): Promise<SaleProperty | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}
