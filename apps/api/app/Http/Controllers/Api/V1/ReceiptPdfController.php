<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Support\ReceiptPdf;
use Spatie\LaravelPdf\PdfBuilder;

final class ReceiptPdfController extends Controller
{
    /** Recibo individual (para el inquilino). */
    public function receipt(Receipt $receipt): PdfBuilder
    {
        return ReceiptPdf::receipt($receipt)
            ->inline(ReceiptPdf::filename('recibo', $receipt));
    }

    /** Rendición de cuentas (para el dueño). */
    public function settlement(Receipt $receipt): PdfBuilder
    {
        return ReceiptPdf::settlement($receipt)
            ->inline(ReceiptPdf::filename('rendicion', $receipt));
    }
}
