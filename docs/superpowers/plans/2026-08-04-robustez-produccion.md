# Robustez en producción: Sentry + Error Boundaries + Lazy Loading

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir monitoreo de errores (Sentry) en backend y frontend, Error Boundaries en el admin React, y lazy loading de 14 rutas para reducir el bundle inicial.

**Architecture:** Sentry SDK en ambos extremos (`sentry/sentry-laravel` en API, `@sentry/react` en SPA); `ErrorBoundary` wrapper de `Sentry.ErrorBoundary` en dos niveles (AppLayout + main.tsx); `React.lazy()` en cada página del router con `Suspense` global en `main.tsx`.

**Tech Stack:** PHP 8.4 / Laravel 12, React 19 / Vite 7, TypeScript strict, `sentry/sentry-laravel`, `@sentry/react`.

## Global Constraints

- Idioma de UI y mensajes al usuario: **español**.
- PHP: `declare(strict_types=1)` en cada archivo nuevo.
- TypeScript strict mode ON.
- `SENTRY_LARAVEL_DSN` y `VITE_SENTRY_DSN` son **secretos** — nunca en el repo. Solo en `.env` del server y GitHub Actions Secrets.
- No commitear `.env`, credenciales ni archivos generados.
- Docker Compose: servicio PHP es `php-fpm` (no `php`). Node es `node`.
- Tests dentro del container: `docker compose exec php-fpm pest`.

---

### Task 1: Sentry backend

**Files:**
- Create: `apps/api/config/sentry.php` (publicado por el paquete, luego reducido)
- Modify: `apps/api/bootstrap/app.php` — añadir captureException en `withExceptions`
- Modify: `apps/api/.env.example` — añadir `SENTRY_LARAVEL_DSN=`
- Modify: `.github/workflows/deploy-api.yml` — inyectar `SENTRY_LARAVEL_DSN` al `.env` del server en post-deploy

**Interfaces:**
- Consumes: `bootstrap/app.php` con `withExceptions` hook (línea 19)
- Produces: toda excepción no manejada en producción capturada por Sentry

- [ ] **Step 1: Instalar paquete**

```bash
docker compose exec php-fpm composer require sentry/sentry-laravel
```

Expected: `sentry/sentry-laravel` en `composer.json` y `composer.lock`.

- [ ] **Step 2: Publicar config**

```bash
docker compose exec php-fpm php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"
```

Expected: crea `apps/api/config/sentry.php`.

- [ ] **Step 3: Reducir config publicado**

Reemplazar el contenido de `apps/api/config/sentry.php` por:

```php
<?php

declare(strict_types=1);

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.0),

    'breadcrumbs' => [
        'logs'       => true,
        'cache'      => false,
        'livewire'   => false,
        'sql_queries' => false,
    ],

    'send_default_pii' => false,
];
```

- [ ] **Step 4: Editar `bootstrap/app.php`**

El bloque `withExceptions` actual (líneas 19–22):

```php
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
```

Reemplazar con:

```php
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
        $exceptions->report(function (\Throwable $e): void {
            if (app()->bound('sentry')) {
                \Sentry\captureException($e);
            }
        });
    })->create();
```

- [ ] **Step 5: Añadir variables a `.env.example`**

Al final de `apps/api/.env.example` agregar:

```
# Error monitoring (Sentry). Obtener DSN en sentry.io → Settings → Projects → Client Keys.
SENTRY_LARAVEL_DSN=
SENTRY_TRACES_SAMPLE_RATE=0
```

- [ ] **Step 6: Inyectar secret en CI**

En `.github/workflows/deploy-api.yml`, el step "Post-deploy (migrate + storage:link + caches)" actualmente es:

```yaml
      - name: Post-deploy (migrate + storage:link + caches)
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_PORT: ${{ secrets.SSH_PORT }}
          SSH_USER: ${{ secrets.SSH_USER }}
          DEPLOY_PATH_API: ${{ secrets.DEPLOY_PATH_API }}
        run: |
          ssh -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new "${SSH_USER}@${SSH_HOST}" \
            "cd '${DEPLOY_PATH_API}' && \
             PHP=/opt/alt/php84/usr/bin/php && \
             mkdir -p storage/framework/cache storage/framework/views storage/framework/sessions storage/app/public && \
             \$PHP artisan migrate --force && \
             (\$PHP artisan storage:link || true) && \
             \$PHP artisan optimize"
```

