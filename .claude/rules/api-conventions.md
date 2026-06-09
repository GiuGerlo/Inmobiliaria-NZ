# Convenciones API REST

## Estructura

- Prefijo: `/api/v1/...`. Versionar desde el día 1.
- Recursos en plural inglés: `/api/v1/properties`, `/api/v1/owners`, `/api/v1/tenants`, `/api/v1/contracts`, `/api/v1/receipts`, `/api/v1/cities`, `/api/v1/payment-methods`.
- Verbos REST estándar: `GET` lista/detalle, `POST` crear, `PATCH` modificar parcial, `PUT` reemplazo total, `DELETE` borrar.

## Respuestas

- Siempre **API Resource** (`JsonResource`) — nunca devolver model crudo.
- Listas paginadas con meta de paginación de Laravel (`data`, `meta`, `links`).
- Códigos HTTP correctos: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`.
- Errores de validación con `422` y formato Laravel default (`{ message, errors }`).
- Errores de negocio devuelven JSON con `{ message, code? }`. Opción: adoptar **RFC 7807 (Problem Details)** — decisión en ADR si se ve necesario.

## Filtros, búsqueda, ordenamiento

- Query string:
  - Búsqueda: `?q=...` (full-text simple).
  - Filtros: `?filter[campo]=valor`.
  - Orden: `?sort=campo` o `-campo` (desc).
  - Paginación: `?page=N&per_page=M` (`per_page` con tope, ej. 100).
- Considerar `spatie/laravel-query-builder` para evitar reinventar.

## Auth

- Sanctum cookie-based para SPA del mismo dominio.
- Tokens personales solo si aparece integración externa (no por ahora).
- Cada endpoint privado pasa por middleware `auth:sanctum`.
- Autorización vía **Policies** por modelo. No `if ($user->id !== ...)` en controllers.

## Documentación

- Generar OpenAPI desde código (ej. `scramble`) o mantener `docs/api/openapi.yaml`. Decisión en ADR.

## Headers obligatorios en responses

- `X-Content-Type-Options: nosniff`
- `Cache-Control: no-store` para endpoints autenticados que devuelven PII.
