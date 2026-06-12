<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Contract $resource
 */
final class ContractResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->ID_Contrato,
            'owner_id' => $this->resource->ID_Dueno,
            'tenant_id' => $this->resource->ID_Inquilino,
            'property_id' => $this->resource->ID_Propiedad,
            'start_date' => $this->resource->F_Inicio?->toDateString(),
            'end_date' => $this->resource->F_Fin?->toDateString(),
            'balance' => (int) $this->resource->Saldo,
            'certification' => $this->resource->Certificacion,
            'owner' => new OwnerResource($this->whenLoaded('owner')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'property' => new PropertyResource($this->whenLoaded('property')),
        ];
    }
}
