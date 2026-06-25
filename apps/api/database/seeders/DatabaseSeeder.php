<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Roles primero (los necesitan los usuarios demo de abajo).
        $this->call(RoleSeeder::class);

        // Datos demo solo en local — jamás en producción.
        if (app()->environment('local')) {
            $inmobiliariaId = Role::query()->where('name', Role::INMOBILIARIA)->value('id');
            $superadminId = Role::query()->where('name', Role::SUPERADMIN)->value('id');

            // Dos perfiles de prueba (password `password`). Pass_User se setea directo
            // (no está en $fillable y la columna legacy no tiene default).
            $demoUsers = [
                ['Email_User' => 'demo@example.com', 'Nombre_User' => 'Demo', 'role_id' => $inmobiliariaId],
                ['Email_User' => 'super@nz.com', 'Nombre_User' => 'Superadmin', 'role_id' => $superadminId],
            ];
            foreach ($demoUsers as $data) {
                $user = User::query()->firstOrNew(['Email_User' => $data['Email_User']]);
                if (! $user->exists) {
                    $user->Nombre_User = $data['Nombre_User'];
                    $user->Pass_User = '';
                    $user->password = Hash::make('password');
                    $user->role_id = $data['role_id'];
                    $user->save();
                }
            }

            $this->call(DemoSeeder::class);
            $this->call(SalesDemoSeeder::class);
        }
    }
}
