<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Support\DashboardData;

final class DashboardController extends Controller
{
    /** Datos del dashboard de inicio: totales, recibos pendientes del mes y contratos por vencer. */
    public function __invoke(): DashboardResource
    {
        return new DashboardResource(DashboardData::now());
    }
}
