<?php

declare(strict_types=1);

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

    $this->getJson('/api/v1/payment-methods')->assertUnauthorized();
});

it('lista formas de pago ordenadas por descripción', function () {
    PaymentMethod::factory()->create(['Desc_FP' => 'Transferencia']);
    PaymentMethod::factory()->create(['Desc_FP' => 'Efectivo']);

    $this->getJson('/api/v1/payment-methods')
        ->assertOk()
        ->assertJsonPath('data.0.description', 'Efectivo');
});

it('crea y valida forma de pago', function () {
    $this->postJson('/api/v1/payment-methods', ['description' => 'Mercado Pago'])
        ->assertCreated()
        ->assertJsonPath('data.description', 'Mercado Pago');

    $this->postJson('/api/v1/payment-methods', ['description' => str_repeat('x', 41)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['description']);
});

it('muestra y actualiza una forma de pago', function () {
    $fp = PaymentMethod::factory()->create();

    $this->getJson("/api/v1/payment-methods/{$fp->ID_FP}")
        ->assertOk()
        ->assertJsonPath('data.id', $fp->ID_FP);

    $this->patchJson("/api/v1/payment-methods/{$fp->ID_FP}", ['description' => 'Cheque'])
        ->assertOk()
        ->assertJsonPath('data.description', 'Cheque');
});

it('borra forma de pago libre y 409 con recibos', function () {
    $libre = PaymentMethod::factory()->create();
    $this->deleteJson("/api/v1/payment-methods/{$libre->ID_FP}")->assertNoContent();

    $usada = PaymentMethod::factory()->create();
    Receipt::factory()->create(['ID_FP' => $usada->ID_FP]);

    $this->deleteJson("/api/v1/payment-methods/{$usada->ID_FP}")->assertStatus(409);
});
