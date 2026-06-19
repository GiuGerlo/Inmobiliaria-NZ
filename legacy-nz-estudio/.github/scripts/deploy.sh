#!/usr/bin/env bash
#
# Deploy script para nz-estudio — modular por fases.
# Llamado por .github/workflows/deploy.yml y redeploy.yml.
#
# Uso:
#   deploy.sh --phase=<fase> [--mode=sequential|bulk] [--from-sha=X] [--to-sha=Y] [--update-sha=true|false]
#
# Fases:
#   config     → ETAPA 1: validar config, anunciar
#   read-sha   → ETAPA 2: leer .deployed_sha del server
#   plan       → ETAPA 3: calcular qué commits/archivos hay que deployar
#   execute    → ETAPA 4: backup + upload + rm + actualizar SHA por commit
#   finalize   → ETAPA 5: resumen final
#
# Variables de entorno requeridas en TODAS las fases:
#   SSH_HOST, SSH_PORT, SSH_USER, DEPLOY_PATH, SSH agent cargado.
#
# State entre fases (persiste en $RUNNER_TEMP/nz-deploy/):
#   state.env      → key=value (FROM_SHA, TO_SHA, MODE, MODE_RESOLVED, START_TS, contadores, etc.)
#   commits.txt    → lista de SHAs a deployar (modo sequential)
#   files.txt      → lista de archivos a subir (modo INITIAL)

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────
# Parseo de flags
# ──────────────────────────────────────────────────────────────────────
PHASE=""
MODE_ARG=""
FROM_SHA_ARG=""
TO_SHA_ARG=""
UPDATE_SHA_ARG=""

for arg in "$@"; do
    case "$arg" in
        --phase=*)      PHASE="${arg#*=}" ;;
        --mode=*)       MODE_ARG="${arg#*=}" ;;
        --from-sha=*)   FROM_SHA_ARG="${arg#*=}" ;;
        --to-sha=*)     TO_SHA_ARG="${arg#*=}" ;;
        --update-sha=*) UPDATE_SHA_ARG="${arg#*=}" ;;
        *) echo "Flag desconocido: $arg" >&2; exit 1 ;;
    esac
done

: "${PHASE:?Falta --phase=...}"
: "${SSH_HOST:?SSH_HOST no definido}"
: "${SSH_PORT:?SSH_PORT no definido}"
: "${SSH_USER:?SSH_USER no definido}"
: "${DEPLOY_PATH:?DEPLOY_PATH no definido}"

# ──────────────────────────────────────────────────────────────────────
# State / paths
# ──────────────────────────────────────────────────────────────────────
STATE_DIR="${RUNNER_TEMP:-/tmp}/nz-deploy"
mkdir -p "$STATE_DIR"
STATE_FILE="$STATE_DIR/state.env"
COMMITS_FILE="$STATE_DIR/commits.txt"
FILES_FILE="$STATE_DIR/files.txt"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
DEPLOYIGNORE="${DEPLOYIGNORE:-.deployignore}"
BACKUP_DIR_REMOTE="$DEPLOY_PATH/../backups"
SHA_FILE_REMOTE="$DEPLOY_PATH/.deployed_sha"

# Cargar state previo si existe
[ -f "$STATE_FILE" ] && . "$STATE_FILE"

save_state() {
    {
        echo "TO_SHA='${TO_SHA:-}'"
        echo "FROM_SHA='${FROM_SHA:-}'"
        echo "MODE='${MODE:-sequential}'"
        echo "MODE_RESOLVED='${MODE_RESOLVED:-}'"
        echo "UPDATE_SHA='${UPDATE_SHA:-true}'"
        echo "START_TS='${START_TS:-}'"
        echo "TOTAL_ADDED='${TOTAL_ADDED:-0}'"
        echo "TOTAL_MODIFIED='${TOTAL_MODIFIED:-0}'"
        echo "TOTAL_DELETED='${TOTAL_DELETED:-0}'"
        echo "TOTAL_BACKUPS='${TOTAL_BACKUPS:-0}'"
        echo "TOTAL_COMMITS_OK='${TOTAL_COMMITS_OK:-0}'"
        echo "TOTAL_COMMITS='${TOTAL_COMMITS:-0}'"
        echo "LAST_OK='${LAST_OK:-}'"
        echo "DEPLOY_FAILED='${DEPLOY_FAILED:-false}'"
    } > "$STATE_FILE"
}

