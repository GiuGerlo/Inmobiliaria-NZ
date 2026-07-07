<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicMaintenanceGate;
use App\Support\MaintenanceState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Modo mantenimiento manejado por el superadmin desde el admin. Activa/desactiva el
 * gate del admin (middleware MaintenanceGate) y del público (.htaccess). La IP permitida
 * se captura del request (server-side, nunca de input) → sin riesgo de inyección. ADR-0010.
 */
final class MaintenanceController extends Controller
{
    public function __construct(private readonly PublicMaintenanceGate $publicGate) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json($this->state($request));
    }

    public function store(Request $request): JsonResponse
    {
        $ip = (string) $request->ip();
        MaintenanceState::enable($ip);
        $this->publicGate->enable($ip);

        return response()->json($this->state($request));
    }

    public function destroy(Request $request): JsonResponse
    {
        MaintenanceState::disable();
        $this->publicGate->disable();

        return response()->json($this->state($request));
    }

    public function updateIp(Request $request): JsonResponse
    {
        $ip = (string) $request->ip();
        MaintenanceState::updateIp($ip);

        if (MaintenanceState::enabled()) {
            $this->publicGate->enable($ip);
        }

        return response()->json($this->state($request));
    }

    /** Estado liviano, público (sin auth): lo lee el SPA para decidir si muestra la pantalla. */
    public function status(): JsonResponse
    {
        return response()->json(['enabled' => MaintenanceState::enabled()]);
    }

    /**
     * @return array{enabled: bool, allowed_ip: string|null, your_ip: string|null}
     */
    private function state(Request $request): array
    {
        return [
            'enabled' => MaintenanceState::enabled(),
            'allowed_ip' => MaintenanceState::allowedIp(),
            'your_ip' => $request->ip(),
        ];
    }
}
