<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Referer de dominio stateful: simula el request de la SPA (Sanctum).
    $this->withHeader('Referer', 'http://localhost:8080');
});

it('loguea con credenciales correctas y devuelve el usuario', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email']])
        ->assertJsonPath('data.email', $user->Email_User);

    $this->assertAuthenticatedAs($user);
});

it('rechaza password incorrecta con 422 y mensaje genérico', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'incorrecta',
    ]);

    $response->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'Las credenciales no coinciden con nuestros registros.');

    $this->assertGuest();
});

it('devuelve el mismo mensaje genérico si el email no existe', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'noexiste@test.com',
        'password' => 'loquesea1',
    ]);

    $response->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'Las credenciales no coinciden con nuestros registros.');
});

it('aplica rate limit: el sexto intento en el minuto devuelve 429', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/auth/login', [
            'email' => $user->Email_User,
            'password' => 'incorrecta',
        ])->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'password', // correcta, pero ya está bloqueado
    ])
        ->assertStatus(429)
        ->assertHeader('Retry-After');
});

it('rechaza usuarios sin password bcrypt (sin fallback MD5 legacy)', function () {
    $user = User::factory()->create(['password' => null]);

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'password',
    ])->assertUnprocessable();

    $this->assertGuest();
});

it('emite cookie de remember cuando se pide remember', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'password',
        'remember' => true,
    ]);

    $response->assertOk()
        ->assertCookie(Auth::guard('web')->getRecallerName());
});
