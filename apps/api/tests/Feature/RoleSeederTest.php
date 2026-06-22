<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('asigna superadmin a Giuliano y inmobiliaria al resto', function () {
    $giuli = User::factory()->create(['Email_User' => 'ggiuliano526@gmail.com']);
    $otro = User::factory()->create(['Email_User' => 'staff@example.com']);

    $this->seed(RoleSeeder::class);

    expect($giuli->refresh()->role->name)->toBe(Role::SUPERADMIN)
        ->and($otro->refresh()->role->name)->toBe(Role::INMOBILIARIA);
});
