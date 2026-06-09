<?php

declare(strict_types=1);
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Pest test bootstrap — Inmobiliaria NZ
|--------------------------------------------------------------------------
*/

pest()->extend(TestCase::class)
    ->in('Feature');

pest()->extend(TestCase::class)
    ->in('Unit');
