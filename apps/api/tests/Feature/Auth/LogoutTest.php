<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:8080');
});

it('cierra la sesión y deja al usuario como guest', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->Email_User,
        'password' => 'password',
    ])->assertOk();

    $this->postJson('/api/v1/auth/logout')->assertNoContent();

    $this->assertGuest('web');
});

it('rechaza logout sin sesión activa', function () {
    $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
});
