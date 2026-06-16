@extends('pdf.layout')

@section('title', 'Pagos '.$month.' '.$year)

@push('styles')
    .report-title {
        text-align: center;
        font-size: 19px;
        font-weight: 700;
        color: #13294b;
        margin: 16px 0 10px;
    }
    .section-title {
        font-size: 14px;
        font-weight: 700;
        margin: 16px 0 6px;
    }
    .section-title.paid { color: #1d6b3a; }
    .section-title.unpaid { color: #9b2226; }

    table.grid {
        width: 100%;
        font-size: 11.5px;
    }
    table.grid th, table.grid td {
        border: 1px solid #c9d0dc;
        padding: 5px 6px;
        text-align: left;
    }
    table.grid td.amount, table.grid th.amount { text-align: right; }
    table.grid thead.paid th { background: #e2f2e8; color: #155724; }
    table.grid thead.unpaid th { background: #f9e3e4; color: #721c24; }
    table.grid tbody tr:nth-child(even) td { background: #f7f9fc; }
    .empty { font-size: 12.5px; color: #43506a; font-style: italic; margin: 6px 0 4px; }
@endpush

@php
    // En la grilla no se pueden omitir celdas: los montos en 0 se muestran como "—".
    $fmt = fn ($v) => (float) $v > 0 ? '$ '.number_format((float) $v, 0, ',', '.') : '—';
@endphp

@section('content')
    @include('pdf.partials.brand-header', [
        'docTitle' => 'PAGOS',
        'docDate' => now()->format('d/m/Y'),
    ])

    <div class="report-title">Reporte de recibos — {{ $month }} de {{ $year }}</div>

    <div class="section-title paid">Pagados</div>
    @if ($paid->isEmpty())
        <div class="empty">No hay recibos pagados para este mes y año.</div>
    @else
        <table class="grid">
            <thead class="paid">
                <tr>
                    <th>Fecha pago</th>
                    <th>Inquilino</th>
                    <th>Dueño</th>
                    <th>Contrato</th>
                    <th class="amount">Mun.</th>
                    <th class="amount">Agua</th>
                    <th class="amount">Gas</th>
                    <th class="amount">Electr.</th>
                    <th class="amount">Alquiler</th>
                    <th class="amount">Comisión</th>
                    <th class="amount">Entrega</th>
                    <th class="amount">Honor.</th>
                    <th>Cert.</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($paid as $receipt)
                    @php($calc = \App\Support\ReceiptCalculator::for($receipt))
                    <tr>
                        <td>{{ $receipt->F_Pago?->format('d/m/Y') }}</td>
                        <td>{{ $receipt->contract->tenant->NYA_Inquilino }}</td>
                        <td>{{ $receipt->contract->owner->NYA_Dueno }}</td>
                        <td>{{ $receipt->contract->F_Inicio?->format('d/m/Y') }}</td>
                        <td class="amount">{{ $fmt($receipt->Pago_Municipal) }}</td>
                        <td class="amount">{{ $fmt($receipt->Pago_Agua) }}</td>
                        <td class="amount">{{ $fmt($receipt->Pago_Gas) }}</td>
                        <td class="amount">{{ $fmt($receipt->Pago_Electricidad) }}</td>
                        <td class="amount">{{ $fmt($receipt->Pago_Propiedad) }}</td>
                        <td class="amount">{{ $fmt($calc->commission()) }}</td>
                        <td class="amount">{{ $fmt($calc->monthlyHandover()) }}</td>
                        <td class="amount">{{ $fmt($receipt->Honorarios) }}</td>
                        <td>{{ $receipt->contract->Certificacion }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="section-title unpaid">No pagados</div>
    @if ($unpaid->isEmpty())
        <div class="empty">No hay contratos sin recibo para este mes y año.</div>
    @else
        <table class="grid">
            <thead class="unpaid">
                <tr>
                    <th>Inquilino</th>
                    <th>Dueño</th>
                    <th>Inicio contrato</th>
                    <th class="amount">Precio propiedad</th>
                    <th>Cert.</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($unpaid as $contract)
                    <tr>
                        <td>{{ $contract->tenant->NYA_Inquilino }}</td>
                        <td>{{ $contract->owner->NYA_Dueno }}</td>
                        <td>{{ $contract->F_Inicio?->format('d/m/Y') }}</td>
                        <td class="amount">{{ $fmt($contract->property->Precio_Propiedad) }}</td>
                        <td>{{ $contract->Certificacion }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
@endsection
