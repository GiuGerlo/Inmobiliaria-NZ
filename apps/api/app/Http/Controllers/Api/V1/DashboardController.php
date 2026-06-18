<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Receipt\StoreReceiptRequest;
use App\Http\Resources\DashboardResource;
use App\Support\DashboardData;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class DashboardController extends Controller
{
    /**
     * Datos del dashboard de inicio: totales, recibos pendientes del mes y contratos por vencer.
     * Acepta `month`/`year` opcionales para mirar otro período (lo usa el panel de Recibos).
     */
    public function __invoke(Request $request): DashboardResource
    {
        $validated = $request->validate([
            'month' => ['nullable', Rule::in(StoreReceiptRequest::MONTHS)],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $data = isset($validated['month'], $validated['year'])
            ? new DashboardData($validated['month'], (int) $validated['year'])
            : DashboardData::now();

        return new DashboardResource($data);
    }
}
