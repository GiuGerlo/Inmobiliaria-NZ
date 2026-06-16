<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Support\NumberToWords;
use App\Support\ReceiptCalculator;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;

final class ReceiptPdfController extends Controller
{
    private const RELATIONS = [
        'contract.tenant',
        'contract.owner',
        'contract.property',
        'paymentMethod',
    ];

    /** Recibo individual (para el inquilino). */
    public function receipt(Receipt $receipt): PdfBuilder
    {
        $receipt->load(self::RELATIONS);
        $calc = ReceiptCalculator::for($receipt);

        return Pdf::view('pdf.receipt', [
            'receipt' => $receipt,
            'calc' => $calc,
            'totalInWords' => NumberToWords::spell($calc->receiptTotal()),
        ])
            ->format('a4')
            ->inline("recibo-{$receipt->Nro_Recibo}.pdf");
    }

    /** Rendición de cuentas (para el dueño). */
    public function settlement(Receipt $receipt): PdfBuilder
    {
        $receipt->load(self::RELATIONS);

        return Pdf::view('pdf.settlement', [
            'receipt' => $receipt,
            'calc' => ReceiptCalculator::for($receipt),
        ])
            ->format('a4')
            ->inline("rendicion-{$receipt->Nro_Recibo}.pdf");
    }
}
