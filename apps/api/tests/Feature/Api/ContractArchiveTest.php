<?php

declare(strict_types=1);

use App\Models\Contract;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('archiva y reactiva un contrato', function () {
    $contract = Contract::factory()->create();

    $this->postJson("/api/v1/contracts/{$contract->ID_Contrato}/archive")
        ->assertOk()
        ->assertJsonPath('data.id', $contract->ID_Contrato);
    expect($contract->fresh()->archived_at)->not->toBeNull();

    $this->deleteJson("/api/v1/contracts/{$contract->ID_Contrato}/archive")
        ->assertOk()
        ->assertJsonPath('data.archived_at', null);
    expect($contract->fresh()->archived_at)->toBeNull();
});

it('el listado oculta archivados por defecto y los muestra con el filtro', function () {
    $vigente = Contract::factory()->create();
    $archivado = Contract::factory()->create(['archived_at' => now()]);

    $this->getJson('/api/v1/contracts')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $vigente->ID_Contrato);

    $this->getJson('/api/v1/contracts?filter[archived]=1')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $archivado->ID_Contrato);

    $this->getJson('/api/v1/contracts?filter[archived]=all')->assertJsonCount(2, 'data');
});

it('un archivado no cuenta como activo ni aparece en el dashboard', function () {
    $fechas = ['F_Inicio' => now()->subYear()->toDateString(), 'F_Fin' => now()->addMonth()->toDateString()];
    Contract::factory()->create($fechas);
    Contract::factory()->create([...$fechas, 'archived_at' => now(), 'Saldo' => 5000]);

    expect(Contract::query()->active()->count())->toBe(1);

    $this->getJson('/api/v1/dashboard')
        ->assertOk()
        ->assertJsonPath('data.totals.active_contracts', 1)
        ->assertJsonCount(1, 'data.pending_receipts')
        ->assertJsonCount(0, 'data.contracts_with_balance');
});

it('no permite crear un recibo para un contrato archivado', function () {
    $contract = Contract::factory()->create(['archived_at' => now()]);

    $this->postJson('/api/v1/receipts', [
        'contract_id' => $contract->ID_Contrato,
        'payment_method_id' => PaymentMethod::factory()->create()->ID_FP,
        'paid_at' => '2026-06-05',
    ])->assertUnprocessable()->assertJsonValidationErrors('contract_id');
});
