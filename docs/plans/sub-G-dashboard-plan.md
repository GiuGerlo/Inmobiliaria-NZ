# Plan — Sub-G: Dashboard / Inicio

> Spec: `docs/superpowers/specs/2026-06-16-sub-G-dashboard-design.md`. Estado: **DONE 2026-06-16**
> (branch `fase/G-dashboard`). Una fase = un commit (lo hace Giuliano). Los 6 pasos completos; Pest
> 104 + Vitest 37 verdes; `/security-review` sin hallazgos. Sumó (pedidos del usuario): sidebar
> colapsable con animación + login redirige al inicio; y una **2ª ronda** de ampliación: accesos
> rápidos, progreso del mes, últimos recibos generados, contratos con saldo, y paneles "por hacer" +
> "hechos este mes" al pie de la página de Recibos. Ver changelog 2026-06-16 sub-G para el detalle.

## 1. Backend: scope + DashboardData

- `app/Models/Contract.php`: `scopeActive($q)` → `F_Inicio <= today AND F_Fin >= today` (tolera `F_Fin`
  null como activo).
- `app/Support/DashboardData.php` (nuevo, estilo `MonthlyPaymentsReport`):
  - `totals(): array` — propiedades, dueños, inquilinos, `Contract::active()->count()`, recibos del mes
    (`Receipt` filtrado por mes ES actual + año).
  - `expiringContracts(int $days = 90)` — activos con `F_Fin` entre hoy y hoy+$days, asc, eager
    owner/tenant/property; cada item con `days_left`.
  - `pendingReceipts()` — contratos activos sin recibo del mes actual (patrón `unpaid()` + `active()`),
    eager owner/tenant/property.
- Mes actual: `StoreReceiptRequest::MONTHS[now()->month - 1]`.
- **Done**: `DashboardData` instanciable en tinker devuelve los 3 datasets correctos contra la DB real.

## 2. Backend: Resource + controller + ruta

- `app/Http/Resources/DashboardResource.php`: arma
  `{ totals, expiring_contracts: [{contract_id, owner, tenant, property, f_fin, days_left}],
  pending_receipts: [{contract_id, owner, tenant, property}] }` (camelCase como el resto).
- `app/Http/Controllers/Api/V1/DashboardController.php` (invokable) → `DashboardResource`.
- `routes/api.php`: `Route::get('/dashboard', DashboardController::class);` en el grupo
  `auth:sanctum` + `NoStoreHeaders`.
- **Done**: `GET /api/v1/dashboard` responde 200 + shape autenticado, 401 sin sesión.

## 3. Frontend: feature slice dashboard

- `apps/web/src/features/dashboard/`: `types.ts`, `api.ts` (`getDashboard()`), `queries.ts`
  (`useDashboard()`), query key en `lib/query-keys.ts`.
- `DashboardPage.tsx` con skill **`frontend-design`** (shadcn Card/Badge/Table, tema navy NZ):
  - Stat cards (totales) con íconos lucide.
  - "Recibos pendientes del mes (N)" — tabla corta + "Crear recibo" por fila + empty state.
  - "Contratos por vencer · 90 días (N)" — tabla + badge urgencia (rojo <30d, ámbar <60d) + empty state.
  - Sub-componentes por archivo si crece.
- **Done**: la página renderiza los 3 bloques con datos reales del endpoint.

## 4. Frontend: routing + nav + prefill recibo

- `app/router.tsx`: `index: true` → `<DashboardPage />`; catch-all `*` → `Navigate to "/"`.
- `components/layout/nav-items.ts`: item "Inicio" (`LayoutDashboard`) al tope, `to: '/'`.
- "Crear recibo" desde un pendiente: `navigate('/recibos', { state: { createForContract: id } })`;
  `ReceiptsPage` lee `location.state` al montar y abre `ReceiptFormDialog` con `defaultContractId`
  (prop opcional nueva, reusa `EntityCombobox`). *Ponytail:* si la wiring cruzada se complica, v1
  linkea a `/recibos` a secas.
- **Done**: Inicio es la landing; nav muestra "Inicio"; crear recibo desde un pendiente abre el form
  con el contrato precargado.

## 5. Tests

- Pest: `tests/Unit/DashboardDataTest.php` (totales, borde 90d, pendientes excluye vencidos/ya-pagados)
  + `tests/Feature/DashboardTest.php` (401/200 + shape).
- Vitest: `features/dashboard/DashboardPage.test.tsx` (MSW: cards + listas + empty states).
- **Done**: `pest --filter=Dashboard` y `pnpm test` verdes; suite completa sin regresión.

## 6. Cierre

- Verificación real en :8080 (contadores vs phpMyAdmin, prefill recibo).
- `/security-review` del branch.
- `docs/changelog.md` + `docs/roadmap.md` (sub-G DONE) + plan DONE + sugerir commit (caveman-commit).
