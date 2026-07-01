# Fase 7 — Lo que hacés vos (fuera del código)

> Guía de pasos manuales para el deploy. El código (workflows, modo mantenimiento, scripts) lo
> armo yo en el repo. Esto es lo que vos tenés que hacer en hPanel de Hostinger, en GitHub y en
> el servidor. Hacelo en orden. Cuando termines un bloque, avisame y sigo con el código que lo usa.

Leyenda: `[ ]` pendiente · marcá `[x]` a medida que avanzás.

---

## Modelo de ramas (cómo va a funcionar)

- **`main`** — tu trabajo local / integración. NO deploya nada.
- **`dev`** — al hacer push acá, GitHub Actions deploya solo a la **instancia dev**.
- **`production`** — al hacer push acá, deploya a **producción**.

Flujo normal: trabajás en `main` → cuando querés probar en server real, `merge main → dev` →
testeás en los subdominios dev → cuando está de 10, `merge dev → production` → sale a prod.

> Nota: hoy estás en la rama `fusion-nz`. Antes de empezar Fase 7 la fusionamos a `main` y de ahí
> nacen `dev` y `production`. Ese paso lo coordinamos (los commits/merges los hacés vos).

---

## Modo mantenimiento — cómo se usa (referencia)

Ya está en el código (este commit). Activás/desactivás por SSH en el server, sin redeploy.
Token secreto: generá uno con `openssl rand -hex 24` y guardalo como GitHub secret `MAINT_SECRET`
(el deploy lo inyecta en el `.htaccess` del público y vos lo pasás al admin con `--secret`).

**Admin / API (Laravel)** — desde la carpeta del proyecto en el server:
```
php artisan down --secret="<MAINT_SECRET>" --retry=60   # activar (todos ven 503)
# bypass: visitar UNA vez  https://admin.nz-.../<MAINT_SECRET>   → te deja entrar normal
php artisan up                                          # desactivar
```

**Público (Next estático)** — desde el document root del público en el server:
```
touch maintenance.on     # activar (visitantes ven la página de mantenimiento, 503)
# bypass: visitar UNA vez  https://nz-.../__open/<MAINT_SECRET>   → cookie 8 h, navegás normal
rm maintenance.on        # desactivar
```

- [ ] Generar `MAINT_SECRET` y guardarlo (lo cargás como secret en el Bloque 5).

---

## Estado de los valores (REPO PÚBLICO — no pegar valores reales acá)

Los valores reales (IP/usuario SSH, rutas absolutas, nombres de DB, token) **no van a este doc**
porque el repo es público. Viven en: **GitHub Secrets** (environment `dev`/`production`) + tus
**notas seguras** (password manager). Acá solo trackeamos qué está cargado.

| Clave | Dónde vive | Estado dev |
|---|---|---|
| `SSH_HOST` / `SSH_PORT` / `SSH_USER` | GitHub Secret (env `dev`) | OK |
| `SSH_KEY` (privada) | GitHub Secret (env `dev`) | OK |
| `DEPLOY_PATH_API` | GitHub Secret (env `dev`) | OK (doc root `…/public`; deny `.htaccess` en el padre OK) |
| `DEPLOY_PATH_PUBLIC` | GitHub Secret (env `dev`) | OK |
| `MAINT_SECRET` | GitHub Secret (env `dev`) + notas | OK |
| DB dev (name/user/pass) | `.env` del server + notas | DB creada OK; `.env` se carga en Bloque 6 |
| Secrets de `production` | GitHub Secret (env `production`) | pendiente (en el corte) |

---

## Bloque 1 — Hostinger: subdominios (hPanel)

Entrá a hPanel → **Dominios → Subdominios**. Creá estos 4 (los de prod podés dejarlos para el final):

| Subdominio | Para qué | Cuándo |
|---|---|---|
| `admin-dev.nz-estudiojuridicoinmobiliario.com` | API Laravel + admin React (DEV) | ahora |
| `dev.nz-estudiojuridicoinmobiliario.com` | Público Next estático (DEV) | ahora |
| `admin.nz-estudiojuridicoinmobiliario.com` | API Laravel + admin React (PROD) | en el corte |
| (el dominio raíz ya existe) `nz-estudiojuridicoinmobiliario.com` | Público Next (PROD) | en el corte |

- [ ] Crear `admin-dev`
- [ ] Crear `dev`
- [ ] Anotar la **ruta del document root** que te muestra hPanel para cada uno (algo tipo
      `/home/uXXXXXX/domains/.../public_html`). La voy a necesitar para los secrets de deploy.

### Detalle importante de Laravel (admin-dev)
Laravel se sirve desde su carpeta `public/`, no desde la raíz del proyecto. Dos opciones:

- **Recomendada**: subir el proyecto Laravel a una carpeta fuera del webroot (ej.
  `~/laravel-api-dev/`) y en hPanel apuntar el **document root del subdominio `admin-dev`** a
  `~/laravel-api-dev/public`. hPanel permite custom document root por subdominio.
