# Deploy a producción — nz-estudio

Pipeline CI/CD de GitHub Actions hacia Hostinger. Push a `production` despliega automáticamente. Este documento es la referencia operativa.

---

## 1. Cómo funciona

```
push a production
       │
       ▼
GitHub Actions (deploy.yml)
       │
       ├── checkout completo
       ├── carga SSH key (secret)
       ├── ssh-keyscan del host
       │
       ▼
.github/scripts/deploy.sh --mode=sequential
       │
       ├── lee .deployed_sha del server
       ├── git rev-list --reverse $LAST_SHA..HEAD
       │
       └── para cada commit C:
              1. backup tar.gz pre-deploy
              2. git diff --name-status PREV..C
              3. filtra contra .deployignore
              4. rsync added+modified → server
              5. ssh rm de deleted
              6. escribe C en .deployed_sha
              7. añade reporte al GITHUB_STEP_SUMMARY
              ├── si OK: PREV=C, sigue
              └── si falla: exit 1, los siguientes NO se intentan
```

**Por qué commit-por-commit:** si pusheás 5 commits juntos, el server avanza paso a paso. Cada commit genera su propio backup. Si el 3º falla, el server queda en el 2º (último OK) y el próximo push retoma desde ahí.

---

## 2. Branches

| Branch | Rol |
|---|---|
| `main` | Desarrollo. Tocás archivos acá, hacés commits libremente. **No dispara deploy.** |
| `production` | Lo que está en el server. Cada push acá dispara el workflow. **Tratala como sagrada.** |

`main` puede estar adelantado a `production` con cambios sin deployar. `production` jamás debe tener commits que no estén en `main` (excepto el merge en sí).

---

## 3. Setup inicial (ya completado)

1. ✅ SSH key generada localmente (`ssh-keygen -t ed25519 -f ~/.ssh/nz_deploy`)
2. ✅ Pública instalada en hPanel → SSH Access
3. ✅ Secrets cargados en GitHub:

| Secret | Descripción |
|---|---|
| `SSH_HOST` | IP/host SSH de Hostinger |
| `SSH_PORT` | Puerto SSH (típico `65002`) |
| `SSH_USER` | Usuario SSH |
| `SSH_KEY` | Contenido completo de la private key |
| `DEPLOY_PATH` | Ruta absoluta a `public_html` |

4. ⏳ **Falta**: crear la branch `production` y hacer primer push.

```bash
git checkout -b production
git push -u origin production
```

Eso dispara el primer deploy (modo INITIAL = full, sube todo el repo filtrado por `.deployignore`).

---

## 4. Flujo de trabajo: cómo llevar cambios de `main` a `production`

### Opción A — Pull Request (recomendado para cambios grandes o que querés tener registrados)

```bash
# desde main, ya con tus cambios commiteados y pusheados
gh pr create --base production --head main --title "Deploy: <descripción>"
# revisás el PR, mergeás desde la UI o:
gh pr merge --merge
```

Ventajas: queda historial de qué deployaste y cuándo. Ideal si trabajás en equipo o querés trazabilidad.

### Opción B — Push directo local (rápido para fixes cotidianos)

```bash
git checkout production
git merge main
git push
git checkout main   # volver a dev
```

Ventajas: 1 comando. Sin overhead.

**Cualquier opción dispara el workflow igual** — diferencia está solo en cómo aparece el merge en el historial.

---

## 5. Deploy normal (comportamiento por defecto)

Cuando pusheás a `production`:

1. Workflow corre **una vez** por push, sin importar cuántos commits trae.
2. El script aplica commits **en orden cronológico** (oldest first).
3. Por cada commit:
   - Backup `tar.gz` con timestamp y SHA corto en el nombre.
   - Solo se suben archivos que ese commit tocó (no full sync).
   - `.deployed_sha` del server se actualiza al SHA recién deployado.
4. Si llega otro push mientras este corre → el nuevo **queda en cola**, no se solapa (concurrency lock).

El reporte en la pestaña Actions muestra una subsección por commit con la lista exacta de archivos nuevos, modificados y eliminados.

---

## 6. Auto-recovery ante fallo

`.deployed_sha` en el server **solo se actualiza si el commit deployó OK**. Si un commit falla a mitad:

- Los commits siguientes del lote NO se intentan (fail-fast).
- `.deployed_sha` queda en el último commit que sí funcionó.
- El próximo push (o redeploy manual) calcula el diff desde ese SHA viejo, así que recupera todo lo que faltó deployar.

**No te quedás atrás.** Aunque fallen 5 deploys seguidos, cuando el 6º funcione, va a deployar el rango acumulado completo (5 commits anteriores + el nuevo).

---

## 7. Redeploy manual

Workflow extra: `.github/workflows/redeploy.yml`. Se dispara desde la pestaña **Actions** de GitHub → **Redeploy manual** → **Run workflow**.

Inputs:

| Input | Default | Significado |
|---|---|---|
| `from_sha` | vacío | SHA inicial. Vacío usa `.deployed_sha` del server. `INITIAL` fuerza full upload. |
| `to_sha` | `HEAD` | SHA destino. |
| `mode` | `sequential` | `sequential` itera commit-por-commit. `bulk` hace un solo diff/upload. |
| `update_sha` | `true` | Si actualiza `.deployed_sha` al final. `false` = redeploy experimental que no afecta el tracking. |

### Casos de uso

**Reaplicar el último commit** (ej. el server quedó raro pero el commit es bueno):
```
from_sha:   HEAD~1
to_sha:     HEAD
mode:       sequential
update_sha: true
```

**Forzar full sync** (ej. sospechás drift entre repo y server):
```
from_sha:   INITIAL
to_sha:     HEAD
mode:       bulk
update_sha: true
```

