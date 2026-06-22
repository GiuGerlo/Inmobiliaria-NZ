# Fusión NZ Fase 3 — Auth + roles — Design

- **Fecha**: 2026-06-19
- **Estado**: aprobado
- **Track**: Fusión NZ, Fase 3. Spec paraguas: `2026-06-19-fusion-nz-design.md`. ADR-0009.
- **Depende de**: Fase 2 (dominio ventas), sub-C (auth Sanctum).

## Problema

Tras Fase 2, cualquier usuario autenticado puede escribir el dominio ventas (los writes solo están detrás
de `auth:sanctum`). El negocio requiere que **solo el superadmin (Giuliano)** gestione ventas, mientras el
**staff inmobiliaria** (incluida la dueña Nadina) sigue trabajando solo alquileres. Falta una noción de rol.

## Objetivo

Introducir 2 roles y gatear las escrituras de ventas al superadmin. Backend-only: el ocultamiento de la
sección ventas en la UI del admin es Fase 4 (se apoya en el rol expuesto por la API).

## Decisiones (acordadas con el usuario)

1. **Implementación** = tabla `roles` + FK `role_id` en `users` (un usuario tiene UN rol). Se descartó
   `spatie/laravel-permission` (RBAC completo, overkill para 2 roles) y la columna string suelta (el usuario
   prefirió relación por id).
2. **Roles** = `superadmin` (ve todo, incl. ventas) / `inmobiliaria` (solo alquileres).
3. **Superadmin** = `ggiuliano526@gmail.com`, hardcodeado en el seeder. El resto → `inmobiliaria`.
4. **Gate** = un único Gate `manage-sales` aplicado a las rutas de escritura de ventas. **Desviación
   consciente de `api-conventions.md`** ("autorización vía Policies por modelo"): el gate es coarse por rol y
   2 Policy classes con el mismo chequeo aportarían boilerplate sin valor. Si en el futuro la autorización se
   vuelve por-registro, se migra a Policies.
5. **`role_id` nullable** = least privilege: un usuario sin rol no puede escribir ventas (`isSuperadmin()`
   null-safe → false).

## Schema

```
roles    id, name (unique: superadmin|inmobiliaria), label (nullable), timestamps
users    + role_id  (foreignId nullable, constrained roles, nullOnDelete)
```

Modelos: `Role` con constantes `SUPERADMIN`/`INMOBILIARIA` y `hasMany(User)`; `User belongsTo Role`
(relación `role()`), helper `isSuperadmin(): bool`.

## Autorización

- `Gate::define('manage-sales', fn (User $u) => $u->isSuperadmin())` en `AppServiceProvider::boot()`.
- Rutas de escritura de ventas (`POST/PATCH/DELETE` de `sale-properties` y `property-types`, reorder, y los
  endpoints de imágenes) llevan `->middleware('can:manage-sales')` además de `auth:sanctum`.
- Lecturas públicas de ventas: **sin cambios** (siguen públicas, para el SSG). Endpoints de alquileres: **sin
  cambios** (ambos roles).

## Exponer rol

`UserResource` suma `role` (el `name`) e `is_superadmin` (bool). Lo consumen `/me` y el login; la UI de Fase 4
muestra/oculta la sección ventas según eso.

## Testing

- `UserFactory` states `->superadmin()` / `->inmobiliaria()`.
- `SalesAuthorizationTest`: inmobiliaria → 403 en cada write de ventas; superadmin → ok; lectura pública sin
  auth sigue 200; `/me` trae `role` + `is_superadmin`.
- Actualizar los tests de ventas de Fase 2 (`PropertyTypeTest`, `SalePropertyTest`, `SalePropertyImageTest`)
  para actuar como superadmin en los writes (si no, 403).
- Test del seeder: Giuliano queda superadmin.

## Verificación / done

- `migrate` + `db:seed --class=RoleSeeder` ok. Pest completo verde. Smoke: 403 inmobiliaria / 200 superadmin;
  `/me` con rol; lectura pública intacta. `/security-review` sin hallazgos. `/fase-close`.

## Fuera de alcance

- Ocultar la sección ventas en la UI (Fase 4).
- Gestión de usuarios/altas con selección de rol (no hay UI de usuarios todavía).
- Permisos granulares (si aparecen, se evaluará migrar a un esquema de permisos).
