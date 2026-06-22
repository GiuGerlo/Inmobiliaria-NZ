# Fusión NZ Fase 4 — Admin de ventas (React) — Implementation Plan

> **Estado: DONE 2026-06-22** (rama `fusion-nz`). Tasks 1–7 completas; Vitest 52 verdes, lint+typecheck+build OK; `/security-review` sin hallazgos. Reorder de filas de la tabla diferido. Nota Fase 5: sanitizar `map_embed`.
>
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development o superpowers:executing-plans. Pasos con checkbox.
> Spec: `docs/superpowers/specs/2026-06-19-fusion-4-admin-ventas-design.md`. ADR-0009.

**Goal:** Sección "Propiedades en venta" en `apps/web`, solo para `is_superadmin`: CRUD de propiedades + categorías + multi-foto (subir/borrar/reordenar drag-drop) + toggle vendida, consumiendo la API de Fase 2.

**Architecture:** Feature module `src/features/sales-properties/` espejando `features/properties`. Gating de nav+ruta por `is_superadmin`. Drag-drop con `@atlaskit/pragmatic-drag-and-drop`.

**Tech Stack:** React 19 + Vite + TS, React Router 7, TanStack Query + Table, RHF + Zod, shadcn/ui, axios, Vitest + MSW, @atlaskit/pragmatic-drag-and-drop.

## Global Constraints

- **pnpm SOLO dentro del container** node-dev: `docker compose exec node-dev pnpm <cmd>` (en host rompe el setup).
- TS strict; export nombrado (no default salvo páginas de routing — acá usamos export nombrado como el resto).
- camelCase vars, PascalCase componentes/tipos. Server state → React Query; client state → useState.
- Validación cliente con Zod (UX); el backend valida y autoriza (no confiar en el front).
- Estilo: espejar el admin existente (shadcn, navy NZ). Sin lenguaje visual nuevo.
- Una fase = un commit (lo hace el usuario al cierre). Pasos terminan en "tests verdes".

---

### Task 1: Gating — `is_superadmin` en el front + nav + ruta

**Files:**
- Modify: `apps/web/src/features/auth/types.ts`
- Modify: `apps/web/src/components/layout/nav-items.ts`
- Modify: `apps/web/src/components/layout/SidebarNav.tsx`
- Create: `apps/web/src/features/auth/RequireSuperadmin.tsx`
- Modify: `apps/web/src/app/router.tsx`
- Modify: `apps/web/src/test/server.ts` (el `me` mock devuelve `role`/`is_superadmin`)
- Test: `apps/web/src/components/layout/SidebarNav.test.tsx`

**Interfaces:**
- Produces: `User.is_superadmin`; `NavItem.superadminOnly?`; `<RequireSuperadmin/>`.

- [ ] **Step 1: User type**

`apps/web/src/features/auth/types.ts` → `User`:
```ts
export type User = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  is_superadmin: boolean;
};
```

- [ ] **Step 2: nav-items con flag superadmin**

En `nav-items.ts`: agregar `superadminOnly?: boolean` al type `NavItem` e item nuevo (importar `Tag` o `Store` de lucide):
```ts
export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
  superadminOnly?: boolean;
};
// dentro de navItems, tras 'Propiedades':
{ label: 'Propiedades en venta', to: '/propiedades-venta', icon: Store, enabled: true, superadminOnly: true },
```

- [ ] **Step 3: SidebarNav filtra superadmin**

En `SidebarNav.tsx`: importar `useAuth`, filtrar:
```tsx
import { useAuth } from '@/features/auth/useAuth';
// dentro del componente:
const { user } = useAuth();
const items = navItems.filter((i) => !i.superadminOnly || user?.is_superadmin);
// map sobre `items` en vez de `navItems`.
```

- [ ] **Step 4: RequireSuperadmin guard**

