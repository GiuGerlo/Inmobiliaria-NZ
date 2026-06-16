<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Receipt;

/**
 * Única fuente de verdad de los cálculos de los PDFs (recibo, rendición, listado
 * mensual). Replica la lógica del legacy:
 *   - Total recibo  = alquiler + municipal + agua + electricidad + gas + honorarios.
 *   - Comisión      = alquiler × commission_rate (10%).
 *   - Entrega (rendición) = ingresos − (comisión + arreglos + otros).
 *   - Entrega (mensual)   = ingresos − comisión.
 *
 * Trabaja sobre las columnas legacy del modelo Receipt; los montos se castean a
 * float (las columnas son decimal:0 → string).
 */
final class ReceiptCalculator
{
    public function __construct(private readonly Receipt $receipt) {}

    public static function for(Receipt $receipt): self
    {
        return new self($receipt);
    }

    private function commissionRate(): float
    {
        return (float) config('inmobiliaria.commission_rate', 0.10);
    }

    public function rent(): float
    {
        return (float) $this->receipt->Pago_Propiedad;
    }

    /** Suma de servicios (municipal + agua + electricidad + gas). */
    public function services(): float
    {
        return (float) $this->receipt->Pago_Municipal
            + (float) $this->receipt->Pago_Agua
            + (float) $this->receipt->Pago_Electricidad
            + (float) $this->receipt->Pago_Gas;
    }

    public function fees(): float
    {
        return (float) $this->receipt->Honorarios;
    }

    public function repairs(): float
    {
        return (float) $this->receipt->Arreglos;
    }

    public function other(): float
    {
        return (float) $this->receipt->Sepelio;
    }

    /** Total del recibo al inquilino: alquiler + servicios + honorarios (NO arreglos/otros). */
    public function receiptTotal(): float
    {
        return $this->rent() + $this->services() + $this->fees();
    }

    /** Comisión de administración: 10% del alquiler. */
    public function commission(): float
    {
        return $this->rent() * $this->commissionRate();
    }

    /** Ingresos de la rendición: alquiler + servicios (sin honorarios). */
    public function settlementIncome(): float
    {
        return $this->rent() + $this->services();
    }

    /** Egresos de la rendición: comisión + arreglos + otros. */
    public function settlementExpenses(): float
    {
        return $this->commission() + $this->repairs() + $this->other();
    }

    /** Entrega al dueño en la rendición: ingresos − egresos. */
    public function settlementHandover(): float
    {
        return $this->settlementIncome() - $this->settlementExpenses();
    }

    /** Entrega en el listado mensual: ingresos − comisión (sin arreglos/otros). */
    public function monthlyHandover(): float
    {
        return $this->settlementIncome() - $this->commission();
    }
}
