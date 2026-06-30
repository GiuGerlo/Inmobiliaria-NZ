# Modo mantenimiento — paso a paso

Cómo poner en mantenimiento (y volver a levantar) el **admin** y el **público**, en **dev** y en
**producción**. El mantenimiento corta el acceso a los visitantes y te deja a vos entrar por un
**link secreto**. No requiere redeploy: se activa/desactiva por SSH.

---

## 0. Antes de empezar (una sola vez)

- **Token secreto** (`MAINT_SECRET`): generá uno largo y guardalo.
  ```
  openssl rand -hex 24
  ```
  Es el mismo para admin y público. Va como GitHub secret `MAINT_SECRET` (lo inyecta el deploy en el
  `.htaccess` del público). Para el admin lo pasás a mano en el comando `--secret`.
- **Acceso SSH** a Hostinger (host, puerto, usuario — los tenés del setup).
  ```
  ssh -p <PUERTO> <USUARIO>@<HOST>
  ```
- **Rutas en el server** (anotalas una vez, salen de hPanel):

  | Entorno | Carpeta Laravel (admin) | Document root público |
  |---|---|---|
  | dev | `~/laravel-api-dev` | doc root de `dev.nz-...` |
  | prod | `~/laravel-api` (la de prod) | doc root del dominio raíz |

---

## 1. ACTIVAR mantenimiento

> Hacé los dos pasos (admin + público). El orden no importa.

### Admin (Laravel)
```
cd <CARPETA_LARAVEL>
php artisan down --secret="<MAINT_SECRET>" --retry=60
```
Desde ese momento todos ven la página 503 de mantenimiento del admin.

### Público (Next estático)
```
cd <DOC_ROOT_PUBLICO>
touch maintenance.on
```
Desde ese momento todos ven `maintenance.html` (HTTP 503).

---

## 2. ENTRAR vos (bypass por link secreto)

Una sola visita setea tu acceso; después navegás normal aunque siga en mantenimiento.

- **Admin**: abrí en el navegador
  `https://<admin-dev o admin>.nz-estudiojuridicoinmobiliario.com/<MAINT_SECRET>`
  → te redirige y entrás al panel normal.

- **Público**: abrí
  `https://<dev o dominio-raiz>/__open/<MAINT_SECRET>`
  → setea una cookie por 8 h y navegás el sitio normal.

> Si tu sesión expira o cambiás de navegador/dispositivo, volvé a visitar el link.

---

## 3. VERIFICAR que quedó bien

- En una **ventana de incógnito** (sin tu cookie de bypass):
  - Admin → debe mostrar la página navy "Estamos actualizando el sistema".
  - Público → debe mostrar "Volvemos enseguida".
- En tu ventana normal (con el bypass hecho en el paso 2) → ambos cargan normal.

Si en incógnito ves el sitio normal, el mantenimiento **no** está activo (revisá paso 1).

---

## 4. DESACTIVAR mantenimiento (volver a la normalidad)

### Admin
```
cd <CARPETA_LARAVEL>
php artisan up
```

### Público
```
cd <DOC_ROOT_PUBLICO>
rm maintenance.on
```

Listo: todos vuelven a entrar normal.

---

## 5. Diferencias dev vs prod

Es **exactamente el mismo procedimiento**; solo cambian las rutas y las URLs:

| | DEV | PROD |
|---|---|---|
| Carpeta admin | `~/laravel-api-dev` | `~/laravel-api` |
| URL admin | `admin-dev.nz-...` | `admin.nz-...` |
| Doc root público | el de `dev.nz-...` | el del dominio raíz |
| URL público | `dev.nz-...` | `nz-estudiojuridicoinmobiliario.com` |

Probá **siempre primero en dev**. Cuando estés cómodo con el flujo, lo repetís en prod en la ventana
de corte.

---

## 6. Si algo falla

- **El admin no entra con el link secreto**: el token del `--secret` no coincide con el de la URL.
  Volvé a correr `php artisan down --secret="<token>"` con el token correcto y reintentá `/​<token>`.
- **El público sigue mostrándose normal con `maintenance.on` creado**: confirmá que el archivo está
  en el **document root correcto** (`pwd` debe ser el doc root del subdominio) y que el `.htaccess`
  con el gate está deployado ahí.
- **El público muestra mantenimiento pero sin estilos/logo**: normal solo si falta el deploy; los
  assets (`/img/logo.png`) los sirve el mismo sitio.
- **Quedó el admin caído y perdiste el token**: por SSH `php artisan up` lo levanta sin token.
