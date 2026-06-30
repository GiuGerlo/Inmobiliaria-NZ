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

El `.env` con credenciales reales **vive en el server, no en git**. Te voy a dejar un
`.env.example` actualizado; vos creás el real en cada carpeta Laravel del server.

Para **dev** (`~/laravel-api-dev/.env`):

- [ ] `APP_ENV=production` (sí, production aunque sea dev: desactiva debug)
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY=` → generar con `php artisan key:generate` por SSH
- [ ] `APP_URL=https://admin-dev.nz-estudiojuridicoinmobiliario.com`
- [ ] `DB_*` → datos de `nz_dev` (Bloque 2)
- [ ] `SANCTUM_STATEFUL_DOMAINS` y `SESSION_DOMAIN` → dominios dev
- [ ] Tokens de **WhatsApp Meta** (los mismos aprobados, o número de prueba para dev)
- [ ] `APP_MAINTENANCE_*` y el **token secreto de mantenimiento** (te lo genero yo, lo pegás acá)

- [ ] Repetir para **prod** en el corte, con datos de `nz_prod` y URLs de prod.

---

## Bloque 7 — Cron para la cola de WhatsApp (hPanel)

Los envíos de WhatsApp usan cola. En shared hosting no hay worker permanente → un cron lo procesa.

- [ ] hPanel → Avanzado → Cron Jobs → agregar, cada 1 minuto:
      `cd ~/laravel-api-dev && php artisan queue:work --stop-when-empty --max-time=50 >> storage/logs/queue.log 2>&1`
- [ ] (En el corte) el mismo cron apuntando a la carpeta de prod.

---

## Bloque 8 — Datos de prueba en dev

- [ ] Importar a `nz_dev` un dump (phpMyAdmin de Hostinger o por SSH). Sin PII real de
      inquilinos/dueños — sirve una copia controlada o seeders. Te ayudo a armarlo.

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
