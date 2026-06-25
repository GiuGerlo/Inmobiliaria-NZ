#!/bin/sh
# Auto-bootstrap de Laravel al arrancar el container.
# Zero-touch: .env + APP_KEY + migraciones + seed sin comandos manuales.
set -e

cd /var/www/api

if [ ! -f .env ]; then
    echo "[entrypoint] .env no existe — copiando desde .env.example"
    cp .env.example .env
fi

# Los workers fpm corren como www-data; el bind mount llega como root.
# Sin esto no se escriben view cache ni uploads (storage/app/public).
# También crea los subdirectorios que Laravel espera bajo storage/framework/.
mkdir -p storage/framework/views storage/framework/cache/data storage/framework/sessions storage/logs storage/app/public bootstrap/cache
chmod -R ugo+rwX storage bootstrap/cache

if ! grep -q "^APP_KEY=base64:" .env; then
    echo "[entrypoint] APP_KEY vacía — generando"
    php artisan key:generate --force
fi

# --- Base de datos: migrar y seedear automáticamente ---
# mariadb ya está "healthy" por depends_on, pero reintentamos por las dudas de timing.
echo "[entrypoint] migrando la base de datos…"
tries=0
until php artisan migrate --force 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge 30 ]; then
        echo "[entrypoint] la DB no respondió a tiempo — arranco sin migrar (corré 'php artisan migrate' a mano)"
        break
    fi
    echo "[entrypoint] DB no lista, reintento ($tries)…"
    sleep 2
done

# Seed SOLO si la base está vacía — nunca pisa datos existentes.
USERS=$(php artisan tinker --execute='echo \App\Models\User::count();' 2>/dev/null | tr -dc '0-9')
if [ -z "$USERS" ] || [ "$USERS" = "0" ]; then
    echo "[entrypoint] base vacía — seedeando roles + usuarios demo"
    php artisan db:seed --force
fi

exec php-fpm
