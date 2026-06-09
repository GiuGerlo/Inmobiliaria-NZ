# Stack tecnológico

## Backend

- **PHP 8.5** (la versión más nueva al momento; verificar imagen oficial `php:8.5-fpm-alpine` disponible — si no, fallback a `8.4` y actualizar al salir 8.5).
- **Laravel 12** (última estable) — API REST. Decisión "API-only vs Inertia" se documenta en `docs/adr/0001-laravel-api-only-vs-inertia.md`.
- **Laravel Sanctum** para auth SPA (cookies HttpOnly + CSRF).
- **Eloquent ORM** + migrations + seeders + factories.
- **spatie/laravel-permission** para roles/permisos (si el sub-proyecto C lo confirma).
- **spatie/laravel-pdf** o **dompdf** vía Laravel para recibos/rendiciones. Decisión en ADR.
- **Pest** como test runner (preferido sobre PHPUnit puro).
- **Laravel Horizon** + Redis si aparecen jobs en cola (notificaciones, exports). Diferido hasta sub-G.

## Frontend

- **React 19** + **Vite 7** + **TypeScript** (strict).
- **React Router** (v7) para routing.
- **TanStack Query** (React Query) para estado servidor.
- **React Hook Form** + **Zod** para formularios + validación.
- **Tailwind CSS 4** + **shadcn/ui** como base de componentes.
- **Axios** o `fetch` nativo (decidir en sub-E).
- **Vitest** + **Testing Library** para tests.
- **ESLint** + **Prettier** + reglas de `react-hooks` y `jsx-a11y`.

## Base de datos

- **MariaDB 11.8.6** (espejo de producción Hostinger).
- `utf8mb4` / `utf8mb4_general_ci`.
- Naming destino: snake_case, inglés (renombrar `dueno` → `owners`, `inquilino` → `tenants`, etc.). La decisión de **rename vs preservar nombres en español** se trata en ADR.

## Infra local

- **Docker Compose**: servicios `nginx`, `php`, `mariadb`, `phpmyadmin`, `node` (Vite dev).
- Volúmenes nombrados para DB; bind mount para código.
- `.env.example` versionado, `.env` ignorado.
- Dump inicial: `db/db.sql` se importa automáticamente la primera vez (`docker-entrypoint-initdb.d/`).

## Producción

- Por ahora: Hostinger (compartido). A mediano plazo evaluar VPS para correr contenedores.
- CI/CD: GitHub Actions → rsync/SFTP (Hostinger compartido no corre containers).
- ADR pendiente: `docs/adr/0003-deploy-strategy.md`.

## Herramientas de desarrollo

- **CodeGraph MCP** (índice estructural) — ver `codegraph.md`.
- **Context7 MCP** — docs actualizadas de librerías.
- Skills relevantes: `brainstorming`, `frontend-design`, `docker-expert`, `laravel-specialist`, `shadcn`, `simplify`, `security-review`, `caveman-commit`.
