<?php

declare(strict_types=1);

use App\Models\Contract;
use App\Models\PaymentMethod;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('rechaza el listado sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/receipts')->assertUnauthorized();
});

it('filtra por mes/año de rendición (query de la rendición mensual)', function () {
    Receipt::factory()->create(['Mes_Rend' => 'Marzo', 'Ano_Rend' => 2026]);
    Receipt::factory()->create(['Mes_Rend' => 'Marzo', 'Ano_Rend' => 2025]);
    Receipt::factory()->create(['Mes_Rend' => 'Abril', 'Ano_Rend' => 2026]);

    $this->getJson('/api/v1/receipts?filter[month]=Marzo&filter[year]=2026')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.month', 'Marzo')
        ->assertJsonPath('data.0.year', 2026);
});

it('filtra por contrato e incluye relaciones anidadas', function () {
    $contract = Contract::factory()->create();
    Receipt::factory()->create(['ID_Contrato' => $contract->ID_Contrato]);
    Receipt::factory()->create();

    $this->getJson("/api/v1/receipts?filter[contract_id]={$contract->ID_Contrato}&include=contract.owner,paymentMethod")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.contract.id', $contract->ID_Contrato)
        ->assertJsonStructure(['data' => [['contract' => ['owner' => ['name']], 'payment_method' => ['description']]]]);
});

it('crea un recibo', function () {
    $contract = Contract::factory()->create();
    $fp = PaymentMethod::factory()->create();

    $this->postJson('/api/v1/receipts', [
        'contract_id' => $contract->ID_Contrato,
        'payment_method_id' => $fp->ID_FP,
        'paid_at' => '2026-06-05',
        'property_amount' => 250_000,
        'municipal_amount' => 3_000,
        'fees_amount' => 25_000,
        'month' => 'Mayo',
        'year' => 2026,
        'comments' => 'Pago en término',
    ])
        ->assertCreated()
        ->assertJsonPath('data.property_amount', 250_000)
        ->assertJsonPath('data.month', 'Mayo');

    $this->assertDatabaseHas('recibo', [
        'ID_Contrato' => $contract->ID_Contrato,
        'Mes_Rend' => 'Mayo',
        'Ano_Rend' => 2026,
    ]);
});

it('rechaza mes inválido y montos negativos', function () {
    $contract = Contract::factory()->create();
    $fp = PaymentMethod::factory()->create();

    $this->postJson('/api/v1/receipts', [
        'contract_id' => $contract->ID_Contrato,
        'payment_method_id' => $fp->ID_FP,
        'paid_at' => '2026-06-05',
        'property_amount' => -100,
        'month' => 'Brumario',
        'year' => 2026,
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['property_amount', 'month']);
});

it('muestra y actualiza un recibo', function () {
    $receipt = Receipt::factory()->create();

    $this->getJson("/api/v1/receipts/{$receipt->Nro_Recibo}")
        ->assertOk()
        ->assertJsonPath('data.number', $receipt->Nro_Recibo);

    $this->patchJson("/api/v1/receipts/{$receipt->Nro_Recibo}", ['comments' => 'Corregido'])
        ->assertOk()
        ->assertJsonPath('data.comments', 'Corregido');
});

it('borra un recibo', function () {
    $receipt = Receipt::factory()->create();

    $this->deleteJson("/api/v1/receipts/{$receipt->Nro_Recibo}")->assertNoContent();

    $this->assertDatabaseMissing('recibo', ['Nro_Recibo' => $receipt->Nro_Recibo]);
});
