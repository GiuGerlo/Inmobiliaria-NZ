# syntax=docker/dockerfile:1.7
ARG PHP_VERSION=8.4
FROM php:${PHP_VERSION}-fpm-alpine

# Extensiones del sistema requeridas por Laravel + librerías comunes
RUN apk add --no-cache \
      git unzip libzip-dev oniguruma-dev icu-dev \
      libpng-dev libjpeg-turbo-dev freetype-dev libwebp-dev \
      mariadb-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
       pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Composer 2.x
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# Layer cache: copiamos solo metadata de Composer si existe.
# Builds normales: cocina vendor/ dentro del image layer (no bind mount).
COPY apps/api/composer.json apps/api/composer.lock* ./
# Si hay lock → install (reproducible). Si no → update (resuelve y genera lock).
RUN if [ -f composer.lock ]; then \
      composer install --no-interaction --no-scripts --no-progress --prefer-dist; \
    else \
      composer update --no-interaction --no-scripts --no-progress --prefer-dist; \
    fi

# El código se monta por bind (./apps/api). vendor/ vive en volumen nombrado
# (api-vendor) — ver docker-compose.yml — para no ser tapado por el bind mount.

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
