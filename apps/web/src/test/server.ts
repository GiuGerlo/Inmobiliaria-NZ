import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { City } from '@/features/cities/types';

const API = '/api/v1';

const USER = { id: 1, name: 'Nadina Zalazar', email: 'admin@nz.com' };

/** Store de ciudades en memoria, reseteable entre tests. */
let cities: City[] = [];

export function seedCities(rows: City[]): void {
  cities = [...rows];
}

export function resetStore(): void {
  cities = [
    { code: '2000', name: 'Rosario', province: 'Santa Fe' },
    { code: '5000', name: 'Córdoba', province: 'Córdoba' },
  ];
}

/** Handlers por defecto: usuario autenticado + CRUD de ciudades funcional. */
export const handlers = [
  http.get('/sanctum/csrf-cookie', () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/me`, () => HttpResponse.json({ data: USER })),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === 'wrong') {
      return HttpResponse.json(
        { message: 'Credenciales inválidas.', errors: { email: ['Credenciales inválidas.'] } },
        { status: 422 },
      );
    }
    return HttpResponse.json({ data: USER });
  }),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/cities`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? cities.filter(
          (c) => c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q),
        )
      : cities;
    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, from: 1, last_page: 1, per_page: 15, to: filtered.length, total: filtered.length },
      links: { first: null, last: null, prev: null, next: null },
    });
  }),

  http.post(`${API}/cities`, async ({ request }) => {
    const input = (await request.json()) as City;
    cities.push(input);
    return HttpResponse.json({ data: input }, { status: 201 });
  }),

  http.patch(`${API}/cities/:code`, async ({ request, params }) => {
    const input = (await request.json()) as City;
    cities = cities.map((c) => (c.code === params.code ? input : c));
    return HttpResponse.json({ data: input });
  }),

  http.delete(`${API}/cities/:code`, ({ params }) => {
    cities = cities.filter((c) => c.code !== params.code);
    return new HttpResponse(null, { status: 204 });
  }),
];

export const server = setupServer(...handlers);
export { API, USER };
