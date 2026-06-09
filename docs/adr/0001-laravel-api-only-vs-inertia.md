# 0001 — Laravel API-only vs Inertia.js

- **Estado**: aceptada
- **Fecha**: 2026-06-08
- **Sub-proyecto**: A (afecta E principalmente)

## Contexto

El usuario quiere reformular la app PHP legacy a un stack moderno con React. Hay tres caminos típicos para integrar Laravel + React:

1. **API-only**: Laravel sirve sólo JSON; React SPA separado consume el API.
2. **Inertia.js**: Laravel renderiza páginas que despachan React components; no hay API REST tradicional.
3. **Blade + React islands**: server-rendered con React para piezas interactivas.

## Opciones consideradas

### A — API-only + React SPA separado (elegida)

- **Pros**:
  - Frontend y backend independientes — se pueden deployar separadamente.
  - El API queda reutilizable si en el futuro se agrega una app mobile o integraciones externas.
  - Stack frontend "limpio" (React + TS + Vite) sin acoplarse al render server-side de Laravel.
  - Permite tests independientes en ambos lados.
- **Contras**:
  - Más infra (dos lados que mantener: Laravel + React).
  - Auth con Sanctum cookie SPA requiere config CORS / mismo origen — resuelto con nginx proxy unificado.
  - SEO no-trivial (no aplica en este caso: app interna de admin).

### B — Inertia.js

- **Pros**:
  - Una sola app monolítica; routing y auth los maneja Laravel.
  - Menos boilerplate de fetching: las props llegan del controller.
- **Contras**:
  - Acopla Laravel y React a perpetuidad.
  - Si en el futuro queremos mobile o exponer datos a terceros, hay que duplicar como API.
  - Tooling de testing frontend más limitado.

### C — Blade + React islands

- **Pros**:
  - Migración gradual desde el legacy más natural.
- **Contras**:
  - El usuario quiere romper con el legacy, no convivir parcialmente.
  - Worst of both worlds para tests.

## Decisión

**A — API-only + React SPA separado.**

Razones:
- El usuario eligió explícitamente React, no Livewire ni Inertia.
- El monorepo con `apps/api` + `apps/web` ya estructura el split.
- Mantener el API limpio facilita el futuro (mobile, integraciones, exports).
- El costo extra de coordinación es bajo en un equipo de 1 persona con un agente IA.

## Consecuencias

- Auth: Sanctum cookie SPA (sub-C). Stateful domains en `.env`.
- CORS: evitamos el problema con nginx proxy unificado en `http://localhost:8080`.
- Routing: React Router lado cliente; Laravel solo expone `/api/v1/*`.
- Build/deploy: dos pipelines (Laravel build + React build estático). Decidir en sub-H.
- Tests: Pest del lado Laravel, Vitest del lado React. MSW para mocks de API en frontend.

## Referencias

- Spec: `docs/superpowers/specs/2026-06-08-sub-A-infra-bootstrap-design.md`.
- Roadmap: `docs/roadmap.md`.
