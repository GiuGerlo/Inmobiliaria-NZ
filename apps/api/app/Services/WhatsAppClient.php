<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Cliente de WhatsApp Cloud API oficial (Meta). Sube el PDF como media y manda
 * mensajes de plantilla (con documento o solo texto). Loguea cada intento + la
 * respuesta/error completo de Meta en el canal `whatsapp` (storage/logs/whatsapp/).
 * El token vive en config/.env y NUNCA se loguea (sub-I/J, ADR-0008).
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

        $this->ensureOk($response, 'uploadMedia', ['file' => basename($path)]);

        $id = $response->json('id');

        if (! is_string($id) || $id === '') {
            throw new RuntimeException('WhatsApp uploadMedia: respuesta sin media id.');
        }

        Log::channel('whatsapp')->info('uploadMedia OK', ['media_id' => $id]);

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

        return $this->messageId($response, 'sendTemplateDocument', $to, $template);
    }

    /**
     * Manda un mensaje de plantilla de SOLO texto (sin header de documento).
     *
     * @param  list<string>  $bodyVars  valores de las variables del cuerpo, en orden
     * @return string meta_message_id
     */
    public function sendTemplate(string $to, string $template, string $language, array $bodyVars = []): string
    {
        $components = [];
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

        return $this->messageId($response, 'sendTemplate', $to, $template);
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

        return $this->messageId($response, 'sendDocument', $to, null);
    }

    private function url(string $endpoint): string
    {
        return "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/{$endpoint}";
    }

    /** Valida la respuesta de un /messages, loguea y devuelve el message id. */
    private function messageId(Response $response, string $op, string $to, ?string $template): string
    {
        $this->ensureOk($response, $op, array_filter(['to' => $to, 'template' => $template]));

        $id = $response->json('messages.0.id');

        if (! is_string($id) || $id === '') {
            throw new RuntimeException("WhatsApp {$op}: respuesta sin message id.");
        }

        Log::channel('whatsapp')->info("{$op} OK", ['to' => $to, 'message_id' => $id]);

        return $id;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function ensureOk(Response $response, string $op, array $context = []): void
    {
        if (! $response->failed()) {
            return;
        }

        // El cuerpo de error de Meta NUNCA incluye el token; se loguea completo.
        $error = $response->json('error.message') ?? 'error desconocido';
        $code = $response->json('error.code');
        $details = $response->json('error.error_data.details');

        Log::channel('whatsapp')->error("{$op} FALLÓ", array_merge($context, [
            'status' => $response->status(),
            'meta_error' => $response->json('error') ?? $response->body(),
        ]));

        $message = "WhatsApp {$op} falló ({$response->status()}): {$error}";
        if ($code) {
            $message .= " [code {$code}]";
        }
        if ($details) {
            $message .= " — {$details}";
        }

        throw new RuntimeException($message);
    }
}
