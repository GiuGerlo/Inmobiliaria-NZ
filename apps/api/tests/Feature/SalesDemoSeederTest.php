<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('siembra categorías y propiedades de venta demo', function () {
    $this->seed(SalesDemoSeeder::class);

    expect(PropertyType::count())->toBeGreaterThanOrEqual(6)
        ->and(SaleProperty::count())->toBe(8)
        ->and(SaleProperty::where('is_sold', true)->count())->toBeGreaterThan(0);
});

it('es idempotente (no duplica al re-correr)', function () {
    $this->seed(SalesDemoSeeder::class);
    $this->seed(SalesDemoSeeder::class);

    expect(SaleProperty::count())->toBe(8)
        ->and(PropertyType::count())->toBe(6);
});
