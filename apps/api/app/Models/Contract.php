<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Contract extends Model
{
    use HasFactory;

    protected $table = 'contrato';

    protected $primaryKey = 'ID_Contrato';

    public $timestamps = false;

    protected $fillable = [
        'ID_Dueno',
        'ID_Inquilino',
        'ID_Propiedad',
        'F_Inicio',
        'F_Fin',
        'Saldo',
        'Certificacion',
    ];

    protected function casts(): array
    {
        return [
            'F_Inicio' => 'date',
            'F_Fin' => 'date',
            'Saldo' => 'decimal:0',
        ];
    }

    /**
     * Contratos vigentes hoy: ya empezaron y todavía no terminaron.
     * Un F_Fin null se considera sin vencimiento → activo.
     *
     * @param  Builder<Contract>  $query
     * @return Builder<Contract>
     */
    public function scopeActive(Builder $query): Builder
    {
        $today = now()->toDateString();

        return $query
            ->where('F_Inicio', '<=', $today)
            ->where(function (Builder $q) use ($today): void {
                $q->whereNull('F_Fin')->orWhere('F_Fin', '>=', $today);
            });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'ID_Dueno', 'ID_Dueno');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'ID_Inquilino', 'ID_Inquilino');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'ID_Propiedad', 'ID_Propiedad');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'ID_Contrato', 'ID_Contrato');
    }
}
