<?php

declare(strict_types=1);

use App\Models\City;
use App\Models\Contract;
use App\Models\PaymentMethod;
use App\Models\Receipt;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('DemoSeeder produce el dataset esperado', function () {
    $this->seed(DemoSeeder::class);

    expect(City::query()->count())->toBe(5)
        ->and(PaymentMethod::query()->count())->toBe(3)
        ->and(Contract::query()->count())->toBe(12)
        ->and(Receipt::query()->count())->toBe(30);
});
