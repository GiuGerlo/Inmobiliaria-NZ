<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contract\StoreContractRequest;
use App\Http\Requests\Contract\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class ContractController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'owner_id' => 'ID_Dueno',
        'tenant_id' => 'ID_Inquilino',
        'property_id' => 'ID_Propiedad',
        'start_date' => 'F_Inicio',
        'end_date' => 'F_Fin',
        'balance' => 'Saldo',
        'certification' => 'Certificacion',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $contracts = QueryBuilder::for(Contract::class)
            ->allowedFilters(
                AllowedFilter::exact('owner_id', 'ID_Dueno'),
                AllowedFilter::exact('tenant_id', 'ID_Inquilino'),
                AllowedFilter::exact('property_id', 'ID_Propiedad'),
                AllowedFilter::exact('certification', 'Certificacion'),
                // Rango por fecha de inicio del contrato.
                AllowedFilter::callback('start_from', function (Builder $query, $value): void {
                    $query->whereDate('F_Inicio', '>=', $value);
                }),
                AllowedFilter::callback('start_to', function (Builder $query, $value): void {
                    $query->whereDate('F_Inicio', '<=', $value);
                }),
            )
            ->allowedSorts(
                AllowedSort::field('id', 'ID_Contrato'),
                AllowedSort::field('start_date', 'F_Inicio'),
                AllowedSort::field('end_date', 'F_Fin'),
            )
            ->defaultSort(AllowedSort::field('-id', 'ID_Contrato'))
            ->allowedIncludes('owner', 'tenant', 'property')
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return ContractResource::collection($contracts);
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $contract = Contract::create($this->mapFields($request->validated()));

        return (new ContractResource($contract))->response()->setStatusCode(201);
    }

    public function show(Contract $contract): ContractResource
    {
        return new ContractResource($contract->load(['owner', 'tenant', 'property']));
    }

    public function update(UpdateContractRequest $request, Contract $contract): ContractResource
    {
        $contract->fill($this->mapFields($request->validated()))->save();

        return new ContractResource($contract);
    }

    public function destroy(Contract $contract): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $contract,
            'No se puede eliminar el contrato: tiene recibos asociados.',
        );
    }
}
