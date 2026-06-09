<?php

declare(strict_types=1);

use App\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('devuelve exito con la base íntegra', function () {
    Contract::factory()->create();

    $this->artisan('legacy:check-orphans')->assertSuccessful();
});

it('detecta huérfanos plantados y devuelve fallo', function () {
    Contract::factory()->create();

    // Plantar recibo huérfano esquivando las FKs
    Schema::disableForeignKeyConstraints();
    DB::table('recibo')->insert([
        'ID_FP' => 64000,
        'ID_Contrato' => 65000,
        'F_Pago' => '2026-01-15',
        'Pago_Propiedad' => 100000,
        'Mes_Rend' => 'Enero',
        'Ano_Rend' => 2026,
    ]);
    Schema::enableForeignKeyConstraints();

    $this->artisan('legacy:check-orphans')
        ->expectsOutputToContain('65000')
        ->assertFailed();
});
