# 0009 — Fusión NZ: monorepo, .env único, merge por copia y roles

- **Estado**: aceptada
- **Fecha**: 2026-06-19
- **Sub-proyecto**: cross (track Fusión NZ, Fase 1)

## Contexto

Se fusiona el sitio público de venta `nz-estudio` (PHP vanilla, repo aparte) dentro de este monorepo de
alquileres (Laravel 12 + React 19). El target es un monorepo con `apps/api` (backend único), `apps/web`
(admin React) y `apps/public` (sitio público Next.js SSG), una sola DB y un solo auth. Antes de empezar
a migrar código hay que fijar cuatro decisiones de arranque que afectan a fases posteriores. Spec:
`docs/superpowers/specs/2026-06-19-fusion-nz-design.md`.

## Opciones consideradas

### A — Estructura del monorepo

- **A1 — `apps/api` + `apps/web` + `apps/public`** (elegida): continúa el patrón `apps/` ya existente,
  suma `apps/public` (Next SSG) en Fase 5. Pros: consistente, separación clara de deployables. Contras:
  ninguno relevante.
- **A2 — Public como parte de Laravel (Blade/SSR)**: un solo deployable. Contras: el público es SEO-crítico
  y estático; mezclar con el admin complica el deploy estático a Hostinger sin Node.

### B — Mecanismo del `.env` único

- **B1 — Continuar el patrón existente** (elegida): root `.env` → `docker-compose` (`env_file`) →
  entrypoint deriva `apps/api/.env`; Next lee del entorno en build. Pros: ya funciona, cero invención.
- **B2 — Tool externo (direnv / dotenv-vault / symlinks)**: Contras: dependencia nueva para un problema
  ya resuelto.

### C — Merge de repos

- **C1 — Copia como referencia, sin historia** (elegida): copiar nz-estudio a `legacy-nz-estudio/`. El PHP
  se reescribe a Next/React, su historial aporta poco. Pros: diff limpio, log sin commits desechables.
- **C2 — `git subtree` con historia**: Contras: ensucia el log con commits del PHP que vamos a tirar.

### D — Dump de ventas (`nzestudio.sql`) y roles

- **D1 — Dump local, fuera de git** (elegida): trae hashes/PII; consistente con `db/*.sql` ya ignorado.
- **D2 — Commitearlo whitelisteado**: Contras: PII/credenciales en git.
- **Roles**: 2 únicos — `superadmin` (Giuliano, ve todo) / `inmobiliaria` (staff y dueña Nadina, solo
  alquileres). Sin rol especial de dueña (confirmado con el usuario 2026-06-19).

## Decisión

Elegimos **A1 + B1 + C1 + D1** y el esquema de 2 roles. Es el camino de menor fricción: aprovecha lo ya
construido (patrón `apps/`, `.env` por entrypoint, `db/*.sql` ignorado), evita dependencias nuevas y no
mete PII ni historial desechable en git.

## Consecuencias

- **Ahora**: se trae `legacy-nz-estudio/` como referencia (sin `.env`/`uploads`/`*.sql`); el sitio público
  sigue vivo en su repo/hosting hasta el corte (Fase 7).
- **Deuda / a revisitar**:
  - `apps/public` (Next) y su servicio en `docker-compose.yml` + reglas `.claude/rules/` de Next/SEO → Fase 5.
  - Wiring del import de `nzestudio.sql` a la DB → Fase 2.
  - Instalación de `spatie/laravel-permission` y los gates → Fase 3.
  - Motor PDF (mPDF vs dompdf) → ADR-0004 revisado en Fase 6.
  - Reutilizar `legacy-nz-estudio/.github/workflows/deploy.yml` + `scripts/deploy.sh` como base → Fase 7.

## Referencias

- Spec paraguas: `docs/superpowers/specs/2026-06-19-fusion-nz-design.md`.
- Plan aprobado: `~/.claude/plans/misty-prancing-brooks.md` (diseño) + `arranco-fusi-n-nz-floofy-kernighan.md` (Fase 1).
- ADR-0002 (rename a inglés/snake_case), ADR-0004 (motor PDF), ADR-0003 (deploy).
