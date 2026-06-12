<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\City\StoreCityRequest;
use App\Http\Requests\City\UpdateCityRequest;
use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class CityController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'code' => 'CodP',
        'name' => 'Nombre_Ciudad',
        'province' => 'Provincia',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $cities = QueryBuilder::for(City::class)
            ->allowedFilters(
                AllowedFilter::exact('province', 'Provincia'),
            )
            ->allowedSorts(
                AllowedSort::field('code', 'CodP'),
                AllowedSort::field('name', 'Nombre_Ciudad'),
                AllowedSort::field('province', 'Provincia'),
            )
            ->defaultSort(AllowedSort::field('name', 'Nombre_Ciudad'))
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('Nombre_Ciudad', 'like', "%{$q}%")
                        ->orWhere('Provincia', 'like', "%{$q}%");
                });
            })
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return CityResource::collection($cities);
    }

    public function store(StoreCityRequest $request): JsonResponse
    {
        $city = City::create($this->mapFields($request->validated()));

        return (new CityResource($city))->response()->setStatusCode(201);
    }

    public function show(City $city): CityResource
    {
        return new CityResource($city);
    }

    public function update(UpdateCityRequest $request, City $city): CityResource
    {
        $city->fill($this->mapFields($request->validated()))->save();

        return new CityResource($city);
    }

    public function destroy(City $city): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $city,
            'No se puede eliminar la ciudad: tiene dueños, inquilinos o propiedades asociados.',
        );
    }
}
