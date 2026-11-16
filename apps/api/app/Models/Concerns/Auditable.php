<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

/**
 * Registra altas, cambios y bajas del modelo en audit_logs.
 * Excluye $hidden (passwords, tokens) y timestamps. Las escrituras masivas
 * del query builder no disparan eventos de Eloquent → no quedan registradas.
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(fn (Model $model) => AuditLog::record('created', $model, [], self::auditValues($model, $model->getAttributes())));

        static::updated(function (Model $model): void {
            $new = self::auditValues($model, $model->getChanges());
            if ($new === []) {
                return;
            }
            AuditLog::record('updated', $model, Arr::only($model->getOriginal(), array_keys($new)), $new);
        });

        static::deleted(fn (Model $model) => AuditLog::record('deleted', $model, self::auditValues($model, $model->getAttributes())));
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private static function auditValues(Model $model, array $values): array
    {
        return Arr::except($values, [...$model->getHidden(), 'created_at', 'updated_at']);
    }
}
