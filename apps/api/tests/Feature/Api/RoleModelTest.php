<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marca superadmin solo cuando el rol es superadmin', function () {
    $super = User::factory()->superadmin()->create();
    $staff = User::factory()->inmobiliaria()->create();
    $sinRol = User::factory()->create();

    expect($super->isSuperadmin())->toBeTrue()
        ->and($staff->isSuperadmin())->toBeFalse()
        ->and($sinRol->isSuperadmin())->toBeFalse();
});

it('relaciona role hasMany users', function () {
    $user = User::factory()->superadmin()->create();
    $role = Role::where('name', Role::SUPERADMIN)->first();

    expect($role->users)->toHaveCount(1)
        ->and($user->role->name)->toBe(Role::SUPERADMIN);
});