**Deploy de rango histórico paso a paso** (ej. recuperar commits viejos):
```
from_sha:   abc1234
to_sha:     def5678
mode:       sequential
update_sha: true
```

**Redeploy experimental sin tocar tracking** (ej. probar si algo funciona sin afectar próximo push):
```
from_sha:   HEAD~3
to_sha:     HEAD
mode:       sequential
update_sha: false
```

---

## 8. Rollback con backups (incrementales)

Cada commit genera un backup en el server, fuera de `public_html`:
```
<DEPLOY_PATH>/../backups/20260603_142315_<sha7>_<N>files.tar.gz
```

El backup es **incremental**: contiene únicamente los archivos que ese commit va a modificar o eliminar (no respalda los `added`, que son nuevos). Tamaño típico: bytes a KB en vez de los MB del proyecto entero.

Se conservan los **últimos 10** (los más viejos se borran solos). Si el commit sólo agrega archivos, no se crea backup (no hay nada que respaldar).

### Rollback manual (vía SSH)

```bash
# 1. Conectar al server
ssh -p $SSH_PORT -i ~/.ssh/nz_deploy $SSH_USER@$SSH_HOST

# 2. Listar backups disponibles (el nombre incluye el SHA y la cantidad de archivos)
ls -lh ~/domains/nz-estudio.com/backups/

# 3. Restaurar (sobreescribe sólo los archivos modificados/eliminados de ese commit)
cd ~/domains/nz-estudio.com/public_html
tar -xzf ../backups/20260603_142315_8f14f9d_12files.tar.gz
```

⚠️ Nota importante del modelo incremental: el rollback restaura los archivos que el commit fallido había pisado/borrado, pero **no borra los archivos que ese commit había agregado** (esos quedan como basura inocua en el server). Si querés rollback total al estado previo, además del extract hay que `rm` los archivos que el commit fallido agregó — consultá la lista en el reporte del workflow (sección "➕ Nuevos" del summary).

**Después del rollback manual** decidí qué hacer con `.deployed_sha`:
- Si querés que el próximo push reaplique lo que rollbackeaste: dejá `.deployed_sha` como está (con el SHA del que fallaba).
- Si querés "reescribir la historia" y considerar el SHA del backup como el deployado: `echo SHA_DEL_BACKUP > .deployed_sha`.

---

## 9. Troubleshooting

### `Permission denied (publickey)`
- Revisar que `SSH_KEY` en GitHub secrets sea la **private key completa**, incluyendo las líneas `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`.
- Confirmar que la pública correspondiente está pegada en hPanel → SSH Access.

### `Host key verification failed`
- El step `ssh-keyscan` debería resolverlo. Si persiste: SSH al host manualmente desde tu PC primero, aceptar la huella, después ya queda registrada.

### `rsync: Connection timed out`
- Hostinger puede estar en mantenimiento. Reintentá con redeploy manual.
- Verificá que el puerto SSH (`SSH_PORT`) sea el correcto en secrets.

### `tar: backups: No such file or directory`
- El script intenta crear `<DEPLOY_PATH>/../backups`. Si Hostinger no permite escribir un nivel arriba de `public_html`, editar `deploy.sh` línea ~50 y cambiar `BACKUP_DIR_REMOTE` a `$DEPLOY_PATH/_backups` (agregar un `.htaccess` con `Require all denied` en esa carpeta).

### `cat: .deployed_sha: No such file or directory`
- Normal en el primer deploy. El script detecta esto y entra en modo INITIAL automáticamente.

### El reporte muestra "skipped (sólo cambios excluidos)"
- El commit tocó solo archivos que están en `.deployignore` (ej. solo modificaste `README.md`). No es un error.

### Quiero ver qué pasó en el server
```bash
ssh -p $SSH_PORT -i ~/.ssh/nz_deploy $SSH_USER@$SSH_HOST
cd ~/domains/nz-estudio.com/public_html
cat .deployed_sha       # qué SHA está deployado
ls -lh ../backups/      # backups disponibles
```

---

## 10. Mantenimiento

### Agregar/quitar patrones de exclusión
Editar `.deployignore` en la raíz del repo. Próximo deploy lo respeta. Sintaxis estilo gitignore (soporta directorios con `/`, globs `*.ext`, exact match).

### Agregar pasos post-deploy (ej. limpiar cache)
Al final de `.github/scripts/deploy.sh`, antes del último `echo "✅ Deploy completado"`, agregar:
```bash
ssh_run "cd $DEPLOY_PATH && php artisan cache:clear"  # ejemplo
```

### Cambiar cantidad de backups conservados
En `deploy.sh`, función `do_backup`, cambiar `tail -n +11` por `tail -n +N+1` (conserva últimos N). Default: 10.

### Cambiar branch que dispara deploy
En `.github/workflows/deploy.yml`, línea `branches: [production]`, cambiar a la branch deseada.

### Forzar redeploy completo
Usar `redeploy.yml` con `from_sha=INITIAL`, `mode=bulk`.

---

## 11. Referencia rápida de secrets

| Secret | Ejemplo |
|---|---|
| `SSH_HOST` | `46.202.145.141` |
| `SSH_PORT` | `65002` |
| `SSH_USER` | `u407412506` |
| `SSH_KEY` | contenido de `~/.ssh/nz_deploy` (private, OpenSSH format) |
| `DEPLOY_PATH` | `/home/u407412506/domains/nz-estudio.com/public_html` |

Para rotar la SSH key:
1. Generar nueva: `ssh-keygen -t ed25519 -f ~/.ssh/nz_deploy_new`
2. Subir la pública nueva a hPanel
3. Probar conexión con la nueva
4. Reemplazar el secret `SSH_KEY` en GitHub con la nueva private
5. Borrar la vieja del authorized_keys de Hostinger
