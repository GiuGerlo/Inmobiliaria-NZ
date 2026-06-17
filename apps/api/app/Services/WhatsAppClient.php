<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente de WhatsApp Cloud API oficial (Meta). Sube el PDF como media y manda un
 * mensaje de plantilla con el documento en el header. El token vive en config/.env
 * y nunca se loguea (sub-I, ADR-0008).
 */
final class WhatsAppClient
{
    private string $token;

    private string $phoneNumberId;

    private string $apiVersion;

    public function __construct()
    {
        $config = config('services.whatsapp');

        $this->token = (string) ($config['token'] ?? '');
        $this->phoneNumberId = (string) ($config['phone_number_id'] ?? '');
        $this->apiVersion = (string) ($config['api_version'] ?? 'v21.0');
    }

    /** Sube un PDF y devuelve el media_id de Meta. */
    public function uploadMedia(string $path, string $mime = 'application/pdf'): string
    {
        $response = Http::withToken($this->token)
            ->attach('file', file_get_contents($path), basename($path), ['Content-Type' => $mime])
            ->post($this->url('media'), [
                'messaging_product' => 'whatsapp',
                'type' => $mime,
            ]);

        $this->ensureOk($response, 'uploadMedia');

        $id = $response->json('id');

        if (! is_string($id) || $id === '') {
            throw new RuntimeException('WhatsApp uploadMedia: respuesta sin media id.');
        }

        return $id;
    }

    /**
     * Manda un mensaje de plantilla con el PDF en el header de documento.
     *
     * @param  list<string>  $bodyVars  valores de las variables del cuerpo, en orden
     * @return string meta_message_id
     */
    public function sendTemplateDocument(
        string $to,
        string $template,
        string $language,
        string $mediaId,
        string $filename,
        array $bodyVars = [],
    ): string {
        $components = [[
            'type' => 'header',
            'parameters' => [[
                'type' => 'document',
                'document' => ['id' => $mediaId, 'filename' => $filename],
            ]],
        ]];

        if ($bodyVars !== []) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(
                    static fn (string $v) => ['type' => 'text', 'text' => $v],
                    $bodyVars,
                ),
            ];
        }

        $response = Http::withToken($this->token)
            ->post($this->url('messages'), [
                'messaging_product' => 'whatsapp',
                'to' => ltrim($to, '+'),
                'type' => 'template',
                'template' => [
                    'name' => $template,
                    'language' => ['code' => $language],
                    'components' => $components,
                ],
            ]);

        $this->ensureOk($response, 'sendTemplateDocument');

        $id = $response->json('messages.0.id');

        if (! is_string($id) || $id === '') {
            throw new RuntimeException('WhatsApp sendTemplateDocument: respuesta sin message id.');
        }

        return $id;
    }

    /**
     * Manda un documento SIN plantilla (mensaje libre). Solo funciona dentro de la
     * ventana de 24 h (el destinatario escribió primero). Para test/iteración.
     */
    public function sendDocument(string $to, string $mediaId, string $filename, string $caption = ''): string
    {
        $document = ['id' => $mediaId, 'filename' => $filename];
        if ($caption !== '') {
            $document['caption'] = $caption;
        }

        $response = Http::withToken($this->token)
            ->post($this->url('messages'), [
                'messaging_product' => 'whatsapp',
                'to' => ltrim($to, '+'),
                'type' => 'document',
                'document' => $document,
            ]);

        $this->ensureOk($response, 'sendDocument');

        $id = $response->json('messages.0.id');

        if (! is_string($id) || $id === '') {
            throw new RuntimeException('WhatsApp sendDocument: respuesta sin message id.');
        }

        return $id;
    }

    private function url(string $endpoint): string
    {
        return "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/{$endpoint}";
    }

    private function ensureOk(Response $response, string $op): void
    {
        if ($response->failed()) {
            // El mensaje de error de Meta (sin token: nunca se incluye en el body).
            $error = $response->json('error.message') ?? 'error desconocido';

            throw new RuntimeException("WhatsApp {$op} falló ({$response->status()}): {$error}");
        }
    }
}