# ──────────────────────────────────────────────────────────────────────
# Helpers SSH/rsync
# ──────────────────────────────────────────────────────────────────────
SSH_OPTS=(
    -p "$SSH_PORT"
    -o StrictHostKeyChecking=accept-new
    -o BatchMode=yes
    -o ConnectTimeout=15
    -o ServerAliveInterval=10
    -o ServerAliveCountMax=3
)

# Retry wrapper: 3 intentos con backoff 5s/15s. Para glitches transitorios
# de Hostinger (timeouts SSH, rate-limit, latencia).
SSH_MAX_RETRIES=3
SSH_BACKOFFS=(5 15)

with_retry() {
    local attempt=1
    local rc=0
    while [ "$attempt" -le "$SSH_MAX_RETRIES" ]; do
        "$@" && return 0
        rc=$?
        if [ "$attempt" -lt "$SSH_MAX_RETRIES" ]; then
            local sleep_for="${SSH_BACKOFFS[$((attempt - 1))]:-15}"
            echo "   ⚠️  Intento $attempt falló (rc=$rc). Reintento en ${sleep_for}s..." >&2
            sleep "$sleep_for"
        fi
        attempt=$((attempt + 1))
    done
    echo "   ❌ Falló tras $SSH_MAX_RETRIES intentos (rc=$rc)" >&2
    return "$rc"
}

_ssh_run_once() {
    ssh "${SSH_OPTS[@]}" "$SSH_USER@$SSH_HOST" "$@"
}
ssh_run() {
    with_retry _ssh_run_once "$@"
}

_rsync_files_once() {
    local list_file="$1"
    rsync -az --files-from="$list_file" \
          -e "ssh ${SSH_OPTS[*]}" \
          ./ "$SSH_USER@$SSH_HOST:$DEPLOY_PATH/"
}
rsync_files() {
    local list_file="$1"
    [ -s "$list_file" ] || return 0
    with_retry _rsync_files_once "$list_file"
}

ssh_rm_files() {
    local list_file="$1"
    [ -s "$list_file" ] || return 0
    < "$list_file" ssh_run "cd '$DEPLOY_PATH' && xargs -d '\n' rm -f --"
}

