# Roadmap — Reformulación Inmobiliaria NZ

> Estado del plan maestro. Actualizar al cierre de cada fase. Última revisión: 2026-06-10.

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
| **E** | Frontend React core | 🟡 fundación DONE 2026-06-12 | D | Fundación (login Sanctum, layout NZ, DataTable server-side, modales, toasts, react-query) + slice CRUD Ciudades. CRUD del resto de recursos = sub-fases E2+. |
| **F** | PDFs (recibos + rendiciones) | ⚪ pendiente | D | Generación de recibo individual y rendición mensual a dueños desde Laravel. |
| **G** | Features nuevos | ⚪ pendiente | E, F | Por definir con el usuario (dashboard, alertas de vencimiento, roles, exports, etc.). |
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
- **2026-06-15** — Sub-E EN PROGRESO. CRUD de 5 recursos más (formas de pago, dueños, inquilinos, propiedades+foto, contratos) sobre el patrón Ciudades; EntityCombobox FK con búsqueda, doble confirmación de borrado, paginación default 10 con selector, orden newest-first, filtros de contratos (dueño/inquilino/rango fecha). Web 26 tests verdes. **Falta Recibos + cierre** (changelog final, roadmap DONE, `/security-review`). Ver changelog 2026-06-15 para detalle.
