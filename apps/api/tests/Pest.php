<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Pest test bootstrap — Inmobiliaria NZ
|--------------------------------------------------------------------------
*/

pest()->extend(Tests\TestCase::class)
    ->in('Feature');

pest()->extend(Tests\TestCase::class)
    ->in('Unit');
