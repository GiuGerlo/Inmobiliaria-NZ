# Fusión NZ Fase 2 — Dominio ventas en Laravel — Design

- **Fecha**: 2026-06-19
- **Estado**: aprobado
- **Track**: Fusión NZ, Fase 2. Spec paraguas: `2026-06-19-fusion-nz-design.md`. ADR-0009.
- **Depende de**: Fase 1 (consolidación, DONE), fases A–D (backend Laravel + patrones API/imagen).

## Problema

El sitio público de venta `nz-estudio` (PHP vanilla) tiene su propio dominio de datos: propiedades en
venta, sus categorías y sus imágenes. Para unificar en un solo backend, ese dominio debe vivir en el
Laravel del monorepo (misma DB, misma API). Esta fase trae **solo el backend** de ventas: tablas,
modelos, API REST y la migración de los datos e imágenes reales del dump. El admin React (Fase 4) y el
sitio público Next (Fase 5) consumirán esta API después.

## Objetivo

- 3 tablas nuevas (inglés/snake_case) + modelos Eloquent + factories.
- API REST: lectura pública (para el SSG) + CRUD autenticado (para el admin), con doc OpenAPI autogenerada.
- Comando artisan one-shot que migra `tipos_propiedad`/`propiedades`/`imagenes_propiedades` del dump a
  las tablas nuevas, copiando y convirtiendo las imágenes a WebP en `storage/app/public`.

## Decisiones (acordadas con el usuario)

1. **Migración** = comando artisan `php artisan ventas:import` (one-shot, idempotente, versionado). No
   seeder con datos embebidos (PII) ni import SQL crudo.
2. **Schema** = paridad 1:1 con el legacy; `servicios`/`caracteristicas`/`mapa` como texto. Normalizar
   queda para más adelante si hace falta.
3. **Scope** = se construyen de una los endpoints **públicos de lectura** (listado/detalle/filtros) y el
   **CRUD admin**. Mismos controllers.
4. **Doc** = Scramble (ADR-0006) autogenera el OpenAPI en `/docs/api`. Sin doc manual.
5. **Gating** = writes detrás de `auth:sanctum`; el candado a rol `superadmin` se agrega en Fase 3
   (Policies preparadas, permisivas por ahora).
6. **Docker/DB** = sin cambios; ventas viven en la misma mariadb. El servicio Next `public` recién en Fase 5.
7. **Naming** (ADR-0002): alquileres conserva nombres legacy en español; ventas son tablas nuevas → inglés.

## Schema (paridad 1:1)

```
property_types     id, name, timestamps
sale_properties    id, property_type_id (FK→property_types, nullable), title, locality, location(text),
                   size, services(text), features(text), map_embed(text), sort_order(int default 0),
                   is_sold(bool default false), latitude decimal(10,8) null, longitude decimal(11,8) null,
                   timestamps
property_images    id, sale_property_id (FK→sale_properties, cascade), path, sort_order(int), timestamps
```

Mapeo legacy→nuevo: `categoria→property_type_id`, `titulo→title`, `localidad→locality`,
`ubicacion→location`, `tamanio→size`, `servicios→services`, `caracteristicas→features`,
`mapa→map_embed`, `orden→sort_order`, `vendida→is_sold`, `ruta_imagen→path`.

Relaciones: `PropertyType hasMany SaleProperty`; `SaleProperty belongsTo PropertyType`, `hasMany
PropertyImage`; `PropertyImage belongsTo SaleProperty`. Casts: `is_sold`→bool, `latitude/longitude`→decimal.

## API (`/api/v1`)

**Lectura pública (sin auth):**
- `GET /sale-properties` — lista + `?filter[type]`, `?filter[sold]`, `?q`, sort, paginación (spatie/query-builder).
- `GET /sale-properties/{id}` — detalle con imágenes ordenadas.
- `GET /property-types`.

**CRUD admin (`auth:sanctum` + `NoStoreHeaders`):**
- `POST/PATCH/DELETE /sale-properties`; `PATCH /sale-properties/reorder`.
- `POST /sale-properties/{id}/images` (multi-upload); `DELETE /sale-property-images/{id}`;
  `PATCH /sale-property-images/reorder`.
- `apiResource property-types`.

FormRequests para validación, API Resources para respuesta, Policies por modelo (permisivas hasta Fase 3).

## Imágenes

Multi-upload → validar **mime real** (FormRequest tipo `StorePropertyPhotoRequest`) → convertir a WebP con
`Intervention\Image\ImageManager` (GD, `Format::WEBP` q82) → `Storage::disk('public')->put('sale-properties/{id}/{uuid}.webp')`
→ fila `property_images`. Reusa el patrón exacto de `PropertyPhotoController` (sub-D).

## Comando `ventas:import`

`App\Console\Commands\ImportVentas` (`ventas:import`). Setup local (gitignored): importar `nzestudio.sql`
a una base `nzestudio` en la misma mariadb; conexión secundaria `nzestudio_legacy` en `config/database.php`;
dejar los WebP originales accesibles al container. El comando es **idempotente** (trunca las 3 tablas +
limpia `storage/app/public/sale-properties/` antes de reimportar): copia `tipos_propiedad`→`property_types`,
`propiedades`→`sale_properties` (mapeo de campos), e `imagenes_propiedades`→`property_images` copiando/
convirtiendo cada WebP. Reporta totales; faltantes se avisan sin abortar.

## Testing

Pest (`tests/Feature/`): lectura pública sin auth, CRUD exige auth (401 sin token), filtros/sort, validación
de mime en upload, reorder, y un test del comando con fixture chico. Factories para los 3 modelos.

## Verificación / done

- Pest verde. `ventas` visible en `/docs/api` (Scramble). Smoke manual con el dump real (Docker). `/security-review`
  sin hallazgos (SQLi en import, uploads por mime real, prepared statements). `/fase-close`.

## Fuera de alcance

- Frontend admin (Fase 4) y sitio público Next (Fase 5).
- Rol `superadmin`/gating fino (Fase 3).
- Normalización de campos de texto.
