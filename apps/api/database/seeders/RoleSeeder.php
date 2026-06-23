<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

final class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = Role::firstOrCreate(['name' => Role::SUPERADMIN], ['label' => 'Superadministrador']);
        $inmobiliaria = Role::firstOrCreate(['name' => Role::INMOBILIARIA], ['label' => 'Inmobiliaria']);

        // Todos los usuarios sin rol → inmobiliaria (least privilege por default).
        User::query()->whereNull('role_id')->update(['role_id' => $inmobiliaria->id]);

        // El superadmin se define por entorno (config/inmobiliaria.php ← SUPERADMIN_EMAIL),
        // no hardcodeado. En prod = cuenta real del dueño.
        $email = config('inmobiliaria.superadmin_email');
        if (is_string($email) && $email !== '') {
            User::query()->where('Email_User', $email)->update(['role_id' => $superadmin->id]);
        }
    }
}
