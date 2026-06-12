# Sub-E — Frontend React core (fundación + slice Ciudades) — Design

- **Fecha**: 2026-06-12
- **Estado**: aprobado
- **Depende de**: sub-D (API REST), sub-C (auth Sanctum).

## Problema

El backend (sub-A..D) expone una API REST Sanctum cookie-based completa: auth, perfil y CRUD de 7 recursos con filtros/orden/paginación y OpenAPI viva. `apps/web` sigue siendo el scaffold de sub-A: React 19 + Vite 6 + TS strict con `react-query`/`axios`/`react-router` instalados pero **nada montado** (App.tsx es un health-check de ejemplo). No hay UI usable.

## Objetivo

Construir la **fundación de la SPA** con identidad NZ y un **vertical slice CRUD completo de Ciudades** como patrón replicable para los otros 6 recursos. El resto del CRUD queda para sub-fases siguientes (E2…).

## Decisiones (acordadas con el usuario)

1. **Alcance**: fundación + 1 slice (Ciudades). No los 7 recursos en un commit.
2. **Identidad**: refresh moderno sobre paleta NZ (navy `#05172D`, azul primario, fondo claro, logo NZ existente, Poppins). No clon de Bootstrap.
3. **Tablas**: `@tanstack/react-table` headless + DataTable shadcn, server-side (sort/filter/page mapeados a query params de la API).

## Stack incorporado

- **Tailwind CSS 4** vía `@tailwindcss/vite` (config CSS-first, tokens en `@theme`).
- **shadcn/ui** (Tailwind 4 + React 19). Base: button, input, label, form, table, dialog, dropdown-menu, sonner, card, badge, skeleton, select.
- **react-hook-form** + **zod** + `@hookform/resolvers`.
- **@tanstack/react-table**.
- Alias `@/*` → `src/*`.
- **MSW** para tests.

## Arquitectura

SPA con dos zonas de ruta: **pública** (`/login`) y **privada** (todo lo demás bajo `AppLayout`, protegida por `RequireAuth`). Server state vía React Query; client state local con `useState`. Cada feature es un módulo aislado (`features/<x>/`) con su api/queries/schema/columns/page/dialog/types. Primitivos compartidos en `components/` (layout, data-table, ConfirmDialog) y `components/ui` (shadcn).

Ver el desglose de carpetas y los detalles de auth (flujo CSRF cookie + XSRF header), layout (sidebar navy colapsable, 6 secciones con solo Ciudades activa), DataTable genérico server-side y slice Ciudades en el plan de implementación: `docs/plans/sub-E-frontend-core-plan.md`.

## Auth — flujo Sanctum cookie SPA

1. `ensureCsrf()` → `GET /sanctum/csrf-cookie` (setea cookie `XSRF-TOKEN`).
2. `POST /api/v1/auth/login` con `withCredentials` + header `X-XSRF-TOKEN` (axios `withXSRFToken`).
3. Sesión por cookie `HttpOnly`. `GET /me` valida sesión. 401 global → redirige a `/login`.
4. `logout` → `POST /auth/logout` + limpia cache de React Query.

## Manejo de errores

- **422** validación → mensajes a campos del form (RHF `setError`).
- **429** rate limit login → toast.
- **409** Conflict en borrado (FK RESTRICT) → toast con el mensaje del backend, UI intacta.
- **401** → guard redirige a login.

## Testing

Vitest + Testing Library + MSW: LoginPage (ok/422/429), useAuth (login/logout/me), DataTable (cambios de página/orden disparan params correctos), slice Ciudades (lista/crear/editar/borrar/409).

## Fuera de alcance

CRUD de los otros 6 recursos (sub-fases E2+), dashboard/alertas (sub-G), PDFs (sub-F).