- Si no se puede cambiar el document root: lo resolvemos con un `.htaccess` que redirige a `public/`
  (te lo dejo armado).

- [ ] Decidir cuál de las dos podés hacer y avisarme (cambia un detalle del deploy).

---

## Bloque 2 — Hostinger: bases de datos (hPanel)

hPanel → **Bases de datos → MySQL**. Creá la DB de dev (la de prod, en el corte):

- [ ] Crear DB **`nz_dev`** + usuario + contraseña. Anotá host, nombre real (Hostinger suele
      prefijar, ej. `uXXXXXX_nz_dev`), usuario y pass.
- [ ] (En el corte) crear **`nz_prod`** igual.

> El nombre real con prefijo va en el `.env` del server, no en git.

---

## Bloque 3 — Hostinger: SSH y PHP (hPanel)

- [ ] **SSH**: Avanzado → Acceso SSH → activarlo. Anotá **host, puerto, usuario**.
- [ ] **Versión de PHP**: Avanzado → Configuración PHP → poné **PHP 8.4** en los subdominios del
      admin (la que usa el proyecto, ver `.claude/rules/stack.md`). Activá extensiones:
      `pdo_mysql`, `mbstring`, `gd`, `fileinfo`, `openssl`, `zip`, `curl`.
- [ ] **SSL**: Seguridad → SSL → emitir Let's Encrypt para `admin-dev` y `dev` (suele ser
      automático; verificá que queden en HTTPS).

---

## Bloque 4 — Llave SSH de deploy (tu PC + Hostinger + GitHub)

GitHub Actions entra al server por SSH con una llave dedicada (no tu llave personal).

- [ ] Generar par de llaves (en tu PC, terminal):
      `ssh-keygen -t ed25519 -C "deploy-nz" -f deploy_nz` (sin passphrase).
- [ ] **Pública** (`deploy_nz.pub`): pegar en Hostinger → SSH → claves autorizadas
      (o `~/.ssh/authorized_keys` del server).
- [ ] **Privada** (`deploy_nz`): va como secret en GitHub (Bloque 5). NUNCA al repo.
- [ ] Probar desde tu PC: `ssh -i deploy_nz -p <puerto> <usuario>@<host>` debe entrar sin pedir pass.

---

## Bloque 5 — GitHub: Environments y Secrets

Repo en GitHub → **Settings → Environments**. Creá dos: **`dev`** y **`production`**.
En cada uno, **Settings → Secrets**, cargá:

| Secret | Valor | Notas |
|---|---|---|
| `SSH_HOST` | host de Hostinger | igual en ambos entornos si es la misma cuenta |
| `SSH_PORT` | puerto SSH | |
| `SSH_USER` | usuario SSH | |
| `SSH_KEY` | contenido de `deploy_nz` (privada) | pegar el archivo entero |
| `DEPLOY_PATH_API` | ruta del Laravel en el server | dev: `~/laravel-api-dev` · prod: el de prod |
| `DEPLOY_PATH_PUBLIC` | document root del público | dev: el de `dev.` · prod: el del dominio raíz |

- [ ] Environment `dev` con sus 6 secrets.
- [ ] Environment `production` con sus 6 secrets.

> Separar por Environment permite que la misma Action sepa a dónde deployar según la rama, y que
> prod tenga su propia llave/ruta. Más adelante podés exigir aprobación manual para `production`.

---

## Bloque 6 — `.env` en el servidor (uno por entorno)

El `.env` con credenciales reales **vive en el server, no en git** (el deploy lo excluye, nunca lo pisa).
La carpeta `DEPLOY_PATH_API` ya existe (ahí pusiste el deny `.htaccess`), así que **podés crear el
`.env` ANTES del primer deploy** → el primer deploy migra sin fallar.

Por SSH:
```
cd <DEPLOY_PATH_API>          # la carpeta laravel-api-dev (donde está el deny .htaccess)
nano .env                     # pegá el template de abajo y completá los <...>
```

APP_KEY sin artisan (todavía no está la app): generá una y pegala en `APP_KEY=`:
```
echo "base64:$(openssl rand -base64 32)"
```

### Template `.env` dev (completá los `<...>`, no commitear)
```env
APP_NAME="Inmobiliaria NZ"
APP_ENV=production
APP_KEY=<pegar el base64:... generado arriba>
APP_DEBUG=false
APP_URL=https://admin-dev.nz-estudiojuridicoinmobiliario.com

APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_AR
APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u407412506_nz_dev
DB_USERNAME=u407412506_nz_dev_user
DB_PASSWORD=<pass de la DB dev>

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=admin-dev.nz-estudiojuridicoinmobiliario.com
SANCTUM_STATEFUL_DOMAINS=admin-dev.nz-estudiojuridicoinmobiliario.com

QUEUE_CONNECTION=database
CACHE_STORE=file
FILESYSTEM_DISK=local
MAIL_MAILER=log
BROADCAST_CONNECTION=log

LARAVEL_PDF_DRIVER=dompdf

# WhatsApp Meta (dejá vacío en dev si no vas a probar envíos reales)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_TEMPLATE_RECIBO=
WHATSAPP_TEMPLATE_RENDICION=
WHATSAPP_TEMPLATE_LANG=es
WHATSAPP_TEMPLATE_RECORDATORIO_PAGO=
WHATSAPP_TEMPLATE_RECORDATORIO_FALTANTE=

NZ_NAME="Nadina Zaranich"
NZ_LOCALITY="Guatimozín"
NZ_ADDRESS="Catamarca 227"
NZ_PHONE="3468-495281"
NZ_HOURS="8 hs a 12 hs - 16 hs a 20 hs"
NZ_CUIT="27-27036340-2"
NZ_COMMISSION_RATE=0.10

# Email que el RoleSeeder promueve a superadmin (tu cuenta)
SUPERADMIN_EMAIL=<tu email de admin>
```

