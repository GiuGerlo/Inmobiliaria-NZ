<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property-read Property $resource
 */
final class PropertyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->ID_Propiedad,
            'address' => $this->resource->Dir_Propiedad,
            'city_code' => $this->resource->CodP,
            'type' => $this->resource->Tipo_Propiedad,
            'services' => $this->resource->Serv_Propiedad,
            'price' => (int) $this->resource->Precio_Propiedad,
            'features' => $this->resource->Caract_Propiedad,
            'photo_url' => $this->resource->foto_path !== null
                ? Storage::disk('public')->url($this->resource->foto_path)
                : null,
            'city' => new CityResource($this->whenLoaded('city')),
        ];
    }
}
