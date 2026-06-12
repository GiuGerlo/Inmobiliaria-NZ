<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreOwnerRequest;
use App\Http\Requests\Owner\UpdateOwnerRequest;
use App\Http\Resources\OwnerResource;
use App\Models\Owner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class OwnerController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'name' => 'NYA_Dueno',
        'phone' => 'Tel_Dueno',
        'email' => 'Email_Dueno',
        'city_code' => 'CodP',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $owners = QueryBuilder::for(Owner::class)
            ->allowedFilters(
                AllowedFilter::exact('city_code', 'CodP'),
            )
            ->allowedSorts(
                AllowedSort::field('name', 'NYA_Dueno'),
                AllowedSort::field('email', 'Email_Dueno'),
            )
            ->defaultSort(AllowedSort::field('name', 'NYA_Dueno'))
            ->allowedIncludes('city')
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('NYA_Dueno', 'like', "%{$q}%")
                        ->orWhere('Email_Dueno', 'like', "%{$q}%");
                });
            })
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return OwnerResource::collection($owners);
    }

    public function store(StoreOwnerRequest $request): JsonResponse
    {
        $owner = Owner::create($this->mapFields($request->validated()));

        return (new OwnerResource($owner))->response()->setStatusCode(201);
    }

    public function show(Owner $owner): OwnerResource
    {
        return new OwnerResource($owner->load('city'));
    }

    public function update(UpdateOwnerRequest $request, Owner $owner): OwnerResource
    {
        $owner->fill($this->mapFields($request->validated()))->save();

        return new OwnerResource($owner);
    }

    public function destroy(Owner $owner): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $owner,
            'No se puede eliminar el dueño: tiene contratos asociados.',
        );
    }
}
