<?php

declare(strict_types=1);

use App\Jobs\SendWhatsAppDocument;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\Receipt;
use App\Models\Tenant;
use App\Models\User;
use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Queue::fake();
});

/** Recibo con dueño/inquilino de teléfono válido y determinista. */
function receiptWithValidPhones(): Receipt
{
    $tenant = Tenant::factory()->create(['Tel_Inquilino' => '3468495281']);
    $owner = Owner::factory()->create(['Tel_Dueno' => '3468495281']);
    $contract = Contract::factory()->create([
        'ID_Inquilino' => $tenant->ID_Inquilino,
        'ID_Dueno' => $owner->ID_Dueno,
    ]);

    return Receipt::factory()->create(['ID_Contrato' => $contract->ID_Contrato]);
}

it('encola el envío del recibo y registra el mensaje', function () {
    $receipt = receiptWithValidPhones();

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", ['type' => 'recibo'])
        ->assertStatus(202)
        ->assertJsonPath('data.status', 'queued')
        ->assertJsonPath('data.type', 'recibo');

    $this->assertDatabaseHas('whatsapp_messages', [
        'receipt_id' => $receipt->Nro_Recibo,
        'type' => 'recibo',
        'status' => 'queued',
        'recipient_phone' => '+543468495281',
    ]);

    // El body guardado es el texto real del mensaje (no "Recibo #N (PDF)").
    $body = WhatsAppMessage::query()->value('body');
    expect($body)->toContain('te enviamos el recibo de alquiler de')
        ->toContain("{$receipt->Mes_Rend}/{$receipt->Ano_Rend}");

    Queue::assertPushed(SendWhatsAppDocument::class);
});

it('usa el teléfono override normalizado a E.164', function () {
    $receipt = receiptWithValidPhones();

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", [
        'type' => 'rendicion',
        'phone' => '+54 9 3468 49-5281',
    ])->assertStatus(202);

    $this->assertDatabaseHas('whatsapp_messages', [
        'receipt_id' => $receipt->Nro_Recibo,
        'type' => 'rendicion',
        'recipient_phone' => '+5493468495281',
    ]);
});

it('rechaza con 422 un teléfono inválido y no encola', function () {
    $receipt = receiptWithValidPhones();

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", [
        'type' => 'recibo',
        'phone' => 'basura',
    ])->assertStatus(422)->assertJsonValidationErrors('phone');

    $this->assertDatabaseCount('whatsapp_messages', 0);
    Queue::assertNothingPushed();
});

it('rechaza un tipo inválido con 422', function () {
    $receipt = receiptWithValidPhones();

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", ['type' => 'spam'])
        ->assertStatus(422)->assertJsonValidationErrors('type');
});

it('rechaza el envío sin sesión', function () {
    auth()->guard('web')->logout();
    $receipt = receiptWithValidPhones();

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", ['type' => 'recibo'])
        ->assertUnauthorized();
});
