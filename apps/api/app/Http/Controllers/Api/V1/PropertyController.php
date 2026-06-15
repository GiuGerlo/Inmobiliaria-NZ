<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class PropertyController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'address' => 'Dir_Propiedad',
        'city_code' => 'CodP',
        'type' => 'Tipo_Propiedad',
        'services' => 'Serv_Propiedad',
        'price' => 'Precio_Propiedad',
        'features' => 'Caract_Propiedad',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $properties = QueryBuilder::for(Property::class)
            ->allowedFilters(
                AllowedFilter::exact('city_code', 'CodP'),
                AllowedFilter::partial('type', 'Tipo_Propiedad'),
            )
            ->allowedSorts(
                AllowedSort::field('id', 'ID_Propiedad'),
                AllowedSort::field('address', 'Dir_Propiedad'),
                AllowedSort::field('price', 'Precio_Propiedad'),
                AllowedSort::field('type', 'Tipo_Propiedad'),
            )
            ->defaultSort(AllowedSort::field('-id', 'ID_Propiedad'))
            ->allowedIncludes('city')
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('Dir_Propiedad', 'like', "%{$q}%")
                        ->orWhere('Caract_Propiedad', 'like', "%{$q}%");
                });
            })
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return PropertyResource::collection($properties);
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = Property::create($this->mapFields($request->validated()));

        return (new PropertyResource($property))->response()->setStatusCode(201);
    }

    public function show(Property $property): PropertyResource
    {
        return new PropertyResource($property->load('city'));
    }

    public function update(UpdatePropertyRequest $request, Property $property): PropertyResource
    {
        $property->fill($this->mapFields($request->validated()))->save();

        return new PropertyResource($property);
    }

    public function destroy(Property $property): Response|JsonResponse
    {
        $response = $this->destroyOrConflict(
            $property,
            'No se puede eliminar la propiedad: tiene contratos asociados.',
        );

        if ($response->getStatusCode() === 204) {
            Storage::disk('public')->deleteDirectory("propiedades/{$property->ID_Propiedad}");
        }

        return $response;
    }
}
