<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\WhatsAppMessage;
use App\Services\WhatsAppClient;
use Throwable;

/**
 * Envía un mensaje de texto por WhatsApp a partir de una fila ya creada en
 * whatsapp_messages y la marca sent/failed (sub-J). Centraliza el "enviar + loguear"
 * que usan el job masivo y el envío de faltantes.
 */
final class WhatsAppSender
{
    public function __construct(private readonly WhatsAppClient $client) {}

    /** Envía una fila ya creada usando su plantilla + variables y la marca sent/failed. */
    public function send(WhatsAppMessage $message): void
    {
        try {
            $id = $this->client->sendTemplate(
                $message->recipient_phone,
                (string) $message->template,
                (string) config("services.whatsapp.template_langs.{$message->type}", config('services.whatsapp.template_lang')),
                array_values($message->template_vars ?? []),
            );
            $message->update([
                'status' => WhatsAppMessage::STATUS_SENT,
                'meta_message_id' => $id,
                'sent_at' => now(),
            ]);
        } catch (Throwable $e) {
            $message->update([
                'status' => WhatsAppMessage::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
