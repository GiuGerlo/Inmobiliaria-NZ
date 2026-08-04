# Spec: Robustez en producción — Error Monitoring + Error Boundaries + Lazy Loading

- **Fecha**: 2026-08-04
- **Estado**: aprobada

## Contexto

El sistema está en producción desde 2026-07-31. Tres gaps técnicos afectan la observabilidad
y la resiliencia del admin en runtime:

1. Si algo explota en la API o en el browser de Nadina, nadie se entera hasta que ella llama.
2. Si un componente React tira una excepción, toda la pantalla del admin queda en blanco.
3. El bundle del admin carga las 14 páginas de una sola vez, aunque el usuario solo entre al dashboard.

---

## 1. Monitoreo de errores — Sentry

### Por qué Sentry
Cubre con SDKs oficiales tanto Laravel (backend) como React (frontend) en una sola cuenta y
un solo dashboard. Free tier (5.000 errores/mes, retención 14 días) es suficiente para este proyecto.

### Backend — `sentry/sentry-laravel`

- Instalar via `composer require sentry/sentry-laravel`.
- Configurar en `bootstrap/app.php` mediante `withExceptions()`:
  ```php
  ->withExceptions(function (Exceptions $exceptions) {
      $exceptions->report(function (Throwable $e) {
          if (app()->bound('sentry')) {
              \Sentry\captureException($e);
          }
      });
  })
  ```
- Variables de entorno:
  - `SENTRY_LARAVEL_DSN` — DSN del proyecto Sentry (secreto, solo en `.env` de prod/dev).
  - `SENTRY_TRACES_SAMPLE_RATE=0` — sin performance tracing (innecesario para este proyecto).
- Publicar config: `php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"`.
- `.env.example` recibe `SENTRY_LARAVEL_DSN=` (vacío, sin valor).
- En CI/CD (GitHub Actions): agregar `SENTRY_LARAVEL_DSN` como secret de repositorio
  e inyectarlo en el paso de deploy para `apps/api/.env`.

### Frontend — `@sentry/react`

- Instalar via `pnpm add @sentry/react` dentro de `apps/web`.
- Inicializar en `apps/web/src/main.tsx` **antes** de montar el árbol React:
  ```ts
  import * as Sentry from '@sentry/react';
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,  // no reporta en dev local
  });
  ```
- Variable de entorno: `VITE_SENTRY_DSN` en `apps/web/.env.production` (gitignored).
  `apps/web/.env.example` recibe `VITE_SENTRY_DSN=` (vacío).
- En CI/CD: agregar `VITE_SENTRY_DSN` como secret e inyectarlo en el build del frontend.

### Notificaciones
- Configurar en el panel de Sentry: alerta por email cuando ocurre un error nuevo,
  o cuando un error existente supera 10 ocurrencias en 1 hora.
- El email de alertas: `ggiuliano526@gmail.com`.

---

## 2. React Error Boundaries

### Dos niveles de protección

**Nivel raíz** — `apps/web/src/components/ErrorBoundary.tsx`

Componente clase reutilizable. Acepta prop `fallback` opcional; si no se pasa, muestra un
mensaje genérico con botón "Recargar página".

Si Sentry está inicializado, usa `Sentry.ErrorBoundary` de `@sentry/react` como wrapper
(captura y reporta automáticamente). Si Sentry no está disponible, fallback a implementación
nativa de React.

**Nivel AppLayout** — `apps/web/src/components/layout/AppLayout.tsx`

Envolver el `<Outlet />` (el área de contenido de cada página) con el `ErrorBoundary`.
Si una página explota, el sidebar y el header siguen visibles y el usuario puede navegar
a otra sección sin perder la sesión.

**Nivel main.tsx**

Envolver `<AppProviders>` con un segundo `ErrorBoundary` de último recurso.
Si explota algo fuera del router (providers, etc.), muestra pantalla de error con botón recargar.

### UX del fallback
- Mensaje en español: "Ocurrió un error inesperado en esta sección."
- Botón: "Recargar página" → `window.location.reload()`
- Sin detalles técnicos expuestos al usuario.

---

## 3. Lazy Loading de rutas

### Enfoque
Convertir todos los imports de páginas en `apps/web/src/app/router.tsx` de estáticos a
`React.lazy()`. Envolver el router con `<Suspense>` en `main.tsx`.

**Patrón para exports nombrados** (todas las páginas del proyecto usan export nombrado):
```ts
const OwnersPage = lazy(() =>
  import('@/features/owners/OwnersPage').then((m) => ({ default: m.OwnersPage }))
);
```

**14 páginas a convertir**: `LoginPage`, `DashboardPage`, `CitiesPage`, `PaymentMethodsPage`,
`OwnersPage`, `TenantsPage`, `PropertiesPage`, `ContractsPage`, `ReceiptsPage`,
`RemindersPage`, `SalesPropertiesPage`, `ProfilePage`, `MaintenancePage`, `UsersPage`.

### Suspense boundary
En `main.tsx`, envolver `<RouterProvider>` con `<Suspense fallback={<PageLoader />}`.

`PageLoader` — componente mínimo: pantalla con el spinner ya existente en el proyecto
(centrado en pantalla, sin texto). Se crea en `apps/web/src/components/PageLoader.tsx`.

### Qué NO cambia
- Los componentes `RequireAuth`, `RequireSuperadmin`, `AppLayout` siguen siendo imports
  estáticos (son pequeños y se necesitan para toda navegación).
- El comportamiento de auth y rutas protegidas no cambia.

---

## Orden de implementación

1. Sentry backend (composer + config + .env.example + CI)
2. Sentry frontend (pnpm + main.tsx + .env.example)
3. ErrorBoundary component + integración con Sentry.ErrorBoundary
4. AppLayout: wrap Outlet
5. main.tsx: wrap AppProviders + Suspense
6. router.tsx: convertir 14 imports a lazy
7. PageLoader component

## Criterio de done

- `php artisan sentry:test` devuelve un error de prueba visible en el dashboard de Sentry.
- Abrir el admin en el browser y verificar que el script de Sentry está cargado (DevTools → Network).
- Forzar un error en un componente test → aparece el fallback del ErrorBoundary, no pantalla en blanco.
- Abrir DevTools → Network → al navegar a `/duenos` por primera vez, se descarga un chunk JS separado.
