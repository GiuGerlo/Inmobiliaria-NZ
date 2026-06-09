---
description: Cierra la fase actual — actualiza roadmap, changelog, sugiere commit.
---

Cerrá la fase indicada por `$ARGUMENTS` (ej. `A`).

Pasos:

1. Verificá tasks pendientes — si hay alguna sin completar, listalas y parate.
2. Corré tests:
   - Backend: `docker compose exec php pest` (si hay backend ya).
   - Frontend: `pnpm test` (si hay frontend ya).
   - Si fallan, listá errores y parate.
3. Sugerí correr `/security-review` sobre el branch (no lo invoques vos, decíselo al usuario).
4. Actualizá `docs/roadmap.md`: estado de sub-`$ARGUMENTS` → DONE, fecha de cierre, marcá dependientes desbloqueados.
5. Agregá entrada a `docs/changelog.md` con:
   - Fecha.
   - Resumen ≤2 oraciones.
   - Bullets de cambios principales.
   - Breaking / migración si aplica.
6. Marcá DONE el `docs/plans/sub-$ARGUMENTS-*-plan.md` (sello al final del archivo: `> ✅ DONE — YYYY-MM-DD`).
7. Sugerí mensaje de commit en formato Conventional Commits (≤50 chars en subject). Usá skill `caveman-commit` si está disponible.
8. **No** hagas el commit vos — el usuario lo ejecuta.
