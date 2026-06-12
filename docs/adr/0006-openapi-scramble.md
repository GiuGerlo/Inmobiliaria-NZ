# 0006 — Documentación OpenAPI autogenerada con Scramble

- **Estado**: aceptada
- **Fecha**: 2026-06-10
- **Contexto**: `api-conventions.md` dejaba abierta la decisión de cómo documentar la API (generar OpenAPI desde código vs mantener `openapi.yaml` a mano). Sub-D agrega 43 rutas y sub-E (frontend) necesita una referencia confiable.
- **Opciones consideradas**:
  - **A. dedoc/scramble**: infiere el spec desde controllers, FormRequests y Resources sin anotaciones. Pro: cero mantenimiento manual, siempre sincronizado. Contra: inferencia imperfecta en casos exóticos.
  - **B. `docs/api/openapi.yaml` a mano**: control total. Contra: se desactualiza garantido; doble trabajo en cada endpoint.
  - **C. swagger-php (anotaciones)**: explícito pero llena los controllers de docblocks gigantes.
- **Decisión**: **A — scramble**. Docs en `/docs/api`, accesibles solo en entorno `local` (default del paquete).
- **Consecuencias**: los FormRequests/Resources son la fuente de verdad del contrato; mantenerlos tipados y completos. Si scramble infiere mal algún endpoint, se corrige con sus atributos PHP puntuales. nginx proxya `/docs/` a Laravel.
