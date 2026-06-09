<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\Receipt;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('navega la cadena completa receipt → contract → owner → city', function () {
    $receipt = Receipt::factory()->create();

    $city = $receipt->contract->owner->city;

    expect($city)->toBeInstanceOf(City::class)
        ->and($city->Nombre_Ciudad)->not->toBeEmpty();
});

it('contract expone tenant y property', function () {
    $contract = Contract::factory()->create();

    expect($contract->tenant->NYA_Inquilino)->not->toBeEmpty()
        ->and($contract->property->Dir_Propiedad)->not->toBeEmpty()
        ->and($contract->F_Inicio->lessThan($contract->F_Fin))->toBeTrue();
});

it('hasMany cuenta bien los recibos de un contrato', function () {
    $contract = Contract::factory()->create();
    Receipt::factory()->count(3)->for($contract, 'contract')->create();

    expect($contract->receipts()->count())->toBe(3);
});

it('city hasMany owners/tenants/properties', function () {
    $city = City::factory()->create();

    Owner::factory()->count(2)->state(['CodP' => $city->CodP])->create();
    Tenant::factory()->state(['CodP' => $city->CodP])->create();

    expect($city->owners()->count())->toBe(2)
        ->and($city->tenants()->count())->toBe(1);
});
