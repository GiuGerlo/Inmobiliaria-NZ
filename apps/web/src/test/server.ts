import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { City } from '@/features/cities/types';
import type { PaymentMethod } from '@/features/payment-methods/types';
import type { Owner } from '@/features/owners/types';
import type { Tenant } from '@/features/tenants/types';
import type { Property } from '@/features/properties/types';

const API = '/api/v1';

const USER = { id: 1, name: 'Nadina Zalazar', email: 'admin@nz.com' };

/** Envuelve filas en la forma paginada de Laravel (1 sola página, suficiente para tests). */
function paginated<T>(rows: T[]) {
  return {
    data: rows,
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 15, to: rows.length, total: rows.length },
    links: { first: null, last: null, prev: null, next: null },
  };
}

/** Stores en memoria, reseteables entre tests. */
let cities: City[] = [];
let paymentMethods: PaymentMethod[] = [];
let owners: Owner[] = [];
let tenants: Tenant[] = [];
let properties: Property[] = [];

export function seedCities(rows: City[]): void {
  cities = [...rows];
}

function cityByCode(code: string): City | undefined {
  return cities.find((c) => c.code === code);
}

export function resetStore(): void {
  cities = [
    { code: '2000', name: 'Rosario', province: 'Santa Fe' },
    { code: '5000', name: 'Córdoba', province: 'Córdoba' },
  ];
  paymentMethods = [
    { id: 1, description: 'Efectivo' },
    { id: 2, description: 'Transferencia' },
  ];
  owners = [
    { id: 1, name: 'Juan Pérez', phone: '341 555-1', email: 'juan@nz.com', city_code: '2000', city: cities[0] },
    { id: 2, name: 'Ana Gómez', phone: '351 555-2', email: 'ana@nz.com', city_code: '5000', city: cities[1] },
  ];
  tenants = [
    { id: 1, name: 'María López', phone: '341 555-3', email: 'maria@nz.com', city_code: '2000', city: cities[0] },
    { id: 2, name: 'Pedro Díaz', phone: '351 555-4', email: 'pedro@nz.com', city_code: '5000', city: cities[1] },
  ];
  properties = [
    {
      id: 1,
      address: 'Av. Pellegrini 1234',
      city_code: '2000',
      type: 'Departamento',
      services: 'Agua, luz',
      price: 120000,
      features: '2 amb',
      photo_url: null,
      city: cities[0],
    },
    {
      id: 2,
      address: 'Bv. Oroño 500',
      city_code: '5000',
      type: 'Casa',
      services: 'Todos',
      price: 250000,
      features: '3 dorm',
      photo_url: null,
      city: cities[1],
    },
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

  http.get(`${API}/payment-methods`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? paymentMethods.filter((p) => p.description.toLowerCase().includes(q))
      : paymentMethods;
    return HttpResponse.json(paginated(filtered));
  }),

  http.post(`${API}/payment-methods`, async ({ request }) => {
    const input = (await request.json()) as { description: string };
    const created = { id: paymentMethods.length + 1, description: input.description };
    paymentMethods.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/payment-methods/:id`, async ({ request, params }) => {
    const input = (await request.json()) as { description: string };
    const id = Number(params.id);
    const updated = { id, description: input.description };
    paymentMethods = paymentMethods.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/payment-methods/:id`, ({ params }) => {
    paymentMethods = paymentMethods.filter((p) => p.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/owners`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? owners.filter(
          (o) => o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q),
        )
      : owners;
    return HttpResponse.json(paginated(filtered));
  }),

  http.post(`${API}/owners`, async ({ request }) => {
    const input = (await request.json()) as Omit<Owner, 'id' | 'city'>;
    const created: Owner = {
      id: owners.length + 1,
      ...input,
      city: cityByCode(input.city_code),
    };
    owners.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/owners/:id`, async ({ request, params }) => {
    const input = (await request.json()) as Omit<Owner, 'id' | 'city'>;
    const id = Number(params.id);
    const updated: Owner = { id, ...input, city: cityByCode(input.city_code) };
    owners = owners.map((o) => (o.id === id ? updated : o));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/owners/:id`, ({ params }) => {
    owners = owners.filter((o) => o.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/tenants`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? tenants.filter(
          (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
        )
      : tenants;
    return HttpResponse.json(paginated(filtered));
  }),

  http.post(`${API}/tenants`, async ({ request }) => {
    const input = (await request.json()) as Omit<Tenant, 'id' | 'city'>;
    const created: Tenant = { id: tenants.length + 1, ...input, city: cityByCode(input.city_code) };
    tenants.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/tenants/:id`, async ({ request, params }) => {
    const input = (await request.json()) as Omit<Tenant, 'id' | 'city'>;
    const id = Number(params.id);
    const updated: Tenant = { id, ...input, city: cityByCode(input.city_code) };
    tenants = tenants.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/tenants/:id`, ({ params }) => {
    tenants = tenants.filter((t) => t.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/properties`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? properties.filter(
          (p) => p.address.toLowerCase().includes(q) || p.features.toLowerCase().includes(q),
        )
      : properties;
    return HttpResponse.json(paginated(filtered));
  }),

  http.post(`${API}/properties`, async ({ request }) => {
    const input = (await request.json()) as Omit<Property, 'id' | 'city' | 'photo_url'>;
    const created: Property = {
      id: properties.length + 1,
      ...input,
      photo_url: null,
      city: cityByCode(input.city_code),
    };
    properties.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/properties/:id`, async ({ request, params }) => {
    const input = (await request.json()) as Omit<Property, 'id' | 'city' | 'photo_url'>;
    const id = Number(params.id);
    const existing = properties.find((p) => p.id === id);
    const updated: Property = {
      id,
      ...input,
      photo_url: existing?.photo_url ?? null,
      city: cityByCode(input.city_code),
    };
    properties = properties.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/properties/:id`, ({ params }) => {
    properties = properties.filter((p) => p.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/properties/:id/photo`, ({ params }) => {
    const id = Number(params.id);
    const url = `/storage/propiedades/${id}/foto.webp`;
    properties = properties.map((p) => (p.id === id ? { ...p, photo_url: url } : p));
    const updated = properties.find((p) => p.id === id);
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/properties/:id/photo`, ({ params }) => {
    const id = Number(params.id);
    properties = properties.map((p) => (p.id === id ? { ...p, photo_url: null } : p));
    return new HttpResponse(null, { status: 204 });
  }),
];

export const server = setupServer(...handlers);
export { API, USER };
