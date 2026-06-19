<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @property-read PropertyImage $resource */
final class PropertyImageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'url' => Storage::disk('public')->url($this->resource->path),
            'sort_order' => $this->resource->sort_order,
        ];
    }
}
