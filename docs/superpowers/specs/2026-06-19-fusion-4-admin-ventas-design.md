# Fusión NZ Fase 4 — Admin de ventas (React) — Design

- **Fecha**: 2026-06-19
- **Estado**: aprobado
- **Track**: Fusión NZ, Fase 4. Spec paraguas: `2026-06-19-fusion-nz-design.md`. ADR-0009.
- **Depende de**: Fase 2 (API ventas), Fase 3 (roles + `is_superadmin` en `/me`), sub-E (fundación SPA).

## Problema

El backend de ventas (Fase 2) y el gating por rol (Fase 3) existen, pero no hay UI para gestionarlo: hoy las
propiedades en venta solo se migran por comando. Falta la sección de admin en `apps/web` para que el
**superadmin** dé de alta/baja/edite propiedades, categorías y fotos, y marque vendidas.

## Objetivo

Una sección "Propiedades en venta" en el admin React, **visible solo para `is_superadmin`**, que consuma la
API de Fase 2: CRUD de propiedades, ABM de categorías, multi-upload + orden de fotos, toggle vendida, filtros.
Espeja los patrones y el estilo del admin existente (navy NZ, shadcn). El sitio público es Fase 5.

## Decisiones (acordadas con el usuario)

1. **Drag-drop** = `@atlaskit/pragmatic-drag-and-drop`. Instalar con **pnpm dentro del container** node-dev
   (`pnpm` en host rompe el setup). Se usa para reordenar fotos y el orden de propiedades.
2. **Imágenes** = se gestionan **dentro del form de edición** (grilla: subir varias, borrar, reordenar).
3. **Gating** = nav item + ruta solo para `is_superadmin` (expuesto por `/me`). El backend ya bloquea las
   escrituras (Gate `manage-sales`); el gating de UI es UX, no seguridad.

## Arquitectura

Feature module `src/features/sales-properties/` espejando `features/properties`/`receipts`:
`types.ts` · `schema.ts` · `api.ts` · `queries.ts` · `columns.tsx` · `SalesPropertiesPage.tsx` ·
`SalePropertyFormDialog.tsx` · `PropertyTypesDialog.tsx` · `useDragReorder.ts` · `*.test.tsx`.

- **API** (`src/lib/api.ts` axios): `sale-properties` (list con `filter[type]`/`filter[sold]`/`q`/sort/page,
  show, create, update, delete, `reorder`), imágenes (`{id}/images` multipart `images[]`, delete, reorder),
  `property-types` (list + CRUD).
- **Estado servidor** vía react-query (queryKeys nuevos, invalidación tras mutaciones).
- **DataTable** server-side existente + toolbar (búsqueda, filtro categoría/vendida, "Nueva", "Categorías").
- **Form** RHF + Zod + shadcn `Dialog`; FK categoría con `EntityCombobox`; imágenes con preview
  (`URL.createObjectURL`) ampliado a múltiples; reorder con pragmatic-dnd.
- **Gating**: `User` (front) suma `role`/`is_superadmin`; `nav-items.ts` marca el item superadmin-only y
  `SidebarNav` lo filtra; `router.tsx` envuelve la ruta en `RequireSuperadmin` (redirige a `/` si no).

## Campos del form

`title` (requerido), `property_type_id` (combobox), `locality`, `location`, `size`, `services` (textarea),
`features` (textarea), `map_embed` (textarea), `latitude`/`longitude` (numéricos), `is_sold` (switch/checkbox),
+ grilla de imágenes.

## Testing

Vitest + MSW: extender `src/test/server.ts` con handlers de `sale-properties`/`property-types` y `me` con
`is_superadmin`. `SalesPropertiesPage.test.tsx`: lista, crea, filtra (categoría/vendida), borra; gating
(la sección no aparece para no-superadmin). La lógica de reorder se testea como función pura (no eventos DnD).

## Verificación / done

- `pnpm lint` + `pnpm typecheck` + `pnpm test` verdes (en container). Smoke: superadmin gestiona todo;
  inmobiliaria no ve la sección y la ruta redirige. `/security-review`. `/fase-close`.

## Fuera de alcance

- Sitio público Next (Fase 5). Motor PDF (Fase 6). Deploy (Fase 7).
- Gestión de usuarios/roles desde la UI (no hay ABM de usuarios todavía).
