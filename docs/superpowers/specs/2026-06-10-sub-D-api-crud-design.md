# Sub-D — API REST CRUD (design spec)

- **Sub-proyecto**: D
- **Fecha**: 2026-06-10
- **Estado**: aprobado
- **Branch**: `fase/D-api-crud`
- **Depende de**: sub-C (DONE)

## Contexto

El legacy maneja los 7 ABMs (ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago) con páginas PHP + DataTables + controladores `registrar-/modificar-/eliminar-*` sin validación server-side. Sub-D los reemplaza con una API REST completa sobre los modelos Eloquent de sub-B, protegida con la auth Sanctum de sub-C. Es el insumo directo del frontend (sub-E) y de los PDFs (sub-F).

## Decisiones de esta fase

| # | Decisión | Razón |
|---|---|---|
| 1 | `apiResource` controllers ×7 + FormRequests + Resources, sin service layer | CRUD plano sin lógica de negocio (eso es sub-F). Patrón estándar, consistente con sub-C. |
| 2 | **spatie/laravel-query-builder** para filtros/orden/includes | api-conventions.md lo sugería; evita reinventar parsing ×7 recursos. |
| 3 | DELETE → si FK RESTRICT salta, **409 Conflict** con mensaje claro | Datos contables no se borran en cascada. Sin soft deletes (romperían paridad con el legacy que lee las mismas tablas). |
| 4 | Foto de propiedad: **archivo WebP en disco + path en DB** (no LONGBLOB) | Pedido del usuario. El legacy no usa `Foto_Propiedad` (columna muerta verificada — solo una referencia comentada). Una foto por propiedad. |
| 5 | Columna nueva `foto_path` varchar nullable en `propiedad` | LONGBLOBs viejas (`Foto_Propiedad`, `Foto_Propiedad_GXI`) quedan intactas hasta deprecar el legacy. |
| 6 | **dedoc/scramble** para OpenAPI autogenerada | Cierra la decisión pendiente de api-conventions.md (ADR). Sub-E consume la API con docs frescas. |
| 7 | Campos de API en inglés (Resources como capa de traducción) | Mismo patrón que `UserResource` (ADR-0002: modelos en inglés, tablas legacy). |

## Endpoints

Todo bajo `auth:sanctum` + `NoStoreHeaders`, prefix `/api/v1`. `Route::apiResource()` da index/store/show/update/destroy.

| Recurso | Ruta | Modelo | PK | Extra |
|---|---|---|---|---|
| cities | `/cities` | City | `CodP` (string) | |
| owners | `/owners` | Owner | `ID_Dueno` | |
| tenants | `/tenants` | Tenant | `ID_Inquilino` | |
| properties | `/properties` | Property | `ID_Propiedad` | `POST /properties/{id}/photo`, `DELETE /properties/{id}/photo` |
| contracts | `/contracts` | Contract | `ID_Contrato` | |
| receipts | `/receipts` | Receipt | `Nro_Recibo` | |
| payment-methods | `/payment-methods` | PaymentMethod | `ID_FP` | |

Códigos: 200 lista/detalle/update, 201 store, 204 destroy y delete photo, 401 sin auth, 404 no existe, 409 delete con dependencias, 422 validación.

## Listados (query-builder)

- `?filter[campo]=valor` — whitelist por recurso. Ejemplos: receipts → `contract_id`, `month`, `year`, `payment_method_id`; properties → `city`, `type`; contracts → `owner_id`, `tenant_id`, `property_id`.
- `?sort=campo` / `-campo` — whitelist por recurso (default: PK desc en recibos/contratos, nombre asc en el resto).
- `?include=` — whitelist: ej. `receipts?include=contract.owner,paymentMethod`, `properties?include=city`.
- `?q=` — búsqueda simple sobre campos de texto del recurso (filter callback con `LIKE`).
- Paginación: `?page=N&per_page=M`, default 25, tope 100. Respuesta `data/meta/links` estándar.

## Validación (FormRequests Store/Update por entidad)

Espejo de tipos legacy. Reglas clave:

