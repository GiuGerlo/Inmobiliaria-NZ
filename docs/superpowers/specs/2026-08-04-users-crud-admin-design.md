# Spec: CRUD de Usuarios — Panel Admin

- **Fecha**: 2026-08-04
- **Estado**: aprobada

## Contexto

El superadmin no puede gestionar los usuarios del panel desde la UI. Para crear una cuenta de staff
(`inmobiliaria`) o cambiar credenciales, hoy hay que ir a tinker o phpMyAdmin. Esta fase agrega la
gestión completa de usuarios dentro del mismo admin.

## Campos del usuario

| Campo | Tipo | Notas |
|-------|------|-------|
| nombre | string, max 100 | Nombre y apellido |
| email | string, email unique | Login |
| password | string, min 8 | Con toggle mostrar/ocultar; opcional al editar |
| rol | select | `superadmin` \| `inmobiliaria`; opciones desde `GET /roles` |

## UX

- Página `/usuarios` visible solo para superadmin (gate `manage-users`).
- Tabla: nombre, email, badge de rol, columna de acciones.
- Dialog único para crear y editar (título dinámico).
  - Al editar: password y confirmar vacíos con placeholder "Dejar vacío para no cambiar".
  - Eye-toggle en ambos campos de password.
- Dialog separado de sesiones activas (acción "Sesiones" en el dropdown de acciones).
  - Muestra: IP, browser/OS simplificado, última actividad, badge "Actual" en la sesión propia.
  - Botón "Revocar" por sesión + "Revocar todas" en el footer.
- Sin restricciones: el superadmin puede editar o eliminar cualquier usuario.

## Backend

- Gate `manage-users`: solo superadmin.
- `GET /api/v1/roles` — pública (dentro de auth), devuelve `[{ id, name, label }]`.
- `GET /api/v1/users` — lista paginada, ordenada por nombre.
- `POST /api/v1/users` — crear usuario.
- `PATCH /api/v1/users/{user}` — editar; password solo si viene en el payload.
- `DELETE /api/v1/users/{user}` — eliminar (borra también sus sesiones).
- `GET /api/v1/users/{user}/sessions` — sesiones activas del usuario.
- `DELETE /api/v1/users/{user}/sessions` — revocar todas.
- `DELETE /api/v1/users/{user}/sessions/{sessionId}` — revocar una.

## Criterio de done

- Superadmin puede crear, editar y eliminar usuarios desde la UI.
- Superadmin puede ver y revocar sesiones activas de cualquier usuario.
- Usuario con rol `inmobiliaria` no ve `/usuarios` en la nav ni puede llamar a los endpoints.
- Tests Pest para CRUD y sesiones, verdes en CI.
