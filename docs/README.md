# Documentación — Inmobiliaria NZ

Este directorio es la **memoria larga** del proyecto. CLAUDE.md y `.claude/rules/` son reglas vivas; acá viven planes, decisiones, historia.

## Mapa

| Archivo / carpeta | Para qué |
|---|---|
| `roadmap.md` | Estado de los sub-proyectos A–H. **Empezá leyendo esto.** |
| `architecture.md` | Diagramas y vista global del sistema durante la transición. |
| `superpowers/specs/` | Specs de brainstorming (uno por sub-proyecto). |
| `plans/` | Planes de implementación detallados (output de writing-plans). |
| `adr/` | Architecture Decision Records — decisiones grandes con contexto y consecuencias. |
| `changelog.md` | Qué cambió en cada fase, con fecha. |
| `legacy/` | Foto del estado anterior antes de tocar — referencia histórica. |
| `api/` | (futuro) OpenAPI / contratos del API. |

## Convenciones

- Fechas en formato `YYYY-MM-DD`.
- Slugs en kebab-case.
- Todo en español (incluido nombres de archivo de specs/plans/ADRs).

## Cómo agregar un nuevo sub-proyecto

1. Brainstorm con `/brainstorming` → spec en `superpowers/specs/`.
2. Spec aprobado → plan con writing-plans → `plans/`.
3. Entrada en `roadmap.md`.
4. Decisiones grandes → ADR.
5. Cierre → entrada en `changelog.md`, roadmap a DONE.
