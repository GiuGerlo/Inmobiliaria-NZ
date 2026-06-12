<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Tenant $resource
 */
final class TenantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->ID_Inquilino,
            'name' => $this->resource->NYA_Inquilino,
            'phone' => $this->resource->Tel_Inquilino,
            'email' => $this->resource->Email_Inquilino,
            'city_code' => $this->resource->CodP,
            'city' => new CityResource($this->whenLoaded('city')),
        ];
    }
}
