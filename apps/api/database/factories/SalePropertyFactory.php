<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SaleProperty> */
final class SalePropertyFactory extends Factory
{
    protected $model = SaleProperty::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'property_type_id' => PropertyType::factory(),
            'title' => $this->faker->sentence(3),
            'locality' => $this->faker->city(),
            'location' => $this->faker->address(),
            'size' => $this->faker->numberBetween(50, 500).' m2',
            'services' => 'Luz, Agua, Gas',
            'features' => $this->faker->sentence(),
            'map_embed' => null,
            'sort_order' => 0,
            'is_sold' => false,
            'latitude' => $this->faker->latitude(-33, -31),
            'longitude' => $this->faker->longitude(-63, -61),
        ];
    }

    public function sold(): static
    {
        return $this->state(fn () => ['is_sold' => true]);
    }
}
