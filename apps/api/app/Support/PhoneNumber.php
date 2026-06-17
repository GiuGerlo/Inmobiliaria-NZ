<?php

declare(strict_types=1);

namespace App\Support;

use Propaganistas\LaravelPhone\PhoneNumber as LibPhoneNumber;
use Throwable;

/**
 * Normaliza teléfonos legacy (Tel_Dueno / Tel_Inquilino, char(20) en formato libre)
 * al formato E.164 que exige WhatsApp Cloud API. País por defecto: Argentina
 * (libphonenumber resuelve el "9" de celular).
 */
final class PhoneNumber
{
    // ponytail: un número AR ambiguo (sin marca de celular) sale como fijo, sin el "9"
    // (ej. +543468... en vez de +5493468...). El operador lo corrige en el modal y se
    // valida en la verificación real con Meta; si Meta no resuelve el 9, agregar el
    // transform AR aquí.

    /** Devuelve el número en E.164 (ej. +5493514...) o null si no es válido. */
    public static function toE164(?string $raw, string $country = 'AR'): ?string
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        try {
            $phone = new LibPhoneNumber($raw, $country);

            return $phone->isValid() ? $phone->formatE164() : null;
        } catch (Throwable) {
            return null;
        }
    }
}
