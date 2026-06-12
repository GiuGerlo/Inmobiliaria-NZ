# Plan — Sub-D — API REST CRUD

> Fuente: `docs/superpowers/specs/2026-06-10-sub-D-api-crud-design.md` (aprobado 2026-06-10).
> Branch: `fase/D-api-crud`.

## Pasos

### Step 1 — Dependencias + infra
- [x] `composer require spatie/laravel-query-builder dedoc/scramble intervention/image`.
- [x] Dockerfile php-fpm: `libwebp-dev` + gd `--with-webp` → rebuild → `gd_info()['WebP Support'] = true`.
- [x] Migration `add_foto_path_to_propiedad` (varchar 255 nullable, guard `hasColumn`).
- [x] nginx location `/storage/` (alias al disk public, sin symlink por bind mount Windows) + `/docs/` → rebuild nginx. Entrypoint `chmod ugo+rwX storage bootstrap/cache`.

### Step 2 — Resources ×7
- [x] City, Owner, Tenant, Property (con `photo_url`), Contract, Receipt, PaymentMethod. Campos en inglés, `whenLoaded`.

### Step 3 — FormRequests Store/Update ×7
- [x] Subcarpeta por entidad. Reglas espejo legacy (exists, largos, Si/No, meses español, importes ≥0, end > start). Mensajes en español (`lang/es/validation.php`).

### Step 4 — Controllers + rutas
- [x] 7 `apiResource` controllers, QueryBuilder en index (spatie v7: firma variádica, no array) + `?q` + per_page tope 100.
- [x] destroy → 409 en FK RESTRICT (trait `HandlesRestrictedDelete`, QueryException 1451). Trait `MapsLegacyFields`.
- [x] `PropertyPhotoController` (upload WebP con `ImageManager::usingDriver(GdDriver)->decodePath()->encodeUsingFormat(Format::WEBP)` + delete). Property destroy limpia carpeta.
- [x] Rutas en grupo `auth:sanctum` existente. `route:list` → 43 rutas.

### Step 5 — Scramble + ADRs
- [x] OpenAPI en `/docs/api` (gateado a local). Spec completo: 43 rutas, schemas, 409 tipados.
- [x] ADR-0006 (OpenAPI scramble) + ADR-0007 (foto file storage WebP).

### Step 6 — Tests
- [x] `tests/Feature/Api/<Entity>Test.php` ×7 + `PropertyPhotoTest`: index/filtros/sort, store 201+422, show+404, update, destroy 204+409, 401, foto (webp por magic bytes, mime falso 422, replace, delete, cleanup en destroy).
- [x] Suite completa: **83 passed (301 assertions)**.

### Step 7 — Verificación + cierre
- [x] `pint` limpio (1 fix auto). curl E2E real sobre el stack: login → CRUD 7 recursos → foto webp servida en `/storage/` → filtro mes/año + include anidado + paginación → 409 por FK → borrado en cascada (todos 204). Usuario y temporales E2E limpiados.
- [x] `/security-review`: cero hallazgos (upload re-encodea a WebP, sin path traversal, `?q` con binding, mass-assignment cerrado por validated()+FIELD_MAP, nginx no ejecuta PHP en /storage).
- [x] roadmap (D DONE), changelog, este plan DONE, commit sugerido.

## Verificación ejecutada (2026-06-10)

```
pest                 → 83 passed (301 assertions)
pint --test          → 109 files PASS
curl E2E             → login + 7 CRUD + foto webp + filtros/include + 409 FK + cascada (todos OK)
/docs/api            → OpenAPI con 43 rutas
security-review      → 0 hallazgos
```

## Fuera de scope (recordatorio)

PDFs (sub-F), frontend (sub-E), roles (sub-G), tipos legacy, galería multi-foto.

> ✅ DONE — 2026-06-10.
