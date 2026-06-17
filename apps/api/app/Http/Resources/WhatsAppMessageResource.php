<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WhatsAppMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read WhatsAppMessage $resource
 */
final class WhatsAppMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'receipt_id' => $this->resource->receipt_id,
            'type' => $this->resource->type,
            'recipient_phone' => $this->resource->recipient_phone,
            'status' => $this->resource->status,
            'error' => $this->resource->error,
            'sent_at' => $this->resource->sent_at?->toIso8601String(),
        ];
    }
}
