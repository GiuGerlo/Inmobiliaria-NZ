<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Datos demo solo en local — jamás en producción.
        if (app()->environment('local')) {
            User::query()->firstOrCreate(
                ['Email_User' => 'demo@example.com'],
                ['Nombre_User' => 'Demo', 'Pass_User' => '', 'password' => bcrypt('password')],
            );

            $this->call(DemoSeeder::class);
        }

        $this->call(RoleSeeder::class);
    }
}
