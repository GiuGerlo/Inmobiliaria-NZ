#!/bin/sh
# Auto-bootstrap de Laravel al arrancar el container.
# Garantiza zero-touch: .env + APP_KEY sin comandos manuales.
set -e

cd /var/www/api

if [ ! -f .env ]; then
    echo "[entrypoint] .env no existe — copiando desde .env.example"
    cp .env.example .env
fi

if ! grep -q "^APP_KEY=base64:" .env; then
    echo "[entrypoint] APP_KEY vacía — generando"
    php artisan key:generate --force
fi

# Los workers fpm corren como www-data; el bind mount llega como root.
# Sin esto no se escriben view cache ni uploads (storage/app/public).
chmod -R ugo+rwX storage bootstrap/cache

exec php-fpm
