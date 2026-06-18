<?php

declare(strict_types=1);

namespace App\Support;

use Luecano\NumeroALetras\NumeroALetras;

/**
 * Número entero de pesos → palabras, para el "Recibí(mos) la suma de: Pesos ..."
 * del recibo. Reemplaza el conversor casero del legacy (que escribía mal
 * "docientos"/"trecientos") por luecano/numero-a-letras.
 */
final class NumberToWords
{
    /**
     * Devuelve el monto en palabras, en minúsculas (el Blade antepone "Pesos").
     * Ej: 120000 → "ciento veinte mil".
     */
    public static function spell(float|int $amount): string
    {
        $words = (new NumeroALetras)->toWords((int) round($amount), 0);

        return mb_strtolower(trim($words));
    }
}
