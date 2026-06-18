<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WhatsAppMessageResource;
use App\Jobs\SendBulkReminder;
use App\Models\WhatsAppMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Historial unificado de mensajes de WhatsApp (recibos, rendiciones y recordatorios)
 * y estado en vivo de un lote para el progreso de envío (sub-J).
 */
final class WhatsAppMessageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $messages = QueryBuilder::for(WhatsAppMessage::class)
            ->allowedFilters(
                AllowedFilter::exact('type'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('batch_id'),
            )
            ->defaultSort('-id')
            ->paginate(min($request->integer('per_page', 20), 100))
            ->appends($request->query());

        return WhatsAppMessageResource::collection($messages);
    }

    /** Estado de un lote (para poll-ear el progreso de un envío masivo). */
    public function batch(string $batch): JsonResponse
    {
        $messages = WhatsAppMessage::query()
            ->where('batch_id', $batch)
            ->orderBy('id')
            ->get();

        return response()->json([
            'batch_id' => $batch,
            'total' => $messages->count(),
            'sent' => $messages->where('status', WhatsAppMessage::STATUS_SENT)->count(),
            'failed' => $messages->where('status', WhatsAppMessage::STATUS_FAILED)->count(),
            'queued' => $messages->where('status', WhatsAppMessage::STATUS_QUEUED)->count(),
            'messages' => WhatsAppMessageResource::collection($messages),
        ]);
    }

    /** Reintenta solo los fallidos de un lote: crea un lote nuevo y lo envía. */
    public function retry(Request $request, string $batch): JsonResponse
    {
        $failed = WhatsAppMessage::query()
            ->where('batch_id', $batch)
            ->where('status', WhatsAppMessage::STATUS_FAILED)
            ->get();

        $newBatch = (string) Str::uuid();

        foreach ($failed as $message) {
            WhatsAppMessage::create([
                'batch_id' => $newBatch,
                'type' => $message->type,
                'template' => $message->template,
                'template_vars' => $message->template_vars,
                'recipient_phone' => $message->recipient_phone,
                'recipient_name' => $message->recipient_name,
                'body' => $message->body,
                'status' => WhatsAppMessage::STATUS_QUEUED,
                'user_id' => $request->user()?->getKey(),
            ]);
        }

        if ($failed->isNotEmpty()) {
            SendBulkReminder::dispatch($newBatch)->afterResponse();
        }

        return response()->json(['batch_id' => $newBatch, 'total' => $failed->count()], 202);
    }
}