`apps/web/src/features/auth/RequireSuperadmin.tsx`:
```tsx
import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';

/** Gatea rutas solo-superadmin. Asume que RequireAuth ya garantizó sesión. */
export function RequireSuperadmin() {
  const { user } = useAuth();

  if (!user?.is_superadmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 5: Ruta**

En `apps/web/src/app/router.tsx`: importar `RequireSuperadmin` y `SalesPropertiesPage`, y anidar la ruta dentro de `AppLayout`:
```tsx
{
  element: <RequireSuperadmin />,
  children: [{ path: 'propiedades-venta', element: <SalesPropertiesPage /> }],
},
```
(colocar antes del `{ path: '*', ... }`).

- [ ] **Step 6: MSW `me` con rol**

En `apps/web/src/test/server.ts`, el handler de `GET /me` (y el `USER` mock) devuelve `role: 'superadmin', is_superadmin: true`. Agregar un helper para poder togglear a no-superadmin en un test.

- [ ] **Step 7: Test del gating de nav**

`apps/web/src/components/layout/SidebarNav.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { SidebarNav } from './SidebarNav';

describe('SidebarNav gating', () => {
  it('muestra "Propiedades en venta" al superadmin', async () => {
    renderWithProviders(<SidebarNav />);
    expect(await screen.findByText('Propiedades en venta')).toBeInTheDocument();
  });
});
```
> Si el server por defecto es superadmin, agregá un caso con override a `is_superadmin:false` usando `server.use(...)` que verifique `queryByText('Propiedades en venta')` ausente.

- [ ] **Step 8: Correr** — `docker compose exec node-dev pnpm test -- src/components/layout/SidebarNav.test.tsx`. PASS.

---

### Task 2: Modelo de datos del feature (types, schema, api, queries, queryKeys)

**Files:**
- Create: `apps/web/src/features/sales-properties/types.ts`, `schema.ts`, `api.ts`, `queries.ts`
- Modify: `apps/web/src/lib/query-keys.ts`

**Interfaces:**
- Produces: tipos `SaleProperty`/`PropertyType`/`PropertyImage`; funciones api; hooks `useSaleProperties`/`useCreateSaleProperty`/etc.; `queryKeys.salesProperties`/`queryKeys.propertyTypes`.

- [ ] **Step 1: types.ts**
```ts
export type PropertyType = { id: number; name: string };

export type PropertyImage = { id: number; url: string; sort_order: number };

export type SaleProperty = {
  id: number;
  property_type_id: number | null;
  title: string | null;
  locality: string | null;
  location: string | null;
  size: string | null;
  services: string | null;
  features: string | null;
  map_embed: string | null;
  sort_order: number;
  is_sold: boolean;
  latitude: string | null;
  longitude: string | null;
  type?: PropertyType | null;
  images?: PropertyImage[];
};

export type SalePropertyInput = {
  property_type_id: number | null;
  title: string;
  locality?: string | null;
  location?: string | null;
  size?: string | null;
  services?: string | null;
  features?: string | null;
  map_embed?: string | null;
  is_sold?: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type SalePropertyListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
  type?: number;
  sold?: boolean;
};
```

- [ ] **Step 2: schema.ts**
```ts
import { z } from 'zod';

