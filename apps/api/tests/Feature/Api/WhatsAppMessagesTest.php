<?php

declare(strict_types=1);

use App\Models\Receipt;
use App\Models\User;
use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('lista el historial unificado (recibos + recordatorios)', function () {
    $receipt = Receipt::factory()->create();
    WhatsAppMessage::create([
        'receipt_id' => $receipt->Nro_Recibo, 'type' => 'recibo', 'recipient_phone' => '+5493468495281',
        'recipient_name' => 'Inquilino', 'body' => 'Recibo #1 (PDF)', 'status' => 'sent',
    ]);
    WhatsAppMessage::create([
        'batch_id' => 'b1', 'type' => 'recordatorio_pago', 'recipient_phone' => '+5493514567890',
        'recipient_name' => 'Otro', 'body' => 'Buen día!', 'status' => 'sent',
    ]);

    $this->getJson('/api/v1/whatsapp/messages')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('devuelve el estado de un lote y reintenta los fallidos', function () {
    config(['services.whatsapp.token' => 'T', 'services.whatsapp.phone_number_id' => '100', 'services.whatsapp.template_lang' => 'es']);
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.OK']]])]);

    WhatsAppMessage::create([
        'batch_id' => 'lote1', 'type' => 'recordatorio_pago', 'template' => 'recordatorio_pago',
        'template_vars' => ['Junio', 'VIERNES'], 'recipient_phone' => '+5493468495281',
        'recipient_name' => 'Falló', 'body' => 'x', 'status' => 'failed', 'error' => 'numero invalido',
    ]);

    $this->getJson('/api/v1/whatsapp/batches/lote1')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('failed', 1);

    $this->postJson('/api/v1/whatsapp/batches/lote1/retry')
        ->assertStatus(202)
        ->assertJsonPath('total', 1);

    // El retry creó una fila nueva para el mismo destinatario en otro batch (se envía
    // tras la respuesta vía afterResponse → queda 'sent' con Http::fake).
    expect(WhatsAppMessage::where('recipient_name', 'Falló')->count())->toBe(2);
    expect(WhatsAppMessage::where('recipient_name', 'Falló')->where('status', 'sent')->exists())->toBeTrue();
});
