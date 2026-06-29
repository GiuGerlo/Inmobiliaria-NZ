<?php

declare(strict_types=1);

namespace App\Support;

use RuntimeException;

/**
 * Embebe imágenes de marca (logo, firma) como data URI base64 en los Blade de PDF.
 *
 * El motor (dompdf, PHP puro) no resuelve rutas locales ni `http://localhost/...` de
 * forma confiable (el bug del legacy). Embeber en base64 evita toda dependencia de red
 * o de assets servidos.
 */
final class PdfAsset
{
    private const DIR = 'pdf-assets';

    /** Cache en memoria por request para no releer/recodificar el mismo asset. */
    private static array $cache = [];

    /**
     * Devuelve el asset como data URI listo para `src=""` en el Blade.
     */
    public static function dataUri(string $filename): string
    {
        if (isset(self::$cache[$filename])) {
            return self::$cache[$filename];
        }

        $path = resource_path(self::DIR.'/'.$filename);

        if (! is_file($path)) {
            throw new RuntimeException("PDF asset no encontrado: {$filename}");
        }

        $mime = match (strtolower(pathinfo($filename, PATHINFO_EXTENSION))) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };

        $data = base64_encode((string) file_get_contents($path));

        return self::$cache[$filename] = "data:{$mime};base64,{$data}";
    }
}
