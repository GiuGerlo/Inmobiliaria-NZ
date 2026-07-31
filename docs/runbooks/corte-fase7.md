# Corte a producción — Fase 7 (migración de datos reales + switch)

> Runbook operativo del **switch final** del legacy al sistema nuevo. Se ejecuta una sola vez, cuando
> dev está de 10 y Giuli entrega los dumps. Referencia de infra/secrets: `fase7-pasos-manuales.md`
> § Bloque 9. Deploy: `README-deploy.md`. Modo mantenimiento: `modo-mantenimiento.md`.

**Idea clave**: el dominio alquileres en Laravel **conserva las tablas y columnas legacy en español
1:1** (ADR-0002) → migrar alquileres = **cargar los datos** del dump en las mismas tablas, sin mapeo.
Ventas ya tiene el comando `ventas:import`. Nada de esto reescribe esquema.

---

## Datos del server

- **SSH**: `ssh -i ~/.ssh/deploy_nz -p 65002 u407412506@46.202.145.141`
- **PHP CLI**: `PHP=/opt/alt/php84/usr/bin/php` (el `php` del shell es otro)
- **API prod**: `<DEPLOY_PATH_API>` (el del secret `DEPLOY_PATH_API` de env `production`)
- **Público prod**: docroot del dominio raíz (secret `DEPLOY_PATH_PUBLIC` de env `production`)
- **DB prod**: `nz_prod` (credenciales en el `.env` del server)

En todos los `artisan` de abajo: `cd <DEPLOY_PATH_API>` primero, y usar `$PHP artisan …`.

---

## 0. Pre-requisitos (antes de empezar)

- [ ] Dev verde y verificado (admin + público + un PDF + un envío WhatsApp).
- [ ] `nz_prod` creada (hPanel) + subdominio `admin.nz-…` apuntando al `public/` del Laravel prod.
- [ ] Secrets env `production` cargados (incl. `GA_MEASUREMENT_ID`). Ver Bloque 9.
- [ ] `.env` de prod en el server: URLs prod, DB `nz_prod`, `PUBLIC_DOCROOT_PATH` = docroot del dominio
      raíz, `SUPERADMIN_EMAIL`, tokens WhatsApp, `LARAVEL_PDF_DRIVER=dompdf`, y para la migración de
      ventas: `NZ_LEGACY_DB_*` + `NZ_LEGACY_UPLOADS_PATH` (ver paso 3c).
- [ ] Cron `queue-nz-prod.sh` configurado (Bloque 7, apuntando al Laravel de prod).
- [ ] **Dumps entregados por Giuli**: (a) DB legacy de **alquileres** (`.sql`), (b) DB legacy de
      **ventas** nz-estudio (`.sql`), (c) **uploads de ventas** (carpeta de imágenes del legacy).

---

## 1. Backup del legacy (red de seguridad)

Antes de tocar nada, respaldar ambos sistemas legacy que están vivos:

```sh
# En el server, por SSH. Ajustar nombres reales de DB/carpetas del legacy.
mkdir -p ~/backups-corte/$(date +%F)
cd ~/backups-corte/$(date +%F)

# DBs legacy (alquileres + ventas) — nombres reales según hPanel
mysqldump -u <USER> -p <DB_LEGACY_ALQUILERES> | gzip > alquileres-legacy.sql.gz
mysqldump -u <USER> -p <DB_LEGACY_VENTAS>     | gzip > ventas-legacy.sql.gz

# Archivos del público legacy + uploads de ventas
tar czf legacy-files.tgz -C <DOCROOT_LEGACY_RAIZ> .
```

> Guardar también una copia local (bajar por scp). Esto es el rollback de último recurso.

---

## 2. Deploy del API a prod (crea el esquema vacío)

El esquema de `nz_prod` lo crean las migraciones, no el dump.

- [ ] Merge `dev` → `production` y push (lo hace el usuario). Dispara `deploy-api`:
      `migrate --force` (crea todas las tablas en `nz_prod`, incluidas las FKs) + `optimize`.
