<?php

declare(strict_types=1);

use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('genera el PDF del recibo (inline, %PDF válido)', function () {
    $receipt = Receipt::factory()->create();

    $response = $this->get("/api/v1/receipts/{$receipt->Nro_Recibo}/pdf");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect($response->headers->get('content-disposition'))->toContain('inline');
    expect(substr($response->getContent(), 0, 5))->toBe('%PDF-');
})->group('pdf');

it('genera el PDF de la rendición (inline, %PDF válido)', function () {
    $receipt = Receipt::factory()->create();

    $response = $this->get("/api/v1/receipts/{$receipt->Nro_Recibo}/settlement");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect($response->headers->get('content-disposition'))->toContain('inline');
    expect(substr($response->getContent(), 0, 5))->toBe('%PDF-');
})->group('pdf');

it('rechaza el PDF del recibo sin sesión', function () {
    auth()->guard('web')->logout();

    $receipt = Receipt::factory()->create();

    $this->getJson("/api/v1/receipts/{$receipt->Nro_Recibo}/pdf")->assertUnauthorized();
});

it('devuelve 404 si el recibo no existe', function () {
    $this->getJson('/api/v1/receipts/999999/pdf')->assertNotFound();
})->group('pdf');
