FROM php:8.2.30-apache

# Paquetes del sistema necesarios para extensiones PHP
RUN apt-get update && apt-get install -y --no-install-recommends \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libwebp-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        libicu-dev \
        zlib1g-dev \
        unzip \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Extensiones PHP: mysqli, gd con WebP, exif, intl, zip, opcache
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        mysqli \
        gd \
        exif \
        intl \
        zip \
        opcache

# Habilitar mod_rewrite (para .htaccess del proyecto)
RUN a2enmod rewrite headers expires

# Configuración de PHP y Apache
COPY php.ini /usr/local/etc/php/conf.d/zz-nz-estudio.ini
COPY apache-vhost.conf /etc/apache2/sites-available/000-default.conf

# Permisos: que Apache pueda escribir uploads/
RUN chown -R www-data:www-data /var/www/html \
    && mkdir -p /var/www/html/uploads \
    && chmod -R 775 /var/www/html/uploads

# Marca de entorno para que config.php detecte Docker
ENV NZ_ENV=docker

EXPOSE 80
