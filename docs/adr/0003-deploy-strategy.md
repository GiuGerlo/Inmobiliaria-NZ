# 0003 — Estrategia de deploy: GitHub Actions + rsync a Hostinger

- **Estado**: aceptada
- **Fecha**: 2026-07-01
- **Sub-proyecto**: H (deploy) / Fusión NZ Fase 7

## Contexto

Producción corre en Hostinger **compartido** (sin Docker, sin Node en runtime). Hay que llevar el
API Laravel + admin React (SPA) y el sitio público Next (SSG) desde el repo al server, de forma
repetible, segura y con red de recuperación. El repo es **público** → GitHub Actions es ilimitado y
gratis, así que el objetivo no es ahorrar minutos sino **robustez, visibilidad y backups**.

Modelo de ramas (ver `git-workflow.md`): `dev` deploya a la instancia dev, `production` a prod;
`main` no deploya. El environment de GitHub (con sus secrets) se elige por la rama.

## Opciones consideradas

### A — GitHub Actions: build en el runner + `rsync` por SSH (elegida)
- **Pros**: el runner buildea (composer `--no-dev`, `pnpm build`) → al server solo van artefactos.
  `rsync --delete` reconcilia el server al HEAD de la rama en cada corrida (siempre 100% sincronizado,
  no se deployan commits sueltos). Incremental por naturaleza (solo transfiere lo que cambió).
- **Contras**: el server necesita SSH + un `.env` propio ya cargado; hay que versionar el binario PHP
  correcto del CLI (Hostinger sirve 8.4 a la web pero el CLI default es 8.2 → se usa
  `/opt/alt/php84/usr/bin/php`).

### B — FTP/SFTP deploy (subir archivos)
- **Pros**: simple, sin SSH shell.
- **Contras**: sin `--delete` confiable (quedan archivos huérfanos), sin backups atómicos, sin correr
  `artisan migrate` post-subida. Frágil.

### C — `git pull` en el server + build en el server
- **Pros**: sin runner.
- **Contras**: shared hosting no tiene Node ni recursos para buildear; expone el `.git` y todo el repo
  (docs, tests) en el server. Descartado.

## Decisión

**Opción A.** Dos workflows (`deploy-api.yml`, `deploy-public.yml`) que buildean en el runner y
`rsync`ean por SSH. Sobre esa base, cada corrida incorpora:

- **Backups por corrida** (retención **5** por entorno, poda automática), fuera del webroot en
  `<dominio>/backups/<entorno>/{api,public}/<timestamp>/` (la carpeta `backups/` a nivel del dominio,
  junto a `public_html` — la misma que usa el deploy del legacy):
  - API: `mysqldump | gzip` de la DB **antes** de migrar + copia de los archivos pisados/borrados
    (`rsync --backup-dir`).
  - Público: solo copia de archivos (es estático, no toca DB).
- **Reporte de cambios** en el summary de Actions: nuevos / modificados / borrados (`rsync -i`) + `--stats`.
- **Ventana de mantenimiento** en el API: `artisan down → rsync → migrate → up` (con `up` en
  `if: always()` para que el admin no quede caído si migrate falla). El flag de `down` vive en
  `storage/framework/`, que el rsync excluye para que `--delete` no lo borre.
- **Cache** de composer (vendor) y pnpm store → builds rápidos.
- **Health check** post-deploy (`/api/v1/health` y home 200). Si falla, la corrida falla y GitHub notifica.
- **Force full resync**: input manual `force_full` en `workflow_dispatch` → `rsync --checksum --ignore-times`
  (re-verifica byte a byte ante sospecha de desincronización).

**Fuera de alcance (YAGNI): rollback automático / releases versionados.** Los backups por corrida ya
dan recuperación manual (restaurar archivos desde `files-replaced/` + DB desde `db.sql.gz`).

## Consecuencias

- El server debe tener: SSH con la llave de deploy, `.env` cargado a mano (Bloque 6 del runbook),
  `mysqldump`/`gzip` en PATH, y el binario `/opt/alt/php84/usr/bin/php`.
- El `.env` del server nunca se pisa (rsync lo excluye). Si `DB_PASSWORD` tiene espacios o `#`, debe ir
  entre comillas en el `.env` (el backup lo parsea con `grep`/`cut`).
- Los secrets (`SSH_*`, `DEPLOY_PATH_*`, `MAINT_SECRET`, `GOOGLE_MAPS_API_KEY`) viven por environment
  (`dev`/`production`) en GitHub, nunca en el repo.
- Deuda: no hay rollback de un botón. Si se necesita, revisitar con releases versionados (symlink
  `current` → `releases/<ts>`) en un ADR futuro.
- Restauración y uso de `force_full` documentados en `docs/runbooks/fase7-pasos-manuales.md`.
