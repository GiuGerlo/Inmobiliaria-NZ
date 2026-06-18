<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Receipt\SendWhatsAppRequest;
use App\Http\Resources\WhatsAppMessageResource;
use App\Jobs\SendWhatsAppDocument;
use App\Models\Receipt;
use App\Models\WhatsAppMessage;
use App\Support\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * Encola el envío por WhatsApp de un recibo (al inquilino) o de su rendición (al dueño).
 * El PDF y el envío real corren en el job; aquí se resuelve el destinatario y se valida.
 */
final class ReceiptWhatsAppController extends Controller
{
    public function __invoke(SendWhatsAppRequest $request, Receipt $receipt): JsonResponse
    {
        $type = $request->string('type')->toString();
        $receipt->loadMissing(['contract.tenant', 'contract.owner']);

        $raw = $request->filled('phone')
            ? $request->string('phone')->toString()
            : ($type === WhatsAppMessage::TYPE_RENDICION
                ? $receipt->contract?->owner?->Tel_Dueno
                : $receipt->contract?->tenant?->Tel_Inquilino);

        $phone = PhoneNumber::toE164($raw);

        if ($phone === null) {
            throw ValidationException::withMessages([
                'phone' => 'El teléfono del destinatario no es válido. Revisá el número.',
            ]);
        }

        $isRendicion = $type === WhatsAppMessage::TYPE_RENDICION;
        $recipientName = $isRendicion
            ? $receipt->contract?->owner?->NYA_Dueno
            : $receipt->contract?->tenant?->NYA_Inquilino;

        // Snapshot del texto real que recibe el destinatario (espejo de las plantillas Meta
        // envio_recibo / envio_rendicion, con nombre/mes/año rellenados).
        $period = "{$receipt->Mes_Rend}/{$receipt->Ano_Rend}";
        $body = $isRendicion
            ? "Hola {$recipientName}, adjuntamos la rendición de {$period} de tu propiedad. Saludos!"
            : "Hola {$recipientName}, te enviamos el recibo de alquiler de {$period}. Ante cualquier consulta quedamos a disposición.";

        $message = WhatsAppMessage::create([
            'receipt_id' => $receipt->Nro_Recibo,
            'contract_id' => $receipt->ID_Contrato,
            'type' => $type,
            'recipient_phone' => $phone,
            'recipient_name' => $recipientName,
            'body' => $body,
            'status' => WhatsAppMessage::STATUS_QUEUED,
            'user_id' => $request->user()?->getKey(),
        ]);

        SendWhatsAppDocument::dispatch($message)->afterResponse();

        return (new WhatsAppMessageResource($message))->response()->setStatusCode(202);
    }
}
