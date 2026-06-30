{{-- Vista de mantenimiento del admin/API. Se muestra automáticamente cuando la app está
     en modo mantenimiento (php artisan down). El acceso del operador se hace con el token
     secreto (php artisan down --secret="<token>") visitando /<token> una vez. --}}
@php($nz = config('inmobiliaria'))
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>En mantenimiento — {{ $nz['name'] }}</title>
    <style>
        :root { --navy: #2d465e; --accent: #3690e7; --ink: #1f2937; --muted: #6b7280; }
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--navy); color: var(--ink); padding: 24px;
        }
        .card {
            background: #fff; border-radius: 16px; max-width: 480px; width: 100%;
            padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.25);
        }
        .badge {
            display: inline-block; font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
            color: var(--accent); font-weight: 700; margin-bottom: 16px;
        }
        h1 { font-size: 24px; margin: 0 0 12px; color: var(--navy); }
        p { font-size: 15px; line-height: 1.6; color: var(--muted); margin: 0 0 8px; }
        .sep { height: 1px; background: #e5e7eb; margin: 28px 0; }
        .contact { font-size: 13px; color: var(--ink); }
        .contact strong { color: var(--navy); }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Mantenimiento</div>
        <h1>Estamos actualizando el sistema</h1>
        <p>El panel de administración está temporalmente fuera de línea por tareas de mantenimiento.</p>
        <p>Volvé a intentar en unos minutos. Disculpá las molestias.</p>
        <div class="sep"></div>
        <div class="contact">
            <strong>{{ $nz['name'] }}</strong><br>
            Tel: {{ $nz['phone'] }} &nbsp;|&nbsp; {{ $nz['locality'] }}
        </div>
    </div>
</body>
</html>
