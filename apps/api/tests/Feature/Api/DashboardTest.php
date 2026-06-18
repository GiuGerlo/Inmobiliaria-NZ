<?php

declare(strict_types=1);

use App\Models\Contract;
use App\Models\Receipt;
use App\Models\User;
use App\Support\DashboardData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Tiempo congelado para que las ventanas de fechas sean deterministas.
    $this->travelTo(Carbon::create(2026, 6, 15));
    $this->actingAs(User::factory()->create());
});

/** Contrato vigente: empezó en el pasado y termina en $endInDays días. */
function activeContract(int $endInDays = 365): Contract
{
    return Contract::factory()->create([
        'F_Inicio' => now()->subYear()->toDateString(),
        'F_Fin' => now()->addDays($endInDays)->toDateString(),
    ]);
}

it('cuenta contratos activos y recibos del mes actual', function () {
    activeContract();
    activeContract();
    // Vencido: no cuenta como activo.
    Contract::factory()->create([
        'F_Inicio' => now()->subYears(3)->toDateString(),
        'F_Fin' => now()->subMonth()->toDateString(),
    ]);

    $paid = activeContract();
    Receipt::factory()->create([
        'ID_Contrato' => $paid->ID_Contrato,
        'Mes_Rend' => 'Junio',
        'Ano_Rend' => 2026,
    ]);

    $totals = DashboardData::now()->totals();

    expect($totals['active_contracts'])->toBe(3);
    expect($totals['receipts_this_month'])->toBe(1);
});

it('lista contratos por vencer respetando la ventana de 90 días', function () {
    $soon = activeContract(89);   // dentro de la ventana
    activeContract(91);           // fuera de la ventana
    // Vencido: ni activo ni por vencer.
    Contract::factory()->create([
        'F_Inicio' => now()->subYears(2)->toDateString(),
        'F_Fin' => now()->subDay()->toDateString(),
    ]);

    $ids = DashboardData::now()->expiringContracts(90)->pluck('ID_Contrato');

    expect($ids)->toHaveCount(1)->toContain($soon->ID_Contrato);
});

it('lista recibos pendientes excluyendo vencidos y ya cobrados', function () {
    $pending = activeContract();

    $paid = activeContract();
    Receipt::factory()->create([
        'ID_Contrato' => $paid->ID_Contrato,
        'Mes_Rend' => 'Junio',
        'Ano_Rend' => 2026,
    ]);

    $expired = Contract::factory()->create([
        'F_Inicio' => now()->subYears(2)->toDateString(),
        'F_Fin' => now()->subDay()->toDateString(),
    ]);

    $ids = DashboardData::now()->pendingReceipts()->pluck('ID_Contrato');

    expect($ids)->toContain($pending->ID_Contrato)
        ->not->toContain($paid->ID_Contrato)
        ->not->toContain($expired->ID_Contrato);
});

it('devuelve los últimos recibos, el más nuevo primero', function () {
    $contract = activeContract();
    foreach ([10, 25, 40] as $nro) {
        Receipt::factory()->create(['Nro_Recibo' => $nro, 'ID_Contrato' => $contract->ID_Contrato]);
    }

    $numbers = DashboardData::now()->latestReceipts(2)->pluck('Nro_Recibo');

    expect($numbers)->toHaveCount(2);
    expect($numbers->all())->toBe([40, 25]);
});

it('lista solo contratos con saldo > 0, el mayor primero', function () {
    activeContract();                                  // saldo 0 por default → no aparece
    $a = Contract::factory()->create(['Saldo' => 5000]);
    $b = Contract::factory()->create(['Saldo' => 12000]);

    $ids = DashboardData::now()->contractsWithBalance()->pluck('ID_Contrato');

    expect($ids->all())->toBe([$b->ID_Contrato, $a->ID_Contrato]);
});

it('responde el dashboard con la estructura esperada', function () {
    $contract = activeContract(30);

    $this->getJson('/api/v1/dashboard')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'totals' => [
                    'properties',
                    'owners',
                    'tenants',
                    'active_contracts',
                    'receipts_this_month',
                ],
                'pending_receipts' => [['id', 'owner', 'tenant', 'property']],
                'expiring_contracts' => [['days_left', 'contract' => ['id']]],
                'latest_receipts',
                'contracts_with_balance',
            ],
        ]);
});

it('respeta month/year para mirar los pendientes de otro período', function () {
    // Recibo de mayo: pendiente en junio, ya cobrado al mirar mayo.
    $contract = activeContract();
    Receipt::factory()->create([
        'ID_Contrato' => $contract->ID_Contrato,
        'Mes_Rend' => 'Mayo',
        'Ano_Rend' => 2026,
    ]);

    $junio = collect($this->getJson('/api/v1/dashboard')->json('data.pending_receipts'))
        ->pluck('id');
    $mayo = collect($this->getJson('/api/v1/dashboard?month=Mayo&year=2026')->json('data.pending_receipts'))
        ->pluck('id');

    expect($junio)->toContain($contract->ID_Contrato);
    expect($mayo)->not->toContain($contract->ID_Contrato);
});

it('rechaza un mes inválido en el dashboard', function () {
    $this->getJson('/api/v1/dashboard?month=Foo&year=2026')->assertStatus(422);
});

it('rechaza el dashboard sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/dashboard')->assertUnauthorized();
});
