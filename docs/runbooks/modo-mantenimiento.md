# Modo mantenimiento — paso a paso

Cómo poner el sitio (público + admin) en mantenimiento y volver a levantarlo, **desde el admin**,
sin SSH. Lo maneja el **superadmin**. Diseño en `docs/adr/0010-modo-mantenimiento-admin.md`.

---

## Qué hace

Con mantenimiento **ON**:

- **Público** (`nz-estudiojuridicoinmobiliario.com` / `dev.nz-…`): todos ven la página de
  mantenimiento (503), **menos tu IP** permitida.
- **Admin** (`admin.nz-…` / `admin-dev.nz-…`): entra **solo tu IP permitida o tu sesión de
  superadmin**; el resto (staff `inmobiliaria`) ve una pantalla de mantenimiento. El **login queda
  accesible** → no te bloqueás a vos mismo aunque te cambie la IP.

Tu IP se **captura sola** al activar. Es **una** IP; si te cambia, usás "Actualizar a mi IP".

---

## Requisito (una sola vez, en el server)

En el `.env` del **API** del entorno, seteá el docroot del público para que el admin pueda escribir
ahí su gate:

```
PUBLIC_DOCROOT_PATH=<ruta absoluta del docroot público>   # dev = docroot de dev. · prod = raíz
```

Después `/opt/alt/php84/usr/bin/php artisan config:clear`. **Sin esta variable, el toggle solo bloquea
el admin** (el público queda normal).

---

## 1. ACTIVAR

1. Entrá al admin como superadmin → menú **Mantenimiento**.
2. **Activar mantenimiento**.
3. Verificá que **"IP permitida" = tu IP real** (comparala con [whatismyip.com](https://www.whatismyip.com/)).
4. Probá en **incógnito / otra red**: el público muestra la página de mantenimiento; el admin no deja
   entrar. En tu ventana normal, ambos cargan bien.

## 2. SI TE CAMBIÓ LA IP

En **Mantenimiento**, si "Tu IP actual" ≠ "IP permitida", apretá **Actualizar a mi IP** (reescribe el
gate del público con tu IP nueva). Al admin, igual entrás siempre por tu sesión de superadmin.

## 3. DESACTIVAR

En **Mantenimiento** → **Desactivar**. Todo vuelve a la normalidad al instante.

---

## Notas

- Un **deploy del público** reescribe su `.htaccess` base → **apaga** el mantenimiento del público. Si
  necesitás seguir en mantenimiento tras un deploy, **re-activá** desde el admin.
- El mantenimiento **breve y automático de cada deploy** (unos segundos, mientras corren las
  migraciones del API) es **otra cosa**: es automático, no lo tocás.
- Si algún día Hostinger interpone un proxy, la IP capturada podría no ser la tuya real. Se ajusta
  trusted-proxy / `X-Forwarded-For` en Laravel **y** el `%{REMOTE_ADDR}` del `.htaccess` (deben usar la
  misma IP). Se valida en dev.

## Si algo falla

- **El público sigue normal con mantenimiento ON**: falta `PUBLIC_DOCROOT_PATH` en el `.env` (o quedó
  cacheada la config vieja → `config:clear`).
- **Te bloqueaste del admin**: no debería pasar (el login y tu sesión de superadmin siempre entran).
  Último recurso por SSH: `UPDATE settings SET value='0' WHERE key='maintenance.enabled';` en la DB, o
  borrar el bloque `NZ-MAINTENANCE` del `.htaccess` del público.
