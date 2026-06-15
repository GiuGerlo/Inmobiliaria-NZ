<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentMethod\StorePaymentMethodRequest;
use App\Http\Requests\PaymentMethod\UpdatePaymentMethodRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class PaymentMethodController extends Controller
{
    use HandlesRestrictedDelete;
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'description' => 'Desc_FP',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $paymentMethods = QueryBuilder::for(PaymentMethod::class)
            ->allowedSorts(
                AllowedSort::field('id', 'ID_FP'),
                AllowedSort::field('description', 'Desc_FP'),
            )
            ->defaultSort(AllowedSort::field('-id', 'ID_FP'))
            ->when($request->filled('q'), function ($query) use ($request) {
                $query->where('Desc_FP', 'like', '%'.$request->string('q')->value().'%');
            })
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return PaymentMethodResource::collection($paymentMethods);
    }

    public function store(StorePaymentMethodRequest $request): JsonResponse
    {
        $paymentMethod = PaymentMethod::create($this->mapFields($request->validated()));

        return (new PaymentMethodResource($paymentMethod))->response()->setStatusCode(201);
    }

    public function show(PaymentMethod $paymentMethod): PaymentMethodResource
    {
        return new PaymentMethodResource($paymentMethod);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): PaymentMethodResource
    {
        $paymentMethod->fill($this->mapFields($request->validated()))->save();

        return new PaymentMethodResource($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $paymentMethod,
            'No se puede eliminar la forma de pago: tiene recibos asociados.',
        );
    }
}
