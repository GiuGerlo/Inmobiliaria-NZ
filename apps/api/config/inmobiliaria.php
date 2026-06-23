<?php

declare(strict_types=1);

/*
 * Datos fijos de la inmobiliaria y reglas de negocio que aparecen en los PDFs
 * (recibo, rendición, listado mensual). Antes estaban hardcodeados en el legacy.
 */
return [
    'name' => env('NZ_NAME', 'Nadina Zaranich'),
    'locality' => env('NZ_LOCALITY', 'Guatimozín'),
    'address' => env('NZ_ADDRESS', 'Catamarca 227'),
    'phone' => env('NZ_PHONE', '3468-495281'),
    'hours' => env('NZ_HOURS', '8 hs a 12 hs - 16 hs a 20 hs'),
    'cuit' => env('NZ_CUIT', '27-27036340-2'),

    /*
     * Comisión de administración: 10% del alquiler (Pago_Propiedad).
     * Se usa en la rendición al dueño y en el listado mensual.
     */
    'commission_rate' => (float) env('NZ_COMMISSION_RATE', 0.10),

    /*
     * Email del usuario que el RoleSeeder promueve a superadmin (en prod, la cuenta
     * real del dueño del sistema). Configurable por entorno — sin hardcodear emails.
     * En local no hace falta: el seed crea un superadmin de prueba (super@nz.com).
     */
    'superadmin_email' => env('SUPERADMIN_EMAIL'),
];