Reemplazar con:

```yaml
      - name: Post-deploy (migrate + storage:link + caches)
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_PORT: ${{ secrets.SSH_PORT }}
          SSH_USER: ${{ secrets.SSH_USER }}
          DEPLOY_PATH_API: ${{ secrets.DEPLOY_PATH_API }}
          SENTRY_LARAVEL_DSN: ${{ secrets.SENTRY_LARAVEL_DSN }}
        run: |
          ssh -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new "${SSH_USER}@${SSH_HOST}" \
            "cd '${DEPLOY_PATH_API}' && \
             PHP=/opt/alt/php84/usr/bin/php && \
             mkdir -p storage/framework/cache storage/framework/views storage/framework/sessions storage/app/public && \
             \$PHP artisan migrate --force && \
             (\$PHP artisan storage:link || true) && \
             \$PHP artisan optimize"
          ssh -p "${SSH_PORT}" -o StrictHostKeyChecking=accept-new "${SSH_USER}@${SSH_HOST}" \
            "cd '${DEPLOY_PATH_API}' && \
             if grep -q '^SENTRY_LARAVEL_DSN=' .env; then \
               sed -i \"s|^SENTRY_LARAVEL_DSN=.*|SENTRY_LARAVEL_DSN=${SENTRY_LARAVEL_DSN}|\" .env; \
             else \
               echo \"SENTRY_LARAVEL_DSN=${SENTRY_LARAVEL_DSN}\" >> .env; \
             fi"
```

- [ ] **Step 7: Verificar container levanta sin errores**

```bash
docker compose restart php-fpm
docker compose exec php-fpm php artisan about
```

Expected: no hay errores relacionados a Sentry. Con `SENTRY_LARAVEL_DSN` vacío en local, Sentry queda silencioso.

---

### Task 2: Sentry frontend

**Files:**
- Create: `apps/web/.env.example`
- Modify: `apps/web/src/main.tsx` — inicializar Sentry antes de `createRoot`
- Modify: `.github/workflows/deploy-api.yml` — inyectar `VITE_SENTRY_DSN` en el build

**Interfaces:**
- Consumes: `main.tsx` existente (líneas 1–22)
- Produces: objeto `Sentry` disponible globalmente; usado por `Sentry.ErrorBoundary` en Task 3

- [ ] **Step 1: Instalar @sentry/react**

```bash
docker compose exec node pnpm --dir apps/web add @sentry/react
```

Expected: `@sentry/react` en `apps/web/package.json` y `pnpm-lock.yaml`.

- [ ] **Step 2: Crear `apps/web/.env.example`**

```
# Admin SPA — variables de entorno Vite
# Copiar a .env.local para desarrollo local (no commitear .env.local)

# Error monitoring (Sentry). Solo activo en producción (enabled: import.meta.env.PROD).
VITE_SENTRY_DSN=
```

- [ ] **Step 3: Inicializar Sentry en `main.tsx`**

El `main.tsx` actual es:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { setUnauthorizedHandler } from './lib/api';
import { queryClient } from './lib/query-client';

// Sesión expirada (401 fuera del login): limpiar cache y volver al login.
setUnauthorizedHandler(() => {
  queryClient.clear();
  void router.navigate('/login');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
```

Reemplazar con:

```typescript
import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { setUnauthorizedHandler } from './lib/api';
import { queryClient } from './lib/query-client';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
});

