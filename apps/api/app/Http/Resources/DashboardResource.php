<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Contract;
use App\Support\DashboardData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read DashboardData $resource
 */
final class DashboardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'totals' => $this->resource->totals(),
            'pending_receipts' => ContractResource::collection($this->resource->pendingReceipts()),
            'expiring_contracts' => $this->resource->expiringContracts()
                ->map(fn (Contract $contract): array => [
                    'days_left' => (int) now()->startOfDay()->diffInDays($contract->F_Fin, false),
                    'contract' => new ContractResource($contract),
                ])
                ->values(),
            'latest_receipts' => ReceiptResource::collection($this->resource->latestReceipts()),
            'contracts_with_balance' => ContractResource::collection(
                $this->resource->contractsWithBalance(),
            ),
        ];
    }
}
