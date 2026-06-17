# Sub-G — Dashboard / Inicio — Design

- **Fecha**: 2026-06-16
- **Estado**: aprobado
- **Depende de**: sub-D (API + modelos Contract/Receipt), sub-E (frontend core), sub-F (módulo Recibos).

## Problema

La app reformulada tiene el CRUD de los 7 recursos y los PDFs, pero al entrar cae directo en la lista
de Ciudades. No hay una pantalla que dé **visión operativa de un vistazo** — algo que el legacy PHP
nunca tuvo. El trabajo mensual de la inmobiliaria es repetitivo (emitir el recibo de cada contrato
activo) y los contratos vencen sin aviso.

## Objetivo

Una pantalla de **Inicio** (`/`, landing post-login) con tres bloques accionables, **sin métricas de
ingresos** (decisión del usuario). Linda (skill `frontend-design`) sobre el tema navy NZ y los
primitivos shadcn ya instalados.

## Widgets (acordados con el usuario)

1. **Recibos no hechos este mes** — contratos **activos** sin recibo del mes/año actual. El accionable
   clave: a quién falta emitirle el recibo. Cada fila ofrece "Crear recibo" (prefill del contrato).
   Reusa la lógica de `MonthlyPaymentsReport::unpaid()`, agregando el filtro de contrato activo (la
   lista del PDF mensual incluye vencidos; en el dashboard no tiene sentido).
2. **Contratos por vencer** — `F_Fin` dentro de **90 días**, ordenados por vencimiento ascendente, con
   "vence en X días" y badge de urgencia.
3. **Totales del sistema** — contadores: propiedades, dueños, inquilinos, contratos activos, recibos
   del mes.

## Decisiones

1. **Sin ingresos / comisión.** El usuario lo descartó explícitamente.
2. **Un endpoint agregado** `GET /api/v1/dashboard` (no un endpoint por widget): un round-trip, una
   query React. Es interno y las listas son cortas.
3. **Contrato activo** = `F_Inicio <= hoy <= F_Fin`. Si `F_Fin` fuese null → activo, pero no aparece
   en "por vencer". (Supuesto: `F_Fin` no nullable en la práctica.)
4. **Ventana por vencer**: 90 días.
5. **Landing**: el índice `/` pasa a renderizar el Dashboard (reemplaza el redirect a `/ciudades`).

## Arquitectura

**Backend**: endpoint GET bajo `auth:sanctum` + `NoStoreHeaders` (devuelve PII de inquilinos/dueños).
La lógica vive en `App\Support\DashboardData` (testeable sin HTTP, mismo estilo que
`MonthlyPaymentsReport`): `totals()`, `expiringContracts(int $days = 90)`, `pendingReceipts()`. El mes
actual se resuelve con `StoreReceiptRequest::MONTHS[now->month-1]` (`Mes_Rend` es nombre en español).
`Contract::scopeActive` encapsula la condición de vigencia y se reutiliza en totales y pendientes. Un
`DashboardResource` mapea los nombres legacy al camelCase ya usado en los demás Resources.

**Frontend**: feature slice `features/dashboard/` siguiendo el patrón de `features/receipts/`
(`api.ts` + `queries.ts` + `types.ts` + `DashboardPage.tsx`). Página con stat cards + dos tablas
cortas (no DataTable server-side). "Crear recibo" navega a `/recibos` con `location.state` para
preseleccionar el contrato en `ReceiptFormDialog`. Nuevo nav item "Inicio".

## Manejo de errores

- **401** sin sesión → guard / endpoint responde 401, el front redirige a login.
- Estados vacíos lindos: "Todos los recibos del mes emitidos ✓" / "Sin contratos por vencer".
- Sin contratos/recibos → contadores en 0, no rompe.

## Testing

- **Pest**: `DashboardData` (totales correctos; ventana 90d respeta el borde — 89d sí, 91d no;
  `pendingReceipts` excluye vencidos y los que ya tienen recibo del mes). Feature `GET /dashboard`:
  401 sin auth, 200 + shape con `actingAs`.
- **Vitest**: `DashboardPage` con MSW — render de cards + listas; empty states.
- **Manual end-to-end**: login en :8080, contrastar contadores y pendientes contra la DB (phpMyAdmin),
  probar "Crear recibo" desde un pendiente.

## Fuera de alcance (YAGNI)

- Gráficos / series temporales.
- Métricas de ingresos o comisión.
- Configurar qué widgets se ven / reordenarlos.
- Alertas por email / push de vencimientos (candidato futuro).

## Referencias

- Plan: `docs/plans/sub-G-dashboard-plan.md`.
- Reusa: `app/Support/MonthlyPaymentsReport.php`, `App\Http\Requests\Receipt\StoreReceiptRequest::MONTHS`.
