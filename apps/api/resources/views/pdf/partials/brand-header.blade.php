{{-- Header de marca reutilizable. Vars: $docTitle, $docNumber (opcional), $docDate. --}}
@php($nz = config('inmobiliaria'))
<div class="brand-header">
    <div class="brand-left">
        <img class="logo" src="{{ \App\Support\PdfAsset::dataUri('logo.jpg') }}" alt="Logo {{ $nz['name'] }}">
        <div class="brand-info">
            <div class="name">{{ $nz['name'] }}</div>
            <strong>Localidad:</strong> {{ $nz['locality'] }} &nbsp;|&nbsp; <strong>Tel:</strong> {{ $nz['phone'] }}<br>
            <strong>Dirección:</strong> {{ $nz['address'] }}<br>
            <strong>Horario:</strong> {{ $nz['hours'] }}<br>
            <strong>CUIT:</strong> {{ $nz['cuit'] }}
        </div>
    </div>
    <div class="doc-meta">
        <div class="doc-title">{{ $docTitle }}</div>
        @isset($docNumber)
            <div class="doc-number">N.º {{ $docNumber }}</div>
        @endisset
        <div class="doc-date">{{ $docDate }}</div>
    </div>
</div>