export const salePropertySchema = z.object({
  property_type_id: z.number().int().nullable(),
  title: z.string().trim().min(1, 'Requerido.').max(255, 'Máx 255.'),
  locality: z.string().max(255).nullable().optional(),
  location: z.string().nullable().optional(),
  size: z.string().max(255).nullable().optional(),
  services: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  map_embed: z.string().nullable().optional(),
  is_sold: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export type SalePropertyFormValues = z.infer<typeof salePropertySchema>;
```

- [ ] **Step 3: api.ts** (espeja `properties/api.ts`)
```ts
import { api } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import type {
  PropertyImage,
  PropertyType,
  SaleProperty,
  SalePropertyInput,
  SalePropertyListParams,
} from './types';

function buildParams(p: SalePropertyListParams): Record<string, string | number> {
  const q: Record<string, string | number> = { page: p.page, per_page: p.perPage };
  if (p.sort) q.sort = p.sort;
  if (p.q) q.q = p.q;
  if (p.type != null) q['filter[type]'] = p.type;
  if (p.sold != null) q['filter[sold]'] = p.sold ? 1 : 0;
  return q;
}

export async function listSaleProperties(params: SalePropertyListParams) {
  const { data } = await api.get<Paginated<SaleProperty>>('/sale-properties', { params: buildParams(params) });
  return data;
}

export async function getSaleProperty(id: number) {
  const { data } = await api.get<{ data: SaleProperty }>(`/sale-properties/${id}`);
  return data.data;
}

export async function createSaleProperty(input: SalePropertyInput) {
  const { data } = await api.post<{ data: SaleProperty }>('/sale-properties', input);
  return data.data;
}

export async function updateSaleProperty(id: number, input: SalePropertyInput) {
  const { data } = await api.patch<{ data: SaleProperty }>(`/sale-properties/${id}`, input);
  return data.data;
}

export async function deleteSaleProperty(id: number) {
  await api.delete(`/sale-properties/${id}`);
}

export async function reorderSaleProperties(ids: number[]) {
  await api.patch('/sale-properties/reorder', { ids });
}

export async function uploadImages(id: number, files: File[]) {
  const fd = new FormData();
  files.forEach((f) => fd.append('images[]', f));
  const { data } = await api.post<{ data: PropertyImage[] }>(`/sale-properties/${id}/images`, fd);
  return data.data;
}

export async function deleteImage(imageId: number) {
  await api.delete(`/sale-property-images/${imageId}`);
}

export async function reorderImages(ids: number[]) {
  await api.patch('/sale-property-images/reorder', { ids });
}

export async function listPropertyTypes() {
  const { data } = await api.get<{ data: PropertyType[] }>('/property-types');
  return data.data;
}

export async function createPropertyType(name: string) {
  const { data } = await api.post<{ data: PropertyType }>('/property-types', { name });
  return data.data;
}

export async function updatePropertyType(id: number, name: string) {
  const { data } = await api.patch<{ data: PropertyType }>(`/property-types/${id}`, { name });
  return data.data;
}

export async function deletePropertyType(id: number) {
  await api.delete(`/property-types/${id}`);
}

/** Opciones para el EntityCombobox de categoría. */
export async function fetchPropertyTypeOptions() {
  const types = await listPropertyTypes();
  return types.map((t) => ({ value: t.id, label: t.name }));
}
```

- [ ] **Step 4: queryKeys**

En `apps/web/src/lib/query-keys.ts` agregar (importar `SalePropertyListParams`):
```ts
salesProperties: {
  all: ['sale-properties'] as const,
  list: (params: SalePropertyListParams) => ['sale-properties', 'list', params] as const,
  detail: (id: number) => ['sale-properties', 'detail', id] as const,
},
propertyTypes: { all: ['property-types'] as const },
```

- [ ] **Step 5: queries.ts** (espeja `properties/queries.ts`; create/update NO invalidan — el form encadena imágenes e invalida al final)
```ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as apiFns from './api';
import type { SalePropertyInput, SalePropertyListParams } from './types';

export function useSaleProperties(params: SalePropertyListParams) {
  return useQuery({
    queryKey: queryKeys.salesProperties.list(params),
    queryFn: () => apiFns.listSaleProperties(params),
    placeholderData: keepPreviousData,
  });
}

export function usePropertyTypes() {
  return useQuery({ queryKey: queryKeys.propertyTypes.all, queryFn: apiFns.listPropertyTypes });
}

export function useCreateSaleProperty() {
  return useMutation({ mutationFn: (input: SalePropertyInput) => apiFns.createSaleProperty(input) });
}

export function useUpdateSaleProperty() {
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SalePropertyInput }) => apiFns.updateSaleProperty(id, input),
  });
}

