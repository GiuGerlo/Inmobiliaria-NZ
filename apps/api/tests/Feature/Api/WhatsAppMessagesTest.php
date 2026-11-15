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

    // El retry creó una fila nueva para el mismo destinatario en otro batch. El bulk se
    // despacha a la cola; en tests QUEUE_CONNECTION=sync corre inline → queda 'sent' con Http::fake.
    expect(WhatsAppMessage::where('recipient_name', 'Falló')->count())->toBe(2);
    expect(WhatsAppMessage::where('recipient_name', 'Falló')->where('status', 'sent')->exists())->toBeTrue();
});

it('filtra el historial por nombre/teléfono, rango de fechas y recibo', function () {
    $receipt = Receipt::factory()->create();
    $base = ['type' => 'recordatorio_pago', 'status' => 'sent'];
    $ana = WhatsAppMessage::create($base + ['recipient_name' => 'Ana Ruiz', 'recipient_phone' => '+5493468111111', 'receipt_id' => $receipt->Nro_Recibo]);
    $ana->forceFill(['created_at' => '2026-11-10 10:00:00'])->save();
    $beto = WhatsAppMessage::create($base + ['recipient_name' => 'Beto Paz', 'recipient_phone' => '+5493468222222']);
    $beto->forceFill(['created_at' => '2026-11-14 10:00:00'])->save();

    $names = fn (string $query) => collect($this->getJson("/api/v1/whatsapp/messages?{$query}")->assertOk()->json('data'))
        ->pluck('recipient_name')->all();

    expect($names('filter[q]=ana'))->toBe(['Ana Ruiz'])
        ->and($names('filter[q]=222222'))->toBe(['Beto Paz'])
        ->and($names('filter[from]=2026-11-12'))->toBe(['Beto Paz'])
        ->and($names('filter[to]=2026-11-10'))->toBe(['Ana Ruiz'])
        ->and($names("filter[receipt_id]={$receipt->Nro_Recibo}"))->toBe(['Ana Ruiz']);
});
