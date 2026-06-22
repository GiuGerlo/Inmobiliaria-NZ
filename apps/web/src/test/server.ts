import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { City } from '@/features/cities/types';
import type { PaymentMethod } from '@/features/payment-methods/types';
import type { Owner } from '@/features/owners/types';
import type { Tenant } from '@/features/tenants/types';
import type { Property } from '@/features/properties/types';
import type { Contract } from '@/features/contracts/types';
import type { Receipt, ReceiptInput } from '@/features/receipts/types';
import type { PropertyType, SaleProperty } from '@/features/sales-properties/types';

const API = '/api/v1';

const USER = {
  id: 1,
  name: 'Nadina Zaranich',
  email: 'admin@nz.com',
  role: 'superadmin',
  is_superadmin: true,
};

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
let contracts: Contract[] = [];
let receipts: Receipt[] = [];

type WaMessage = {
  id: number;
  batch_id: string | null;
  type: string;
  recipient_phone: string;
  recipient_name: string | null;
  body: string | null;
  status: 'queued' | 'sent' | 'failed';
  error: string | null;
  sent_at: string | null;
  created_at: string | null;
};
let waMessages: WaMessage[] = [];
let waBatches: Record<string, WaMessage[]> = {};
let waSeq = 0;

let propertyTypes: PropertyType[] = [];
let saleProperties: SaleProperty[] = [];
let saleSeq = 0;
let imageSeq = 0;

function withTypeRelation(p: SaleProperty): SaleProperty {
  return { ...p, type: propertyTypes.find((t) => t.id === p.property_type_id) ?? null };
}

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
  contracts = [
    {
      id: 1,
      owner_id: 1,
      tenant_id: 1,
      property_id: 1,
      start_date: '2025-01-01',
      end_date: '2026-01-01',
      balance: 0,
      certification: 'Si',
      owner: owners[0],
      tenant: tenants[0],
      property: properties[0],
    },
    {
      id: 2,
      owner_id: 2,
      tenant_id: 2,
      property_id: 2,
      start_date: '2025-03-01',
      end_date: '2026-03-01',
      balance: 5000,
      certification: 'No',
      owner: owners[1],
      tenant: tenants[1],
      property: properties[1],
    },
  ];
  receipts = [
    {
      number: 1,
      contract_id: 1,
      payment_method_id: 1,
      paid_at: '2025-01-05',
      property_amount: 120000,
      municipal_amount: 0,
      water_amount: 0,
      electricity_amount: 0,
      gas_amount: 0,
      repairs_amount: 0,
      funeral_amount: 0,
      fees_amount: 0,
      month: 'Enero',
      year: 2025,
      comments: null,
    },
    {
      number: 2,
      contract_id: 2,
      payment_method_id: 2,
      paid_at: '2025-02-05',
      property_amount: 250000,
      municipal_amount: 0,
      water_amount: 0,
      electricity_amount: 0,
      gas_amount: 0,
      repairs_amount: 0,
      funeral_amount: 0,
      fees_amount: 0,
      month: 'Febrero',
      year: 2025,
      comments: null,
    },
  ];
  waMessages = [];
  waBatches = {};
  waSeq = 0;

  propertyTypes = [
    { id: 1, name: 'Casas' },
    { id: 2, name: 'Terrenos' },
  ];
  saleProperties = [
    {
      id: 1,
      property_type_id: 1,
      title: 'Casa céntrica',
      locality: 'Guatimozín',
      location: 'Centro',
      size: '200 m2',
      services: 'Luz, agua',
      features: '3 dormitorios',
      map_embed: null,
      sort_order: 0,
      is_sold: false,
      latitude: null,
      longitude: null,
      images: [
        { id: 1, url: '/storage/sale-properties/1/a.webp', sort_order: 0 },
        { id: 2, url: '/storage/sale-properties/1/b.webp', sort_order: 1 },
      ],
    },
    {
      id: 2,
      property_type_id: 2,
      title: 'Terreno esquina',
      locality: 'Arias',
      location: 'Ruta 8',
      size: '500 m2',
      services: null,
      features: null,
      map_embed: null,
      sort_order: 1,
      is_sold: true,
      latitude: null,
      longitude: null,
      images: [],
    },
  ];
  saleSeq = 2;
  imageSeq = 2;
}

