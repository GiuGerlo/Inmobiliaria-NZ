<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('inmobiliaria no puede escribir ventas (403)', function () {
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->postJson('/api/v1/property-types', ['name' => 'X'])->assertForbidden();
    $this->postJson('/api/v1/sale-properties', ['title' => 'X'])->assertForbidden();

    $property = SaleProperty::factory()->create();
    $this->patchJson("/api/v1/sale-properties/{$property->id}", ['is_sold' => true])->assertForbidden();
    $this->deleteJson("/api/v1/sale-properties/{$property->id}")->assertForbidden();
    $this->patchJson('/api/v1/sale-properties/reorder', ['ids' => [$property->id]])->assertForbidden();
});

it('superadmin sí puede escribir ventas', function () {
    $this->actingAs(User::factory()->superadmin()->create());
    $type = PropertyType::factory()->create();

    $this->postJson('/api/v1/sale-properties', [
        'property_type_id' => $type->id,
        'title' => 'Casa',
    ])->assertCreated();
});

it('la lectura pública de ventas sigue sin auth', function () {
    SaleProperty::factory()->count(2)->create();

    $this->getJson('/api/v1/sale-properties')->assertOk()->assertJsonCount(2, 'data');
    $this->getJson('/api/v1/property-types')->assertOk();
});

it('/me expone el rol del usuario', function () {
    $this->actingAs(User::factory()->superadmin()->create());

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('data.role', 'superadmin')
        ->assertJsonPath('data.is_superadmin', true);
});