# ──────────────────────────────────────────────────────────────────────
# Filtro contra .deployignore
# ──────────────────────────────────────────────────────────────────────
EXCLUDE_PATTERNS=()
load_exclude_patterns() {
    EXCLUDE_PATTERNS=()
    [ -f "$DEPLOYIGNORE" ] || return
    while IFS= read -r line || [ -n "$line" ]; do
        line="${line%$'\r'}"
        [[ -z "$line" || "$line" == \#* ]] && continue
        EXCLUDE_PATTERNS+=("$line")
    done < "$DEPLOYIGNORE"
}

is_excluded() {
    local file="$1"
    local pattern base
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$pattern" == */ ]]; then
            local p="${pattern%/}"
            [[ "$file" == "$p" || "$file" == "$p"/* ]] && return 0
        elif [[ "$pattern" == */* ]]; then
            # shellcheck disable=SC2053
            [[ "$file" == $pattern ]] && return 0
        else
            base="${file##*/}"
            # shellcheck disable=SC2053
            [[ "$base" == $pattern || "$file" == $pattern ]] && return 0
        fi
    done
    return 1
}

filter_list() {
    while IFS= read -r f; do
        [ -z "$f" ] && continue
        is_excluded "$f" || echo "$f"
    done
}

# ──────────────────────────────────────────────────────────────────────
# Backup remoto (INCREMENTAL)
#
# A diferencia del backup full anterior, este sólo respalda los archivos
# que el commit va a modificar o eliminar. Los archivos `added` no se
# respaldan: no existen aún en el server, nada que perder.
#
# Si rollback hace falta: extraer el tar.gz al DEPLOY_PATH y los archivos
# vuelven a su versión pre-cambio. Los added quedarán en el server (basura
# inocua) pero se pueden borrar leyendo el .deployed_sha previo.
#
# Backup name: ${ts}_${label}_${n}files.tar.gz
# Rotación: últimos 10 (antes 5, ahora son ~KB en vez de ~MB).
# ──────────────────────────────────────────────────────────────────────
do_backup() {
    local label="$1"
    local files_list="${2:-}"

    if [ -z "$files_list" ] || [ ! -s "$files_list" ]; then
        echo "   ├─ 💾 Backup: omitido (sin archivos previos a respaldar)"
        LAST_BACKUP="(omitido)"
        return 0
    fi

    local ts; ts=$(date +%Y%m%d_%H%M%S)
    local n; n=$(wc -l < "$files_list" | tr -d ' ')
    local backup_name="${ts}_${label}_${n}files.tar.gz"
    echo "   ├─ 💾 Backup incremental: $backup_name ($n archivo(s))"

    # No usamos with_retry: stdin no se puede "rebobinar" en reintentos.
    # Si el backup falla, el deploy sigue (no es bloqueante).
    if ssh "${SSH_OPTS[@]}" "$SSH_USER@$SSH_HOST" \
            "mkdir -p '$BACKUP_DIR_REMOTE' && \
             cd '$DEPLOY_PATH' && \
             tar -czf '$BACKUP_DIR_REMOTE/$backup_name' \
                 --files-from=- --ignore-failed-read 2>/dev/null && \
             ls -1t '$BACKUP_DIR_REMOTE'/*.tar.gz | tail -n +11 | xargs -r rm --" \
            < "$files_list"; then
        LAST_BACKUP="$backup_name"
        TOTAL_BACKUPS=$((TOTAL_BACKUPS + 1))
    else
        echo "   ⚠️  Backup falló (deploy continúa igual)"
        LAST_BACKUP="(falló)"
    fi
}

# ──────────────────────────────────────────────────────────────────────
# Reporte de un commit al SUMMARY (markdown persistente)
# ──────────────────────────────────────────────────────────────────────
write_commit_report() {
    local sha="$1" added_file="$2" modified_file="$3" deleted_file="$4"
    local commit_num="$5" commit_total="$6"
    local sha7="${sha:0:7}"
    local subject; subject=$(git log -1 --format=%s "$sha")
    local author; author=$(git log -1 --format='%an' "$sha")
    local n_a n_m n_d total
    n_a=$(wc -l < "$added_file" | tr -d ' ')
    n_m=$(wc -l < "$modified_file" | tr -d ' ')
    n_d=$(wc -l < "$deleted_file" | tr -d ' ')
    total=$(( n_a + n_m + n_d ))

    echo "   ├─ 📊 Cambios: $n_a nuevos · $n_m modificados · $n_d eliminados ($total total)"

    {
        echo ""
        echo "---"
        echo ""
        echo "### 📌 Commit $commit_num/$commit_total · \`$sha7\` — $subject"
        echo ""
        echo "**Autor:** $author"
        echo ""
        echo "| Tipo | Cantidad |"
        echo "|---|---:|"
        echo "| ➕ Nuevos | $n_a |"
        echo "| ✏️ Modificados | $n_m |"
        echo "| 🗑️ Eliminados | $n_d |"
        echo "| **📦 Total** | **$total** |"
        echo ""
        echo "**💾 Backup:** \`${LAST_BACKUP:-(ninguno)}\`"
        echo ""

        if [ "$total" -gt 0 ]; then
            echo "<details><summary>📂 Ver lista de archivos</summary>"
            echo ""
            if [ "$n_a" -gt 0 ]; then
                echo "**➕ Nuevos ($n_a):**"
                echo ""
                awk '{printf "%d. `%s`\n", NR, $0}' "$added_file"
                echo ""
            fi
            if [ "$n_m" -gt 0 ]; then
                echo "**✏️ Modificados ($n_m):**"
                echo ""
                awk '{printf "%d. `%s`\n", NR, $0}' "$modified_file"
                echo ""
            fi
            if [ "$n_d" -gt 0 ]; then
                echo "**🗑️ Eliminados ($n_d):**"
                echo ""
                awk '{printf "%d. `%s`\n", NR, $0}' "$deleted_file"
                echo ""
            fi
            echo "</details>"
        fi
    } >> "$SUMMARY"

    TOTAL_ADDED=$((TOTAL_ADDED + n_a))
    TOTAL_MODIFIED=$((TOTAL_MODIFIED + n_m))
    TOTAL_DELETED=$((TOTAL_DELETED + n_d))
}

deploy_one_commit() {
    local prev_sha="$1" target_sha="$2" commit_num="$3" commit_total="$4"
    local subject; subject=$(git log -1 --format=%s "$target_sha")
    local sha7="${target_sha:0:7}"

    echo "━━━ Commit $commit_num/$commit_total · $sha7 ━━━"
    echo "   ├─ 📝 Mensaje: \"$subject\""

    local tmp; tmp=$(mktemp -d)
    local added="$tmp/added.txt" modified="$tmp/modified.txt" deleted="$tmp/deleted.txt"
    : > "$added"; : > "$modified"; : > "$deleted"

    git diff --name-status "$prev_sha" "$target_sha" | while IFS=$'\t' read -r status p1 p2; do
        case "$status" in
            A)    echo "$p1" >> "$added" ;;
            M|T)  echo "$p1" >> "$modified" ;;
            D)    echo "$p1" >> "$deleted" ;;
            R*)   echo "$p1" >> "$deleted"; echo "$p2" >> "$added" ;;
            C*)   echo "$p2" >> "$added" ;;
        esac
    done

    : > "$added.f"; : > "$modified.f"; : > "$deleted.f"
    filter_list < "$added"    > "$added.f"
    filter_list < "$modified" > "$modified.f"
    filter_list < "$deleted"  > "$deleted.f"

    local total
    total=$(( $(wc -l < "$added.f") + $(wc -l < "$modified.f") + $(wc -l < "$deleted.f") ))

    if [ "$total" -eq 0 ]; then
        echo "   └─ ⏭️  Skipped: sólo cambios en archivos excluidos"
        {
            echo ""
            echo "---"
            echo ""
            echo "### ⏭️ Commit $commit_num/$commit_total · \`$sha7\` — _skipped_"
            echo ""
            echo "Sólo cambios en archivos excluidos por \`.deployignore\`."
        } >> "$SUMMARY"
        rm -rf "$tmp"
        return 0
    fi

    # Backup INCREMENTAL: respalda sólo lo que vamos a pisar/borrar
    # (modified + deleted). Los added son nuevos en server, no hay nada
    # que respaldar para ellos.
    cat "$modified.f" "$deleted.f" > "$tmp/backup.txt"
    do_backup "$sha7" "$tmp/backup.txt"

    git checkout --quiet "$target_sha"

    cat "$added.f" "$modified.f" > "$tmp/upload.txt"
    echo "   ├─ ⬆️  Subiendo $(wc -l < "$tmp/upload.txt" | tr -d ' ') archivos al servidor..."
    rsync_files "$tmp/upload.txt"
    ssh_rm_files "$deleted.f"

    write_commit_report "$target_sha" "$added.f" "$modified.f" "$deleted.f" "$commit_num" "$commit_total"
    echo "   └─ ✅ Commit $sha7 deployado OK"

    rm -rf "$tmp"
}

