<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\Owner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Owner>
 */
final class OwnerFactory extends Factory
{
    protected $model = Owner::class;

    public function definition(): array
    {
        return [
            'CodP' => City::factory(),
            'NYA_Dueno' => $this->faker->name(),
            'Tel_Dueno' => $this->faker->numerify('34########'),
            'Email_Dueno' => $this->faker->safeEmail(),
        ];
    }
}
