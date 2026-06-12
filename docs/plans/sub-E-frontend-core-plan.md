# Plan — Sub-E Frontend React core (fundación + slice Ciudades)

> Spec: `docs/superpowers/specs/2026-06-12-sub-E-frontend-core-design.md`. Estado: **DONE 2026-06-12** (pendiente solo `/security-review` del branch).

## Pasos

### 1. Tooling base
- Instalar deps: `tailwindcss @tailwindcss/vite`, `@hookform/resolvers react-hook-form zod`, `@tanstack/react-table`, `class-variance-authority clsx tailwind-merge lucide-react`, dev: `msw`.
- `vite.config.ts`: plugin `@tailwindcss/vite` + alias `@`→`src`. `tsconfig` paths `@/*`.
- `src/styles/index.css`: `@import "tailwindcss"` + `@theme` con tokens NZ (navy `#05172D`, blue, fondo). Poppins por `<link>` en `index.html`.
- `npx shadcn init` + agregar: button input label form table dialog dropdown-menu sonner card badge skeleton select tooltip.
- **Done**: `pnpm dev` levanta con Tailwind activo; un componente shadcn renderiza.

### 2. Infra app (providers, router, api)
- `lib/api.ts` (axios withCredentials + withXSRFToken, interceptor 401), `lib/csrf.ts` (ensureCsrf), `lib/query-keys.ts`.
- `app/providers.tsx` (QueryClientProvider + `<Toaster/>` sonner), `app/router.tsx` (createBrowserRouter), `main.tsx` monta todo.
- **Done**: app arranca con router; `/` redirige según auth.

### 3. Auth
- `features/auth/useAuth.ts` (me/login/logout), `RequireAuth.tsx`, `LoginPage.tsx` (RHF+zod, logo NZ, 422→campos, 429→toast).
- **Done**: login real contra API funciona; sesión persiste; logout limpia.

### 4. Layout NZ
- `components/layout/AppLayout.tsx` + `Sidebar.tsx` (6 secciones, solo Ciudades activa) + `UserMenu.tsx`.
- **Done**: shell navy responsive con Outlet; UserMenu hace logout.

### 5. DataTable genérico
- `components/data-table/DataTable.tsx` (TanStack manual sorting/pagination) + `DataTablePagination.tsx` + `DataTableToolbar.tsx` (search debounce + filtros). `ConfirmDialog.tsx`.
- **Done**: tabla server-side mapea estado → params API.

### 6. Slice Ciudades
- `features/cities/`: types, api, queries, schema, columns, `CitiesPage.tsx`, `CityFormDialog.tsx`.
- Borrado maneja 409.
- **Done**: CRUD ciudades end-to-end contra API real.

### 7. Tests
- Vitest + TL + MSW: LoginPage, useAuth, DataTable, Ciudades CRUD + 409. Reemplazar test health.
- **Done**: `pnpm test` + `pnpm lint` verdes.

### 8. Cierre
- changelog + roadmap + plan DONE + `/security-review` + sugerir commit.

## Verificación
Ver sección Verificación del spec. Manual en `http://localhost:8080` + suite Vitest.
