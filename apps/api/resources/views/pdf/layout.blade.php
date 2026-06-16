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

        body {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            font-size: 14px;
            color: #1a2230;
            margin: 0;
        }

        /* Paleta NZ */
        :root {
            --navy: #13294b;
            --gold: #c5a572;
        }

        .brand-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 14px;
            border-bottom: 3px solid #13294b;
        }

        .brand-header .brand-left {
            display: flex;
            gap: 14px;
            align-items: flex-start;
        }

        .brand-header img.logo {
            width: 78px;
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
            font-weight: 600;
        }

        .doc-meta .doc-date {
            margin-top: 2px;
            font-size: 12px;
            color: #43506a;
        }

        table {
            border-collapse: collapse;
        }

        .signature {
            margin-top: 42px;
        }

        .signature img {
            width: 150px;
            height: auto;
            display: block;
        }

        .signature .label {
            margin-top: 4px;
            font-size: 12px;
            font-weight: 700;
            border-top: 1px solid #1a2230;
            display: inline-block;
            padding-top: 4px;
            min-width: 150px;
            text-align: center;
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
