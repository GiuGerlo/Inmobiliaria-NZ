<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\MonthlyPaymentsRequest;
use App\Support\MonthlyPaymentsReport;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;

final class MonthlyPaymentsReportController extends Controller
{
    /** Listado mensual de pagos: recibos del mes/año (pagados) + contratos sin recibo (no pagados). */
    public function __invoke(MonthlyPaymentsRequest $request): PdfBuilder
    {
        $report = MonthlyPaymentsReport::for($request->month(), $request->year());

        return Pdf::view('pdf.monthly-payments', [
            'month' => $report->month,
            'year' => $report->year,
            'paid' => $report->paid(),
            'unpaid' => $report->unpaid(),
        ])
            ->format('a4')
            ->landscape()
            ->inline("pagos-{$report->month}-{$report->year}.pdf");
    }
}
