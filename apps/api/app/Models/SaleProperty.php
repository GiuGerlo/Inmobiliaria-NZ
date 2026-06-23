<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SalePropertyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

final class SaleProperty extends Model
{
    /** @use HasFactory<SalePropertyFactory> */
    use HasFactory;

    // slug NO es fillable: se genera internamente (el admin no lo manda).
    protected $fillable = [
        'property_type_id', 'title', 'locality', 'location', 'size',
        'services', 'features', 'map_embed', 'sort_order', 'is_sold',
        'latitude', 'longitude',
    ];

    protected static function booted(): void
    {
        // Slug estable y único para las URLs del sitio público: base del título + "-{id}".
        // El id solo existe tras el insert → en `created` se reescribe sin disparar eventos.
        self::creating(fn (self $p) => $p->slug = self::slugBase($p->title));
        self::created(function (self $p) {
            $p->slug = self::slugBase($p->title)."-{$p->id}";
            $p->saveQuietly();
        });
        self::updating(function (self $p) {
            if ($p->isDirty('title')) {
                $p->slug = self::slugBase($p->title)."-{$p->id}";
            }
        });
    }

    private static function slugBase(?string $title): string
    {
        return Str::slug((string) $title) ?: 'propiedad';
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'is_sold' => 'boolean',
            'sort_order' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /** @return BelongsTo<PropertyType, $this> */
    public function type(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class, 'property_type_id');
    }

    /** @return HasMany<PropertyImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }
}
