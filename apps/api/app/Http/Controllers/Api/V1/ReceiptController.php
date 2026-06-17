<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\MapsLegacyFields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Receipt\StoreReceiptRequest;
use App\Http\Requests\Receipt\UpdateReceiptRequest;
use App\Http\Resources\ReceiptResource;
use App\Models\Receipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class ReceiptController extends Controller
{
    use MapsLegacyFields;

    private const FIELD_MAP = [
        'contract_id' => 'ID_Contrato',
        'payment_method_id' => 'ID_FP',
        'paid_at' => 'F_Pago',
        'property_amount' => 'Pago_Propiedad',
        'municipal_amount' => 'Pago_Municipal',
        'water_amount' => 'Pago_Agua',
        'electricity_amount' => 'Pago_Electricidad',
        'gas_amount' => 'Pago_Gas',
        'repairs_amount' => 'Arreglos',
        'funeral_amount' => 'Sepelio',
        'fees_amount' => 'Honorarios',
        'month' => 'Mes_Rend',
        'year' => 'Ano_Rend',
        'comments' => 'Comentarios',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $receipts = QueryBuilder::for(Receipt::class)
            ->allowedFilters(
                AllowedFilter::exact('contract_id', 'ID_Contrato'),
                AllowedFilter::exact('payment_method_id', 'ID_FP'),
                AllowedFilter::exact('month', 'Mes_Rend'),
                AllowedFilter::exact('year', 'Ano_Rend'),
            )
            ->allowedSorts(
                AllowedSort::field('number', 'Nro_Recibo'),
                AllowedSort::field('paid_at', 'F_Pago'),
                AllowedSort::field('year', 'Ano_Rend'),
            )
            ->defaultSort(AllowedSort::field('-number', 'Nro_Recibo'))
            ->allowedIncludes('contract', 'paymentMethod', 'contract.owner', 'contract.tenant', 'contract.property')
            ->withMax(['whatsappMessages as whatsapp_recibo_sent_at' => fn ($q) => $q->where('type', 'recibo')->where('status', 'sent')], 'sent_at')
            ->withMax(['whatsappMessages as whatsapp_rendicion_sent_at' => fn ($q) => $q->where('type', 'rendicion')->where('status', 'sent')], 'sent_at')
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return ReceiptResource::collection($receipts);
    }

    public function store(StoreReceiptRequest $request): JsonResponse
    {
        $receipt = Receipt::create($this->mapFields($request->validated()));

        return (new ReceiptResource($receipt))->response()->setStatusCode(201);
    }

    public function show(Receipt $receipt): ReceiptResource
    {
        return new ReceiptResource($receipt->load(['contract', 'paymentMethod']));
    }

    public function update(UpdateReceiptRequest $request, Receipt $receipt): ReceiptResource
    {
        $receipt->fill($this->mapFields($request->validated()))->save();

        return new ReceiptResource($receipt);
    }

    public function destroy(Receipt $receipt): Response
    {
        // El recibo es hoja: nada depende de él, borra directo.
        $receipt->delete();

        return response()->noContent();
    }
}
