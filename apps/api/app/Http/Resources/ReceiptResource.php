<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Receipt $resource
 */
final class ReceiptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'number' => $this->resource->Nro_Recibo,
            'contract_id' => $this->resource->ID_Contrato,
            'payment_method_id' => $this->resource->ID_FP,
            'paid_at' => $this->resource->F_Pago?->toDateString(),
            'property_amount' => (int) $this->resource->Pago_Propiedad,
            'municipal_amount' => (int) $this->resource->Pago_Municipal,
            'water_amount' => (int) $this->resource->Pago_Agua,
            'electricity_amount' => (int) $this->resource->Pago_Electricidad,
            'gas_amount' => (int) $this->resource->Pago_Gas,
            'repairs_amount' => (int) $this->resource->Arreglos,
            'funeral_amount' => (int) $this->resource->Sepelio,
            'fees_amount' => (int) $this->resource->Honorarios,
            'month' => $this->resource->Mes_Rend,
            'year' => $this->resource->Ano_Rend,
            'comments' => $this->resource->Comentarios,
            'contract' => new ContractResource($this->whenLoaded('contract')),
            'payment_method' => new PaymentMethodResource($this->whenLoaded('paymentMethod')),
        ];
    }
}
