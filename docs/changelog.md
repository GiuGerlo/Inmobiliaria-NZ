# Changelog

Historial de cambios por fase. Más reciente arriba.

## [2026-06-09] sub-B — Schema + Migrations Laravel

**Resumen**: Capa de datos Laravel sobre la DB legacy compartida. Migrations espejo del schema (baseline skip si la tabla existe), FKs RESTRICT verificables con `legacy:check-orphans`, 8 modelos Eloquent en inglés, factories sin PII y tests contra MariaDB real.

**Cambios**:
- 12 migrations: 7 tablas dominio espejo exacto + users híbrida (legacy + password bcrypt nullable) + FKs/índices idempotentes.
- Comando `php artisan legacy:check-orphans` (gate de la migration de FKs sobre datos viejos).
- Modelos: City, Owner, Tenant, Property, Contract, PaymentMethod, Receipt, User — `$table` legacy, relationships completas, `$timestamps=false`.
- Factories es_AR + `DemoSeeder` (solo local). Cero PII.
- Test DB `inmobiliaria_test` (mismo container, se crea en primer boot del volumen).
- `phpunit.xml` apunta a MariaDB real (paridad de motor).
- Suite Pest: 11 passed.
- ADR-0002: preservar nombres legacy; modelos en inglés como capa de traducción.

**Breaking**: nada — el legacy sigue funcionando igual (mismas tablas).
**Migración**: en DB con dump real: `artisan migrate` → `artisan legacy:check-orphans` → corregir huérfanos si los hay.

## [2026-06-08] sub-A — Infra + Bootstrap (Docker zero-touch)

**Resumen**: Stack nuevo en Docker funcionando con un solo comando. Laravel 13 + React 19 + MariaDB 11.8 + nginx + phpMyAdmin + legacy PHP conviviendo. Tests Pest y Vitest verdes. Legacy preservado en `legacy/` corre en paralelo durante toda la transición.

**Cambios**:
- Monorepo: legacy movido a `legacy/` (368 archivos renombrados, historial preservado vía rename detection).
- `apps/api`: Laravel 13.8 con Sanctum, Pest 4, Pint. Endpoint `/api/v1/health` + test Pest.
- `apps/web`: React 19 + Vite 6 + TS strict. Page que fetcha `/api/v1/health` + test Vitest.
- `docker/`: Dockerfiles para nginx, php-fpm 8.4-alpine, node 22-alpine + pnpm, legacy php 7.4-apache.
- `docker-compose.yml`: 6 servicios + volúmenes nombrados (`mariadb-data`, `api-vendor`, `web-node-modules`) + healthcheck MariaDB + auto-import opcional vía `DB_DUMP_PATH`.
- `.env.example` raíz + `.env` local (gitignored).
- Nginx proxy unificado en `http://localhost:8080` (`/` → Vite con HMR, `/api` → Laravel).
- `package.json` raíz con scripts wrappers de `docker compose` (no requiere Node en host).
- `README.md` con setup 4 pasos.
- ADR-0001 (Laravel API-only vs Inertia → API-only).
- ADR-0005 (PHP 8.4 fijo, upgrade 8.5 diferido).

**Breaking**:
- El legacy ya no se sirve desde la raíz del repo; ahora está en `legacy/`. Producción no se vio afectada (sigue corriendo en Hostinger).

**Migración**:
- Si hacés `git pull` y tenías checkout local en uso, el código PHP legacy se movió a `legacy/`. Ningún PHP en raíz.
- Setup en PC nueva: `docker compose up -d --build` y nada más — el entrypoint de php-fpm auto-crea `.env` y `APP_KEY`.

---

## [2026-06-08] sub-0 — Bootstrap de documentación y reglas

**Resumen**: Se establece la estructura de docs + reglas (`.claude/`) y el roadmap maestro de reformulación. No hay cambios de código todavía.

**Cambios**:
- `CLAUDE.md` raíz reescrito como índice corto.
- `.claude/rules/` con stack, code-style, security, git-workflow, testing, api-conventions, docs-workflow, codegraph.
- `.claude/commands/` con `fase-start`, `fase-close`, `sync-plan`.
- `docs/` con README, roadmap, architecture, changelog.
- `docs/adr/0000-template.md` agregado como plantilla.
- `docs/legacy/snapshot-php.md` con foto del estado actual.

**Breaking**: nada.
**Migración**: nada.
