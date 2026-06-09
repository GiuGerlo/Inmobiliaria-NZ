<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Contract;
use App\Models\Owner;
use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contract>
 */
final class ContractFactory extends Factory
{
    protected $model = Contract::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-3 years', 'now');
        $end = (clone $start)->modify('+24 months');

        return [
            'ID_Dueno' => Owner::factory(),
            'ID_Inquilino' => Tenant::factory(),
            'ID_Propiedad' => Property::factory(),
            'F_Inicio' => $start->format('Y-m-d'),
            'F_Fin' => $end->format('Y-m-d'),
            'Saldo' => 0,
            'Certificacion' => $this->faker->randomElement(['Si', 'No']),
        ];
    }
}
