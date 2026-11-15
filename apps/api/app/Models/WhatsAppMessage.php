<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WhatsAppMessage extends Model
{
    protected $table = 'whatsapp_messages';

    public const TYPE_RECIBO = 'recibo';

    public const TYPE_RENDICION = 'rendicion';

    public const TYPE_RECORDATORIO_PAGO = 'recordatorio_pago';

    public const TYPE_RECORDATORIO_FALTANTE = 'recordatorio_faltante';

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    // Estados de entrega que llegan por el webhook `messages` (statuses) de Meta.
    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_READ = 'read';

    /** Aceptado por Meta (y quizá ya entregado/leído): cuenta como "enviado". */
    public const ACCEPTED_STATUSES = [self::STATUS_SENT, self::STATUS_DELIVERED, self::STATUS_READ];

    /** Orden de avance: los statuses de Meta llegan desordenados y nunca deben retroceder. */
    public const STATUS_RANK = [
        self::STATUS_QUEUED => 0,
        self::STATUS_SENT => 1,
        self::STATUS_DELIVERED => 2,
        self::STATUS_READ => 3,
    ];

    protected $fillable = [
        'batch_id',
        'receipt_id',
        'contract_id',
        'type',
        'template',
        'template_vars',
        'recipient_phone',
        'recipient_name',
        'body',
        'meta_message_id',
        'status',
        'error',
        'sent_at',
        'delivered_at',
        'read_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'template_vars' => 'array',
        ];
    }

    /**
     * Texto real que recibe el destinatario de un recibo/rendición: espejo de las plantillas Meta
     * envio_recibo / envio_rendicion con nombre y período rellenados. Se guarda como snapshot.
     */
    public static function documentBody(string $type, ?string $name, string $period): string
    {
        return $type === self::TYPE_RENDICION
            ? "Hola {$name}, adjuntamos la rendición de {$period} de tu propiedad. Saludos!"
            : "Hola {$name}, te enviamos el recibo de alquiler de {$period}. Ante cualquier consulta quedamos a disposición.";
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class, 'receipt_id', 'Nro_Recibo');
    }
}