> Mantenimiento del admin = `php artisan down --secret="<MAINT_SECRET>"` (no va en `.env`, se pasa
> en el comando). El `<MAINT_SECRET>` es el mismo token del GitHub Secret.

- [x] `.env` dev creado y completado (APP_KEY generada, DB conecta OK).
- [ ] Repetir para **prod** en el corte, con datos de `nz_prod` y URLs de prod.

> **PHP CLI en el server**: el selector de PHP de hPanel aplica a la **web** (LiteSpeed); el `php`
> del SSH sigue en el default (8.2). El binario 8.4 real es `/opt/alt/php84/usr/bin/php` (no hay
> wrapper `php8.4`). El deploy ya usa esa ruta absoluta; para tu uso manual, alias en `~/.bashrc`:
> `alias php='/opt/alt/php84/usr/bin/php'`.

---

## Bloque 7 — Cron para la cola de WhatsApp (hPanel)

Los envíos de WhatsApp usan cola. En shared hosting no hay worker permanente → un cron lo procesa.

- [ ] hPanel → Avanzado → Cron Jobs → agregar, cada 1 minuto (ruta real del server + binario 8.4):
      `cd /home/u407412506/domains/nz-estudiojuridicoinmobiliario.com/public_html/laravel-api-dev && /opt/alt/php84/usr/bin/php artisan queue:work --stop-when-empty --max-time=50 >> storage/logs/queue.log 2>&1`
- [ ] (En el corte) el mismo cron apuntando a la carpeta de prod.

---

## Bloque 8 — Datos de prueba en dev

- [ ] Importar a `nz_dev` un dump (phpMyAdmin de Hostinger o por SSH). Sin PII real de
      inquilinos/dueños — sirve una copia controlada o seeders. Te ayudo a armarlo.

---

## Primer deploy a dev — orden importante

Los workflows (`deploy-api.yml`, `deploy-public.yml`) disparan al hacer **push a la rama `dev`**.
El público se buildea trayendo el catálogo **de la API en vivo**, así que la API tiene que estar
arriba y con datos ANTES de buildear el público. Orden la primera vez:

1. Tener listos los Bloques 1–6 (subdominios, DB, SSH, secrets, `.env` del server con `APP_KEY`).
2. Push a `dev` (o "Run workflow" manual de **deploy-api** primero). Esperar que termine OK:
   migra la DB, deja el admin en `admin-dev.…`.
   > El workflow corre `migrate --force` pero **NO seedea**. Tras el primer deploy, una vez por SSH:
   > `cd <DEPLOY_PATH_API> && /opt/alt/php84/usr/bin/php artisan db:seed --class=RoleSeeder --force`
   > (crea roles + promueve `SUPERADMIN_EMAIL`; el usuario con ese email debe existir ya — viene del dump).
3. Cargar datos de prueba en `nz_dev` (Bloque 8) — si no hay propiedades, el público buildea vacío.
4. Correr **deploy-public** (push que toque `apps/public/**`, o "Run workflow" manual). Buildea
   contra la API dev y publica en `dev.…`.

> Si en el primer push corren los dos a la vez y **deploy-public falla** (la API todavía no tenía
> datos / no estaba arriba), es esperable: volvé a correrlo (Run workflow) cuando la API ya esté OK.

---

## Bloque 9 — Corte a producción (recién cuando dev esté de 10)

Esto es el switch final; va a su propio runbook detallado (`docs/runbooks/corte-fase7.md`), pero
de tu lado vas a tener que:

- [ ] Crear DB `nz_prod` + subdominio `admin.` + (mover el dominio raíz al nuevo público).
- [ ] Cargar secrets/`.env`/cron de prod.
- [ ] Backup del legacy (admin alquileres + público estudio) antes de tocar nada.
- [ ] Dar el OK para activar mantenimiento, migrar datos y hacer el switch.
- [ ] Bajar el legacy una vez verificado.

---

## Resumen: qué necesito de vos para arrancar el código

Para empezar a escribir los workflows y el modo mantenimiento me alcanza con los **Bloques 1–5**
(subdominios dev, DB dev, SSH, llave, secrets). Los Bloques 6–8 los completás cuando el código ya
esté listo para el primer deploy a dev. El Bloque 9 es el final del camino.
