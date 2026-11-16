<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/** Registro de auditoría. Solo se escribe vía record(); nunca se edita ni se borra desde la app. */
final class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     */
    public static function record(
        string $event,
        ?Model $subject = null,
        array $old = [],
        array $new = [],
        int|string|null $userId = null,
    ): self {
        $request = request();

        return self::create([
            'user_id' => $userId ?? auth()->id(),
            'event' => $event,
            'auditable_type' => $subject ? class_basename($subject) : null,
            'auditable_id' => $subject?->getKey() !== null ? (string) $subject->getKey() : null,
            'old_values' => $old ?: null,
            'new_values' => $new ?: null,
            'ip' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 250, ''),
        ]);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'ID_User');
    }
}
