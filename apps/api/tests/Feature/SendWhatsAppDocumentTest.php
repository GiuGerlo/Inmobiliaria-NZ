<?php

declare(strict_types=1);

use App\Jobs\SendWhatsAppDocument;
use App\Models\Receipt;
use App\Models\WhatsAppMessage;
use App\Services\WhatsAppClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.whatsapp.token' => 'TEST_TOKEN',
        'services.whatsapp.phone_number_id' => '100200300',
        'services.whatsapp.api_version' => 'v21.0',
        'services.whatsapp.template_recibo' => 'envio_recibo',
        'services.whatsapp.template_rendicion' => 'envio_rendicion',
        'services.whatsapp.template_lang' => 'es',
    ]);
});

function whatsappMessageFor(string $type): WhatsAppMessage
{
    $receipt = Receipt::factory()->create();

    return WhatsAppMessage::create([
        'receipt_id' => $receipt->Nro_Recibo,
        'type' => $type,
        'recipient_phone' => '+5493468495281',
        'status' => WhatsAppMessage::STATUS_QUEUED,
    ]);
}

it('genera el PDF, lo sube y marca el mensaje como enviado', function () {
    Http::fake([
        'graph.facebook.com/*/media' => Http::response(['id' => 'MEDIA123']),
        'graph.facebook.com/*/messages' => Http::response(['messages' => [['id' => 'wamid.OK']]]),
    ]);

    $message = whatsappMessageFor('recibo');

    (new SendWhatsAppDocument($message))->handle(app(WhatsAppClient::class));

    $message->refresh();
    expect($message->status)->toBe('sent');
    expect($message->meta_message_id)->toBe('wamid.OK');
    expect($message->sent_at)->not->toBeNull();
})->group('pdf');

it('marca el mensaje como fallido si Meta rechaza', function () {
    Http::fake([
        'graph.facebook.com/*/media' => Http::response(['id' => 'MEDIA123']),
        'graph.facebook.com/*/messages' => Http::response(['error' => ['message' => 'Invalid template']], 400),
    ]);

    $message = whatsappMessageFor('rendicion');
    $job = new SendWhatsAppDocument($message);

    try {
        $job->handle(app(WhatsAppClient::class));
    } catch (Throwable $e) {
        $job->failed($e);
    }

    $message->refresh();
    expect($message->status)->toBe('failed');
    expect($message->error)->toContain('Invalid template');
})->group('pdf');
