<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>@yield('title', 'Documento')</title>
    <style>
        @page {
            margin: 28px 32px;
        }

        * {
            box-sizing: border-box;
        }

        /* DejaVu Sans: dompdf la embebe completa (normal/bold/itálica + acentos). Evita
           el fallback a serif en los textos en negrita (bug de Helvetica/Arial en dompdf). */
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 13px;
            color: #1a2230;
            margin: 0;
        }

        /* Header de marca por tabla (dompdf no soporta flexbox). */
        table.brand-header {
            width: 100%;
            border-collapse: collapse;
            padding-bottom: 14px;
            border-bottom: 3px solid #13294b;
        }

        table.brand-header > tbody > tr > td {
            vertical-align: top;
            padding-bottom: 14px;
        }

        table.brand-header td.brand-meta {
            text-align: right;
        }

        table.brand-header table.brand-left td {
            vertical-align: top;
        }

        table.brand-header td.logo-cell {
            width: 124px;
            padding-right: 16px;
        }

        table.brand-header img.logo {
            width: 108px;
            height: auto;
        }

        .brand-info {
            font-size: 12px;
            line-height: 1.5;
            color: #43506a;
        }

        .brand-info .name {
            font-size: 15px;
            font-weight: 700;
            color: #13294b;
            margin-bottom: 2px;
        }

        .doc-meta {
            text-align: right;
        }

        .doc-meta .doc-title {
            font-size: 23px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #13294b;
        }

        .doc-meta .doc-number {
            margin-top: 4px;
            font-size: 15px;
            font-weight: 700;
        }

        .doc-meta .doc-date {
            margin-top: 2px;
            font-size: 12px;
            color: #43506a;
        }

        table {
            border-collapse: collapse;
        }

        /* Firma: caja de ancho fijo, imagen ARRIBA y centrada, línea + "Firma" debajo.
           (img display:block + label inline-block no apilaban bien en dompdf.) */
        table.signature {
            margin-top: 42px;
            border-collapse: collapse;
        }

        table.signature td {
            width: 180px;
            text-align: center;
            vertical-align: bottom;
        }

        table.signature img {
            width: 140px;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        table.signature .label {
            margin-top: 2px;
            border-top: 1px solid #1a2230;
            padding-top: 4px;
            font-size: 12px;
            font-weight: 700;
            display: block;
        }

        .doc-footer {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            text-align: center;
            font-size: 9.5px;
            color: #8a93a6;
            border-top: 1px solid #e2e6ee;
            padding-top: 6px;
        }

        .doc-footer .name {
            color: #13294b;
            font-weight: 700;
        }

        .comments {
            margin-top: 18px;
            font-size: 12.5px;
        }

        .comments .label {
            font-weight: 700;
        }

        @stack('styles')
    </style>
</head>

<body>
    @yield('content')
</body>

</html>
