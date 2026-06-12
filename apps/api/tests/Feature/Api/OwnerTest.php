<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/owners')->assertUnauthorized();
});

it('lista dueños con filtro por ciudad e include', function () {
    $city = City::factory()->create();
    Owner::factory()->create(['CodP' => $city->CodP, 'NYA_Dueno' => 'Carlos Pérez']);
    Owner::factory()->create();

    $this->getJson("/api/v1/owners?filter[city_code]={$city->CodP}&include=city")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Carlos Pérez')
        ->assertJsonPath('data.0.city.code', $city->CodP);
});

it('busca dueños con q', function () {
    Owner::factory()->create(['NYA_Dueno' => 'Marta Zubeldía']);
    Owner::factory()->create(['NYA_Dueno' => 'Pedro García']);

    $this->getJson('/api/v1/owners?q=zubel')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('crea un dueño', function () {
    $city = City::factory()->create();

    $this->postJson('/api/v1/owners', [
        'name' => 'Nuevo Dueño',
        'phone' => '3471555555',
        'email' => 'dueno@test.com',
        'city_code' => $city->CodP,
    ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'dueno@test.com');

    $this->assertDatabaseHas('dueno', ['Email_Dueno' => 'dueno@test.com']);
});

it('valida ciudad inexistente y email inválido', function () {
    $this->postJson('/api/v1/owners', [
        'name' => 'X',
        'phone' => '1',
        'email' => 'no-es-email',
        'city_code' => 'nope',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'city_code']);
});

it('muestra y actualiza un dueño', function () {
    $owner = Owner::factory()->create();

    $this->getJson("/api/v1/owners/{$owner->ID_Dueno}")
        ->assertOk()
        ->assertJsonPath('data.id', $owner->ID_Dueno);

    $this->patchJson("/api/v1/owners/{$owner->ID_Dueno}", ['phone' => '341999999'])
        ->assertOk()
        ->assertJsonPath('data.phone', '341999999');
});

it('borra dueño sin contratos y 409 con contratos', function () {
    $sinContratos = Owner::factory()->create();
    $this->deleteJson("/api/v1/owners/{$sinContratos->ID_Dueno}")->assertNoContent();

    $conContratos = Owner::factory()->create();
    Contract::factory()->create(['ID_Dueno' => $conContratos->ID_Dueno]);

    $this->deleteJson("/api/v1/owners/{$conContratos->ID_Dueno}")
        ->assertStatus(409)
        ->assertJsonPath('message', 'No se puede eliminar el dueño: tiene contratos asociados.');
});
