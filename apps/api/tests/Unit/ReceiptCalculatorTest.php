<?php

declare(strict_types=1);

use App\Models\Receipt;
use App\Support\NumberToWords;
use App\Support\ReceiptCalculator;

function makeReceipt(array $attrs = []): Receipt
{
    return new Receipt(array_merge([
        'Pago_Propiedad' => 200_000,
        'Pago_Municipal' => 3_000,
        'Pago_Agua' => 2_000,
        'Pago_Electricidad' => 1_000,
        'Pago_Gas' => 500,
        'Honorarios' => 25_000,
        'Arreglos' => 4_000,
        'Sepelio' => 1_500,
    ], $attrs));
}

it('calcula el total del recibo (alquiler + servicios + honorarios, sin arreglos/otros)', function () {
    $calc = ReceiptCalculator::for(makeReceipt());

    // 200000 + (3000+2000+1000+500) + 25000
    expect($calc->receiptTotal())->toBe(231_500.0);
});

it('calcula la comisión como 10% del alquiler', function () {
    $calc = ReceiptCalculator::for(makeReceipt());

    expect($calc->commission())->toBe(20_000.0);
});

it('calcula la entrega de la rendición (ingresos − comisión − arreglos − otros)', function () {
    $calc = ReceiptCalculator::for(makeReceipt());

    // ingresos 206500 − (comision 20000 + arreglos 4000 + otros 1500)
    expect($calc->settlementIncome())->toBe(206_500.0)
        ->and($calc->settlementExpenses())->toBe(25_500.0)
        ->and($calc->settlementHandover())->toBe(181_000.0);
});

it('calcula la entrega mensual (ingresos − comisión, sin arreglos/otros)', function () {
    $calc = ReceiptCalculator::for(makeReceipt());

    expect($calc->monthlyHandover())->toBe(186_500.0);
});

it('trata los montos nulos como cero', function () {
    $calc = ReceiptCalculator::for(makeReceipt([
        'Pago_Municipal' => null,
        'Pago_Agua' => null,
        'Pago_Electricidad' => null,
        'Pago_Gas' => null,
        'Honorarios' => null,
        'Arreglos' => null,
        'Sepelio' => null,
    ]));

    expect($calc->receiptTotal())->toBe(200_000.0)
        ->and($calc->commission())->toBe(20_000.0)
        ->and($calc->settlementHandover())->toBe(180_000.0)
        ->and($calc->monthlyHandover())->toBe(180_000.0);
});

it('convierte el número a palabras en minúsculas (reemplazo del util buggy)', function () {
    expect(NumberToWords::spell(120_000))->toBe('ciento veinte mil')
        ->and(NumberToWords::spell(200))->toBe('doscientos')
        ->and(NumberToWords::spell(300))->toBe('trescientos');
});
