<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:8080');
});

it('cambia la password con la actual correcta', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->putJson('/api/v1/me/password', [
        'current_password' => 'password',
        'password' => 'nueva-clave-123',
        'password_confirmation' => 'nueva-clave-123',
    ]);

    $response->assertOk();

    expect(Hash::check('nueva-clave-123', $user->refresh()->password))->toBeTrue();
});

it('permite loguear con la password nueva', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/v1/me/password', [
        'current_password' => 'password',
        'password' => 'nueva-clave-123',
        'password_confirmation' => 'nueva-clave-123',
    ])->assertOk();

    $this->postJson('/api/v1/auth/logout')->assertNoContent();

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'nueva-clave-123',
    ])->assertOk();
});

it('rechaza el cambio si la password actual es incorrecta', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/v1/me/password', [
        'current_password' => 'incorrecta',
        'password' => 'nueva-clave-123',
        'password_confirmation' => 'nueva-clave-123',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['current_password']);
});

it('rechaza password nueva corta o sin confirmación', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/api/v1/me/password', [
        'current_password' => 'password',
        'password' => 'corta',
        'password_confirmation' => 'corta',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);

    $this->actingAs($user)->putJson('/api/v1/me/password', [
        'current_password' => 'password',
        'password' => 'nueva-clave-123',
        'password_confirmation' => 'otra-distinta',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});
