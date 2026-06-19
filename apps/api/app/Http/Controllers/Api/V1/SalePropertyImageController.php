<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleProperty\ReorderRequest;
use App\Http\Requests\SaleProperty\StorePropertyImagesRequest;
use App\Http\Resources\PropertyImageResource;
use App\Models\PropertyImage;
use App\Models\SaleProperty;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class SalePropertyImageController extends Controller
{
    private const WEBP_QUALITY = 82;

    public function store(StorePropertyImagesRequest $request, SaleProperty $saleProperty): AnonymousResourceCollection
    {
        $next = (int) $saleProperty->images()->max('sort_order') + 1;
        $created = collect();

        foreach ($request->file('images') as $file) {
            $webp = ImageManager::usingDriver(GdDriver::class)
                ->decodePath($file->getRealPath())
                ->encodeUsingFormat(Format::WEBP, quality: self::WEBP_QUALITY);

            $path = "sale-properties/{$saleProperty->id}/".Str::uuid()->toString().'.webp';
            Storage::disk('public')->put($path, (string) $webp);

            $created->push($saleProperty->images()->create([
                'path' => $path,
                'sort_order' => $next++,
            ]));
        }

        return PropertyImageResource::collection($created);
    }

    public function destroy(PropertyImage $propertyImage): Response
    {
        Storage::disk('public')->delete($propertyImage->path);
        $propertyImage->delete();

        return response()->noContent();
    }

    public function reorder(ReorderRequest $request): Response
    {
        foreach ($request->validated()['ids'] as $position => $id) {
            PropertyImage::where('id', $id)->update(['sort_order' => $position]);
        }

        return response()->noContent();
    }
}
