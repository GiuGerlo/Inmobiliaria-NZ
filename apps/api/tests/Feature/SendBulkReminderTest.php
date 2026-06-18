<?php

declare(strict_types=1);

use App\Jobs\SendBulkReminder;
use App\Models\WhatsAppMessage;
use App\Support\WhatsAppSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('envía todas las filas en cola del lote y las marca sent', function () {
    config(['services.whatsapp.token' => 'T', 'services.whatsapp.phone_number_id' => '100', 'services.whatsapp.template_lang' => 'es']);
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.OK']]])]);

    foreach (['+5493468495281', '+5493514567890'] as $phone) {
        WhatsAppMessage::create([
            'batch_id' => 'B', 'type' => 'recordatorio_pago', 'template' => 'recordatorio_pago',
            'template_vars' => ['Junio', 'VIERNES'], 'recipient_phone' => $phone,
            'recipient_name' => 'X', 'body' => 'x', 'status' => 'queued',
        ]);
    }

    (new SendBulkReminder('B'))->handle(app(WhatsAppSender::class));

    expect(WhatsAppMessage::where('batch_id', 'B')->where('status', 'sent')->count())->toBe(2);
    expect(WhatsAppMessage::where('batch_id', 'B')->whereNotNull('meta_message_id')->count())->toBe(2);
});
