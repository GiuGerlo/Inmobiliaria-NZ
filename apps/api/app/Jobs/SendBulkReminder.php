<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\WhatsAppMessage;
use App\Support\WhatsAppSender;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Envía un lote de recordatorios de texto (sub-J). Procesa las filas `queued` del
 * batch una por una, marcando cada una sent/failed → el front ve el progreso en vivo
 * poll-eando el batch. Cada fila lleva su plantilla + variables; un fallo no corta el
 * lote (lo maneja WhatsAppSender).
 */
final class SendBulkReminder implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly string $batchId) {}

    public function handle(WhatsAppSender $sender): void
    {
        WhatsAppMessage::query()
            ->where('batch_id', $this->batchId)
            ->where('status', WhatsAppMessage::STATUS_QUEUED)
            ->get()
            ->each(fn (WhatsAppMessage $message) => $sender->send($message));
    }
}
