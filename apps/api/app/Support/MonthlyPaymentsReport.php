<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Contract;
use App\Models\Receipt;
use Illuminate\Database\Eloquent\Collection;

/**
 * Datos del listado mensual de pagos para un mes/año:
 *  - pagados: recibos rendidos ese mes/año.
 *  - no pagados: contratos sin ningún recibo para ese mes/año.
 *
 * Aislado del controller para poder testear el filtrado sin renderizar el PDF.
 * Todas las queries son parametrizadas (corrige la SQL injection del legacy `pagos.php`).
 */
final class MonthlyPaymentsReport
{
    public function __construct(
        public readonly string $month,
        public readonly int $year,
    ) {}

    public static function for(string $month, int $year): self
    {
        return new self($month, $year);
    }

    /** @return Collection<int, Receipt> */
    public function paid(): Collection
    {
        return Receipt::query()
            ->with(['contract.tenant', 'contract.owner'])
            ->where('Mes_Rend', $this->month)
            ->where('Ano_Rend', $this->year)
            ->get();
    }

    /** @return Collection<int, Contract> */
    public function unpaid(): Collection
    {
        return Contract::query()
            ->with(['tenant', 'owner', 'property'])
            ->whereDoesntHave('receipts', function ($query): void {
                $query->where('Mes_Rend', $this->month)->where('Ano_Rend', $this->year);
            })
            ->get();
    }
}