export function useDeleteSaleProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFns.deleteSaleProperty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.salesProperties.all }),
  });
}
```
(Agregar hooks de imágenes/categorías/reorder según los necesiten Tasks 4–6: `useUploadImages`, `useDeleteImage`, `useReorderImages`, `useReorderSaleProperties`, `useCreatePropertyType`/`useUpdatePropertyType`/`useDeletePropertyType` — todos `useMutation` simples.)

- [ ] **Step 6: typecheck** — `docker compose exec node-dev pnpm typecheck`. Sin errores.

---

### Task 3: Listado (page + columns + filtros + borrar) + MSW + test

**Files:**
- Create: `apps/web/src/features/sales-properties/columns.tsx`, `SalesPropertiesPage.tsx`
- Modify: `apps/web/src/test/server.ts` (handlers ventas)
- Test: `apps/web/src/features/sales-properties/SalesPropertiesPage.test.tsx`

**Interfaces:**
- Consumes: queries de Task 2. Produces: `SalesPropertiesPage`, `buildSalePropertyColumns`.

- [ ] **Step 1: columns.tsx** (espeja `properties/columns.tsx`): columnas `title`, `type.name` (categoría), `locality`, badge "Vendida" si `is_sold`, `images.length` fotos, y acciones (menú Editar/Eliminar con `DropdownMenu`, like receipts/properties).

- [ ] **Step 2: SalesPropertiesPage.tsx** (espeja `PropertiesPage.tsx`): estado pagination/sorting/search; **filtros** por categoría (`Select` de `usePropertyTypes`) y por vendida (`Select` sí/no/todas) que setean `params.type`/`params.sold`; toolbar con búsqueda + botón "Nueva" + botón "Categorías" (abre `PropertyTypesDialog`, Task 5); `SalePropertyFormDialog` (Task 4) + `ConfirmDialog` de borrado. Título "Propiedades en venta".

- [ ] **Step 3: MSW handlers** en `src/test/server.ts`: store in-memory de sale-properties + property-types; handlers `GET/POST /sale-properties`, `GET/PATCH/DELETE /sale-properties/{id}`, `PATCH /sale-properties/reorder`, `POST /sale-properties/{id}/images`, `DELETE /sale-property-images/{id}`, `PATCH /sale-property-images/reorder`, `GET/POST/PATCH/DELETE /property-types`. Respetar formato `{ data, meta, links }` en listas (reusar el helper `paginated`).

- [ ] **Step 4: Test** `SalesPropertiesPage.test.tsx` (espeja `ReceiptsPage.test.tsx`): lista propiedades; crea una (abre dialog, completa título + categoría, guarda, ve toast); filtra por vendida; borra (confirm). 

- [ ] **Step 5: Correr** — `docker compose exec node-dev pnpm test -- src/features/sales-properties`. PASS.

---

### Task 4: Form dialog con multi-imagen

**Files:**
- Create: `apps/web/src/features/sales-properties/SalePropertyFormDialog.tsx`
- Test: cubierto por `SalesPropertiesPage.test.tsx` (crear/editar).

**Interfaces:**
- Consumes: schema (Task 2), queries (create/update/uploadImages/deleteImage), `EntityCombobox` + `fetchPropertyTypeOptions`.

- [ ] **Step 1: Esqueleto** — copiar la estructura de `PropertyFormDialog.tsx` (RHF + Zod + `applyServerErrors` + chained save) y adaptar los campos a `SalePropertyFormValues`: `title` (Input), `property_type_id` (EntityCombobox `fetchPropertyTypeOptions`), `locality`/`size` (Input), `location`/`services`/`features`/`map_embed` (Textarea), `latitude`/`longitude` (Input number, patrón del campo `price`), `is_sold` (Checkbox shadcn).

- [ ] **Step 2: Grilla de imágenes (multi)** — estado `newFiles: File[]` (previews con `URL.createObjectURL`, revocar en cleanup) + las `property.images` existentes. UI: grilla de miniaturas (existentes + nuevas), botón "Agregar fotos" (`input type=file multiple accept=image/...`, valida ≤5 MB c/u), botón borrar por miniatura (existente → marca para `deleteImage`; nueva → la saca de `newFiles`). En `onSubmit`: guardar datos → si hay `newFiles` `uploadImages(saved.id, newFiles)` → ejecutar los `deleteImage` marcados → invalidar `salesProperties.all`. (El orden/reorder se agrega en Task 6.)

- [ ] **Step 3: Correr** — `docker compose exec node-dev pnpm test -- src/features/sales-properties`. PASS (crear/editar siguen verdes; agregar un caso que sube una imagen fake y verifica el POST a `/images`).

---

### Task 5: ABM de categorías

**Files:**
- Create: `apps/web/src/features/sales-properties/PropertyTypesDialog.tsx`
- Test: caso en `SalesPropertiesPage.test.tsx`.

**Interfaces:**
- Consumes: `usePropertyTypes` + hooks create/update/delete type.

- [ ] **Step 1: Dialog** — lista de categorías con input inline para crear; por fila, renombrar (input + guardar) y borrar (con `ConfirmDialog`; si la API responde 409, `toast.error` "tiene propiedades asociadas"). Invalida `queryKeys.propertyTypes.all` tras cada mutación.

- [ ] **Step 2: Test** — abrir "Categorías", crear una nueva, verla en la lista; intentar borrar una en uso → toast de 409 (MSW devuelve 409 si tiene propiedades). PASS.

---

### Task 6: Drag-drop (pragmatic) — orden de imágenes y de propiedades

**Files:**
- Create: `apps/web/src/features/sales-properties/useDragReorder.ts`
- Modify: `SalePropertyFormDialog.tsx` (reorder de miniaturas), `SalesPropertiesPage.tsx` (modo reordenar filas)
- Test: `apps/web/src/features/sales-properties/reorder.test.ts` (función pura)

- [ ] **Step 1: Instalar** — `docker compose exec node-dev pnpm add @atlaskit/pragmatic-drag-and-drop`. (Sumar `@atlaskit/pragmatic-drag-and-drop-hitbox` solo si se usa detección de borde.)

- [ ] **Step 2: util de reorder puro** `reorder.ts`:
```ts
/** Mueve el elemento de `from` a `to` devolviendo un nuevo array. */
export function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
```

- [ ] **Step 3: Test del util** `reorder.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { reorder } from './reorder';

