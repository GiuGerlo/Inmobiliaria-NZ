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

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'receipt_id',
        'type',
        'recipient_phone',
        'meta_message_id',
        'status',
        'error',
        'sent_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class, 'receipt_id', 'Nro_Recibo');
    }
}
