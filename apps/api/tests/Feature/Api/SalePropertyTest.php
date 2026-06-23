<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista propiedades sin auth con meta de paginación', function () {
    SaleProperty::factory()->count(3)->create();

    $this->getJson('/api/v1/sale-properties')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'slug', 'title', 'is_sold', 'images', 'type']],
            'meta' => ['current_page', 'per_page', 'total'],
        ]);
});

it('filtra por tipo y por vendida', function () {
    $casas = PropertyType::factory()->create(['name' => 'Casas']);
    SaleProperty::factory()->for($casas, 'type')->create();
    SaleProperty::factory()->sold()->create();

    $this->getJson("/api/v1/sale-properties?filter[type]={$casas->id}")
        ->assertOk()->assertJsonCount(1, 'data');

    $this->getJson('/api/v1/sale-properties?filter[sold]=1')
        ->assertOk()->assertJsonCount(1, 'data');
});

it('muestra el detalle público con imágenes', function () {
    $property = SaleProperty::factory()->create();

    $this->getJson("/api/v1/sale-properties/{$property->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $property->id)
        ->assertJsonStructure(['data' => ['images', 'type']]);
});

it('rechaza crear sin auth', function () {
    $this->postJson('/api/v1/sale-properties', ['title' => 'X'])->assertUnauthorized();
});

it('crea, edita y borra autenticado', function () {
    $this->actingAs(User::factory()->superadmin()->create());
    $type = PropertyType::factory()->create();

    $id = $this->postJson('/api/v1/sale-properties', [
        'property_type_id' => $type->id,
        'title' => 'Casa céntrica',
    ])->assertCreated()->json('data.id');

    $this->patchJson("/api/v1/sale-properties/{$id}", ['is_sold' => true])
        ->assertOk()->assertJsonPath('data.is_sold', true);

    $this->deleteJson("/api/v1/sale-properties/{$id}")->assertNoContent();
    $this->assertDatabaseMissing('sale_properties', ['id' => $id]);
});
