{{-- Pie de página fijo (recibo / rendición). Datos de config/inmobiliaria.php. --}}
@php($nz = config('inmobiliaria'))
<div class="doc-footer">
    <span class="name">{{ $nz['name'] }}</span> · Estudio Jurídico Inmobiliario ·
    {{ $nz['address'] }}, {{ $nz['locality'] }} · Tel: {{ $nz['phone'] }} · CUIT: {{ $nz['cuit'] }}
</div>