# ══════════════════════════════════════════════════════════════════════
# FASES
# ══════════════════════════════════════════════════════════════════════

phase_config() {
    START_TS=$(date +%s)
    MODE="${MODE_ARG:-sequential}"
    UPDATE_SHA="${UPDATE_SHA_ARG:-true}"
    TO_SHA=$(git rev-parse "${TO_SHA_ARG:-HEAD}")
    FROM_SHA="$FROM_SHA_ARG"
    TOTAL_ADDED=0
    TOTAL_MODIFIED=0
    TOTAL_DELETED=0
    TOTAL_BACKUPS=0
    TOTAL_COMMITS_OK=0
    LAST_OK=""
    DEPLOY_FAILED=false

    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 ETAPA 1/5 — Configuración"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "   ├─ 🖥️  Servidor:      $SSH_USER@$SSH_HOST:$SSH_PORT"
    echo "   ├─ 📁 Path remoto:    $DEPLOY_PATH"
    echo "   ├─ 💾 Backups dir:    $BACKUP_DIR_REMOTE"
    echo "   ├─ ⚙️  Modo:           $MODE"
    echo "   ├─ 🎯 SHA destino:    ${TO_SHA:0:7}"
    echo "   └─ 🔄 Update SHA:     $UPDATE_SHA"

    {
        echo "# 🚀 Deploy a producción — nz-estudio"
        echo ""
        echo "| Campo | Valor |"
        echo "|---|---|"
        echo "| **🖥️ Servidor** | \`$SSH_HOST:$SSH_PORT\` |"
        echo "| **📁 Path** | \`$DEPLOY_PATH\` |"
        echo "| **⚙️ Modo** | \`$MODE\` |"
        echo "| **🎯 SHA destino** | \`${TO_SHA:0:7}\` |"
        echo "| **🔄 Update SHA** | \`$UPDATE_SHA\` |"
    } >> "$SUMMARY"

    save_state
}

