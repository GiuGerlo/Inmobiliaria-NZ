<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
final class CityFactory extends Factory
{
    protected $model = City::class;

    public function definition(): array
    {
        return [
            'CodP' => (string) $this->faker->unique()->numberBetween(1000, 9999),
            'Nombre_Ciudad' => $this->faker->city(),
            'Provincia' => $this->faker->randomElement([
                'Córdoba', 'Santa Fe', 'Buenos Aires', 'Entre Ríos', 'La Pampa',
            ]),
        ];
    }
}
