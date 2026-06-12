<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Contract;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/properties')->assertUnauthorized();
});

it('lista propiedades con filtro por tipo y orden por precio', function () {
    Property::factory()->create(['Tipo_Propiedad' => 'Casa', 'Precio_Propiedad' => 200_000]);
    Property::factory()->create(['Tipo_Propiedad' => 'Departamento', 'Precio_Propiedad' => 100_000]);

    $this->getJson('/api/v1/properties?filter[type]=casa')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.type', 'Casa');

    $this->getJson('/api/v1/properties?sort=-price')
        ->assertOk()
        ->assertJsonPath('data.0.price', 200_000);
});

it('crea una propiedad', function () {
    $city = City::factory()->create();

    $this->postJson('/api/v1/properties', [
        'address' => 'San Martín 123',
        'city_code' => $city->CodP,
        'type' => 'Casa',
        'services' => 'Agua, Luz',
        'price' => 150_000,
        'features' => '2 dormitorios',
    ])
        ->assertCreated()
        ->assertJsonPath('data.address', 'San Martín 123')
        ->assertJsonPath('data.photo_url', null);

    $this->assertDatabaseHas('propiedad', ['Dir_Propiedad' => 'San Martín 123']);
});

it('valida precio negativo', function () {
    $city = City::factory()->create();

    $this->postJson('/api/v1/properties', [
        'address' => 'X',
        'city_code' => $city->CodP,
        'type' => 'Casa',
        'services' => 's',
        'price' => -5,
        'features' => 'f',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['price']);
});

it('muestra y actualiza una propiedad', function () {
    $property = Property::factory()->create();

    $this->getJson("/api/v1/properties/{$property->ID_Propiedad}")
        ->assertOk()
        ->assertJsonPath('data.id', $property->ID_Propiedad);

    $this->patchJson("/api/v1/properties/{$property->ID_Propiedad}", ['price' => 999_999])
        ->assertOk()
        ->assertJsonPath('data.price', 999_999);
});

it('borra propiedad libre y 409 con contratos', function () {
    $libre = Property::factory()->create();
    $this->deleteJson("/api/v1/properties/{$libre->ID_Propiedad}")->assertNoContent();

    $alquilada = Property::factory()->create();
    Contract::factory()->create(['ID_Propiedad' => $alquilada->ID_Propiedad]);

    $this->deleteJson("/api/v1/properties/{$alquilada->ID_Propiedad}")->assertStatus(409);
});
