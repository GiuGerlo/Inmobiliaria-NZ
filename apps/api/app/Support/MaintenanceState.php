<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Setting;

/**
 * Estado del modo mantenimiento, persistido en la tabla `settings`. Lo maneja el
 * superadmin desde el admin (toggle). El middleware MaintenanceGate lee este estado
 * en cada request autenticado. Ver ADR-0010.
 */
final class MaintenanceState
{
    private const ENABLED = 'maintenance.enabled';

    private const ALLOWED_IP = 'maintenance.allowed_ip';

    public static function enabled(): bool
    {
        return Setting::get(self::ENABLED) === '1';
    }

    public static function allowedIp(): ?string
    {
        return Setting::get(self::ALLOWED_IP);
    }

    public static function enable(string $ip): void
    {
        Setting::set(self::ALLOWED_IP, $ip);
        Setting::set(self::ENABLED, '1');
    }

    public static function disable(): void
    {
        Setting::set(self::ENABLED, '0');
    }

    public static function updateIp(string $ip): void
    {
        Setting::set(self::ALLOWED_IP, $ip);
    }
}