- [ ] Confirmar corrida verde en Actions + health check 200 en `admin.nz-…/api/v1/health`.

> El deploy **no seedea** ni carga datos. Solo deja el esquema y el código.

---

## 3. Cargar los datos reales en `nz_prod`

### 3a. Alquileres (copia 1:1 de datos)

Las tablas destino son idénticas al legacy. Cargar **solo los datos** (no el `CREATE`, ya existe),
con FK checks apagados y en orden de dependencias.

```sh
# 1) Data-only del legacy de alquileres, solo las tablas del dominio, en orden de dependencias.
mysqldump -u <USER> -p --no-create-info --skip-triggers --complete-insert \
  <DB_LEGACY_ALQUILERES> \
  ciudad dueno inquilino propiedad formadepago contrato recibo users \
  > alquileres-data.sql

# 2) Cargar en nz_prod con FK checks off (evita problemas de orden).
{ echo "SET FOREIGN_KEY_CHECKS=0;"; cat alquileres-data.sql; echo "SET FOREIGN_KEY_CHECKS=1;"; } \
  | mysql -u <USER> -p nz_prod
```

Notas:
- Las columnas nuevas de `users` (`password`, `role_id`) son nullable → el dump legacy (solo
  `Pass_User` MD5) carga sin problema. El MD5 se rehashea a bcrypt en el **primer login** (sub-C).
- `recibo.Nro_Recibo` se carga con su valor explícito (el nuevo esquema lo acepta).

### 3b. Validar integridad de alquileres

```sh
cd <DEPLOY_PATH_API> && $PHP artisan legacy:check-orphans
```
Corre sobre `nz_prod`. Debe decir **"Integridad OK"**. Si lista huérfanos, corregir esos registros
en el dump/DB antes de seguir (FK ya aplicadas por la migration).

### 3c. Ventas (comando existente)

Requiere en el `.env` de prod:
```env
NZ_LEGACY_DB_HOST=127.0.0.1
NZ_LEGACY_DB_DATABASE=<DB staging con el dump de ventas importado>
NZ_LEGACY_DB_USERNAME=<user>
NZ_LEGACY_DB_PASSWORD=<pass>
NZ_LEGACY_UPLOADS_PATH=<ruta absoluta a los uploads de ventas del legacy>
```
Primero importar el dump de ventas a una DB staging (ej. `nz_ventas_legacy`) y subir los uploads a
`NZ_LEGACY_UPLOADS_PATH`. Después:

```sh
cd <DEPLOY_PATH_API>
$PHP artisan config:clear
$PHP artisan ventas:import          # lee conexión nzestudio; convierte imágenes a WebP en storage
```
Lee `tipos_propiedad` / `propiedades` / `imagenes_propiedades`, mapea IDs y escribe
`sale_properties` / `property_types` / `property_images` + WebP en `storage/app/public/sale-properties/`.
El comando **trunca** esas 3 tablas antes de importar (idempotente: se puede recorrer varias veces).
Al final reporta "N imágenes (M faltantes)" — si M > 0, revisar `NZ_LEGACY_UPLOADS_PATH`.

### 3d. (Opcional) Fotos de propiedades de alquiler

Legacy guardaba la foto en `propiedad.Foto_Propiedad` (LONGBLOB). La UI nueva usa `foto_path` (WebP en
disco). El data-load copia el blob pero deja `foto_path` null → sin foto en la UI. Si las fotos de
alquiler importan (son admin-internas, baja prioridad), one-shot para extraer blob → WebP → `foto_path`:

