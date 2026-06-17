<?php

declare(strict_types=1);

use App\Support\PhoneNumber;

it('normaliza números argentinos válidos a E.164', function (string $raw) {
    expect(PhoneNumber::toE164($raw))->toStartWith('+54');
})->with([
    '3468495281',
    '+54 9 3468 49-5281',
    '+5493468495281',
    '3514567890',
]);

it('devuelve null para números inválidos o vacíos', function (?string $raw) {
    expect(PhoneNumber::toE164($raw))->toBeNull();
})->with([
    '0',
    'basura',
    '',
    null,
]);