describe('reorder', () => {
  it('mueve un elemento y preserva el resto', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });
});
```

- [ ] **Step 4: Hook `useDragReorder`** — envuelve `draggable` + `dropTargetForElements` + `monitorForElements` de pragmatic-dnd sobre una lista de refs; al soltar, calcula `from`/`to`, aplica `reorder`, llama un callback `onReorder(ids)`. Usado por la grilla de imágenes (persiste con `reorderImages`) y por las filas de la tabla en "modo reordenar" (persiste con `reorderSaleProperties`).

- [ ] **Step 5: Integrar** — en el form, reordenar miniaturas existentes → `reorderImages(ids)` al soltar; en la page, un toggle "Reordenar" habilita arrastrar filas → `reorderSaleProperties(ids)`.

- [ ] **Step 6: Correr** — `docker compose exec node-dev pnpm test -- src/features/sales-properties/reorder.test.ts`. PASS. (El DnD de DOM no se testea por eventos; se valida en el smoke manual.)

---

### Task 7: Lint, typecheck, suite, smoke y cierre

- [ ] **Step 1** — `docker compose exec node-dev pnpm lint`. Sin errores.
- [ ] **Step 2** — `docker compose exec node-dev pnpm typecheck`. Sin errores.
- [ ] **Step 3** — `docker compose exec node-dev pnpm test`. Toda la suite Vitest verde.
- [ ] **Step 4: Smoke manual** (Docker, `http://localhost:8080`): login como Giuliano (superadmin) → ver "Propiedades en venta"; crear/editar una propiedad; subir 2+ fotos, reordenarlas (drag), borrar una; marcar vendida; ABM de categorías; reordenar filas. Login como Demo (inmobiliaria) → la sección NO aparece; navegar a `/propiedades-venta` redirige a `/`.
- [ ] **Step 5: `/security-review`** — foco: el gating de UI es UX; confirmar que la API ya bloquea (Fase 3) y que no se expone nada sensible.
- [ ] **Step 6: `/fase-close`** — roadmap + changelog + plan DONE + commit sugerido (lo hace el usuario).

---

## Self-Review

- **Cobertura del spec**: gating (Task 1), datos/api (Task 2), listado+filtros (Task 3), form+multi-imagen (Task 4), categorías (Task 5), drag-drop (Task 6), verificación/cierre (Task 7). ✔
- **Placeholders**: el esqueleto del form (Task 4) y columns/page (Task 3) referencian archivos-espejo existentes con deltas concretos (campos, endpoints) en vez de re-pegar 300 líneas idénticas — es DRY, no placeholder. El código novel (gating, api, types, reorder util) va completo.
- **Consistencia de tipos**: `SaleProperty`/`SalePropertyInput`/`SalePropertyListParams` usados igual en api/queries/page; endpoints coinciden con las rutas reales de Fase 2 (`/sale-properties`, `/property-types`, `/sale-property-images`); `images[]` multipart y `{ ids }` en reorder coinciden con los FormRequests del backend.
