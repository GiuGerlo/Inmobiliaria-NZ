<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Receipt extends Model
{
    use HasFactory;

    protected $table = 'recibo';

    protected $primaryKey = 'Nro_Recibo';

    public $timestamps = false;

    protected $fillable = [
        'ID_FP',
        'ID_Contrato',
        'F_Pago',
        'Pago_Propiedad',
        'Pago_Municipal',
        'Pago_Agua',
        'Honorarios',
        'Mes_Rend',
        'Ano_Rend',
        'Pago_Electricidad',
        'Pago_Gas',
        'Arreglos',
        'Sepelio',
        'Comentarios',
    ];

    protected function casts(): array
    {
        return [
            'F_Pago' => 'date',
            'Pago_Propiedad' => 'decimal:0',
            'Pago_Municipal' => 'decimal:0',
            'Pago_Agua' => 'decimal:0',
            'Honorarios' => 'decimal:0',
            'Pago_Electricidad' => 'decimal:0',
            'Pago_Gas' => 'decimal:0',
            'Arreglos' => 'decimal:0',
            'Sepelio' => 'decimal:0',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'ID_Contrato', 'ID_Contrato');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'ID_FP', 'ID_FP');
    }
}
