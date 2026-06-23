<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('asigna superadmin al email configurado e inmobiliaria al resto', function () {
    config(['inmobiliaria.superadmin_email' => 'jefe@nz.com']);
    $jefe = User::factory()->create(['Email_User' => 'jefe@nz.com']);
    $otro = User::factory()->create(['Email_User' => 'staff@example.com']);

    $this->seed(RoleSeeder::class);

    expect($jefe->refresh()->role->name)->toBe(Role::SUPERADMIN)
        ->and($otro->refresh()->role->name)->toBe(Role::INMOBILIARIA);
});

it('sin email configurado, nadie es superadmin', function () {
    config(['inmobiliaria.superadmin_email' => null]);
    $user = User::factory()->create(['Email_User' => 'staff@example.com']);

    $this->seed(RoleSeeder::class);

    expect($user->refresh()->role->name)->toBe(Role::INMOBILIARIA);
});