function withReceiptRelations(receipt: Receipt): Receipt {
  return {
    ...receipt,
    contract: contracts.find((c) => c.id === receipt.contract_id),
    payment_method: paymentMethods.find((p) => p.id === receipt.payment_method_id),
  };
}

function withContractRelations(contract: Contract): Contract {
  return {
    ...contract,
    owner: owners.find((o) => o.id === contract.owner_id),
    tenant: tenants.find((t) => t.id === contract.tenant_id),
    property: properties.find((p) => p.id === contract.property_id),
  };
}

/** Handlers por defecto: usuario autenticado + CRUD de ciudades funcional. */
export const handlers = [
  http.get('/sanctum/csrf-cookie', () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/me`, () => HttpResponse.json({ data: USER })),

  http.get(`${API}/dashboard`, () =>
    HttpResponse.json({
      data: {
        totals: {
          properties: properties.length,
          owners: owners.length,
          tenants: tenants.length,
          active_contracts: contracts.length,
          receipts_this_month: 0,
        },
        pending_receipts: [],
        expiring_contracts: [],
        latest_receipts: [],
        contracts_with_balance: [],
      },
    }),
  ),

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

  http.get(`${API}/contracts`, ({ request }) => {
    const sp = new URL(request.url).searchParams;
    const cert = sp.get('filter[certification]');
    const ownerId = sp.get('filter[owner_id]');
    const tenantId = sp.get('filter[tenant_id]');
    const startFrom = sp.get('filter[start_from]');
    const startTo = sp.get('filter[start_to]');
    let filtered = contracts;
    if (cert) filtered = filtered.filter((c) => c.certification === cert);
    if (ownerId) filtered = filtered.filter((c) => c.owner_id === Number(ownerId));
    if (tenantId) filtered = filtered.filter((c) => c.tenant_id === Number(tenantId));
    if (startFrom) filtered = filtered.filter((c) => c.start_date >= startFrom);
    if (startTo) filtered = filtered.filter((c) => c.start_date <= startTo);
    return HttpResponse.json(paginated(filtered.map(withContractRelations)));
  }),

  http.post(`${API}/contracts`, async ({ request }) => {
    const input = (await request.json()) as Omit<Contract, 'id' | 'owner' | 'tenant' | 'property'>;
    const created = withContractRelations({ ...input, id: contracts.length + 1, balance: input.balance ?? 0 });
    contracts.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/contracts/:id`, async ({ request, params }) => {
    const input = (await request.json()) as Omit<Contract, 'id' | 'owner' | 'tenant' | 'property'>;
    const id = Number(params.id);
    const updated = withContractRelations({ ...input, id, balance: input.balance ?? 0 });
    contracts = contracts.map((c) => (c.id === id ? updated : c));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/contracts/:id`, ({ params }) => {
    contracts = contracts.filter((c) => c.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/receipts`, ({ request }) => {
    const sp = new URL(request.url).searchParams;
    const contractId = sp.get('filter[contract_id]');
    const paymentMethodId = sp.get('filter[payment_method_id]');
    const month = sp.get('filter[month]');
    const year = sp.get('filter[year]');
    let filtered = receipts;
    if (contractId) filtered = filtered.filter((r) => r.contract_id === Number(contractId));
    if (paymentMethodId)
      filtered = filtered.filter((r) => r.payment_method_id === Number(paymentMethodId));
    if (month) filtered = filtered.filter((r) => r.month === month);
    if (year) filtered = filtered.filter((r) => r.year === Number(year));
    return HttpResponse.json(paginated(filtered.map(withReceiptRelations)));
  }),

  http.post(`${API}/receipts`, async ({ request }) => {
    const input = (await request.json()) as ReceiptInput;
    const created = withReceiptRelations({
      number: receipts.length + 1,
      ...input,
      municipal_amount: input.municipal_amount ?? 0,
      water_amount: input.water_amount ?? 0,
      electricity_amount: input.electricity_amount ?? 0,
      gas_amount: input.gas_amount ?? 0,
      repairs_amount: input.repairs_amount ?? 0,
      funeral_amount: input.funeral_amount ?? 0,
      fees_amount: input.fees_amount ?? 0,
      comments: input.comments ?? null,
    });
    receipts.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/receipts/:number`, async ({ request, params }) => {
    const input = (await request.json()) as ReceiptInput;
    const number = Number(params.number);
    const updated = withReceiptRelations({
      number,
      ...input,
      municipal_amount: input.municipal_amount ?? 0,
      water_amount: input.water_amount ?? 0,
      electricity_amount: input.electricity_amount ?? 0,
      gas_amount: input.gas_amount ?? 0,
      repairs_amount: input.repairs_amount ?? 0,
      funeral_amount: input.funeral_amount ?? 0,
      fees_amount: input.fees_amount ?? 0,
      comments: input.comments ?? null,
    });
    receipts = receipts.map((r) => (r.number === number ? updated : r));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/receipts/:number`, ({ params }) => {
    receipts = receipts.filter((r) => r.number !== Number(params.number));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/receipts/:number/whatsapp`, async ({ request, params }) => {
    const input = (await request.json()) as { type: string; phone?: string };
    return HttpResponse.json(
      { data: { id: 1, receipt_id: Number(params.number), type: input.type, status: 'queued' } },
      { status: 202 },
    );
  }),

  http.post(`${API}/whatsapp/payment-reminders`, async ({ request }) => {
    const input = (await request.json()) as { tenant_ids: number[]; deadline: string };
    const batchId = `batch-${Date.now()}`;
    const now = new Date().toISOString();
    const msgs: WaMessage[] = input.tenant_ids.map((id) => {
      const tenant = tenants.find((t) => t.id === id);
      return {
        id: ++waSeq,
        batch_id: batchId,
        type: 'recordatorio_pago',
        recipient_phone: tenant?.phone ?? '',
        recipient_name: tenant?.name ?? null,
        body: `Buen día! ... hasta el día ${input.deadline}.`,
        status: 'sent',
        error: null,
        sent_at: now,
        created_at: now,
      };
    });
    waBatches[batchId] = msgs;
    waMessages.unshift(...msgs);
    return HttpResponse.json({ batch_id: batchId, total: msgs.length, skipped: [] }, { status: 202 });
  }),

  http.get(`${API}/whatsapp/batches/:batch`, ({ params }) => {
    const msgs = waBatches[String(params.batch)] ?? [];
    return HttpResponse.json({
      batch_id: String(params.batch),
      total: msgs.length,
      sent: msgs.filter((m) => m.status === 'sent').length,
      failed: msgs.filter((m) => m.status === 'failed').length,
      queued: msgs.filter((m) => m.status === 'queued').length,
      messages: msgs,
    });
  }),

  http.post(`${API}/whatsapp/batches/:batch/retry`, () =>
    HttpResponse.json({ batch_id: `retry-${Date.now()}`, total: 0 }, { status: 202 }),
  ),

  http.post(`${API}/whatsapp/missing-items`, async ({ request }) => {
    const input = (await request.json()) as { tenant_id: number; message: string };
    const tenant = tenants.find((t) => t.id === input.tenant_id);
    const now = new Date().toISOString();
    const msg: WaMessage = {
      id: ++waSeq,
      batch_id: `batch-${Date.now()}`,
      type: 'recordatorio_faltante',
      recipient_phone: tenant?.phone ?? '',
      recipient_name: tenant?.name ?? null,
      body: `Hola ${tenant?.name}, ... ${input.message}.`,
      status: 'sent',
      error: null,
      sent_at: now,
      created_at: now,
    };
    waMessages.unshift(msg);
    return HttpResponse.json({ data: msg }, { status: 202 });
  }),

  http.get(`${API}/whatsapp/messages`, () => HttpResponse.json(paginated(waMessages))),

  // ── Ventas (Fusión NZ) ──
  http.get(`${API}/property-types`, () => HttpResponse.json({ data: propertyTypes })),

  http.post(`${API}/property-types`, async ({ request }) => {
    const input = (await request.json()) as { name: string };
    if (propertyTypes.some((t) => t.name === input.name)) {
      return HttpResponse.json(
        { message: 'Duplicada.', errors: { name: ['Ya existe.'] } },
        { status: 422 },
      );
    }
    const created = { id: propertyTypes.length + 10, name: input.name };
    propertyTypes.push(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch(`${API}/property-types/:id`, async ({ request, params }) => {
    const input = (await request.json()) as { name: string };
    const id = Number(params.id);
    const updated = { id, name: input.name };
    propertyTypes = propertyTypes.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json({ data: updated });
  }),

  http.delete(`${API}/property-types/:id`, ({ params }) => {
    const id = Number(params.id);
    if (saleProperties.some((p) => p.property_type_id === id)) {
      return HttpResponse.json({ message: 'Tiene propiedades asociadas.' }, { status: 409 });
    }
    propertyTypes = propertyTypes.filter((t) => t.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/sale-properties`, ({ request }) => {
    const sp = new URL(request.url).searchParams;
    const q = sp.get('q')?.toLowerCase();
    const type = sp.get('filter[type]');
    const sold = sp.get('filter[sold]');
    let filtered = saleProperties;
    if (q)
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) || p.locality?.toLowerCase().includes(q),
      );
    if (type) filtered = filtered.filter((p) => p.property_type_id === Number(type));
    if (sold != null) filtered = filtered.filter((p) => p.is_sold === (sold === '1'));
    return HttpResponse.json(paginated(filtered.map(withTypeRelation)));
  }),

  http.get(`${API}/sale-properties/:id`, ({ params }) => {
    const p = saleProperties.find((x) => x.id === Number(params.id));
    if (!p) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: withTypeRelation(p) });
  }),

  http.post(`${API}/sale-properties`, async ({ request }) => {
    const input = (await request.json()) as Partial<SaleProperty>;
    const created: SaleProperty = {
      id: ++saleSeq,
      property_type_id: input.property_type_id ?? null,
      title: input.title ?? null,
      locality: input.locality ?? null,
      location: input.location ?? null,
      size: input.size ?? null,
      services: input.services ?? null,
      features: input.features ?? null,
      map_embed: input.map_embed ?? null,
      sort_order: saleProperties.length,
      is_sold: input.is_sold ?? false,
      latitude: null,
      longitude: null,
      images: [],
    };
    saleProperties.push(created);
    return HttpResponse.json({ data: withTypeRelation(created) }, { status: 201 });
  }),

  http.patch(`${API}/sale-properties/reorder`, async ({ request }) => {
    const { ids } = (await request.json()) as { ids: number[] };
    ids.forEach((id, i) => {
      saleProperties = saleProperties.map((p) => (p.id === id ? { ...p, sort_order: i } : p));
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API}/sale-properties/:id`, async ({ request, params }) => {
    const input = (await request.json()) as Partial<SaleProperty>;
    const id = Number(params.id);
    const existing = saleProperties.find((p) => p.id === id);
    if (!existing) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...input, id };
    saleProperties = saleProperties.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json({ data: withTypeRelation(updated) });
  }),

  http.delete(`${API}/sale-properties/:id`, ({ params }) => {
    saleProperties = saleProperties.filter((p) => p.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/sale-properties/:id/images`, ({ params }) => {
    const id = Number(params.id);
    const img = { id: ++imageSeq, url: `/storage/sale-properties/${id}/${imageSeq}.webp`, sort_order: 0 };
    saleProperties = saleProperties.map((p) =>
      p.id === id ? { ...p, images: [...(p.images ?? []), img] } : p,
    );
    return HttpResponse.json({ data: [img] });
  }),

  http.delete(`${API}/sale-property-images/:imageId`, ({ params }) => {
    const imageId = Number(params.imageId);
    saleProperties = saleProperties.map((p) => ({
      ...p,
      images: (p.images ?? []).filter((img) => img.id !== imageId),
    }));
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API}/sale-property-images/reorder`, () => new HttpResponse(null, { status: 204 })),
];

export const server = setupServer(...handlers);
export { API, USER };
