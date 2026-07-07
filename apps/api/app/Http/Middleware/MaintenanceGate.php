<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\MaintenanceState;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Modo mantenimiento controlado desde el admin (superadmin). Con mantenimiento ON,
 * al admin solo entra la IP permitida o un superadmin logueado; el resto recibe 503.
 *
 * Se aplica DENTRO del grupo `auth:sanctum` (después de resolver el usuario). El login
 * queda FUERA del grupo → siempre accesible, así el superadmin nunca se bloquea a sí
 * mismo aunque le cambie la IP. `me` y `logout` se dejan pasar para que el SPA pueda
 * resolver la sesión y mostrar la pantalla de mantenimiento. Ver ADR-0010.
 */
final class MaintenanceGate
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! MaintenanceState::enabled()) {
            return $next($request);
        }

        // El flujo de sesión sigue vivo aunque estés bloqueado del resto del admin.
        if ($request->is('api/v1/me', 'api/v1/auth/logout')) {
            return $next($request);
        }

        if ($request->ip() === MaintenanceState::allowedIp() || $request->user()?->isSuperadmin()) {
            return $next($request);
        }

        return response()->json([
            'message' => 'El sistema está en mantenimiento. Volvé a intentar en un rato.',
        ], Response::HTTP_SERVICE_UNAVAILABLE);
    }
}