phase_read_sha() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 ETAPA 2/5 — Leer estado del servidor"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    if [ -z "${FROM_SHA:-}" ]; then
        FROM_SHA=$(ssh_run "cat '$SHA_FILE_REMOTE' 2>/dev/null || echo INITIAL")
        echo "   ├─ 🔎 SHA encontrado en server: $FROM_SHA"
    else
        echo "   ├─ 🔎 FROM_SHA manual: $FROM_SHA"
    fi

    if [ "$FROM_SHA" = "INITIAL" ]; then
        echo "   └─ ℹ️  Primer deploy: no hay SHA previo (modo INITIAL)"
    else
        local subj; subj=$(git log -1 --format=%s "$FROM_SHA" 2>/dev/null || echo "(SHA no encontrado en historial local)")
        echo "   └─ 📝 Último commit deployado: \"$subj\""
    fi

    save_state
}

phase_plan() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 ETAPA 3/5 — Plan de deploy"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    load_exclude_patterns

    # Caso 1: INITIAL (full upload)
    if [ "$FROM_SHA" = "INITIAL" ] || ! git cat-file -e "$FROM_SHA^{commit}" 2>/dev/null; then
        if [ "$FROM_SHA" != "INITIAL" ]; then
            echo "   ├─ ⚠️  FROM_SHA '$FROM_SHA' no existe localmente → fallback INITIAL"
        fi
        MODE_RESOLVED="initial"
        git ls-files | filter_list > "$FILES_FILE"
        local n; n=$(wc -l < "$FILES_FILE" | tr -d ' ')
        echo "   ├─ 📦 Plan: deploy inicial (todo el repo filtrado)"
        echo "   └─ 📊 Archivos a subir: $n"

        {
            echo ""
            echo "---"
            echo ""
            echo "## 📋 Plan: Deploy inicial (INITIAL)"
            echo ""
            echo "Primera vez. Se subirá **todo el repositorio** filtrado por \`.deployignore\`."
            echo ""
            echo "**📦 Total archivos:** $n"
        } >> "$SUMMARY"

        save_state
        return 0
    fi

    # Caso 2: bulk
    if [ "$MODE" = "bulk" ]; then
        MODE_RESOLVED="bulk"
        echo "   ├─ 📦 Plan: deploy BULK (diff único)"
        echo "   └─ 🔁 Rango: ${FROM_SHA:0:7} → ${TO_SHA:0:7}"
        {
            echo ""
            echo "---"
            echo ""
            echo "## 📋 Plan: BULK"
            echo ""
            echo "Diff único de \`${FROM_SHA:0:7}\` → \`${TO_SHA:0:7}\`."
        } >> "$SUMMARY"
        save_state
        return 0
    fi

    # Caso 3: sequential (default)
    MODE_RESOLVED="sequential"
    git rev-list --reverse "$FROM_SHA..$TO_SHA" > "$COMMITS_FILE" || true
    TOTAL_COMMITS=$(wc -l < "$COMMITS_FILE" | tr -d ' ')

    if [ "$TOTAL_COMMITS" -eq 0 ]; then
        MODE_RESOLVED="nothing"
        echo "   └─ ℹ️  Nada que deployar: server ya está al día con $TO_SHA"
        {
            echo ""
            echo "---"
            echo ""
            echo "## 📋 Plan: Sin cambios"
            echo ""
            echo "El servidor ya está al día con el último commit (\`${TO_SHA:0:7}\`)."
        } >> "$SUMMARY"
        save_state
        return 0
    fi

    echo "   ├─ 📦 Plan: deploy SECUENCIAL"
    echo "   ├─ 🔢 Commits a aplicar: $TOTAL_COMMITS"
    {
        echo ""
        echo "---"
        echo ""
        echo "## 📋 Plan: $TOTAL_COMMITS commits (modo secuencial)"
        echo ""
        echo "| # | SHA | Mensaje |"
        echo "|---:|---|---|"
    } >> "$SUMMARY"
    local i=0
    while IFS= read -r c; do
        i=$((i + 1))
        local subj; subj=$(git log -1 --format=%s "$c")
        local sha7="${c:0:7}"
        echo "   │   $i. $sha7 — $subj"
        echo "| $i | \`$sha7\` | $subj |" >> "$SUMMARY"
    done < "$COMMITS_FILE"
    echo "   └─ ✅ Plan listo"

    save_state
}