- **City**: `code` requerido ≤8 unique (store), `name` ≤30, `province` ≤30.
- **Owner/Tenant**: `name` requerido, `phone`, `email` formato email, `city_code` exists:ciudad.
- **Property**: `address` requerido, `city_code` exists, `type`, `services`, `price` entero ≥0, `features`.
- **Contract**: `owner_id`/`tenant_id`/`property_id` exists, `start_date`/`end_date` dates con `end_date > start_date`, `balance` entero, `certification` ∈ {Si, No}.
- **Receipt**: `contract_id`/`payment_method_id` exists, `paid_at` date, importes (`property`, `municipal`, `water`, `electricity`, `gas`, `repairs`, `funeral`, `fees`) enteros ≥0 nullable, `month` ∈ meses en español ("Enero"…"Diciembre"), `year` entero razonable, `comments` libre.
- **PaymentMethod**: `description` requerida ≤45.

Update = mismas reglas con `sometimes` + unique ignorando el propio ID. Mensajes en español.

## Foto de propiedad

- Migration: `foto_path` varchar(255) nullable en `propiedad` (guard `hasColumn`).
- `POST /properties/{id}/photo` (multipart `photo`):
  1. Validación: mime real jpeg/png/webp vía finfo (rule `File::image()` + `mimetypes`), máx 5 MB.
  2. Conversión a WebP con **Intervention Image v3** (driver GD — requiere `libwebp-dev` + `--with-webp` en el Dockerfile de php-fpm → rebuild).
  3. Guarda en disco `public`: `propiedades/{id}/foto.webp`. Subir de nuevo reemplaza el archivo.
  4. `foto_path` = path relativo; el Resource expone URL completa (`/storage/propiedades/{id}/foto.webp`).
- `DELETE /properties/{id}/photo`: borra archivo + `foto_path = null` → 204.
- nginx: nueva location `/storage/` → filesystem del API (`public/storage` symlink vía `storage:link`).
- Al borrar la propiedad, borrar también su carpeta de fotos.

## Errores

- Delete con dependencias: capturar `QueryException` código 1451 → 409 `{ "message": "No se puede eliminar: tiene registros asociados." }` (mensaje específico por recurso).
- 404 default de Laravel en JSON (`shouldRenderJsonWhen` ya configurado).
- Validación: 422 formato Laravel estándar.

## OpenAPI (scramble)

- `dedoc/scramble` instalado; docs en `/docs/api` accesibles solo en `local`.
- Sin anotaciones: scramble infiere de FormRequests/Resources/route model binding.
- ADR nuevo: documentación OpenAPI autogenerada (cierra pendiente de api-conventions.md).
- ADR nuevo: foto en file storage WebP en vez de LONGBLOB.

## Tests de la fase (DoD)

Por cada uno de los 7 recursos:
- [ ] index paginado (meta/links) + al menos un filtro y un sort.
- [ ] store OK 201 + validación 422 (caso representativo).
- [ ] show OK + 404.
- [ ] update OK.
- [ ] destroy OK 204 + destroy con dependencias 409 (donde aplique: city, owner, tenant, property, contract, payment-method).
- [ ] 401 sin sesión.

Foto:
- [ ] upload OK → 200, archivo webp existe, `foto_path` seteado.
- [ ] txt renombrado `.jpg` → 422 (finfo).
- [ ] re-upload reemplaza archivo.
- [ ] delete photo → 204, archivo borrado, `foto_path` null.
- [ ] destroy de property borra carpeta.

Suite completa verde (`docker compose exec php-fpm ./vendor/bin/pest`). Cobertura del área CRUD ≥ 80%.

## Fuera de scope

- Recibo/rendición PDF (sub-F).
- Frontend (sub-E).
- Roles/policies (sub-G — con un solo usuario, `auth:sanctum` alcanza).
- Corrección de tipos legacy (`Mes_Rend` int, `Certificacion` bool, decimales con centavos) — post-deprecate.
- Galería multi-foto (candidato sub-G).

## Riesgos

- **DB compartida**: columna nueva `foto_path` es aditiva — el legacy hace INSERT sin listarla y tiene default NULL. Sin riesgo.
- **Rebuild de php-fpm** por libwebp: probar `imagewebp()` disponible post-build.
- **`per_page` sin tope** sería un DoS fácil — tope 100 obligatorio.
- **Paths de foto**: `{id}` viene de route model binding (entero validado), no de input libre — sin path traversal.

## Referencias

- Spec sub-B (schema): `docs/superpowers/specs/2026-06-09-sub-B-schema-migrations-design.md`.
- Reglas: `.claude/rules/api-conventions.md`, `.claude/rules/security.md` (regla 10 uploads).
- Legacy: `legacy/controlador/*.php`, `legacy/propiedades.php`.
