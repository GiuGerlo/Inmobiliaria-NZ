<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:8080');
});

it('devuelve 401 en /me sin sesión', function () {
    $this->getJson('/api/v1/me')->assertUnauthorized();
});

it('devuelve el usuario autenticado en /me con headers no-store', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/v1/me');

    $response->assertOk()
        ->assertJsonPath('data.id', $user->ID_User)
        ->assertJsonPath('data.name', $user->Nombre_User)
        ->assertJsonPath('data.email', $user->Email_User)
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertHeader('X-Content-Type-Options', 'nosniff');
});

it('actualiza nombre y email del perfil', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patchJson('/api/v1/me', [
        'name' => 'Nuevo Nombre',
        'email' => 'nuevo@test.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Nuevo Nombre')
        ->assertJsonPath('data.email', 'nuevo@test.com');

    $this->assertDatabaseHas('users', [
        'ID_User' => $user->ID_User,
        'Nombre_User' => 'Nuevo Nombre',
        'Email_User' => 'nuevo@test.com',
    ]);
});

it('rechaza email ya usado por otro usuario', function () {
    $otro = User::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->patchJson('/api/v1/me', [
        'name' => $user->Nombre_User,
        'email' => $otro->Email_User,
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('permite guardar el propio email sin cambiarlo', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patchJson('/api/v1/me', [
        'name' => 'Otro Nombre',
        'email' => $user->Email_User,
    ])->assertOk();
});
