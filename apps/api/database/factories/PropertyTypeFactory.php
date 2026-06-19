<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PropertyType> */
final class PropertyTypeFactory extends Factory
{
    protected $model = PropertyType::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Casas', 'Terrenos', 'Locales', 'Quintas', 'Cocheras', 'Departamentos',
            ]),
        ];
    }
}
