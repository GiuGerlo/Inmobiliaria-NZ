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
- Trabajo por fase en branches `fase/<letra>-<slug>` (ej. `fase/A-infra-bootstrap`).
- Merge a `main` cuando el usuario aprueba la fase + tests pasan.

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
