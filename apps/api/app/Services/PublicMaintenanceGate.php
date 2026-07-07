<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Sincroniza el gate de mantenimiento del sitio público (Next static export en
 * Hostinger, sin runtime) escribiendo un bloque delimitado en su `.htaccess`. Admin
 * y público viven en la misma cuenta/filesystem → Laravel puede escribir ahí.
 *
 * Sin `PUBLIC_DOCROOT_PATH` configurado o si el path no existe (ej. local en Docker,
 * donde el público es otro container) → no-op: solo queda el estado en DB. Ver ADR-0010.
 */
final class PublicMaintenanceGate
{
    private const BEGIN = '# BEGIN NZ-MAINTENANCE';

    private const END = '# END NZ-MAINTENANCE';

    /** Escribe el bloque: deja pasar solo $ip; el resto ve maintenance.html (503). */
    public function enable(string $ip): void
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP)) {
            return;
        }

        $path = $this->htaccessPath();
        if ($path === null) {
            return;
        }

        $this->write($path, $this->baseWithoutBlock($path).$this->block($ip));
    }

    /** Quita el bloque de mantenimiento; el público vuelve a servirse normal. */
    public function disable(): void
    {
        $path = $this->htaccessPath();
        if ($path === null) {
            return;
        }

        $this->write($path, $this->baseWithoutBlock($path));
    }

    private function htaccessPath(): ?string
    {
        $docroot = config('maintenance.public_docroot');

        if (! is_string($docroot) || $docroot === '' || ! is_dir($docroot)) {
            return null;
        }

        return rtrim($docroot, '/').'/.htaccess';
    }

    /** Contenido actual del .htaccess sin ningún bloque NZ-MAINTENANCE (idempotente). */
    private function baseWithoutBlock(string $path): string
    {
        $current = is_file($path) ? (string) file_get_contents($path) : '';

        $pattern = '/\s*'.preg_quote(self::BEGIN, '/').'.*?'.preg_quote(self::END, '/').'\s*/s';
        $base = trim((string) preg_replace($pattern, '', $current));

        return $base === '' ? '' : $base."\n";
    }

    private function write(string $path, string $contents): void
    {
        file_put_contents($path, $contents, LOCK_EX);
    }

    private function block(string $ip): string
    {
        return self::BEGIN."\n"
            ."<IfModule mod_rewrite.c>\n"
            ."    RewriteEngine On\n"
            ."    RewriteCond %{REMOTE_ADDR} !={$ip}\n"
            ."    RewriteCond %{REQUEST_URI} !^/maintenance\\.html$ [NC]\n"
            ."    RewriteCond %{REQUEST_URI} !\\.(css|js|png|jpe?g|svg|gif|ico|webp|woff2?|ttf)$ [NC]\n"
            ."    RewriteRule ^ /maintenance.html [R=503,L]\n"
            ."</IfModule>\n"
            ."ErrorDocument 503 /maintenance.html\n"
            .self::END."\n";
    }
}
