<?php

declare(strict_types=1);

use App\Services\WhatsAppClient;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.whatsapp.token' => 'TEST_TOKEN',
        'services.whatsapp.phone_number_id' => '100200300',
        'services.whatsapp.api_version' => 'v21.0',
    ]);
});

it('sube media y devuelve el media id', function () {
    Http::fake([
        'graph.facebook.com/*/media' => Http::response(['id' => 'MEDIA123']),
    ]);

    $path = tempnam(sys_get_temp_dir(), 'pdf_');
    file_put_contents($path, '%PDF-fake');

    $id = app(WhatsAppClient::class)->uploadMedia($path);

    expect($id)->toBe('MEDIA123');

    Http::assertSent(fn ($request) => str_contains($request->url(), '/v21.0/100200300/media')
        && $request->hasHeader('Authorization', 'Bearer TEST_TOKEN'));

    @unlink($path);
});

it('manda la plantilla con el documento en el header', function () {
    Http::fake([
        'graph.facebook.com/*/messages' => Http::response(['messages' => [['id' => 'wamid.XYZ']]]),
    ]);

    $messageId = app(WhatsAppClient::class)->sendTemplateDocument(
        to: '+5493468495281',
        template: 'envio_recibo',
        language: 'es',
        mediaId: 'MEDIA123',
        filename: 'recibo-7.pdf',
        bodyVars: ['Juan Pérez', 'Junio', '2026'],
    );

    expect($messageId)->toBe('wamid.XYZ');

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $body['to'] === '5493468495281' // sin el "+"
            && $body['type'] === 'template'
            && $body['template']['name'] === 'envio_recibo'
            && $body['template']['components'][0]['parameters'][0]['document']['id'] === 'MEDIA123'
            && $body['template']['components'][1]['parameters'][0]['text'] === 'Juan Pérez';
    });
});

it('lanza excepción cuando Meta responde error', function () {
    Http::fake([
        'graph.facebook.com/*/messages' => Http::response(['error' => ['message' => 'Invalid template']], 400),
    ]);

    app(WhatsAppClient::class)->sendTemplateDocument(
        to: '5493468495281',
        template: 'roto',
        language: 'es',
        mediaId: 'M',
        filename: 'x.pdf',
    );
})->throws(RuntimeException::class, 'Invalid template');
