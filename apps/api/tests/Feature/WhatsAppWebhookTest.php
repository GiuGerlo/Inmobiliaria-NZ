<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\WhatsAppWebhookController;
use App\Models\Setting;
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
