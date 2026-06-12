<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Owner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Owner $resource
 */
final class OwnerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->ID_Dueno,
            'name' => $this->resource->NYA_Dueno,
            'phone' => $this->resource->Tel_Dueno,
            'email' => $this->resource->Email_Dueno,
            'city_code' => $this->resource->CodP,
            'city' => new CityResource($this->whenLoaded('city')),
        ];
    }
}
