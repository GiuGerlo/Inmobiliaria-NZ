# Deploy — cómo funciona (resumen)

Guía corta del deploy actual. Para el detalle (setup inicial, .env, cron, corte a prod) ver
`fase7-pasos-manuales.md`.

## En una frase

Push a una rama → GitHub Actions **buildea en el runner** y hace **`rsync --delete` por SSH** a
Hostinger (hosting compartido, **sin Docker**). El server queda siempre = **foto del tip de la rama**
(no aplica commit por commit; sincroniza el estado final). ADR-0003.

## Ramas → entorno

| Rama | Qué hace |
|---|---|
| `main` | Trabajo local / integración. **No deploya nada.** |
| `dev` | Push → deploya a la **instancia dev**. |
| `production` | Push → deploya a **producción**. |

Flujo normal: `main` → merge a `dev` (probar en server real) → merge a `production`.
El *environment* de GitHub (con sus secrets) se elige por la rama.

## Los 2 workflows

| Workflow | Dispara con cambios en | Qué deploya |
|---|---|---|
| `deploy-api.yml` | `apps/api/**`, `apps/web/**` | API Laravel **+ admin SPA** (el build de React se copia dentro de `public/` de Laravel) |
| `deploy-public.yml` | `apps/public/**` | Sitio público (Next.js SSG estático) |

También se pueden correr a mano desde Actions ("Run workflow"), con opción `force_full`
(rsync `--checksum`, re-verifica todo byte a byte).

> **1 push = 1 corrida**, en el HEAD. Da igual cuántos commits traiga el push: deploya el resultado
> acumulado de todos, nunca "solo el último".

## URLs

### Dev (funcionando)
- Admin: `https://admin-dev.nz-estudiojuridicoinmobiliario.com`
- API: `https://admin-dev.nz-estudiojuridicoinmobiliario.com/api/v1` · health: `/api/v1/health`
- Público: `https://dev.nz-estudiojuridicoinmobiliario.com`

### Producción (pendiente de corte)
- Admin: `https://admin.nz-estudiojuridicoinmobiliario.com`
- Público: `https://nz-estudiojuridicoinmobiliario.com`

## Server (Hostinger)

- **SSH**: `ssh -i ~/.ssh/deploy_nz -p 65002 u407412506@46.202.145.141`
  (la llave `deploy_nz` está autorizada en Hostinger y es el secret `SSH_KEY` del entorno).
- **PHP CLI**: `/opt/alt/php84/usr/bin/php` (el `php` del shell es otro; usar siempre este para artisan).
- **Path API dev**: `.../public_html/laravel-api-dev` — su carpeta `public/` es el docroot de `admin-dev.`
- **Path público dev**: docroot del subdominio `dev.` (secret `DEPLOY_PATH_PUBLIC`).
- **Backups**: `<dominio>/backups/<entorno>/{api,public}/<timestamp>/` (fuera del webroot, retención **5**,
  poda automática). Incluyen dump de DB (api) + los archivos pisados/borrados (`files-replaced`).

## Base de datos

| Entorno | DB |
|---|---|
| dev | `u407412506_nz_dev` |
| prod | `nz_prod` (pendiente) |

Credenciales en el `.env` **del server** (no en el repo).

## Usuarios / acceso

- Login del admin = cuenta en la tabla `users` (Sanctum, cookie de sesión). Superadmin actual:
  `ggiuliano526@gmail.com`. **La contraseña se cambia desde el admin → "Mi perfil" (`/perfil`)** — no
  se guarda en el repo.
- Roles: `superadmin` / `inmobiliaria` (los crea `RoleSeeder`; promueve al email en `SUPERADMIN_EMAIL`).

## Qué hace cada corrida

**API + admin** (`deploy-api`): backup DB (`mysqldump`) + backup de archivos → **mantenimiento ON** →
rsync → `migrate --force` → `optimize` → **mantenimiento OFF** (pase lo que pase) → health check.
**No corre seeders.**

**Público** (`deploy-public`): build Next (trae el catálogo de la API **en vivo**) → backup → rsync →
health check. Correr **después** del API (necesita la API arriba y con datos).

Lo que el rsync **nunca pisa** (excluido): `.env`, uploads (`storage/app/public`), imports, logs,
`storage/framework`, flag de mantenimiento.

## Seeders (manuales, por SSH)

El deploy no seedea. Datos demo, una sola vez por entorno (con `PHP=/opt/alt/php84/usr/bin/php`):

```
$PHP artisan db:seed --class=SalesDemoSeeder --force   # catálogo de ventas
$PHP artisan db:seed --class=RentalDemoSeeder --force  # alquileres (ciudades, contratos, recibos…)
$PHP artisan db:seed --class=RoleSeeder --force        # roles + promoción de superadmin
```

> `DemoSeeder` (alquileres random) **no corre en el server**: usa Faker, que es dep de dev. Por eso los
> seeders de arriba son estáticos (sin factory) e idempotentes.

## Rollback rápido

Restaurar desde el backup de la corrida en `<dominio>/backups/<entorno>/...`:
- DB: `gunzip < api/<ts>/db.sql.gz | mysql ...`
- Archivos: copiar de `api/<ts>/files-replaced/` de vuelta al deploy path.

## Secrets (en GitHub → Environments `dev` / `production`)

`SSH_KEY`, `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `DEPLOY_PATH_API`, `DEPLOY_PATH_PUBLIC`,
`GOOGLE_MAPS_API_KEY`, `MAINT_SECRET`. Sin valores en el repo.