```php
// $PHP artisan tinker
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\{Format, ImageManager};

foreach (Property::whereNotNull('Foto_Propiedad')->whereNull('foto_path')->cursor() as $p) {
    $webp = ImageManager::usingDriver(GdDriver::class)
        ->decode($p->Foto_Propiedad)               // blob crudo
        ->encodeUsingFormat(Format::WEBP, quality: 82);
    $path = "propiedades/{$p->ID_Propiedad}/foto.webp";
    Storage::disk('public')->put($path, (string) $webp);
    $p->forceFill(['foto_path' => $path])->save();
}
```
> `Foto_Propiedad` es `hidden` en el modelo; para leer el blob puede requerir `makeVisible` o un
> `DB::table('propiedad')->...`. Ajustar si tinker no lo trae. Si no hay fotos que importen, **saltear**.

### 3e. Symlink + roles

```sh
cd <DEPLOY_PATH_API>
$PHP artisan storage:link                          # public/storage → storage/app/public
$PHP artisan db:seed --class=RoleSeeder --force    # crea roles + promueve SUPERADMIN_EMAIL a superadmin
```

---

## 4. Verificar conteos (nz_prod == legacy)

```sh
cd <DEPLOY_PATH_API> && $PHP artisan tinker
```
```php
[
  'ciudades'  => \App\Models\City::count(),
  'duenos'    => \App\Models\Owner::count(),
  'inquilinos'=> \App\Models\Tenant::count(),
  'propiedades'=> \App\Models\Property::count(),
  'contratos' => \App\Models\Contract::count(),
  'recibos'   => \App\Models\Receipt::count(),
  'ventas'    => \App\Models\SaleProperty::count(),
  'imgs_venta'=> \App\Models\PropertyImage::count(),
  'users'     => \App\Models\User::count(),
];
```
Cada número debe coincidir con las filas del legacy correspondiente. Si algo no cuadra, revisar el
paso 3 antes de exponer el sitio.

---

## 5. Deploy del público a prod

El build de Next trae el catálogo **de la API prod en vivo** → correr **después** de cargar ventas.

- [ ] `deploy-public` (push que toque `apps/public/**` en `production`, o Run workflow manual sobre
      `production`). Buildea con `NEXT_PUBLIC_GA_ID` (GA solo en prod) + `GOOGLE_MAPS_API_KEY`.
- [ ] Corrida verde + health check del dominio raíz.

---

## 6. Smoke test de producción

- [ ] Login en `admin.nz-…` con el superadmin → entra, ve alquileres + ventas.
- [ ] Abrir un recibo → **PDF** (dompdf) renderiza bien.
- [ ] Sitio público (dominio raíz): home, mapa, catálogo, **una propiedad** (galería + OG correcto).
- [ ] (Opcional) un envío WhatsApp de prueba (recibo o recordatorio) — verifica token + cron prod.
- [ ] GA4 → Tiempo real: la visita aparece; click "Consultar por WhatsApp" → evento `whatsapp_click`.

---

## 7. Switch de dominio + baja del legacy

- [ ] Apuntar el docroot del **dominio raíz** al `out/` del público nuevo (secret `DEPLOY_PATH_PUBLIC`
      de prod ya lo refleja; confirmar que hPanel sirve el sitio nuevo).
- [ ] Verificar que `nz-estudiojuridicoinmobiliario.com` sirve el sitio nuevo, no el legacy.
- [ ] Con todo verificado, **bajar el legacy** (mover su carpeta fuera del webroot; conservar el backup
      del paso 1). No borrar los backups.

---

## 8. Rollback (si algo sale mal)

- **Datos/deploy nuevo**: restaurar desde los backups de la corrida en
  `<dominio>/backups/production/{api,public}/<timestamp>/` (ver README-deploy § Rollback).
- **Volver al legacy**: re-apuntar el docroot del dominio raíz al legacy y restaurar sus DBs desde
  `~/backups-corte/<fecha>/` (paso 1). El legacy no se toca hasta el paso 7, así que el rollback es
  volver a apuntarlo.

---

## Al cerrar el corte

- Actualizar `docs/roadmap.md` (Fase 7 = DONE) + `docs/changelog.md`.
- Rotar la contraseña de Hostinger (pendiente histórico del proyecto).
- Marcar `whatsapp_click` como evento clave en GA4 (si no se hizo en el smoke test).
