<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

// API-only en local: la SPA la sirve Vite vía nginx, Laravel solo responde `/api`.
//
// En PROD (Hostinger, sin Node) la SPA se buildea y se copia a public/. Toda ruta no-API
// y no-archivo entra por el front controller y cae acá: devolvemos el index.html del SPA y
// React Router resuelve el resto en el cliente. Si el build no está (local), 404.
// Beneficio: en mantenimiento (`php artisan down`) este fallback también queda cortado,
// así el admin entero muestra el 503 branded, no solo la API.
Route::fallback(function () {
    $spa = public_path('index.html');
    abort_unless(is_file($spa), 404);

    return response()->file($spa);
});
