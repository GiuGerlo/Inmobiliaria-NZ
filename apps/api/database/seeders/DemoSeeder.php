<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\City;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\Receipt;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

/**
 * Dataset demo con forma real pero cero PII. Solo para entorno local.
 */
final class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $cities = City::factory()->count(5)->create();

        // Formas de pago fijas (las 3 del sistema real)
        $paymentMethods = collect(['Efectivo', 'Transferencia', 'Cheque'])
            ->map(fn (string $desc) => PaymentMethod::query()->firstOrCreate(['Desc_FP' => $desc]));

        $owners = Owner::factory()->count(10)
            ->state(fn () => ['CodP' => $cities->random()->CodP])
            ->create();

        $tenants = Tenant::factory()->count(15)
            ->state(fn () => ['CodP' => $cities->random()->CodP])
            ->create();

        $properties = Property::factory()->count(15)
            ->state(fn () => ['CodP' => $cities->random()->CodP])
            ->create();

        $contracts = Contract::factory()->count(12)
            ->state(fn () => [
                'ID_Dueno' => $owners->random()->ID_Dueno,
                'ID_Inquilino' => $tenants->random()->ID_Inquilino,
                'ID_Propiedad' => $properties->random()->ID_Propiedad,
            ])
            ->create();

        Receipt::factory()->count(30)
            ->state(fn () => [
                'ID_Contrato' => $contracts->random()->ID_Contrato,
                'ID_FP' => $paymentMethods->random()->ID_FP,
            ])
            ->create();
    }
}
