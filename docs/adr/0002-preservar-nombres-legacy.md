# 0002 — Preservar nombres de tablas/columnas legacy

- **Estado**: aceptada
- **Fecha**: 2026-06-09
- **Sub-proyecto**: B (afecta B, D, F)

## Contexto

El schema legacy usa nombres en español con convenciones mixtas (`dueno`, `NYA_Inquilino`, `Pago_Propiedad`). El stack objetivo define snake_case inglés. Pero la decisión de sub-A — **DB única compartida** entre legacy PHP y Laravel — implica que el legacy sigue haciendo INSERT/SELECT con los nombres actuales hasta su deprecación.

## Opciones consideradas

### A — Preservar nombres legacy; modelos Eloquent en inglés como capa de traducción (elegida)

- **Pros**: legacy intacto y funcionando; código nuevo lee bien (`$receipt->contract->owner`); cero migración de datos; cero riesgo.
- **Contras**: columnas con nombres feos visibles en queries crudas y API Resources (se mapea en la capa Resource); deuda estética permanece en DB.

### B — Rename físico inmediato

- **Pros**: DB limpia ya.
- **Contras**: rompe el legacy → habría que reescribir TODOS los .php legacy o morir. Inviable mientras conviven.

### C — Vistas SQL con nombres ingleses sobre tablas legacy

- **Pros**: ambos nombres conviven.
- **Contras**: vistas no actualizables sin triggers en varios motores/casos; complejidad alta para ganancia estética; performance.

## Decisión

**A.** Los modelos (`Owner`→`dueno`, `Tenant`→`inquilino`, `Receipt`→`recibo`, etc.) declaran `$table`/`$primaryKey` legacy. El mundo exterior (API sub-D) habla inglés vía API Resources; la DB sigue en español.

## Consecuencias

- API Resources serán la frontera de traducción columna→campo JSON inglés (sub-D).
- Rename físico queda como **posible** fase futura post-deprecate del legacy: con migrations de rename + ajuste de `$table` en modelos, transparente para el API.
- `$timestamps = false` en todos los modelos: el legacy no tiene created_at/updated_at y agregarlas rompería sus INSERT.

## Referencias

- Spec sub-B: `docs/superpowers/specs/2026-06-09-sub-B-schema-migrations-design.md`.
- ADR-0001 (API-only).
