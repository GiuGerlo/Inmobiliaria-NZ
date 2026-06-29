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

## Verificación manual (handoff al usuario) — OBLIGATORIO antes del commit

Los tests automáticos NO alcanzan: validan contratos/bytes, no que la cosa se vea/funcione bien
(ej.: un test de PDF chequea `%PDF`, no el layout). **Antes de sugerir el mensaje de commit, el agente
SIEMPRE entrega al usuario una guía de QA manual** para que pruebe él mismo. El commit lo hace el usuario
recién después de mirar con sus ojos.

La guía debe tener:
1. **Cómo levantar/llegar** — comando y URL exactos (ej. `docker compose up -d`, `http://localhost:8080`).
2. **Qué hacer** — pasos concretos, click por click, con datos de ejemplo si hace falta.
3. **Qué tenés que ver** — el resultado esperado, ítem por ítem (lo que confirma que está OK).
4. **Señales de que está mal** — qué significaría que algo se rompió.

Recién **después** de esta guía va el mensaje de commit sugerido. Nunca al revés, nunca sin la guía.
