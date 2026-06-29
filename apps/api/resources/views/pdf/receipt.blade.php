@extends('pdf.layout')

@section('title', 'Recibo '.$receipt->Nro_Recibo)

@push('styles')
    table.parties {
        width: 100%;
        margin-top: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid #d7dce5;
        line-height: 1.6;
    }
    table.parties td { vertical-align: top; width: 50%; }
    table.parties td.right { text-align: right; }
    table.parties strong { color: #13294b; }

    table.charges {
        width: 100%;
        margin-top: 18px;
    }
    table.charges td {
        padding: 7px 10px;
        border-bottom: 1px solid #e7eaf0;
    }
    table.charges td.amount { text-align: right; }
    table.charges tr.total td {
        font-weight: 700;
        font-size: 15px;
        border-top: 2px solid #13294b;
        border-bottom: none;
        color: #13294b;
    }

    .in-words {
        margin-top: 14px;
        padding: 10px 12px;
        background: #f4f1ea;
        border-left: 3px solid #c5a572;
        font-size: 13.5px;
    }
    .in-words strong { color: #13294b; }
@endpush

@php
    $fmt = fn ($v) => '$ '.number_format((float) $v, 2, ',', '.');
    $contract = $receipt->contract;
    $items = [
        'Alquiler' => $receipt->Pago_Propiedad,
        'Municipal' => $receipt->Pago_Municipal,
        'Agua' => $receipt->Pago_Agua,
        'Electricidad' => $receipt->Pago_Electricidad,
        'Gas' => $receipt->Pago_Gas,
        'Honorarios' => $receipt->Honorarios,
    ];
@endphp

@section('content')
    @include('pdf.partials.brand-header', [
        'docTitle' => 'RECIBO',
        'docNumber' => $receipt->Nro_Recibo,
        'docDate' => now()->format('d/m/Y'),
    ])

    <table class="parties">
        <tr>
            <td>
                <strong>Inquilino:</strong> {{ $contract->tenant->NYA_Inquilino }}<br>
                <strong>Teléfono:</strong> {{ $contract->tenant->Tel_Inquilino }}<br>
                <strong>I.V.A:</strong> Consumidor Final
            </td>
            <td class="right">
                <strong>Contrato:</strong> {{ $contract->F_Inicio?->format('d/m/Y') }} — {{ $contract->F_Fin?->format('d/m/Y') }}<br>
                <strong>En concepto de:</strong> Alquiler<br>
                <strong>Dirección:</strong> {{ $contract->property->Dir_Propiedad }}<br>
                <strong>Dueño:</strong> {{ $contract->owner->NYA_Dueno }}<br>
                <strong>Mes / Año:</strong> {{ $receipt->Mes_Rend }} / {{ $receipt->Ano_Rend }}<br>
                <strong>Forma de pago:</strong> {{ $receipt->paymentMethod->Desc_FP }}
            </td>
        </tr>
    </table>

    <table class="charges">
        @foreach ($items as $label => $value)
            @if ((float) $value > 0)
                <tr>
                    <td>{{ $label }}</td>
                    <td class="amount">{{ $fmt($value) }}</td>
                </tr>
            @endif
        @endforeach
        <tr class="total">
            <td>Total</td>
            <td class="amount">{{ $fmt($calc->receiptTotal()) }}</td>
        </tr>
    </table>

    <div class="in-words">
        <strong>Recibí(mos) la suma de:</strong> Pesos {{ $totalInWords }}.
    </div>

    @if (filled($receipt->Comentarios))
        <div class="comments"><span class="label">Comentarios:</span> {{ $receipt->Comentarios }}</div>
    @endif

    @include('pdf.partials.signature')

    @include('pdf.partials.footer')
@endsection
