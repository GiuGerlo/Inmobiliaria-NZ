<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Clave-valor simple para configuración editable en runtime (ej. modo mantenimiento).
 * No es config estática de `config/*.php`: esto cambia desde la app y persiste en DB.
 */
final class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = static::query()->whereKey($key)->value('value');

        return $value ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
