# Spec — Modo mantenimiento desde el admin (toggle + allowlist por IP)

- **Fecha**: 2026-07-02
- **Estado**: aprobado (implementado)
- **ADR**: `docs/adr/0010-modo-mantenimiento-admin.md`

## Problema

El mantenimiento manual se opera por SSH (`artisan down --secret` + `touch maintenance.on` + link
secreto `MAINT_SECRET`). Es complejo para la superadmin. Se quiere un **toggle en el admin** que solo
el superadmin active/desactive, que bloquee **el sitio público y el admin**, dejando entrar **solo su
IP** (capturada al activar). Reemplaza y borra el método por secreto. Se prueba en dev (Hostinger).

## Restricción de arquitectura

El público es **Next static export** (sin runtime) → no puede leer un flag de DB. Pero Laravel (admin)
y el docroot del público comparten **cuenta/filesystem** en Hostinger → el admin escribe el gate en el
`.htaccess` del público. **Local (Docker)** el público es otro container sin `.htaccess` → el gate del
público es **solo del server**; local se prueba el lado admin.

## Diseño

Un toggle (superadmin) escribe el estado en la DB del admin **y** sincroniza el `.htaccess` del
público. Dos gates independientes leen ese estado:

- **Admin** — middleware `MaintenanceGate` (grupo `auth:sanctum`): con mantenimiento ON, 503 salvo
  (IP permitida) **OR** (superadmin logueado). `login`/`me`/`logout`/`maintenance/status` siempre
  pasan → anti-lockout. El SPA muestra una pantalla de mantenimiento a los no-superadmin.
- **Público** — `.htaccess` con la IP baked (`RewriteCond %{REMOTE_ADDR} !=<IP>` → `maintenance.html`
  503). LiteSpeed sirve tu IP directo.

### Componentes

Backend (`apps/api`):
- Tabla `settings` (key-value) + modelo `Setting` + `Support/MaintenanceState` (claves
  `maintenance.enabled`, `maintenance.allowed_ip`).
- `Http/Middleware/MaintenanceGate` (en el grupo `auth:sanctum` de `routes/api.php`).
- `Http/Controllers/Api/V1/MaintenanceController` + gate `manage-maintenance` (superadmin):
  `GET/POST/DELETE /maintenance`, `POST /maintenance/ip`, y `GET /maintenance/status` (público).
- `Services/PublicMaintenanceGate` (escribe/quita el bloque `# BEGIN NZ-MAINTENANCE … # END` en
  `config('maintenance.public_docroot')`; no-op si vacío/no existe). IP validada; sale de
  `$request->ip()` (server-side, nunca input).

Frontend (`apps/web`):
- `features/maintenance` (api/queries/page): estado, IP permitida, tu IP, activar/desactivar,
  "actualizar a mi IP". Nav + ruta superadmin-only.
- `MaintenanceScreen` + gate en `AppLayout`: si `status.enabled` y el usuario no es superadmin →
  pantalla de mantenimiento en vez de la app.

Limpieza:
- `apps/public/public/.htaccess` → base limpia (sin secreto). `deploy-public.yml` → sin inyección de
  `MAINT_SECRET`. Se borra el GitHub secret `MAINT_SECRET`. `deploy-api.yml` sin cambios (down/up auto).

## Seguridad

- IP server-side (`$request->ip()`), nunca de input → sin inyección en `.htaccess`; igual se valida el
  formato y se arma desde template fijo. Toggle solo superadmin. Escritura acotada a `PUBLIC_DOCROOT_PATH`.
- `REMOTE_ADDR` sin trusted proxies = misma IP que el `.htaccess`. Si aparece un proxy, ajustar XFF en
  ambos (validar en dev).

## Verificación

- **Pest** (`tests/Feature/Api/MaintenanceTest.php`): middleware (bloqueo/allow por IP + superadmin +
  rutas siempre accesibles), controller (solo superadmin, captura IP), `PublicMaintenanceGate` (dir
  temporal + no-op). **Vitest** (`features/maintenance/MaintenancePage.test.tsx`): toggle + gate del SPA.
- **Dev (Hostinger)**: setear `PUBLIC_DOCROOT_PATH`, verificar IP capturada = IP real, activar y probar
  público+admin en incógnito, anti-lockout (re-login), desactivar.
