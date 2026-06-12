<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyPhotoRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class PropertyPhotoController extends Controller
{
    private const WEBP_QUALITY = 82;

    /**
     * Sube/reemplaza la foto de la propiedad: siempre se convierte a WebP
     * y se guarda en el disk public (propiedades/{id}/foto.webp).
     */
    public function store(StorePropertyPhotoRequest $request, Property $property): PropertyResource
    {
        $webp = ImageManager::usingDriver(GdDriver::class)
            ->decodePath($request->file('photo')->getRealPath())
            ->encodeUsingFormat(Format::WEBP, quality: self::WEBP_QUALITY);

        $path = "propiedades/{$property->ID_Propiedad}/foto.webp";
        Storage::disk('public')->put($path, (string) $webp);

        $property->foto_path = $path;
        $property->save();

        return new PropertyResource($property);
    }

    public function destroy(Property $property): Response
    {
        Storage::disk('public')->deleteDirectory("propiedades/{$property->ID_Propiedad}");

        $property->foto_path = null;
        $property->save();

        return response()->noContent();
    }
}
