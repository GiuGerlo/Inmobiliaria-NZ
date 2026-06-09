# Code style

## PHP / Laravel

- **PSR-12** vía Laravel Pint (`vendor/bin/pint`).
- snake_case para columnas DB y variables.
- camelCase para métodos.
- PascalCase para clases, modelos, FormRequests, Resources.
- Strict types: `declare(strict_types=1);` en cada archivo nuevo.
- Inyección por constructor sobre facades cuando aporta testabilidad.
- Form Requests para validación. Nunca `$request->validate()` inline en controllers grandes.
- API Resources para todo response JSON. No devolver Eloquent models directos.
- Migraciones: una intención = una migración. Nombres descriptivos en inglés.

## TypeScript / React

- Strict mode ON (`tsconfig`).
- camelCase para variables/funciones, PascalCase para componentes y tipos.
- Un componente = un archivo. Export nombrado (no default) salvo páginas de routing.
- Hooks personalizados con prefijo `use*` y un solo propósito.
- Server state → React Query. Client state → `useState`/`useReducer`. Nada de Redux salvo razón fuerte (justificar en ADR).
- Formularios: React Hook Form + resolver Zod. Compartir schemas Zod con backend cuando posible.
- Estilos: Tailwind utilitario; componentes reutilizables en `src/components/ui` (shadcn) y `src/components/<feature>`.
- Accesibilidad: respetar reglas `jsx-a11y`, labels asociados, roles ARIA donde corresponda.

## Convenciones cross

- **Idioma**: identificadores del código en inglés; UI, mensajes al usuario, commits y docs en español.
- Comentarios solo cuando el "por qué" no es obvio. Nada de `// suma a + b`.
- Nada de TODOs sin nombre y fecha: `// TODO(giuli, 2026-07): ...`.

## Lo que NO hacemos

- No `mysql_*`, no concatenación SQL, no `md5()` para passwords.
- No `dd()`/`console.log()` en commits.
- No fixtures con datos personales reales de inquilinos/dueños — usar factories.
- No CSS inline salvo casos justificados (style en tags HTML del PDF dompdf es OK).
