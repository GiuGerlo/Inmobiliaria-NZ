<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Contract;
use App\Models\PaymentMethod;
use App\Models\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Receipt>
 */
final class ReceiptFactory extends Factory
{
    protected $model = Receipt::class;

    private const MONTHS = [
        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
        5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
        9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
    ];

    public function definition(): array
    {
        $paymentDate = $this->faker->dateTimeBetween('-18 months', 'now');
        $month = (int) $paymentDate->format('n');

        return [
            'ID_FP' => PaymentMethod::factory(),
            'ID_Contrato' => Contract::factory(),
            'F_Pago' => $paymentDate->format('Y-m-d'),
            'Pago_Propiedad' => $this->faker->numberBetween(50_000, 500_000),
            'Pago_Municipal' => $this->faker->randomElement([0, 0, 1_900, 2_800, 6_000]),
            'Pago_Agua' => $this->faker->randomElement([0, 0, 4_000]),
            'Honorarios' => $this->faker->randomElement([0, 0, 0, 95_000]),
            'Mes_Rend' => self::MONTHS[$month],
            'Ano_Rend' => (int) $paymentDate->format('Y'),
            'Pago_Electricidad' => 0,
            'Pago_Gas' => $this->faker->randomElement([0, 0, 6_690]),
            'Arreglos' => 0,
            'Sepelio' => 0,
            'Comentarios' => $this->faker->optional(0.2)->sentence(8),
        ];
    }
}
