<?php

declare(strict_types=1);

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('crea las 8 tablas del dominio legacy', function () {
    foreach (['ciudad', 'dueno', 'inquilino', 'propiedad', 'formadepago', 'contrato', 'recibo', 'users'] as $tableName) {
        expect(Schema::hasTable($tableName))->toBeTrue("falta tabla $tableName");
    }
});

it('aplica las foreign keys (insert huérfano falla)', function () {
    // recibo con contrato inexistente → violación FK
    DB::table('formadepago')->insert(['Desc_FP' => 'Efectivo']);

    expect(fn () => DB::table('recibo')->insert([
        'ID_FP' => 1,
        'ID_Contrato' => 65000,
        'F_Pago' => '2026-01-15',
        'Pago_Propiedad' => 100000,
        'Mes_Rend' => 'Enero',
        'Ano_Rend' => 2026,
    ]))->toThrow(QueryException::class);
});

it('tiene el índice compuesto de rendición mensual', function () {
    $indexes = collect(Schema::getIndexes('recibo'))->pluck('name');

    expect($indexes)->toContain('recibo_mes_ano_index');
});
