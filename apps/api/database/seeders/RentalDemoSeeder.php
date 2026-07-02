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
 * Datos demo del dominio alquileres (ciudades, dueños, inquilinos, propiedades,
 * contratos, recibos). Cero PII, forma real. Idempotente (firstOrCreate por clave natural).
 *
 * A diferencia de DemoSeeder (que usa factories → Faker, dep de dev), este es 100%
 * estático, así corre en el server donde composer instala --no-dev. Correr con:
 *   php artisan db:seed --class=RentalDemoSeeder
 */
final class RentalDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Ciudades (CodP es la PK string).
        $cities = collect([
            ['CodP' => '2645', 'Nombre_Ciudad' => 'Guatimozín', 'Provincia' => 'Córdoba'],
            ['CodP' => '2624', 'Nombre_Ciudad' => 'Arias', 'Provincia' => 'Córdoba'],
            ['CodP' => '2657', 'Nombre_Ciudad' => 'Corral de Bustos', 'Provincia' => 'Córdoba'],
        ])->map(fn (array $c) => City::query()->firstOrCreate(['CodP' => $c['CodP']], $c));

        // Formas de pago fijas (las 3 del sistema real).
        $paymentMethods = collect(['Efectivo', 'Transferencia', 'Cheque'])
            ->map(fn (string $desc) => PaymentMethod::query()->firstOrCreate(['Desc_FP' => $desc]));

        // Dueños.
        $owners = collect([
            ['NYA_Dueno' => 'Carlos Ramírez', 'Tel_Dueno' => '3468512340', 'Email_Dueno' => 'cramirez@example.com', 'CodP' => '2645'],
            ['NYA_Dueno' => 'María Fernández', 'Tel_Dueno' => '3468598721', 'Email_Dueno' => 'mfernandez@example.com', 'CodP' => '2624'],
            ['NYA_Dueno' => 'Jorge Gómez', 'Tel_Dueno' => '3468544556', 'Email_Dueno' => 'jgomez@example.com', 'CodP' => '2657'],
            ['NYA_Dueno' => 'Ana López', 'Tel_Dueno' => '3468533210', 'Email_Dueno' => 'alopez@example.com', 'CodP' => '2645'],
        ])->map(fn (array $o) => Owner::query()->firstOrCreate(['Email_Dueno' => $o['Email_Dueno']], $o));

        // Inquilinos.
        $tenants = collect([
            ['NYA_Inquilino' => 'Pedro Sánchez', 'Tel_Inquilino' => '3468511122', 'Email_Inquilino' => 'psanchez@example.com', 'CodP' => '2645'],
            ['NYA_Inquilino' => 'Lucía Martínez', 'Tel_Inquilino' => '3468522233', 'Email_Inquilino' => 'lmartinez@example.com', 'CodP' => '2624'],
            ['NYA_Inquilino' => 'Diego Torres', 'Tel_Inquilino' => '3468533344', 'Email_Inquilino' => 'dtorres@example.com', 'CodP' => '2657'],
            ['NYA_Inquilino' => 'Sofía Ruiz', 'Tel_Inquilino' => '3468544455', 'Email_Inquilino' => 'sruiz@example.com', 'CodP' => '2645'],
        ])->map(fn (array $t) => Tenant::query()->firstOrCreate(['Email_Inquilino' => $t['Email_Inquilino']], $t));

        // Propiedades.
        $properties = collect([
            ['Dir_Propiedad' => 'Bv. San Martín 450', 'CodP' => '2645', 'Tipo_Propiedad' => 'Casa', 'Serv_Propiedad' => 'Agua, Luz, Gas', 'Precio_Propiedad' => 180000, 'Caract_Propiedad' => '3 dormitorios, 2 baños, patio con quincho.'],
            ['Dir_Propiedad' => 'Belgrano 1230', 'CodP' => '2624', 'Tipo_Propiedad' => 'Departamento', 'Serv_Propiedad' => 'Agua, Luz, Gas', 'Precio_Propiedad' => 120000, 'Caract_Propiedad' => '1 dormitorio, cocina integrada, balcón.'],
            ['Dir_Propiedad' => 'Av. Italia 875', 'CodP' => '2657', 'Tipo_Propiedad' => 'Local', 'Serv_Propiedad' => 'Luz, Agua', 'Precio_Propiedad' => 250000, 'Caract_Propiedad' => 'Salón amplio, vidriera, baño y depósito.'],
            ['Dir_Propiedad' => 'Sarmiento 320', 'CodP' => '2645', 'Tipo_Propiedad' => 'Casa', 'Serv_Propiedad' => 'Agua, Luz', 'Precio_Propiedad' => 150000, 'Caract_Propiedad' => '2 dormitorios, living comedor, patio.'],
            ['Dir_Propiedad' => 'Los Aromos 145', 'CodP' => '2624', 'Tipo_Propiedad' => 'Departamento', 'Serv_Propiedad' => 'Agua, Luz, Gas, Internet', 'Precio_Propiedad' => 135000, 'Caract_Propiedad' => 'Monoambiente a estrenar, muy luminoso.'],
        ])->map(fn (array $p) => Property::query()->firstOrCreate(['Dir_Propiedad' => $p['Dir_Propiedad']], $p));

        // Contratos: dueño[i] ↔ inquilino[i] ↔ propiedad[i].
        $contractDefs = [
            ['i' => 0, 'F_Inicio' => '2024-03-01', 'F_Fin' => '2026-03-01', 'Certificacion' => 'Si'],
            ['i' => 1, 'F_Inicio' => '2024-07-01', 'F_Fin' => '2026-07-01', 'Certificacion' => 'No'],
            ['i' => 2, 'F_Inicio' => '2023-11-01', 'F_Fin' => '2025-11-01', 'Certificacion' => 'Si'],
            ['i' => 3, 'F_Inicio' => '2025-01-01', 'F_Fin' => '2027-01-01', 'Certificacion' => 'No'],
        ];
        $contracts = collect($contractDefs)->map(function (array $c) use ($owners, $tenants, $properties): Contract {
            $i = $c['i'];

            return Contract::query()->firstOrCreate(
                ['ID_Propiedad' => $properties[$i]->ID_Propiedad, 'F_Inicio' => $c['F_Inicio']],
                [
                    'ID_Dueno' => $owners[$i]->ID_Dueno,
                    'ID_Inquilino' => $tenants[$i]->ID_Inquilino,
                    'F_Fin' => $c['F_Fin'],
                    'Saldo' => 0,
                    'Certificacion' => $c['Certificacion'],
                ],
            );
        });

        // Recibos: 3 meses por contrato.
        $months = [
            ['Mes_Rend' => 'Abril', 'Ano_Rend' => 2025, 'F_Pago' => '2025-04-05'],
            ['Mes_Rend' => 'Mayo', 'Ano_Rend' => 2025, 'F_Pago' => '2025-05-05'],
            ['Mes_Rend' => 'Junio', 'Ano_Rend' => 2025, 'F_Pago' => '2025-06-05'],
        ];
        foreach ($contracts as $idx => $contract) {
            $property = $properties[$idx];
            foreach ($months as $m) {
                Receipt::query()->firstOrCreate(
                    ['ID_Contrato' => $contract->ID_Contrato, 'Mes_Rend' => $m['Mes_Rend'], 'Ano_Rend' => $m['Ano_Rend']],
                    [
                        'ID_FP' => $paymentMethods[$idx % $paymentMethods->count()]->ID_FP,
                        'F_Pago' => $m['F_Pago'],
                        'Pago_Propiedad' => (int) $property->Precio_Propiedad,
                        'Pago_Municipal' => 2800,
                        'Pago_Agua' => 4000,
                        'Honorarios' => $m['Mes_Rend'] === 'Abril' ? 95000 : 0,
                        'Pago_Electricidad' => 0,
                        'Pago_Gas' => 6690,
                        'Arreglos' => 0,
                        'Sepelio' => 0,
                        'Comentarios' => null,
                    ],
                );
            }
        }
    }
}
