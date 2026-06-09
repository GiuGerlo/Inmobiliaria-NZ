<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
final class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        return [
            'CodP' => City::factory(),
            'NYA_Inquilino' => $this->faker->name(),
            'Tel_Inquilino' => $this->faker->numerify('34########'),
            'Email_Inquilino' => $this->faker->safeEmail(),
        ];
    }
}
