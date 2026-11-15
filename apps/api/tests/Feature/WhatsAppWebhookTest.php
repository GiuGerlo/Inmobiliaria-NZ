<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\WhatsAppWebhookController;
use App\Models\Setting;
use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.whatsapp.app_secret' => 'test-secret',
        'services.whatsapp.webhook_verify_token' => 'verify-abc',
    ]);
});

/** Firma HMAC como la manda Meta sobre el cuerpo crudo. */
function waSign(string $payload): string
{
    return 'sha256='.hash_hmac('sha256', $payload, 'test-secret');
}

function postWebhook(string $payload, ?string $signature): TestResponse
{
    return test()->call(
        'POST',
        '/api/v1/whatsapp/webhook',
        [], [], [],
        array_filter([
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => $signature,
        ]),
        $payload,
    );
}

it('devuelve el challenge cuando el verify token coincide (GET)', function () {
    $this->get('/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-abc&hub.challenge=CH123')
        ->assertOk()
        ->assertSee('CH123');
});

it('rechaza el handshake con verify token incorrecto (GET)', function () {
    $this->get('/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=mal&hub.challenge=CH123')
        ->assertForbidden();
});

it('acepta un POST con firma válida', function () {
    $payload = json_encode(['object' => 'whatsapp_business_account', 'entry' => []]);

    postWebhook($payload, waSign($payload))->assertOk();
});

it('rechaza un POST con firma inválida', function () {
    $payload = json_encode(['object' => 'whatsapp_business_account', 'entry' => []]);

    postWebhook($payload, 'sha256=deadbeef')->assertStatus(401);
    postWebhook($payload, null)->assertStatus(401);
});

it('marca desconectado al recibir ACCOUNT_OFFBOARDED', function () {
    $payload = json_encode([
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => 'WABA1',
            'changes' => [['field' => 'account_update', 'value' => ['event' => 'ACCOUNT_OFFBOARDED']]],
        ]],
    ]);

    postWebhook($payload, waSign($payload))->assertOk();

    expect(Setting::get(WhatsAppWebhookController::CONNECTED_KEY))->toBe('0');
});

it('marca reconectado al recibir ACCOUNT_RECONNECTED', function () {
    Setting::set(WhatsAppWebhookController::CONNECTED_KEY, '0');

    $payload = json_encode([
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => 'WABA1',
            'changes' => [['field' => 'account_update', 'value' => ['event' => 'ACCOUNT_RECONNECTED']]],
        ]],
    ]);

    postWebhook($payload, waSign($payload))->assertOk();

    expect(Setting::get(WhatsAppWebhookController::CONNECTED_KEY))->toBe('1');
});

/** Payload `messages` con un único status de entrega para el wamid dado. */
function statusPayload(string $wamid, string $status, array $extra = []): string
{
    return json_encode([
        'object' => 'whatsapp_business_account',
        'entry' => [[
            'id' => 'WABA1',
            'changes' => [[
                'field' => 'messages',
                'value' => ['statuses' => [array_merge(['id' => $wamid, 'status' => $status], $extra)]],
            ]],
        ]],
    ]);
}

function waMessage(string $status): WhatsAppMessage
{
    return WhatsAppMessage::create([
        'type' => WhatsAppMessage::TYPE_RECIBO,
        'recipient_phone' => '+5493468000000',
        'meta_message_id' => 'wamid.TEST',
        'status' => $status,
    ]);
}

it('avanza el estado a entregado y luego a leído', function () {
    $message = waMessage(WhatsAppMessage::STATUS_SENT);

    $payload = statusPayload('wamid.TEST', 'delivered');
    postWebhook($payload, waSign($payload))->assertOk();
    expect($message->fresh()->status)->toBe('delivered');

    $payload = statusPayload('wamid.TEST', 'read');
    postWebhook($payload, waSign($payload))->assertOk();
    expect($message->fresh()->status)->toBe('read');
});

it('no retrocede si los estados llegan desordenados', function () {
    $message = waMessage(WhatsAppMessage::STATUS_READ);

    $payload = statusPayload('wamid.TEST', 'delivered');
    postWebhook($payload, waSign($payload))->assertOk();

    expect($message->fresh()->status)->toBe('read');
});

it('marca falló con el motivo que manda Meta', function () {
    $message = waMessage(WhatsAppMessage::STATUS_SENT);

    $payload = statusPayload('wamid.TEST', 'failed', [
        'errors' => [['code' => 131026, 'title' => 'Message undeliverable']],
    ]);
    postWebhook($payload, waSign($payload))->assertOk();

    expect($message->fresh())
        ->status->toBe('failed')
        ->error->toBe('131026: Message undeliverable');
});

it('ignora estados de mensajes que no son nuestros', function () {
    $message = waMessage(WhatsAppMessage::STATUS_SENT);

    $payload = statusPayload('wamid.OTRO', 'read');
    postWebhook($payload, waSign($payload))->assertOk();

    expect($message->fresh()->status)->toBe('sent');
});

it('guarda cuándo se entregó y se leyó con la hora que manda Meta', function () {
    $message = waMessage(WhatsAppMessage::STATUS_SENT);

    // Llega solo el "read": entregado se completa con la misma hora.
    $payload = statusPayload('wamid.TEST', 'read', ['timestamp' => '1763226000']);
    postWebhook($payload, waSign($payload))->assertOk();

    $fresh = $message->fresh();
    expect($fresh->read_at->timestamp)->toBe(1763226000)
        ->and($fresh->delivered_at->timestamp)->toBe(1763226000);
});
