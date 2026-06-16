@extends('pdf.layout')

@section('title', 'Rendición '.$receipt->Nro_Recibo)

@push('styles')
    .owner-title {
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        color: #13294b;
        margin: 20px 0 14px;
    }

    table.ledger {
        width: 100%;
        margin-top: 6px;
    }
    table.ledger > thead > tr > th {
        background: #13294b;
        color: #fff;
        font-size: 13px;
        letter-spacing: .5px;
        padding: 9px;
        border: 1px solid #13294b;
        width: 33.33%;
    }
    table.ledger > tbody > tr > td {
        border: 1px solid #c9d0dc;
        vertical-align: top;
        padding: 0;
    }
    table.ledger table.inner {
        width: 100%;
    }
    table.ledger table.inner td {
        padding: 6px 10px;
        border-bottom: 1px solid #edf0f5;
        font-size: 13px;
    }
    table.ledger table.inner td.amount { text-align: right; }
    table.ledger table.inner td.k { color: #43506a; font-weight: 600; }
    .entrega {
        font-size: 15px;
        font-weight: 700;
        color: #13294b;
    }
@endpush

@php
    $fmt = fn ($v) => '$ '.number_format((float) $v, 2, ',', '.');
    $contract = $receipt->contract;
@endphp

@section('content')
    @include('pdf.partials.brand-header', [
        'docTitle' => 'RENDICIÓN',
        'docDate' => now()->format('d/m/Y'),
    ])

    <div style="margin-top:10px; font-size:11px; color:#43506a;">
        <strong>Dirección:</strong> {{ $contract->property->Dir_Propiedad }} &nbsp;|&nbsp;
        <strong>Forma de pago:</strong> {{ $receipt->paymentMethod->Desc_FP }}
    </div>

    <div class="owner-title">{{ $contract->owner->NYA_Dueno }}</div>

    <table class="ledger">
        <thead>
            <tr>
                <th>INGRESOS</th>
                <th>EGRESOS</th>
                <th>ENTREGAS</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <table class="inner">
                        <tr><td class="k">Fecha</td><td class="amount">{{ $receipt->F_Pago?->format('d/m/Y') }}</td></tr>
                        <tr><td class="k">Inquilino</td><td class="amount">{{ $contract->tenant->NYA_Inquilino }}</td></tr>
                        <tr><td class="k">Mes / Año</td><td class="amount">{{ $receipt->Mes_Rend }} / {{ $receipt->Ano_Rend }}</td></tr>
                        <tr><td class="k">Alquiler</td><td class="amount">{{ $fmt($receipt->Pago_Propiedad) }}</td></tr>
                        @if ((float) $receipt->Pago_Municipal > 0)
                            <tr><td class="k">Municipal</td><td class="amount">{{ $fmt($receipt->Pago_Municipal) }}</td></tr>
                        @endif
                        @if ((float) $receipt->Pago_Agua > 0)
                            <tr><td class="k">Agua</td><td class="amount">{{ $fmt($receipt->Pago_Agua) }}</td></tr>
                        @endif
                        @if ((float) $receipt->Pago_Electricidad > 0)
                            <tr><td class="k">Electricidad</td><td class="amount">{{ $fmt($receipt->Pago_Electricidad) }}</td></tr>
                        @endif
                        @if ((float) $receipt->Pago_Gas > 0)
                            <tr><td class="k">Gas</td><td class="amount">{{ $fmt($receipt->Pago_Gas) }}</td></tr>
                        @endif
                    </table>
                </td>
                <td>
                    <table class="inner">
                        <tr><td class="k">Comisión (10%)</td><td class="amount">{{ $fmt($calc->commission()) }}</td></tr>
                        @if ((float) $receipt->Arreglos > 0)
                            <tr><td class="k">Arreglos</td><td class="amount">{{ $fmt($receipt->Arreglos) }}</td></tr>
                        @endif
                        @if ((float) $receipt->Sepelio > 0)
                            <tr><td class="k">Otros</td><td class="amount">{{ $fmt($receipt->Sepelio) }}</td></tr>
                        @endif
                    </table>
                </td>
                <td>
                    <table class="inner">
                        <tr><td class="k">Total a entregar</td><td class="amount entrega">{{ $fmt($calc->settlementHandover()) }}</td></tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    @if (filled($receipt->Comentarios))
        <div class="comments"><span class="label">Comentarios:</span> {{ $receipt->Comentarios }}</div>
    @endif

    @include('pdf.partials.signature')

    @include('pdf.partials.footer')
@endsection
