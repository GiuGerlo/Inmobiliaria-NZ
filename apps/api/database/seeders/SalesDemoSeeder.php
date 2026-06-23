<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Database\Seeder;

/**
 * Datos demo del dominio ventas (propiedades en venta). Solo local — los datos
 * reales se importan con `ventas:import`. Idempotente (firstOrCreate por nombre/título).
 * Las fotos NO se siembran (requieren archivos reales en storage); las propiedades
 * quedan sin imagen hasta cargarlas desde el admin o importar el dump.
 */
final class SalesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $types = collect(['Casas', 'Departamentos', 'Terrenos', 'Locales', 'Quintas', 'Cocheras'])
            ->mapWithKeys(fn (string $name): array => [$name => PropertyType::query()->firstOrCreate(['name' => $name])->id]);

        $properties = [
            [
                'title' => 'Casa 3 dormitorios con quincho', 'type' => 'Casas', 'locality' => 'Guatimozín',
                'location' => 'Bv. San Martín 450', 'size' => '220 m²', 'services' => 'Luz, agua, gas natural, cloacas',
                'features' => '3 dormitorios, 2 baños, cochera doble, patio con quincho y parrilla.', 'is_sold' => false,
            ],
            [
                'title' => 'Departamento 1 dormitorio a estrenar', 'type' => 'Departamentos', 'locality' => 'Arias',
                'location' => 'Belgrano 1230, 1º piso', 'size' => '52 m²', 'services' => 'Luz, agua, gas natural',
                'features' => '1 dormitorio, cocina integrada, balcón. Ideal inversión.', 'is_sold' => false,
            ],
            [
                'title' => 'Terreno en esquina 12x30', 'type' => 'Terrenos', 'locality' => 'Inriville',
                'location' => 'Esq. Sarmiento y Rivadavia', 'size' => '360 m²', 'services' => 'Luz y agua en frente',
                'features' => 'Lote en esquina, apto dúplex, todos los servicios disponibles.', 'is_sold' => false,
            ],
            [
                'title' => 'Local comercial sobre avenida', 'type' => 'Locales', 'locality' => 'Corral de Bustos',
                'location' => 'Av. Italia 875', 'size' => '95 m²', 'services' => 'Luz trifásica, agua, baño',
                'features' => 'Salón amplio, vidriera a la calle, baño y depósito. Gran ubicación.', 'is_sold' => false,
            ],
            [
                'title' => 'Quinta con pileta y arboleda', 'type' => 'Quintas', 'locality' => 'Camilo Aldao',
                'location' => 'Camino a la laguna km 2', 'size' => '2.500 m²', 'services' => 'Luz, perforación de agua',
                'features' => 'Casa principal, pileta, quincho, parque parquizado con árboles añosos.', 'is_sold' => false,
            ],
            [
                'title' => 'Cochera cubierta céntrica', 'type' => 'Cocheras', 'locality' => 'Guatimozín',
                'location' => 'Sarmiento 320', 'size' => '15 m²', 'services' => 'Luz',
                'features' => 'Cochera cubierta para un auto, portón automático, en pleno centro.', 'is_sold' => false,
            ],
            [
                'title' => 'Casa 2 dormitorios reciclada', 'type' => 'Casas', 'locality' => 'Los Surgentes',
                'location' => 'Mitre 640', 'size' => '140 m²', 'services' => 'Luz, agua, gas natural',
                'features' => '2 dormitorios, living comedor, patio. Totalmente reciclada a nuevo.', 'is_sold' => true,
            ],
            [
                'title' => 'Terreno en barrio residencial', 'type' => 'Terrenos', 'locality' => 'Arias',
                'location' => 'Los Aromos 145', 'size' => '300 m²', 'services' => 'Todos los servicios',
                'features' => 'Lote nivelado en barrio tranquilo, listo para construir.', 'is_sold' => true,
            ],
        ];

        foreach ($properties as $i => $p) {
            SaleProperty::query()->firstOrCreate(
                ['title' => $p['title']],
                [
                    'property_type_id' => $types[$p['type']],
                    'locality' => $p['locality'],
                    'location' => $p['location'],
                    'size' => $p['size'],
                    'services' => $p['services'],
                    'features' => $p['features'],
                    'is_sold' => $p['is_sold'],
                    'sort_order' => $i,
                ],
            );
        }
    }
}
