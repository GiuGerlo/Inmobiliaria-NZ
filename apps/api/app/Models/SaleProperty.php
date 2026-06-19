<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SalePropertyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SaleProperty extends Model
{
    /** @use HasFactory<SalePropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'property_type_id', 'title', 'locality', 'location', 'size',
        'services', 'features', 'map_embed', 'sort_order', 'is_sold',
        'latitude', 'longitude',
    ];

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
