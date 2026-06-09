# Sub-A — Infra + Bootstrap (design spec)

- **Sub-proyecto**: A
- **Fecha**: 2026-06-08
- **Estado**: aprobado (vía plan mode); en implementación
- **Branch**: `fase/A-infra-bootstrap`

## Contexto

`Inmobiliaria-NZ` es una app PHP procedural legacy en producción (alquileres). Se inicia una reformulación completa a Laravel + React + Docker. Este sub-proyecto sienta la base sobre la que se montan los sub-proyectos B–H.

El objetivo único de la fase: **cualquier PC clona el repo, copia `.env.example` a `.env` y corre `docker compose up -d --build` — todo funciona sin un solo paso extra**. Cero dependencias en el host fuera de Docker.

## Decisiones acumuladas durante el brainstorming

| # | Decisión | Razón |
|---|----------|-------|
| 1 | **Monorepo** `apps/api` + `apps/web` + `legacy/` + `docker/` + `db/` + `docs/` | Una persona, cero fricción inter-repo. Borrar `legacy/` al cierre será operación local. |
| 2 | **Compose con 6 servicios**: nginx, php-fpm, node-dev, mariadb, phpmyadmin, legacy | Paridad con prod + comparar legacy/nuevo sin instalar XAMPP. |
| 3 | **DB única compartida** entre legacy y Laravel; nombres legacy se preservan | Cero riesgo de datos desincronizados. Rename a inglés queda como tarea futura (ADR-0002). |
| 4 | **Dump real fuera de git**, `db/db.sql` gitignored | PII (emails, teléfonos, direcciones reales). |
| 5 | **Nginx proxy unificado** en `http://localhost:8080` (`/` → Vite, `/api` → Laravel) | Cero CORS, cookie Sanctum funciona, paridad con prod. |
| 6 | **PHP 8.4 fijo** (no 8.5) | Mejor compatibilidad con ecosistema actual. Ver ADR-0005. |
| 7 | **Node 22 LTS + pnpm** | npm está obsoleto en términos de eficiencia; pnpm ahorra disco. |
| 8 | **Init DB**: variable `DB_DUMP_PATH` apuntando a path absoluto del dump local | Auto-import primera vez; vacío = DB vacía. |
| 9 | **DoD = zero-touch**: `docker compose up` levanta todo en cualquier PC | El usuario quiere "una PC nueva, un comando, listo". |

## Enfoque arquitectónico — A: baked images

`composer install` y `pnpm install` se cocinan en **build time** dentro de las imágenes Docker. El código se monta por bind; `vendor/` y `node_modules/` están protegidos por volúmenes nombrados (`api-vendor`, `web-node-modules`) que shadow-ean el bind mount en esos paths.

```
docker compose up --build
  ↓
build php-fpm:  COPY composer.json + composer install (en image layer)
build node-dev: COPY package.json   + pnpm install     (en image layer)
build nginx:    COPY nginx.conf
build legacy:   php:7.4-apache + extensions
  ↓
runtime: nginx, vite, php-fpm, mariadb, phpmyadmin, legacy
        + bind mounts del código fuente
        + volumes nombrados para deps
```

Trade-off aceptado: agregar dependencia = rebuild del servicio. Se mitiga con `docker compose build php-fpm` o `node-dev` puntual.

## Arquitectura runtime

```
http://localhost:8080  ─┐
                        ▼
                     [nginx]
                     ┌──┴──────────────────┐
                     │ / → vite:5173       │   (HMR vía WS)
                     │ /api → php-fpm:9000 │   (FastCGI)
                     └─────────────────────┘
                              │
[Vite dev]                    │
node-dev:5173 ────────────────┘
   (bind ./apps/web,
    volumen web-node-modules)

[Laravel]
php-fpm:9000
   (bind ./apps/api,
    volumen api-vendor)
              │
              ▼
         mariadb:3306 ──────  host :3307 (TablePlus, DBeaver)
              │
         phpmyadmin:80 ──────  host :8081

[Legacy]
legacy:80 ──────  host :8082
   (bind ./legacy, mismo MariaDB)
```

## Stack concreto

- **PHP 8.4-fpm-alpine** + extensions: pdo_mysql, mbstring, exif, pcntl, bcmath, gd, zip, intl.
- **Laravel 13.x** (lo que `composer create-project laravel/laravel` instala hoy; `^13.8` en composer.json).
- **Sanctum 4.x** — auth cookie SPA (config viva en sub-C).
- **Pest 4.x** — test runner. `tests/Pest.php` con extend de `Tests\TestCase`.
- **Pint** — formateo PHP.
- **Node 22-alpine** + corepack + pnpm.
- **React 19** + **Vite 6** + **TypeScript 5.7** strict.
- **TanStack Query 5**, **React Router 7**, **axios**.
- **Vitest 2** + **Testing Library 16** + **jsdom**.
- **MariaDB 11.8** oficial.
- **phpMyAdmin 5**.
- **Apache + PHP 7.4** para legacy.

## Definition of Done

- [ ] `docker compose down -v && docker compose up -d --build` en repo limpio funciona end-to-end.
- [ ] `curl http://localhost:8080/api/v1/health` → `{"ok":true,"service":"inmobiliaria-api",...}`.
- [ ] Browser `http://localhost:8080` → "API respondió: ok @ ...".
- [ ] `http://localhost:8081` phpMyAdmin loguea OK.
- [ ] `http://localhost:8082` legacy carga al menos `loginform.php`.
- [ ] `docker compose exec php-fpm ./vendor/bin/pest` → 1 test passed.
- [ ] `docker compose exec node-dev pnpm test` → 1 test passed.
- [ ] HMR: editar `apps/web/src/App.tsx` refresca el browser solo.
- [ ] README permite a alguien con cero contexto previo levantar todo.

## Fuera de scope (van en sub-proyectos posteriores)

- Auth implementada (sub-C).
- CRUD reales (sub-D / E).
- PDFs (sub-F).
- CI/CD (sub-H).
- Tailwind + shadcn + diseño de UI (sub-E).
- Rename de tablas a inglés (decisión en ADR-0002 cuando llegue sub-B).

## Riesgos identificados

- **Windows + bind mount + composer/pnpm cleanup**: filesystem races al ejecutar `composer create-project` o `pnpm create vite` desde host. Mitigación: cocinar todo dentro del Dockerfile build; nunca correr composer/pnpm contra bind mount Windows.
- **HMR via nginx proxy**: requiere config WS específica y `clientPort` en `vite.config.ts`. Ya contemplado.
- **DB_DUMP_PATH vacío**: el placeholder `db/.empty.sql` evita que el mount falle.
- **PHP 7.4 EOL**: el container legacy usa una imagen sin soporte. Aceptado durante la transición; al deprecate del legacy desaparece.

## ADRs relacionados

- ADR-0001 — Laravel API-only vs Inertia.
- ADR-0005 — PHP version pinning.

## Referencias

- Plan ejecutable: `docs/plans/sub-A-infra-bootstrap-plan.md`.
- Roadmap maestro: `docs/roadmap.md`.
- Snapshot del legacy: `docs/legacy/snapshot-php.md`.
