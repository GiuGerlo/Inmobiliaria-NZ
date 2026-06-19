<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SaleProperty;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read SaleProperty $resource */
final class SalePropertyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'property_type_id' => $this->resource->property_type_id,
            'title' => $this->resource->title,
            'locality' => $this->resource->locality,
            'location' => $this->resource->location,
            'size' => $this->resource->size,
            'services' => $this->resource->services,
            'features' => $this->resource->features,
            'map_embed' => $this->resource->map_embed,
            'sort_order' => $this->resource->sort_order,
            'is_sold' => $this->resource->is_sold,
            'latitude' => $this->resource->latitude,
            'longitude' => $this->resource->longitude,
            'type' => new PropertyTypeResource($this->whenLoaded('type')),
            'images' => PropertyImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
