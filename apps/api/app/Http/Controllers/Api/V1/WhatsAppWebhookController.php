<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Webhook público de WhatsApp Cloud API (coexistencia). Requisito de Meta para el
 * onboarding "WhatsApp Business app" (Tech Provider): Meta llama acá y hay que
 * "digerir" los eventos. No es una bandeja de entrada — solo valida, ACK 200 y
 * reacciona a `account_update` (offboard/reconnect) para pausar/reanudar envíos.
 *
 * Autenticación: GET por verify token (handshake), POST por firma HMAC-SHA256 del
 * cuerpo crudo con el App Secret (X-Hub-Signature-256). No usa auth:sanctum.
 */
final class WhatsAppWebhookController extends Controller
{
    /** Clave en `settings`: '1' conectado, '0' desconectado (offboarded). */
    public const CONNECTED_KEY = 'whatsapp_connected';

    /** Handshake de verificación (GET): Meta manda hub.mode/hub.verify_token/hub.challenge. */
    public function verify(Request $request): Response
    {
        // PHP convierte los puntos de las query keys en guiones bajos (hub.mode → hub_mode).
        $token = (string) config('services.whatsapp.webhook_verify_token');

        if ($token !== ''
            && $request->query('hub_mode') === 'subscribe'
            && hash_equals($token, (string) $request->query('hub_verify_token'))
        ) {
            return response((string) $request->query('hub_challenge'), 200)
                ->header('Content-Type', 'text/plain');
        }

        return response('Forbidden', 403);
    }

    /** Recepción (POST): valida firma, reacciona a account_update, siempre ACK 200. */
    public function receive(Request $request): Response
    {
        if (! $this->validSignature($request)) {
            return response('Invalid signature', 401);
        }

        foreach ((array) $request->input('entry', []) as $entry) {
            foreach ((array) ($entry['changes'] ?? []) as $change) {
                if (($change['field'] ?? null) !== 'account_update') {
                    continue;
                }

                $event = $change['value']['event'] ?? null;

                if (in_array($event, ['ACCOUNT_OFFBOARDED', 'PARTNER_REMOVED'], true)) {
                    Setting::set(self::CONNECTED_KEY, '0');
                } elseif ($event === 'ACCOUNT_RECONNECTED') {
                    Setting::set(self::CONNECTED_KEY, '1');
                }

                // Solo el tipo de evento — nunca el payload (puede traer PII de mensajes).
                Log::channel('whatsapp')->info('webhook account_update', ['event' => $event]);
            }
        }

        // Meta reintenta si no recibe 200 rápido. El resto de fields (history, smb_*) se ACKean.
        return response('', 200);
    }

    private function validSignature(Request $request): bool
    {
        $secret = (string) config('services.whatsapp.app_secret');
        $header = (string) $request->header('X-Hub-Signature-256', '');

        if ($secret === '' || $header === '') {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $header);
    }
}
