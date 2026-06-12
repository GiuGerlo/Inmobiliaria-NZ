<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Contract;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/tenants')->assertUnauthorized();
});

it('lista inquilinos con filtro por ciudad', function () {
    $city = City::factory()->create();
    Tenant::factory()->create(['CodP' => $city->CodP]);
    Tenant::factory()->count(2)->create();

    $this->getJson("/api/v1/tenants?filter[city_code]={$city->CodP}")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('crea un inquilino', function () {
    $city = City::factory()->create();

    $this->postJson('/api/v1/tenants', [
        'name' => 'Inquilina Test',
        'phone' => '3471444444',
        'email' => 'inquilina@test.com',
        'city_code' => $city->CodP,
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Inquilina Test');

    $this->assertDatabaseHas('inquilino', ['Email_Inquilino' => 'inquilina@test.com']);
});

it('valida campos requeridos', function () {
    $this->postJson('/api/v1/tenants', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'phone', 'email', 'city_code']);
});

it('muestra y actualiza un inquilino', function () {
    $tenant = Tenant::factory()->create();

    $this->getJson("/api/v1/tenants/{$tenant->ID_Inquilino}")
        ->assertOk()
        ->assertJsonPath('data.id', $tenant->ID_Inquilino);

    $this->patchJson("/api/v1/tenants/{$tenant->ID_Inquilino}", ['name' => 'Cambiada'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Cambiada');
});

it('borra inquilino sin contratos y 409 con contratos', function () {
    $libre = Tenant::factory()->create();
    $this->deleteJson("/api/v1/tenants/{$libre->ID_Inquilino}")->assertNoContent();

    $ocupado = Tenant::factory()->create();
    Contract::factory()->create(['ID_Inquilino' => $ocupado->ID_Inquilino]);

    $this->deleteJson("/api/v1/tenants/{$ocupado->ID_Inquilino}")->assertStatus(409);
});
