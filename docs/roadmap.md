# Roadmap — Reformulación Inmobiliaria NZ

> Estado del plan maestro. Actualizar al cierre de cada fase. Última revisión: 2026-06-08.

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
| **B** | Schema + Migrations Laravel | 🟡 siguiente | A | Migraciones, modelos Eloquent, factories y seeders que reproducen la DB actual. |
| **C** | Auth moderna | ⚪ pendiente | B | Sanctum + rate limit + bcrypt + perfil + CSRF + rehash de usuarios MD5. |
| **D** | API REST CRUD | ⚪ pendiente | C | Endpoints de ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago. |
| **E** | Frontend React core | ⚪ pendiente | D | SPA con login, layout, tablas, modales, toasts, react-query. Identidad NZ. |
| **F** | PDFs (recibos + rendiciones) | ⚪ pendiente | D | Generación de recibo individual y rendición mensual a dueños desde Laravel. |
| **G** | Features nuevos | ⚪ pendiente | E, F | Por definir con el usuario (dashboard, alertas de vencimiento, roles, exports, etc.). |
| **H** | Deploy + CI/CD | ⚪ pendiente | E, F | Pipeline a Hostinger (o VPS si decidimos). Builds reproducibles. |

Leyenda: 🟢 DONE — 🟡 en progreso — ⚪ pendiente — 🔴 bloqueado.

## Decisiones pendientes con impacto cruzado

- ADR-0001: **API-only vs Inertia.js** (afecta E principalmente).
- ADR-0002: **Rename tablas a inglés/snake_case vs preservar nombres legacy** (afecta B, D).
- ADR-0003: **Deploy strategy** (Hostinger compartido vs VPS containerizado) (afecta H).
- ADR-0004: **PDF lib** (spatie/laravel-pdf vs dompdf directo) (afecta F).

Estas se resuelven cuando empieza la fase que las necesita, no antes.

## Bitácora

- **2026-06-08** — Inicio del roadmap. Estructura `docs/` + `.claude/rules/` scaffolded.
- **2026-06-08** — Sub-A DONE. Docker stack zero-touch funcionando con Laravel 13 + React 19 + MariaDB 11.8. Próximo: sub-B (schema + migrations).
