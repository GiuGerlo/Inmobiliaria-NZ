<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppDocument;
use App\Models\Receipt;
use App\Models\WhatsAppMessage;
use App\Services\WhatsAppClient;
use App\Support\PhoneNumber;
use App\Support\ReceiptPdf;
use Illuminate\Console\Command;

/**
 * Dispara un envío real por WhatsApp desde la terminal, sin pasar por la UI.
 * Útil para iterar contra el número de prueba de Meta (sub-I).
 *
 * Ej: php artisan whatsapp:test 1 "+54 9 351 1234567" --type=recibo
 */
final class WhatsAppTestCommand extends Command
{
    protected $signature = 'whatsapp:test {receipt : Nro de recibo} {phone : Teléfono destino} {--type=recibo : recibo|rendicion} {--free : Enviar sin plantilla (ventana 24h, para test)}';

    protected $description = 'Envía un recibo/rendición por WhatsApp para probar el canal';

    public function handle(): int
    {
        $type = $this->option('type');

        if (! in_array($type, [WhatsAppMessage::TYPE_RECIBO, WhatsAppMessage::TYPE_RENDICION], true)) {
            $this->error("type inválido: {$type} (usá recibo|rendicion)");

            return self::FAILURE;
        }

        $receipt = Receipt::find($this->argument('receipt'));
        if (! $receipt) {
            $this->error('Recibo no encontrado.');

            return self::FAILURE;
        }

        $phone = PhoneNumber::toE164($this->argument('phone'));
        if ($phone === null) {
            $this->error('Teléfono inválido (no se pudo normalizar a E.164).');

            return self::FAILURE;
        }

        // Modo --free: documento libre sin plantilla (solo dentro de la ventana de 24h).
        if ($this->option('free')) {
            return $this->sendFree($receipt, $type, $phone);
        }

        $message = WhatsAppMessage::create([
            'receipt_id' => $receipt->Nro_Recibo,
            'type' => $type,
            'recipient_phone' => $phone,
            'status' => WhatsAppMessage::STATUS_QUEUED,
        ]);

        $this->info("Enviando {$type} del recibo #{$receipt->Nro_Recibo} a {$phone}…");

        try {
            SendWhatsAppDocument::dispatchSync($message);
        } catch (\Throwable $e) {
            // dispatchSync no invoca failed(); reflejar el error a mano.
            $message->update([
                'status' => WhatsAppMessage::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);
        }

        $message->refresh();

        if ($message->status === WhatsAppMessage::STATUS_SENT) {
            $this->info("OK ✓ message id: {$message->meta_message_id}");

            return self::SUCCESS;
        }

        $this->error("Falló: {$message->error}");

        return self::FAILURE;
    }

    private function sendFree(Receipt $receipt, string $type, string $phone): int
    {
        $this->info("Enviando {$type} (sin plantilla, ventana 24h) del recibo #{$receipt->Nro_Recibo} a {$phone}…");

        $pdf = tempnam(sys_get_temp_dir(), 'wa_pdf_');

        try {
            ReceiptPdf::for($type, $receipt)->save($pdf);
            $client = app(WhatsAppClient::class);
            $mediaId = $client->uploadMedia($pdf);
            $id = $client->sendDocument($phone, $mediaId, ReceiptPdf::filename($type, $receipt));

            $this->info("OK ✓ message id: {$id}");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Falló: {$e->getMessage()}");

            return self::FAILURE;
        } finally {
            @unlink($pdf);
        }
    }
}
