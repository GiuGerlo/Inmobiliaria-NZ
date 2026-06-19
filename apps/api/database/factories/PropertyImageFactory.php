<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyImage;
use App\Models\SaleProperty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PropertyImage> */
final class PropertyImageFactory extends Factory
{
    protected $model = PropertyImage::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'sale_property_id' => SaleProperty::factory(),
            'path' => 'sale-properties/1/'.$this->faker->uuid().'.webp',
            'sort_order' => 0,
        ];
    }
}
