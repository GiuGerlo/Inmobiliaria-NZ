<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\Requests\Receipt\StoreReceiptRequest;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\Property;
use App\Models\Receipt;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

/**
 * Datos del dashboard de inicio. Aislado del controller para testear sin HTTP
 * (mismo patrón que MonthlyPaymentsReport). Tres datasets, sin métricas de ingresos:
 *  - totals: contadores del sistema.
 *  - expiringContracts: contratos activos que vencen dentro de N días.
 *  - pendingReceipts: contratos activos sin recibo del mes/año actual.
 */
final class DashboardData
{
    public function __construct(
        public readonly string $month,
        public readonly int $year,
    ) {}

    public static function now(): self
    {
        return new self(StoreReceiptRequest::MONTHS[now()->month - 1], (int) now()->year);
    }

    /** @return array<string, int> */
    public function totals(): array
    {
        return [
            'properties' => Property::count(),
            'owners' => Owner::count(),
            'tenants' => Tenant::count(),
            'active_contracts' => Contract::query()->active()->count(),
            'receipts_this_month' => Receipt::query()
                ->where('Mes_Rend', $this->month)
                ->where('Ano_Rend', $this->year)
                ->count(),
        ];
    }

    /**
     * Contratos activos cuyo F_Fin cae entre hoy y hoy+$days, más cercano primero.
     *
     * @return Collection<int, Contract>
     */
    public function expiringContracts(int $days = 90): Collection
    {
        return Contract::query()
            ->active()
            ->whereNotNull('F_Fin')
            ->whereBetween('F_Fin', [now()->toDateString(), now()->addDays($days)->toDateString()])
            ->with(['owner', 'tenant', 'property'])
            ->orderBy('F_Fin')
            ->get();
    }

    /**
     * Contratos activos sin ningún recibo para el mes/año actual.
     *
     * @return Collection<int, Contract>
     */
    public function pendingReceipts(): Collection
    {
        return Contract::query()
            ->active()
            ->with(['owner', 'tenant', 'property'])
            ->whereDoesntHave('receipts', function ($query): void {
                $query->where('Mes_Rend', $this->month)->where('Ano_Rend', $this->year);
            })
            ->get();
    }

    /**
     * Últimos recibos emitidos (por número, el más nuevo primero).
     *
     * @return Collection<int, Receipt>
     */
    public function latestReceipts(int $limit = 5): Collection
    {
        return Receipt::query()
            ->with(['contract.owner', 'contract.tenant', 'contract.property', 'paymentMethod'])
            ->orderByDesc('Nro_Recibo')
            ->limit($limit)
            ->get();
    }

    /**
     * Contratos con saldo pendiente (deuda), el mayor primero.
     *
     * @return Collection<int, Contract>
     */
    public function contractsWithBalance(): Collection
    {
        return Contract::query()
            ->where('Saldo', '>', 0)
            ->with(['owner', 'tenant', 'property'])
            ->orderByDesc('Saldo')
            ->get();
    }
}