phase_execute() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 ETAPA 4/5 — Deploy de commits"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    load_exclude_patterns

    case "${MODE_RESOLVED:-}" in
        initial)
            # No hay backup: es el primer deploy, no hay archivos previos en server.
            LAST_BACKUP="(no aplica, deploy inicial)"
            local n; n=$(wc -l < "$FILES_FILE" | tr -d ' ')
            echo "   ├─ ⬆️  Subiendo $n archivos (modo INITIAL)..."
            rsync_files "$FILES_FILE"
            TOTAL_ADDED=$n
            TOTAL_COMMITS_OK=1
            LAST_OK="$TO_SHA"

            {
                echo ""
                echo "---"
                echo ""
                echo "### 🆕 Deploy inicial completado"
                echo ""
                echo "| Métrica | Valor |"
                echo "|---|---:|"
                echo "| 📦 Archivos subidos | **$n** |"
                echo "| 💾 Backup | _no aplica (deploy inicial)_ |"
                echo ""
                echo "<details><summary>📂 Ver lista completa de $n archivos</summary>"
                echo ""
                awk '{printf "%d. `%s`\n", NR, $0}' "$FILES_FILE"
                echo ""
                echo "</details>"
            } >> "$SUMMARY"
            echo "   └─ ✅ Deploy inicial completado"
            ;;

        bulk)
            deploy_one_commit "$FROM_SHA" "$TO_SHA" 1 1
            TOTAL_COMMITS_OK=1
            LAST_OK="$TO_SHA"
            ;;

        sequential)
            local prev="$FROM_SHA"
            local count=0
            while IFS= read -r c; do
                count=$((count + 1))
                if deploy_one_commit "$prev" "$c" "$count" "$TOTAL_COMMITS"; then
                    LAST_OK="$c"
                    prev="$c"
                    TOTAL_COMMITS_OK=$((TOTAL_COMMITS_OK + 1))
                    # Actualizar SHA en server entre commits (auto-recovery)
                    if [ "$UPDATE_SHA" = "true" ]; then
                        echo "$c" | ssh_run "cat > '$SHA_FILE_REMOTE'"
                    fi
                    echo ""
                else
                    echo "   ❌ FALLÓ en commit ${c:0:7}. Fail-fast: paro acá."
                    DEPLOY_FAILED=true
                    save_state
                    {
                        echo ""
                        echo "---"
                        echo ""
                        echo "## ❌ Deploy abortado en commit \`${c:0:7}\`"
                        echo ""
                        echo "**Último SHA OK en server:** \`${LAST_OK:0:7}\`"
                        echo ""
                        echo "El próximo push retomará desde ese SHA."
                    } >> "$SUMMARY"
                    exit 1
                fi
            done < "$COMMITS_FILE"
            ;;

        nothing)
            echo "   └─ ℹ️  Nada para ejecutar (server al día)"
            ;;

        *)
            echo "   ❌ MODE_RESOLVED inválido: '${MODE_RESOLVED:-}'"
            exit 1
            ;;
    esac

    save_state
}

