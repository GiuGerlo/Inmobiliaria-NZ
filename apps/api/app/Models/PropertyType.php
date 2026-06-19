<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PropertyTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PropertyType extends Model
{
    /** @use HasFactory<PropertyTypeFactory> */
    use HasFactory;

    protected $fillable = ['name'];

    /** @return HasMany<SaleProperty, $this> */
    public function saleProperties(): HasMany
    {
        return $this->hasMany(SaleProperty::class);
    }
}
