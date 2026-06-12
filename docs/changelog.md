# Changelog

Historial de cambios por fase. Más reciente arriba.

## [2026-06-12] sub-E — Frontend React core (fundación + slice Ciudades)

**Resumen**: Fundación de la SPA con identidad NZ y un vertical slice CRUD completo de Ciudades como patrón replicable. La SPA pasó de scaffold (health-check) a app real: login Sanctum, layout navy, tablas server-side y modales. Los otros 6 recursos quedan para sub-fases E2+.

**Cambios**:
- Tooling: Tailwind CSS 4 (`@tailwindcss/vite`, config CSS-first con tokens NZ en `@theme`), shadcn/ui (new-york, 18 componentes base), react-hook-form + zod, `@tanstack/react-table`, alias `@/*`. Poppins por `<link>`.
- ESLint flat config real: `typescript-eslint` + `react-hooks` + `jsx-a11y` + `react-refresh` (la de sub-A no parseaba TS). Vitest 2 → 3 (vitest 2 fija vite 5 y choca con vite 6).
- Auth Sanctum cookie: `lib/api.ts` (axios `withCredentials`+`withXSRFToken`, interceptor 401), `lib/csrf.ts` (`ensureCsrf`), `useAuth`/`useLogin`/`useLogout` (React Query), `RequireAuth` guard, `LoginPage` (RHF+zod, 422→campos, 429→toast, logo NZ).
- Layout: `AppLayout` (sidebar navy `#05172D` desktop + drawer mobile), `SidebarNav` (7 secciones, solo Ciudades activa, resto "Próximamente"), `UserMenu` (logout).
- DataTable genérico server-side (`@tanstack/react-table` manual sort/pagination) + `DataTablePagination` (meta Laravel) + `DataTableToolbar` (search debounce 300ms) + `DataTableColumnHeader` + `ConfirmDialog`.
- Slice Ciudades (`features/cities/`): api, queries (React Query + `keepPreviousData`), schema zod, columns, `CitiesPage`, `CityFormDialog`. CRUD end-to-end; borrado maneja **409** (FK RESTRICT) mostrando el mensaje del backend.
- Router (`createBrowserRouter`): `/login` pública + zona privada bajo `RequireAuth` → `AppLayout` → `/ciudades`. 401 global → vuelve a login.
- Identidad: `LoginPage` rediseñado split-brand (panel navy con logo/marca + detalle dorado, form a la derecha; colapsa a card en mobile). Primary = navy de marca `#13294b` (reemplaza el azul tipo Bootstrap); acento activo del sidebar en dorado `#c5a572` (token `--nz-gold`).
- Provincia (alta/edición de ciudad) = `Select` con las 24 jurisdicciones argentinas (`provinces.ts`), no texto libre; incluye el valor legacy si cae fuera de la lista.
- Tests: Vitest 3 + Testing Library + MSW (handlers con store en memoria). **9 passed** (LoginPage ok/422/429, DataTable render/paginación, Ciudades lista/crear/409). Reemplazado el test de health de sub-A.
- Verificación: `tsc -b`, `pnpm lint`, `pnpm build` y `pnpm test` verdes. SPA sirve por nginx :8080; CSRF y stateful (`localhost:8080`) ya configurados en sub-C.

**Breaking**: nada — solo frontend. La API no cambió.
**Migración**: `pnpm install` (deps nuevas) — automático en `docker compose up` del container `node-dev`.

## [2026-06-10] sub-D — API REST CRUD

**Resumen**: API REST completa de los 7 recursos del dominio (ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago) sobre los modelos de sub-B, protegida con la auth Sanctum de sub-C. Incluye upload de foto de propiedad a disco en WebP y documentación OpenAPI autogenerada.

**Cambios**:
- 7 controllers `apiResource` (index/store/show/update/destroy) bajo `auth:sanctum` + `NoStoreHeaders`, prefix `/api/v1`.
- Filtros/orden/includes con `spatie/laravel-query-builder` (whitelist por recurso) + búsqueda `?q=` + paginación con tope 100.
- FormRequests Store/Update por entidad (validación espejo del schema legacy, mensajes en español vía `lang/es/validation.php`).
- API Resources con campos en inglés (capa de traducción, ADR-0002).
- Borrado: 409 Conflict cuando una FK RESTRICT lo impide (trait `HandlesRestrictedDelete`); mensaje específico por recurso. Recibos borran directo (son hoja).
- Trait `MapsLegacyFields` (input inglés → columnas legacy) + helper de paginación.
- Foto de propiedad: `POST/DELETE /properties/{id}/photo`. Conversión a WebP (Intervention Image v3 + GD con `--with-webp`), guardada en `storage/app/public/propiedades/{id}/foto.webp`, columna nueva `foto_path`. Validación de mime real (finfo) + máx 5 MB. Borrar propiedad limpia su carpeta.
- `dedoc/scramble`: OpenAPI en `/docs/api` (solo local). nginx: locations `/storage/` (alias al disk public) y `/docs/`.
- Imagen php-fpm: `libwebp-dev` + gd `--with-webp`. Entrypoint: `chmod ugo+rwX storage bootstrap/cache` (workers fpm = www-data sobre bind mount).
- 54 tests Pest nuevos (CRUD + filtros + 409 + foto webp verificada por magic bytes) → suite total **83 passed (301 assertions)**.
- ADR-0006 (scramble) y ADR-0007 (foto file storage). Security review: sin hallazgos.

**Breaking**: nada — `foto_path` es columna aditiva nullable; el legacy sigue insertando sin listarla.
**Migración**: `artisan migrate` agrega `foto_path` a `propiedad`. En deploy (sub-H) contemplar persistencia de `storage/app/public`.

## [2026-06-09] sub-C — Auth moderna (Sanctum SPA)

**Resumen**: Auth cookie-based para la SPA con Sanctum stateful, rate limit en login, perfil de usuario y migración transparente de credenciales MD5 legacy a bcrypt en el primer login. El legacy sigue funcionando: `Pass_User` no se toca.

**Cambios**:
- `statefulApi()` + sesiones en DB (`SESSION_DRIVER=database`), cookies `HttpOnly`/`SameSite=Lax`, CSRF vía `/sanctum/csrf-cookie` (nueva location en nginx).
- Endpoints: `POST /api/v1/auth/login` (rate limit 5/min por email+IP, remember me), `POST /api/v1/auth/logout`, `GET/PATCH /api/v1/me`, `PUT /api/v1/me/password` (requiere password actual; invalida las demás sesiones).
- Rehash transitorio MD5→bcrypt en `AuthController::attemptLegacyMd5()` — borrar al deprecar el legacy.
- Form Requests con mensajes en español + `UserResource` (id/name/email).
- Middleware `NoStoreHeaders` (`Cache-Control: no-store` + `nosniff`) en endpoints autenticados.
- Factory state `legacyMd5()` para tests del flujo de migración.
- Suite Pest: 29 passed (18 nuevos de auth). Security review: sin hallazgos.

**Breaking**: nada — el login legacy sigue usando `Pass_User`.
**Migración**: nada. El usuario MD5 existente migra solo en su primer login al sistema nuevo.

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
