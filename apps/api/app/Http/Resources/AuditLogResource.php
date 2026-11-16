<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read AuditLog $resource
 */
final class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'event' => $this->resource->event,
            'user_id' => $this->resource->user_id,
            'user_name' => $this->resource->user?->Nombre_User,
            'auditable_type' => $this->resource->auditable_type,
            'auditable_id' => $this->resource->auditable_id,
            'old_values' => $this->resource->old_values,
            'new_values' => $this->resource->new_values,
            'ip' => $this->resource->ip,
            'user_agent' => $this->resource->user_agent,
        ];
    }
}
