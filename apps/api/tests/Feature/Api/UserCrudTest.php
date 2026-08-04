<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('superadmin puede listar usuarios', function () {
    User::factory()->count(2)->inmobiliaria()->create();

    $this->actingAs(User::factory()->superadmin()->create())
        ->getJson('/api/v1/users')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'name', 'email', 'role', 'role_id', 'is_superadmin']]]);
});

it('inmobiliaria no puede acceder a usuarios (403)', function () {
    $this->actingAs(User::factory()->inmobiliaria()->create())
        ->getJson('/api/v1/users')
        ->assertForbidden();
});

it('superadmin puede crear un usuario', function () {
    $superadmin = User::factory()->superadmin()->create();
    $inmobiliariaRole = \App\Models\Role::firstOrCreate(
        ['name' => \App\Models\Role::INMOBILIARIA],
        ['label' => 'Inmobiliaria'],
    );

    $this->actingAs($superadmin)
        ->postJson('/api/v1/users', [
            'name' => 'Nuevo Staff',
            'email' => 'staff@test.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role_id' => $inmobiliariaRole->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Nuevo Staff')
        ->assertJsonPath('data.email', 'staff@test.com')
        ->assertJsonPath('data.role', \App\Models\Role::INMOBILIARIA);
});

it('no se puede crear usuario con email duplicado', function () {
    $existing = User::factory()->inmobiliaria()->create(['Email_User' => 'dup@test.com']);
    $inmobiliariaRole = \App\Models\Role::where('name', \App\Models\Role::INMOBILIARIA)->first();

    $this->actingAs(User::factory()->superadmin()->create())
        ->postJson('/api/v1/users', [
            'name' => 'Otro',
            'email' => $existing->Email_User,
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role_id' => $inmobiliariaRole->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('superadmin puede editar un usuario sin cambiar la password', function () {
    $target = User::factory()->inmobiliaria()->create();
    $oldHash = $target->password;

    $this->actingAs(User::factory()->superadmin()->create())
        ->patchJson("/api/v1/users/{$target->ID_User}", [
            'name' => 'Nombre Nuevo',
            'email' => $target->Email_User,
            'role_id' => $target->role_id,
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Nombre Nuevo');

    expect($target->fresh()->password)->toBe($oldHash);
});

it('superadmin puede cambiar la password de un usuario', function () {
    $target = User::factory()->inmobiliaria()->create();

    $this->actingAs(User::factory()->superadmin()->create())
        ->patchJson("/api/v1/users/{$target->ID_User}", [
            'name' => $target->Nombre_User,
            'email' => $target->Email_User,
            'role_id' => $target->role_id,
            'password' => 'nuevapassword123',
            'password_confirmation' => 'nuevapassword123',
        ])
        ->assertOk();

    expect(\Illuminate\Support\Facades\Hash::check('nuevapassword123', $target->fresh()->password))->toBeTrue();
});

it('superadmin puede eliminar un usuario', function () {
    $target = User::factory()->inmobiliaria()->create();

    $this->actingAs(User::factory()->superadmin()->create())
        ->deleteJson("/api/v1/users/{$target->ID_User}")
        ->assertNoContent();

    expect(User::find($target->ID_User))->toBeNull();
});

it('no autenticado recibe 401 al listar usuarios', function () {
    $this->getJson('/api/v1/users')->assertUnauthorized();
});
