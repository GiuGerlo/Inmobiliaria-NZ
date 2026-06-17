<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\WhatsAppMessage;
use App\Services\WhatsAppClient;
use App\Support\ReceiptPdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Genera el PDF del recibo/rendición, lo sube a Meta y manda el mensaje de plantilla
 * con el documento adjunto. Marca el WhatsAppMessage como sent/failed (sub-I).
 */
final class SendWhatsAppDocument implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    /** @var list<int> backoff entre reintentos (segundos). */
    public array $backoff = [10, 30, 60];

    public function __construct(private readonly WhatsAppMessage $message) {}

    public function handle(WhatsAppClient $client): void
    {
        $type = $this->message->type;
        $receipt = $this->message->receipt;

        // ReceiptPdf::for() hace loadMissing de las relaciones (contract.owner/tenant).
        $pdfPath = tempnam(sys_get_temp_dir(), 'wa_pdf_');

        try {
            ReceiptPdf::for($type, $receipt)->save($pdfPath);

            $mediaId = $client->uploadMedia($pdfPath);

            $config = config('services.whatsapp');
            $isRendicion = $type === WhatsAppMessage::TYPE_RENDICION;

            $template = (string) ($isRendicion ? $config['template_rendicion'] : $config['template_recibo']);
            $name = $isRendicion
                ? $receipt->contract->owner->NYA_Dueno
                : $receipt->contract->tenant->NYA_Inquilino;

            $messageId = $client->sendTemplateDocument(
                to: $this->message->recipient_phone,
                template: $template,
                language: (string) $config['template_lang'],
                mediaId: $mediaId,
                filename: ReceiptPdf::filename($type, $receipt),
                bodyVars: [(string) $name, (string) $receipt->Mes_Rend, (string) $receipt->Ano_Rend],
            );

            $this->message->update([
                'status' => WhatsAppMessage::STATUS_SENT,
                'meta_message_id' => $messageId,
                'sent_at' => now(),
            ]);
        } finally {
            @unlink($pdfPath);
        }
    }

    public function failed(Throwable $e): void
    {
        $this->message->update([
            'status' => WhatsAppMessage::STATUS_FAILED,
            'error' => $e->getMessage(),
        ]);
    }
}