phase_finalize() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 ETAPA 5/5 — Finalizar"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    # En modos initial/bulk, escribir SHA acá (sequential lo escribe entre commits)
    if [ "${DEPLOY_FAILED:-false}" != "true" ] && \
       [ "$UPDATE_SHA" = "true" ] && \
       [ -n "${LAST_OK:-}" ] && \
       { [ "${MODE_RESOLVED:-}" = "initial" ] || [ "${MODE_RESOLVED:-}" = "bulk" ]; }; then
        echo "   ├─ 📝 Escribiendo $LAST_OK en .deployed_sha"
        echo "$LAST_OK" | ssh_run "cat > '$SHA_FILE_REMOTE'"
    fi

    local end_ts; end_ts=$(date +%s)
    local duration=$((end_ts - START_TS))
    local total_files=$((TOTAL_ADDED + TOTAL_MODIFIED + TOTAL_DELETED))

    echo "   ├─ ✅ Commits aplicados:   $TOTAL_COMMITS_OK"
    echo "   ├─ 📦 Archivos totales:    $total_files"
    echo "   │   ├─ ➕ Nuevos:           $TOTAL_ADDED"
    echo "   │   ├─ ✏️  Modificados:     $TOTAL_MODIFIED"
    echo "   │   └─ 🗑️  Eliminados:      $TOTAL_DELETED"
    echo "   ├─ 💾 Backups creados:     $TOTAL_BACKUPS"
    echo "   └─ ⏱️  Duración total:      ${duration}s"

    {
        echo ""
        echo "---"
        echo ""
        echo "## ✅ Resumen final"
        echo ""
        echo "| Métrica | Valor |"
        echo "|---|---:|"
        echo "| 🟢 Commits aplicados | $TOTAL_COMMITS_OK |"
        echo "| 📦 Archivos totales | **$total_files** |"
        echo "| ➕ Nuevos | $TOTAL_ADDED |"
        echo "| ✏️ Modificados | $TOTAL_MODIFIED |"
        echo "| 🗑️ Eliminados | $TOTAL_DELETED |"
        echo "| 💾 Backups creados | $TOTAL_BACKUPS |"
        echo "| ⏱️ Duración total | ${duration}s |"
    } >> "$SUMMARY"

    save_state
}

# ──────────────────────────────────────────────────────────────────────
# Dispatcher
# ──────────────────────────────────────────────────────────────────────
case "$PHASE" in
    config)    phase_config ;;
    read-sha)  phase_read_sha ;;
    plan)      phase_plan ;;
    execute)   phase_execute ;;
    finalize)  phase_finalize ;;
    *) echo "Fase desconocida: $PHASE" >&2; exit 1 ;;
esac
