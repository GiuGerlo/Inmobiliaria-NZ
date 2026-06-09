# syntax=docker/dockerfile:1.7
# Apache + PHP 7.4 para servir el código PHP legacy intacto durante la transición.
FROM php:7.4-apache

# Dependencias para extensions GD (si el legacy las usa)
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpng-dev libjpeg-dev libfreetype6-dev libzip-dev unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) mysqli pdo_mysql gd zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY docker/legacy/apache.conf /etc/apache2/sites-available/000-default.conf

# Código se monta como bind volume desde ./legacy en compose.

EXPOSE 80
