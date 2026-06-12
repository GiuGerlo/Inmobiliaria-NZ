<?php

declare(strict_types=1);

use App\Models\Contract;
use App\Models\Owner;
use App\Models\Property;
use App\Models\Receipt;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/contracts')->assertUnauthorized();
});

it('lista contratos filtrados por dueño con includes', function () {
    $owner = Owner::factory()->create();
    Contract::factory()->create(['ID_Dueno' => $owner->ID_Dueno]);
    Contract::factory()->count(2)->create();

    $this->getJson("/api/v1/contracts?filter[owner_id]={$owner->ID_Dueno}&include=owner,tenant,property")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.owner.id', $owner->ID_Dueno)
        ->assertJsonStructure(['data' => [['tenant' => ['name'], 'property' => ['address']]]]);
});

it('crea un contrato', function () {
    $owner = Owner::factory()->create();
    $tenant = Tenant::factory()->create();
    $property = Property::factory()->create();

    $this->postJson('/api/v1/contracts', [
        'owner_id' => $owner->ID_Dueno,
        'tenant_id' => $tenant->ID_Inquilino,
        'property_id' => $property->ID_Propiedad,
        'start_date' => '2026-07-01',
        'end_date' => '2028-06-30',
        'balance' => 0,
        'certification' => 'Si',
    ])
        ->assertCreated()
        ->assertJsonPath('data.start_date', '2026-07-01')
        ->assertJsonPath('data.certification', 'Si');
});

it('rechaza end_date anterior a start_date y certification inválida', function () {
    $owner = Owner::factory()->create();
    $tenant = Tenant::factory()->create();
    $property = Property::factory()->create();

    $this->postJson('/api/v1/contracts', [
        'owner_id' => $owner->ID_Dueno,
        'tenant_id' => $tenant->ID_Inquilino,
        'property_id' => $property->ID_Propiedad,
        'start_date' => '2026-07-01',
        'end_date' => '2026-06-30',
        'certification' => 'Quizás',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['end_date', 'certification']);
});

it('al actualizar una fecha exige las dos', function () {
    $contract = Contract::factory()->create();

    $this->patchJson("/api/v1/contracts/{$contract->ID_Contrato}", [
        'end_date' => '2030-01-01',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['start_date']);

    $this->patchJson("/api/v1/contracts/{$contract->ID_Contrato}", [
        'start_date' => '2026-01-01',
        'end_date' => '2030-01-01',
    ])
        ->assertOk()
        ->assertJsonPath('data.end_date', '2030-01-01');
});

it('muestra un contrato con sus relaciones', function () {
    $contract = Contract::factory()->create();

    $this->getJson("/api/v1/contracts/{$contract->ID_Contrato}")
        ->assertOk()
        ->assertJsonPath('data.id', $contract->ID_Contrato)
        ->assertJsonStructure(['data' => ['owner', 'tenant', 'property']]);
});

it('borra contrato sin recibos y 409 con recibos', function () {
    $libre = Contract::factory()->create();
    $this->deleteJson("/api/v1/contracts/{$libre->ID_Contrato}")->assertNoContent();

    $conRecibos = Contract::factory()->create();
    Receipt::factory()->create(['ID_Contrato' => $conRecibos->ID_Contrato]);

    $this->deleteJson("/api/v1/contracts/{$conRecibos->ID_Contrato}")
        ->assertStatus(409)
        ->assertJsonPath('message', 'No se puede eliminar el contrato: tiene recibos asociados.');
});
