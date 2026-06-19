<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PropertyImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PropertyImage extends Model
{
    /** @use HasFactory<PropertyImageFactory> */
    use HasFactory;

    protected $fillable = ['sale_property_id', 'path', 'sort_order'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    /** @return BelongsTo<SaleProperty, $this> */
    public function saleProperty(): BelongsTo
    {
        return $this->belongsTo(SaleProperty::class);
    }
}
