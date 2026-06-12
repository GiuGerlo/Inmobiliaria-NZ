<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

/**
 * La API habla inglés; las tablas legacy hablan español (ADR-0002).
 * Cada controller define FIELD_MAP input → columna.
 */
trait MapsLegacyFields
{
    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function mapFields(array $validated): array
    {
        return collect($validated)
            ->mapWithKeys(fn ($value, $key) => [self::FIELD_MAP[$key] => $value])
            ->all();
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 25), 100));
    }
}
