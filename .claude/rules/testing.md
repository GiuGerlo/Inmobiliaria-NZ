# Testing

## Backend (Laravel)

- **Pest** como runner principal. PHPUnit subyace, OK.
- Estructura:
  - `tests/Unit/` — sin DB, sin HTTP.
  - `tests/Feature/` — HTTP via `actingAs`, DB con `RefreshDatabase`.
- DB de tests: SQLite in-memory o base MariaDB dedicada vía Docker (decisión en ADR si fricciona).
- Factories para todo modelo. Seeders solo para datos demo, no para tests.
- Coverage objetivo: features críticos (auth, recibos, rendiciones) ≥ 80%. No perseguir 100% global.

## Frontend (React)

- **Vitest** + **Testing Library** + **MSW** (mock service worker) para mockear API.
- Tests unitarios para hooks personalizados y utils puros.
- Tests de integración para flujos (login, crear recibo, generar PDF).
- No tests de implementación interna (no testar estado de componentes via `instance`).

## Comandos

```
# Laravel
docker compose exec php pest
docker compose exec php pest --filter=RecepcionTest

# React
pnpm test
pnpm test -- src/features/recibos
```

## Cuándo correr

- **Localmente** antes de cerrar fase.
- **CI** en cada push (sub-H).
- Si un test falla en CI, no se mergea. Punto.
