<?php

declare(strict_types=1);

use App\Models\Contract;
use App\Models\Receipt;
use App\Models\User;
use App\Support\MonthlyPaymentsReport;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('separa pagados y no pagados del mes/año (query parametrizada)', function () {
    $withReceipt = Contract::factory()->create();
    Receipt::factory()->create([
        'ID_Contrato' => $withReceipt->ID_Contrato,
        'Mes_Rend' => 'Marzo',
        'Ano_Rend' => 2026,
    ]);

    $withoutReceipt = Contract::factory()->create();

    // Recibo de otro período: no debe contar como pagado de Marzo/2026.
    Receipt::factory()->create([
        'ID_Contrato' => $withReceipt->ID_Contrato,
        'Mes_Rend' => 'Abril',
        'Ano_Rend' => 2026,
    ]);

    $report = MonthlyPaymentsReport::for('Marzo', 2026);

    expect($report->paid())->toHaveCount(1);
    expect($report->paid()->first()->ID_Contrato)->toBe($withReceipt->ID_Contrato);

    $unpaidIds = $report->unpaid()->pluck('ID_Contrato');
    expect($unpaidIds)->toContain($withoutReceipt->ID_Contrato)
        ->not->toContain($withReceipt->ID_Contrato);
});

it('genera el PDF del listado mensual (inline, %PDF válido)', function () {
    $contract = Contract::factory()->create();
    Receipt::factory()->create(['ID_Contrato' => $contract->ID_Contrato, 'Mes_Rend' => 'Marzo', 'Ano_Rend' => 2026]);
    Contract::factory()->create(); // no pagado

    $response = $this->get('/api/v1/reports/monthly-payments?month=Marzo&year=2026');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect($response->headers->get('content-disposition'))->toContain('inline');
    expect(substr($response->getContent(), 0, 5))->toBe('%PDF-');
})->group('pdf');

it('rechaza mes/año inválidos', function () {
    $this->getJson('/api/v1/reports/monthly-payments?month=Brumario&year=99')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['month', 'year']);
});

it('rechaza el reporte sin sesión', function () {
    auth()->guard('web')->logout();

    $this->getJson('/api/v1/reports/monthly-payments?month=Marzo&year=2026')->assertUnauthorized();
});
