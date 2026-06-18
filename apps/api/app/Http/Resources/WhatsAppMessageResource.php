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
            'batch_id' => $this->resource->batch_id,
            'receipt_id' => $this->resource->receipt_id,
            'contract_id' => $this->resource->contract_id,
            'type' => $this->resource->type,
            'recipient_phone' => $this->resource->recipient_phone,
            'recipient_name' => $this->resource->recipient_name,
            'body' => $this->resource->body,
            'status' => $this->resource->status,
            'error' => $this->resource->error,
            'sent_at' => $this->resource->sent_at?->toIso8601String(),
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
