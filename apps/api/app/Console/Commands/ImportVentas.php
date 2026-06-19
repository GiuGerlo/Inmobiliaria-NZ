<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\PropertyImage;
use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class ImportVentas extends Command
{
    protected $signature = 'ventas:import {--connection=nzestudio}';

    protected $description = 'Migra propiedades en venta, categorías e imágenes del legacy nz-estudio.';

    public function handle(): int
    {
        $conn = (string) $this->option('connection');
        $uploads = rtrim((string) env('NZ_LEGACY_UPLOADS_PATH', ''), '/');

        $this->info('Limpiando tablas de ventas…');
        Schema::disableForeignKeyConstraints();
        PropertyImage::truncate();
        SaleProperty::truncate();
        PropertyType::truncate();
        Schema::enableForeignKeyConstraints();
        Storage::disk('public')->deleteDirectory('sale-properties');

        // 1) Categorías — mapeo legacy id -> nuevo id
        $typeMap = [];
        foreach (DB::connection($conn)->table('tipos_propiedad')->get() as $row) {
            $type = PropertyType::create(['name' => (string) ($row->nombre_categoria ?? 'Sin categoría')]);
            $typeMap[(int) $row->id] = $type->id;
        }
        $this->info(count($typeMap).' categorías.');

        // 2) Propiedades — mapeo legacy id -> nuevo id
        $propMap = [];
        foreach (DB::connection($conn)->table('propiedades')->get() as $row) {
            $property = SaleProperty::create([
                'property_type_id' => $typeMap[(int) $row->categoria] ?? null,
                'title' => $row->titulo,
                'locality' => $row->localidad,
                'location' => $row->ubicacion,
                'size' => $row->tamanio,
                'services' => $row->servicios,
                'features' => $row->caracteristicas,
                'map_embed' => $row->mapa,
                'sort_order' => (int) ($row->orden ?? 0),
                'is_sold' => (bool) ($row->vendida ?? false),
                'latitude' => $row->latitud,
                'longitude' => $row->longitud,
            ]);
            $propMap[(int) $row->id] = $property->id;
        }
        $this->info(count($propMap).' propiedades.');

        // 3) Imágenes — copia/convierte el WebP de uploads a storage
        $images = 0;
        $missing = 0;
        foreach (DB::connection($conn)->table('imagenes_propiedades')->orderBy('orden')->get() as $row) {
            $newId = $propMap[(int) $row->id_propiedad] ?? null;
            if ($newId === null) {
                continue;
            }

            $source = $uploads.'/'.ltrim((string) $row->ruta_imagen, '/');
            if (! is_file($source)) {
                // ponytail: techo conocido — si la ruta legacy no resuelve, probamos
                // por basename; si tampoco existe se avisa y sigue (ajustar NZ_LEGACY_UPLOADS_PATH).
                $source = $uploads.'/'.basename((string) $row->ruta_imagen);
            }
            if (! is_file($source)) {
                $missing++;
                $this->warn("Imagen faltante: {$row->ruta_imagen}");

                continue;
            }

            $webp = ImageManager::usingDriver(GdDriver::class)
                ->decodePath($source)
                ->encodeUsingFormat(Format::WEBP, quality: 82);

            $path = "sale-properties/{$newId}/".Str::uuid()->toString().'.webp';
            Storage::disk('public')->put($path, (string) $webp);

            PropertyImage::create([
                'sale_property_id' => $newId,
                'path' => $path,
                'sort_order' => (int) ($row->orden ?? 0),
            ]);
            $images++;
        }
        $this->info("{$images} imágenes ({$missing} faltantes).");

        return self::SUCCESS;
    }
}
