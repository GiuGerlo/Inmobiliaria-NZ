<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
final class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'Dir_Propiedad' => $this->faker->streetAddress(),
            'CodP' => City::factory(),
            'Tipo_Propiedad' => $this->faker->randomElement(['Casa', 'Departamento', 'Local', 'Galpón']),
            'Serv_Propiedad' => $this->faker->randomElement([
                'Agua, Luz', 'Agua, Luz, Gas', 'Luz', 'Agua, Luz, Gas, Internet',
            ]),
            'Precio_Propiedad' => $this->faker->numberBetween(50_000, 500_000),
            'Caract_Propiedad' => $this->faker->sentence(6),
            'Foto_Propiedad' => null,
            'Foto_Propiedad_GXI' => null,
        ];
    }
}
