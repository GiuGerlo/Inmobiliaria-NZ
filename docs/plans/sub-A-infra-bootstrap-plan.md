# Plan — Sub-A — Infra + Bootstrap

> Fuente: `docs/superpowers/specs/2026-06-08-sub-A-infra-bootstrap-design.md` (aprobado en plan mode 2026-06-08).
> Branch: `fase/A-infra-bootstrap`.

## Pasos ejecutables

### Step 1 — Branch + gitignore + mover legacy + env
- [x] `git switch -c fase/A-infra-bootstrap`.
- [x] Mover `*.php` y carpetas legacy a `legacy/`.
- [x] Extender `.gitignore` (apps, db, env, IDE).
- [x] Actualizar `.claude/rules/stack.md` con PHP 8.4.
- [x] Crear `.env.example` raíz.
- [x] Crear `.env` local (gitignored).

### Step 2 — Estructura
- [x] `apps/{api,web}`, `docker/{nginx,php,node,legacy}`, `db/{migrations,seeders,backups}` con `.gitkeep`.

### Step 3 — Dockerfiles + configs
- [x] `docker/php/Dockerfile` (PHP 8.4-fpm-alpine, extensions, composer baked).
- [x] `docker/php/php.ini` (memory_limit, opcache).
- [x] `docker/node/Dockerfile` (Node 22-alpine + corepack pnpm).
- [x] `docker/nginx/Dockerfile` + `nginx.conf` (gateway con WS proxy a Vite).
- [x] `docker/legacy/Dockerfile` + `apache.conf` (PHP 7.4 + Apache).

### Step 4 — Laravel skeleton
- [x] `composer create-project laravel/laravel apps/api` (via container temp).
- [x] Editar `composer.json` para sumar `laravel/sanctum`, `pestphp/pest`, `pest-plugin-laravel` (install real ocurre en docker build).
- [x] `bootstrap/app.php` con `api: routes/api.php`.
- [x] `routes/api.php` con `/api/v1/health`.
- [x] `tests/Pest.php` + `tests/Feature/HealthTest.php`.
- [x] `apps/api/.env` con `DB_HOST=mariadb`.

### Step 5 — React + Vite skeleton
- [x] Escribir manualmente `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`, `src/App.test.tsx`, `.gitignore`, `eslint.config.js`.
- [x] App fetcha `/api/v1/health` y renderiza el resultado.
- [x] Vitest test verde (con `fetch` stubbed).

### Step 6 — docker-compose.yml
- [x] 6 servicios + volúmenes nombrados (`mariadb-data`, `api-vendor`, `web-node-modules`).
- [x] Healthcheck MariaDB.
- [x] Bind `${DB_DUMP_PATH:-./db/.empty.sql}` para auto-import.
- [x] `docker compose config` validó OK.

### Step 7 — Scripts conveniencia
- [x] `package.json` raíz con wrappers de `docker compose`.

### Step 8 — README
- [x] Setup 4 pasos, URLs, comandos, estructura.

### Step 9 — Docs (spec + plan + ADRs + verificación)
- [x] Spec en `docs/superpowers/specs/2026-06-08-sub-A-infra-bootstrap-design.md`.
- [x] Plan (este archivo).
- [x] ADR-0001 (api-only vs Inertia).
- [x] ADR-0005 (PHP 8.4 pinning).
- [x] Verificación E2E (2026-06-09): build OK, 6 servicios up, health 200, SPA 200, PMA 200, legacy 200, Pest 1 passed, Vitest 1 passed.
- [x] Zero-touch reforzado: entrypoint en php-fpm auto-crea `.env` + `APP_KEY` (sin `key:generate` manual). Verificado borrando `.env` y re-levantando.
- [x] Lockfiles (`composer.lock`, `pnpm-lock.yaml`) extraídos de las imágenes y commiteados para reproducibilidad.
- [ ] HMR en browser: verificación visual pendiente del usuario (único ítem manual).

### Step 10 — Cierre fase
- [x] `docs/changelog.md` += entrada sub-A.
- [x] `docs/roadmap.md`: sub-A → 🟢 DONE; sub-B → 🟡.
- [x] Marcar este plan DONE.
- [x] Sugerir commit message (al usuario).

## Verificación

```bash
# Reset limpio
docker compose down -v
docker compose up -d --build

# Esperar healthy
docker compose ps

# Tests
docker compose exec php-fpm ./vendor/bin/pest
docker compose exec node-dev pnpm test

# Browser
# http://localhost:8080  → "API respondió: ok"
# http://localhost:8081  → phpMyAdmin
# http://localhost:8082  → legacy
```

> ✅ DONE — 2026-06-08 (sujeto a verificación E2E del usuario).
