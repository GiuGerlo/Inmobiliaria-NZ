<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Owner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/cities')->assertUnauthorized();
});

it('lista ciudades paginadas con meta y links', function () {
    City::factory()->count(3)->create();

    $this->getJson('/api/v1/cities')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['code', 'name', 'province']],
            'meta' => ['current_page', 'per_page', 'total'],
            'links',
        ]);
});

it('respeta per_page con tope de 100', function () {
    City::factory()->count(3)->create();

    $this->getJson('/api/v1/cities?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.per_page', 2);

    $this->getJson('/api/v1/cities?per_page=5000')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 100);
});

it('filtra por provincia y busca con q', function () {
    City::factory()->create(['Nombre_Ciudad' => 'Armstrong', 'Provincia' => 'Santa Fe']);
    City::factory()->create(['Nombre_Ciudad' => 'Villa María', 'Provincia' => 'Córdoba']);

    $this->getJson('/api/v1/cities?filter[province]=Santa Fe')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Armstrong');

    $this->getJson('/api/v1/cities?q=villa')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Villa María');
});

it('ordena descendente con sort=-name', function () {
    City::factory()->create(['Nombre_Ciudad' => 'Alcorta']);
    City::factory()->create(['Nombre_Ciudad' => 'Zenón Pereyra']);

    $this->getJson('/api/v1/cities?sort=-name')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Zenón Pereyra');
});

it('crea una ciudad', function () {
    $this->postJson('/api/v1/cities', [
        'code' => '2587',
        'name' => 'Las Parejas',
        'province' => 'Santa Fe',
    ])
        ->assertCreated()
        ->assertJsonPath('data.code', '2587');

    $this->assertDatabaseHas('ciudad', ['CodP' => '2587', 'Nombre_Ciudad' => 'Las Parejas']);
});

it('rechaza código duplicado', function () {
    $city = City::factory()->create();

    $this->postJson('/api/v1/cities', [
        'code' => $city->CodP,
        'name' => 'Otra',
        'province' => 'Santa Fe',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

it('muestra una ciudad y 404 si no existe', function () {
    $city = City::factory()->create();

    $this->getJson("/api/v1/cities/{$city->CodP}")
        ->assertOk()
        ->assertJsonPath('data.code', $city->CodP);

    $this->getJson('/api/v1/cities/inexistente')->assertNotFound();
});

it('actualiza nombre y provincia', function () {
    $city = City::factory()->create();

    $this->patchJson("/api/v1/cities/{$city->CodP}", ['name' => 'Renombrada'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Renombrada');
});

it('borra una ciudad sin dependencias', function () {
    $city = City::factory()->create();

    $this->deleteJson("/api/v1/cities/{$city->CodP}")->assertNoContent();

    $this->assertDatabaseMissing('ciudad', ['CodP' => $city->CodP]);
});

it('devuelve 409 al borrar ciudad con dueños', function () {
    $city = City::factory()->create();
    Owner::factory()->create(['CodP' => $city->CodP]);

    $this->deleteJson("/api/v1/cities/{$city->CodP}")
        ->assertStatus(409)
        ->assertJsonStructure(['message']);

    $this->assertDatabaseHas('ciudad', ['CodP' => $city->CodP]);
});
