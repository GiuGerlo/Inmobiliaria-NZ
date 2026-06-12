<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreTenantRequest;
use App\Http\Requests\Tenant\UpdateTenantRequest;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class TenantController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'name' => 'NYA_Inquilino',
        'phone' => 'Tel_Inquilino',
        'email' => 'Email_Inquilino',
        'city_code' => 'CodP',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $tenants = QueryBuilder::for(Tenant::class)
            ->allowedFilters(
                AllowedFilter::exact('city_code', 'CodP'),
            )
            ->allowedSorts(
                AllowedSort::field('name', 'NYA_Inquilino'),
                AllowedSort::field('email', 'Email_Inquilino'),
            )
            ->defaultSort(AllowedSort::field('name', 'NYA_Inquilino'))
            ->allowedIncludes('city')
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('NYA_Inquilino', 'like', "%{$q}%")
                        ->orWhere('Email_Inquilino', 'like', "%{$q}%");
                });
            })
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return TenantResource::collection($tenants);
    }

    public function store(StoreTenantRequest $request): JsonResponse
    {
        $tenant = Tenant::create($this->mapFields($request->validated()));

        return (new TenantResource($tenant))->response()->setStatusCode(201);
    }

    public function show(Tenant $tenant): TenantResource
    {
        return new TenantResource($tenant->load('city'));
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): TenantResource
    {
        $tenant->fill($this->mapFields($request->validated()))->save();

        return new TenantResource($tenant);
    }

    public function destroy(Tenant $tenant): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $tenant,
            'No se puede eliminar el inquilino: tiene contratos asociados.',
        );
    }
}
