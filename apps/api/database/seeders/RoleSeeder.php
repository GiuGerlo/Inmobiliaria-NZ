<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

final class RoleSeeder extends Seeder
{
    private const SUPERADMIN_EMAIL = 'ggiuliano526@gmail.com';

    public function run(): void
    {
        $superadmin = Role::firstOrCreate(['name' => Role::SUPERADMIN], ['label' => 'Superadministrador']);
        $inmobiliaria = Role::firstOrCreate(['name' => Role::INMOBILIARIA], ['label' => 'Inmobiliaria']);

        // Todos los usuarios sin rol → inmobiliaria (least privilege por default).
        User::query()->whereNull('role_id')->update(['role_id' => $inmobiliaria->id]);

        // El superadmin, por email (hardcodeado).
        User::query()->where('Email_User', self::SUPERADMIN_EMAIL)
            ->update(['role_id' => $superadmin->id]);
    }
}
