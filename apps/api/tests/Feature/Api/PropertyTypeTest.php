<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista categorías sin auth (público)', function () {
    PropertyType::factory()->count(2)->create();

    $this->getJson('/api/v1/property-types')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure(['data' => [['id', 'name']]]);
});

it('rechaza crear categoría sin auth', function () {
    $this->postJson('/api/v1/property-types', ['name' => 'Galpones'])->assertUnauthorized();
});

it('crea categoría autenticado', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/v1/property-types', ['name' => 'Galpones'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Galpones');
});

it('rechaza nombre duplicado', function () {
    $this->actingAs(User::factory()->create());
    $type = PropertyType::factory()->create();

    $this->postJson('/api/v1/property-types', ['name' => $type->name])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('devuelve 409 al borrar categoría con propiedades', function () {
    $this->actingAs(User::factory()->create());
    $type = PropertyType::factory()->create();
    SaleProperty::factory()->for($type, 'type')->create();

    $this->deleteJson("/api/v1/property-types/{$type->id}")
        ->assertStatus(409)
        ->assertJsonStructure(['message']);
});