// Sesión expirada (401 fuera del login): limpiar cache y volver al login.
setUnauthorizedHandler(() => {
  queryClient.clear();
  void router.navigate('/login');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
```

- [ ] **Step 4: Inyectar VITE_SENTRY_DSN en el build de CI**

En `.github/workflows/deploy-api.yml`, el step "Build admin SPA (apps/web)" actualmente es:

```yaml
      - name: Build admin SPA (apps/web)
        working-directory: apps/web
        run: |
          pnpm install --frozen-lockfile
          pnpm build
```

Reemplazar con:

```yaml
      - name: Build admin SPA (apps/web)
        working-directory: apps/web
        env:
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
        run: |
          pnpm install --frozen-lockfile
          pnpm build
```

- [ ] **Step 5: Verificar build local**

```bash
docker compose exec node pnpm --dir apps/web build
```

Expected: build exitoso. Con `VITE_SENTRY_DSN` vacío, Sentry queda silencioso (además `enabled: false` en dev).

---

### Task 3: ErrorBoundary

**Files:**
- Create: `apps/web/src/components/ErrorBoundary.tsx`
- Modify: `apps/web/src/components/layout/AppLayout.tsx` — wrap `<Outlet />`
- Modify: `apps/web/src/main.tsx` — wrap `<AppProviders>`

**Interfaces:**
- Consumes: `@sentry/react` (Task 2), `Sentry.ErrorBoundary` componente clase
- Produces: `ErrorBoundary` exportado como named export, reutilizable en AppLayout y main.tsx

- [ ] **Step 1: Crear `apps/web/src/components/ErrorBoundary.tsx`**

```typescript
import * as Sentry from '@sentry/react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            Ocurrió un error inesperado en esta sección.
          </p>
          <button
            className="text-sm underline underline-offset-4 hover:text-primary"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

- [ ] **Step 2: Wrap `<Outlet />` en AppLayout**

Abrir `apps/web/src/components/layout/AppLayout.tsx`. El área de contenido (línea 106–108):

```tsx
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
```

Cambiar a:

```tsx
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
```

Agregar import al inicio del archivo (junto al resto de imports de componentes):

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

- [ ] **Step 3: Wrap `<AppProviders>` en main.tsx**

El render en `main.tsx` (ya modificado en Task 2):

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
```

Reemplazar con:

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
```

Agregar import al inicio del archivo:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
```

- [ ] **Step 4: Verificar TypeScript**

```bash
docker compose exec node pnpm --dir apps/web tsc --noEmit
```

Expected: 0 errores.

---

### Task 4: Lazy loading + PageLoader

**Files:**
- Create: `apps/web/src/components/PageLoader.tsx`
- Modify: `apps/web/src/app/router.tsx` — convertir 14 imports estáticos a `React.lazy()`
- Modify: `apps/web/src/main.tsx` — wrap `<RouterProvider>` con `<Suspense>`

**Interfaces:**
- Consumes: `PageLoader` (nuevo), `ErrorBoundary` (Task 3)
- Produces: bundle dividido en 14 chunks; `<Suspense>` captura el estado de carga de cada chunk

- [ ] **Step 1: Crear `apps/web/src/components/PageLoader.tsx`**

```typescript
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}
```

- [ ] **Step 2: Reescribir `apps/web/src/app/router.tsx`**

Reemplazar el archivo completo:

```typescript
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireSuperadmin } from '@/features/auth/RequireSuperadmin';

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const CitiesPage = lazy(() =>
  import('@/features/cities/CitiesPage').then((m) => ({ default: m.CitiesPage }))
);
const PaymentMethodsPage = lazy(() =>
  import('@/features/payment-methods/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage }))
);
const OwnersPage = lazy(() =>
  import('@/features/owners/OwnersPage').then((m) => ({ default: m.OwnersPage }))
);
const TenantsPage = lazy(() =>
  import('@/features/tenants/TenantsPage').then((m) => ({ default: m.TenantsPage }))
);
const PropertiesPage = lazy(() =>
  import('@/features/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage }))
);
const ContractsPage = lazy(() =>
  import('@/features/contracts/ContractsPage').then((m) => ({ default: m.ContractsPage }))
);
const ReceiptsPage = lazy(() =>
  import('@/features/receipts/ReceiptsPage').then((m) => ({ default: m.ReceiptsPage }))
);
const RemindersPage = lazy(() =>
  import('@/features/whatsapp/RemindersPage').then((m) => ({ default: m.RemindersPage }))
);
const SalesPropertiesPage = lazy(() =>
  import('@/features/sales-properties/SalesPropertiesPage').then((m) => ({ default: m.SalesPropertiesPage }))
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const MaintenancePage = lazy(() =>
  import('@/features/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage }))
);
const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage }))
);

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'ciudades', element: <CitiesPage /> },
          { path: 'formas-pago', element: <PaymentMethodsPage /> },
          { path: 'duenos', element: <OwnersPage /> },
          { path: 'inquilinos', element: <TenantsPage /> },
          { path: 'propiedades', element: <PropertiesPage /> },
          { path: 'contratos', element: <ContractsPage /> },
          { path: 'recibos', element: <ReceiptsPage /> },
          { path: 'recordatorios', element: <RemindersPage /> },
          { path: 'perfil', element: <ProfilePage /> },
          {
            element: <RequireSuperadmin />,
            children: [
              { path: 'propiedades-venta', element: <SalesPropertiesPage /> },
              { path: 'mantenimiento', element: <MaintenancePage /> },
              { path: 'usuarios', element: <UsersPage /> },
            ],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
```

- [ ] **Step 3: Wrap RouterProvider con Suspense en `main.tsx`**

El render en `main.tsx` (ya modificado en Tasks 2–3):

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
```

Reemplazar con:

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
```

Agregar imports al inicio del archivo:

```typescript
import { Suspense } from 'react';
import { PageLoader } from './components/PageLoader';
```

(el import existente de `StrictMode` pasa a ser `import { StrictMode, Suspense } from 'react';`)

- [ ] **Step 4: Verificar TypeScript**

```bash
docker compose exec node pnpm --dir apps/web tsc --noEmit
```

Expected: 0 errores.

- [ ] **Step 5: Verificar build produce chunks separados**

```bash
docker compose exec node pnpm --dir apps/web build
```

Expected: la salida muestra múltiples archivos JS (un chunk por página). El chunk principal `index-[hash].js` debe ser notoriamente más pequeño que antes.

---

## Guía QA manual (obligatoria antes del commit)

### Setup

```bash
docker compose up -d
# Admin: http://localhost:8080
```

### 1. Sentry backend (solo con DSN real)

Si querés verificar que el backend reporta a Sentry:
- Agregar temporalmente `SENTRY_LARAVEL_DSN=<tu_dsn>` en `apps/api/.env`
- `docker compose exec php-fpm php artisan sentry:test`
- Ir a sentry.io → debe aparecer evento "This is a test exception" en ~30s
- Quitar la línea del `.env` local cuando termines (el DSN se configura en prod manualmente)

### 2. Sentry frontend

- Abrir `http://localhost:8080` en Chrome/Firefox
- DevTools → Network → filtrar por `sentry`
- En dev local: **no debe haber requests** a sentry.io (Sentry inicializado con `enabled: false`)
- Esto es correcto ✓ — solo reporta en producción (cuando `PROD=true`)

### 3. ErrorBoundary

Para probar el fallback visualmente:
- Abrir cualquier página del admin (ej. `/duenos`)
- En `apps/web/src/features/owners/OwnersPage.tsx`, agregar **temporalmente** al inicio del componente:
  ```typescript
  throw new Error('Test ErrorBoundary');
  ```
- Navegar a `/duenos`

**Qué tenés que ver:**
- Mensaje "Ocurrió un error inesperado en esta sección." en el área de contenido
- El sidebar y el header siguen visibles (ErrorBoundary solo cubre el `<Outlet />`)
- Botón "Recargar página" funciona y recarga la app

**Quitar** el `throw` antes del commit.

### 4. Lazy Loading

- DevTools → Network → pestaña JS
- Hacer **hard refresh** (`Ctrl+Shift+R`) en `/` (dashboard)
- Navegar a `/duenos` → debe descargarse un nuevo chunk JS (ej. `OwnersPage-[hash].js`)
- Navegar a `/inquilinos` → debe descargarse otro chunk distinto
- El bundle inicial no contiene las páginas cargadas bajo demanda

### Señales de problema

- ErrorBoundary no aparece ante el `throw` → verificar que `<Outlet />` en `AppLayout.tsx` está dentro del `<ErrorBoundary>`
- No aparecen chunks separados en Network → verificar que los imports en `router.tsx` usan `lazy()` y no import estático
- TypeScript falla → ver Task 4 Step 4

---

## Mensaje de commit sugerido

```
feat(robustez): sentry + error boundaries + lazy loading de rutas
```
