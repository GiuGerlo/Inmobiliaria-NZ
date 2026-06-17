# Roadmap — Reformulación Inmobiliaria NZ

> Estado del plan maestro. Actualizar al cierre de cada fase. Última revisión: 2026-06-15.

## Visión

Reescribir la app PHP legacy a una arquitectura moderna sin perder funcionalidad y sumando mejoras. Stack destino: **Laravel 12 + React 19 + MariaDB 11.8 + Docker (PHP 8.5)**. La app actual sigue en producción hasta que el nuevo sistema esté listo.

## Principios

- **Una fase = un commit = un PR mergeado.** Los commits los hace el usuario.
- **Spec antes que código.** Cada sub-proyecto pasa por brainstorming + plan.
- **Migración incremental, no big bang.** El sistema viejo y el nuevo conviven durante la transición.
- **Seguridad de día 1.** Cada fase pasa `/security-review` antes de mergear.

## Sub-proyectos

| ID | Nombre | Estado | Depende de | Entregable corto |
|----|--------|--------|------------|------------------|
| **A** | Infra + Bootstrap | 🟢 DONE 2026-06-08 | — | `docker compose up` levanta Laravel + React + MariaDB + phpMyAdmin con dump auto-importado. |
| **B** | Schema + Migrations Laravel | 🟢 DONE 2026-06-09 | A | Migraciones, modelos Eloquent, factories y seeders que reproducen la DB actual. |
| **C** | Auth moderna | 🟢 DONE 2026-06-09 | B | Sanctum + rate limit + bcrypt + perfil + CSRF + rehash de usuarios MD5. |
| **D** | API REST CRUD | 🟢 DONE 2026-06-10 | C | Endpoints de ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago. |
| **E** | Frontend React core | 🟢 DONE 2026-06-15 | D | CRUD React de los 7 recursos (Ciudades, Formas de pago, Dueños, Inquilinos, Propiedades con foto, Contratos, Recibos) sobre fundación Sanctum + DataTable server-side + modales + react-query. PDFs diferidos a sub-F. |
| **F** | PDFs (recibos + rendiciones) | 🟢 DONE 2026-06-16 | D, E | Recibo individual, rendición a dueños y listado mensual de pagos en PDF desde Laravel (spatie/laravel-pdf + Gotenberg). Botones inline en la tabla de recibos + reporte mensual en el toolbar. |
| **G** | Dashboard / Inicio | 🟢 DONE 2026-06-16 | E, F | Pantalla de inicio (`/`) con totales, recibos pendientes del mes y contratos por vencer (90d). Endpoint agregado `GET /dashboard`. Sidebar colapsable + login redirige al inicio. |
| **H** | Deploy + CI/CD | ⚪ pendiente | E, F | Pipeline a Hostinger (o VPS si decidimos). Builds reproducibles. |

Leyenda: 🟢 DONE — 🟡 en progreso — ⚪ pendiente — 🔴 bloqueado.

## Decisiones pendientes con impacto cruzado

- ADR-0001: **API-only vs Inertia.js** (afecta E principalmente).
- ADR-0002: **Rename tablas a inglés/snake_case vs preservar nombres legacy** (afecta B, D). ✅ cerrado.
- ADR-0003: **Deploy strategy** (Hostinger compartido vs VPS containerizado) (afecta H).
- ADR-0004: **PDF lib** (spatie/laravel-pdf vs dompdf directo) (afecta F).
- ADR-0006: **OpenAPI autogenerada (scramble)** (afecta D, E). ✅ cerrado.
- ADR-0007: **Foto de propiedad en file storage WebP** (afecta D). ✅ cerrado.

Estas se resuelven cuando empieza la fase que las necesita, no antes.

## Bitácora

- **2026-06-08** — Inicio del roadmap. Estructura `docs/` + `.claude/rules/` scaffolded.
- **2026-06-08** — Sub-A DONE. Docker stack zero-touch funcionando con Laravel 13 + React 19 + MariaDB 11.8. Próximo: sub-B (schema + migrations).
- **2026-06-09** — Sub-B DONE. Migrations espejo + FKs gated + 8 modelos Eloquent + factories + 11 tests verdes contra MariaDB. ADR-0002 cerrado. Próximo: sub-C (auth).
- **2026-06-09** — Sub-C DONE. Sanctum stateful SPA + login con rate limit y rehash MD5→bcrypt transparente + perfil completo. 29 tests verdes. Security review sin hallazgos. Próximo: sub-D (API CRUD).
- **2026-06-10** — Sub-D DONE. API REST de los 7 recursos (apiResource + spatie/query-builder + 409 en FK RESTRICT), upload de foto WebP a disco, OpenAPI autogenerada con scramble. 83 tests verdes. ADR-0006 (scramble) y ADR-0007 (foto file storage) cerrados. Security review sin hallazgos. Próximo: sub-E (frontend) y sub-F (PDFs).
- **2026-06-12** — Sub-E fundación DONE. SPA real: Tailwind 4 + shadcn + RHF/zod + TanStack Table; auth Sanctum cookie (login/guard/401), layout navy NZ, DataTable server-side, slice CRUD Ciudades con 409. 9 tests (Vitest 3 + MSW). lint/build/typecheck verdes. Pendiente: `/security-review` del branch. Próximo: E2+ (CRUD del resto de recursos), sub-F (PDFs).
- **2026-06-15** — Sub-E DONE. CRUD React de los 7 recursos completo: a formas de pago/dueños/inquilinos/propiedades+foto/contratos se sumó **Recibos** (módulo `features/receipts/`, hoja → borrado directo, form de 8 montos + mes/año, filtros contrato/FP/mes/año, tabla con paridad legacy mostrando Contrato como "Dueño - Inquilino" y todas las columnas de montos). EntityCombobox FK, doble confirmación de borrado, paginación default 10, orden newest-first. Web **30 tests verdes**, lint/tsc verdes. PDFs del legacy de recibos (recibo individual, rendición, listado mensual) **diferidos a sub-F**. Próximo: sub-F (PDFs). Ver changelog 2026-06-15 para detalle.
- **2026-06-16** — Sub-F DONE. PDFs de recibo, rendición y listado mensual con spatie/laravel-pdf + **Gotenberg** (Chromium en container aparte, ADR-0004). Blades con branding NZ + logo/firma en base64; cálculos en `ReceiptCalculator`, número→letras con luecano, reporte mensual con query parametrizada (corrige SQLi del legacy). Botones-ícono inline (detalle + 2 PDF) en la tabla de recibos + modal de detalle + reporte mensual en el toolbar. Tablas: scroll horizontal solo al hacer zoom (no por defecto). Pest **97** + Vitest **34** verdes; los 3 PDFs verificados con render real (nuevo vs legacy). Próximo: sub-G (features nuevos) o sub-H (deploy/CI).
- **2026-06-16** — Sub-G DONE. Dashboard de inicio (`/`, landing post-login) — sin ingresos. 1ª ronda: totales, recibos pendientes del mes, contratos por vencer (90d). 2ª ronda (ampliación): accesos rápidos (abren forms vía `location.state.openCreate`), progreso del mes (barra), últimos recibos generados y contratos con saldo pendiente; la página de Recibos suma al pie "por hacer" + "hechos este mes". Endpoint agregado `GET /dashboard` (`DashboardData` + `Contract::scopeActive` + `DashboardResource`, queries parametrizadas sin input; suma `latestReceipts`/`contractsWithBalance`). Sidebar colapsable con transición (persistido) + login redirige al inicio. Pest **104** + Vitest **37** verdes; `/security-review` sin hallazgos. Próximo: sub-H (deploy/CI).
