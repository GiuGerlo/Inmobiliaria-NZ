# Flujo Git

## Reglas

- **Los commits los hace el usuario**, no el agente. El agente sugiere el mensaje.
- **Una fase = un commit** (no commits intermedios por sub-pasos). "Fase" = sub-proyecto del roadmap, o sub-fase si el sub-proyecto se subdivide en su plan.
- Formato: **Conventional Commits**, subject ≤ 50 chars, en español. Body opcional, solo si el "por qué" no es obvio. Ver skill `caveman-commit`.

### Ejemplos

```
feat(infra): docker compose con php8.5 + mariadb 11.8
feat(auth): sanctum login + rate limit + perfil
fix(recibo): corregir total cuando honorarios nulo
refactor(api): mover validacion a FormRequests
docs(roadmap): cerrar sub-A, abrir sub-B
```

## Branches

- `main` = rama estable. Producción se construye desde acá.
- **Sub-proyectos sueltos (A–J)**: una rama por fase `fase/<letra>-<slug>` (ej. `fase/A-infra-bootstrap`), merge a `main` al aprobar.
- **Track Fusión NZ (Fases 1–7)**: **una sola rama** `fusion-nz` para toda la migración (rama por fase es muy tedioso). Se sigue commiteando **una fase = un commit** dentro de esa rama. Merge a `main` cuando se cierra el track (o por hitos, si se decide).

## Ramas de entorno (deploy, desde Fase 7)

Modelo de 3 ramas para el pipeline dev→prod en Hostinger (CI/CD por GitHub Actions):

- **`main`** — trabajo local / integración. **No deploya nada.**
- **`dev`** — push dispara deploy automático a la **instancia dev** (subdominios `*-dev` / `dev.`).
- **`production`** — push dispara deploy automático a **producción**.

Flujo: `main` → merge a `dev` (probar en server real) → merge a `production` (sale a prod, solo
cuando dev está OK). Topología de subdominios y DBs por entorno: `docs/runbooks/fase7-pasos-manuales.md`.

## Antes de mergear una fase

- [ ] Tests pasan (`pest` + `vitest`).
- [ ] `/security-review` corrido en el branch.
- [ ] `docs/roadmap.md` actualizado (estado del sub-proyecto).
- [ ] `docs/changelog.md` con entrada de la fase.
- [ ] `docs/plans/<sub>-plan.md` marcado DONE.
- [ ] Sin TODOs sin contexto. Sin `dd()` ni `console.log`.

## Nunca

- `--no-verify` / `--no-gpg-sign`.
- `push --force` a `main`.
- Amend de commits ya pusheados.
- Commits con secrets o `.env`.
