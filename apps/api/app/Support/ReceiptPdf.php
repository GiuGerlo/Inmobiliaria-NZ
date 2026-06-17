<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Receipt;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;

/**
 * Construcción de los PDFs de un recibo (recibo individual para el inquilino y
 * rendición de cuentas para el dueño). Centraliza la lógica que consumen tanto el
 * controller HTTP (->inline) como el job de envío por WhatsApp (->save). El nombre
 * del archivo lo pone el consumidor con filename() (inline() resetea el nombre).
 */
final class ReceiptPdf
{
    private const RELATIONS = [
        'contract.tenant',
        'contract.owner',
        'contract.property',
        'paymentMethod',
    ];

    /** Recibo individual (para el inquilino). */
    public static function receipt(Receipt $receipt): PdfBuilder
    {
        $receipt->loadMissing(self::RELATIONS);
        $calc = ReceiptCalculator::for($receipt);

        return Pdf::view('pdf.receipt', [
            'receipt' => $receipt,
            'calc' => $calc,
            'totalInWords' => NumberToWords::spell($calc->receiptTotal()),
        ])->format('a4');
    }

    /** Rendición de cuentas (para el dueño). */
    public static function settlement(Receipt $receipt): PdfBuilder
    {
        $receipt->loadMissing(self::RELATIONS);

        return Pdf::view('pdf.settlement', [
            'receipt' => $receipt,
            'calc' => ReceiptCalculator::for($receipt),
        ])->format('a4');
    }

    /** Builder por tipo ('recibo' | 'rendicion'). */
    public static function for(string $type, Receipt $receipt): PdfBuilder
    {
        return $type === 'rendicion'
            ? self::settlement($receipt)
            : self::receipt($receipt);
    }

    /** Nombre de archivo descargable por tipo. */
    public static function filename(string $type, Receipt $receipt): string
    {
        $prefix = $type === 'rendicion' ? 'rendicion' : 'recibo';

        return "{$prefix}-{$receipt->Nro_Recibo}.pdf";
    }
}
