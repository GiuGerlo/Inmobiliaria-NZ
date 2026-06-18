<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Receipt\StoreReceiptRequest;
use App\Http\Requests\WhatsApp\MissingItemsRequest;
use App\Http\Requests\WhatsApp\PaymentRemindersRequest;
use App\Http\Resources\WhatsAppMessageResource;
use App\Jobs\SendBulkReminder;
use App\Models\Tenant;
use App\Models\WhatsAppMessage;
use App\Support\PhoneNumber;
use App\Support\WhatsAppSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Envíos manuales de recordatorios por WhatsApp (sub-J): masivo de pago (lote con
 * progreso) y faltantes por inquilino. Todo queda registrado en whatsapp_messages.
 */
final class WhatsAppReminderController extends Controller
{
    /** Recordatorio de pago masivo: crea un lote y lo envía en background. */
    public function paymentReminders(PaymentRemindersRequest $request): JsonResponse
    {
        $data = $request->validated();
        $month = StoreReceiptRequest::MONTHS[now()->month - 1];
        $deadline = $data['deadline'];
        $body = self::renderPaymentBody($month, $deadline);
        $batchId = (string) Str::uuid();
        $userId = $request->user()?->getKey();

        $tenants = Tenant::query()->whereIn('ID_Inquilino', $data['tenant_ids'])->get();

        /** @var list<string> $skipped */
        $skipped = [];
        $total = 0;

        foreach ($tenants as $tenant) {
            $phone = PhoneNumber::toE164($tenant->Tel_Inquilino);
            if ($phone === null) {
                $skipped[] = $tenant->NYA_Inquilino;

                continue;
            }

            WhatsAppMessage::create([
                'batch_id' => $batchId,
                'type' => WhatsAppMessage::TYPE_RECORDATORIO_PAGO,
                'template' => (string) config('services.whatsapp.template_recordatorio_pago'),
                'template_vars' => [$month, $deadline],
                'recipient_phone' => $phone,
                'recipient_name' => $tenant->NYA_Inquilino,
                'body' => $body,
                'status' => WhatsAppMessage::STATUS_QUEUED,
                'user_id' => $userId,
            ]);
            $total++;
        }

        if ($total > 0) {
            SendBulkReminder::dispatch($batchId)->afterResponse();
        }

        return response()->json([
            'batch_id' => $batchId,
            'total' => $total,
            'skipped' => $skipped,
        ], 202);
    }

    /** Recordatorio de faltantes a un inquilino (envío inmediato). */
    public function missingItems(MissingItemsRequest $request, WhatsAppSender $sender): JsonResponse
    {
        $data = $request->validated();
        $tenant = Tenant::query()->findOrFail($data['tenant_id']);

        $phone = PhoneNumber::toE164($tenant->Tel_Inquilino);
        if ($phone === null) {
            throw ValidationException::withMessages([
                'tenant_id' => 'El inquilino no tiene un teléfono válido. Revisá su ficha.',
            ]);
        }

        $message = $data['message'];
        $body = "Hola {$tenant->NYA_Inquilino}, desde Estudio Zaranich te recordamos: {$message}. ¡Gracias!";

        $row = WhatsAppMessage::create([
            'batch_id' => (string) Str::uuid(),
            'type' => WhatsAppMessage::TYPE_RECORDATORIO_FALTANTE,
            'template' => (string) config('services.whatsapp.template_recordatorio_faltante'),
            'template_vars' => [$tenant->NYA_Inquilino, $message],
            'recipient_phone' => $phone,
            'recipient_name' => $tenant->NYA_Inquilino,
            'body' => $body,
            'status' => WhatsAppMessage::STATUS_QUEUED,
            'user_id' => $request->user()?->getKey(),
        ]);

        $sender->send($row);

        return (new WhatsAppMessageResource($row->fresh()))->response()->setStatusCode(202);
    }

    private static function renderPaymentBody(string $month, string $deadline): string
    {
        return "Buen día! En el mes de {$month} vamos a tomar los pagos hasta el día {$deadline}. "
            .'Les solicitamos tengan a bien hacer los pagos antes de esa fecha para poder hacer la '
            .'entrega correspondiente a los propietarios. Desde ya muchas gracias. Saludos. '
            .'Estudio Jurídico Inmobiliario ZARANICH.';
    }
}
