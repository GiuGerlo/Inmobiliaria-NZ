<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Property extends Model
{
    use HasFactory;

    protected $table = 'propiedad';

    protected $primaryKey = 'ID_Propiedad';

    public $timestamps = false;

    protected $fillable = [
        'Dir_Propiedad',
        'CodP',
        'Tipo_Propiedad',
        'Serv_Propiedad',
        'Precio_Propiedad',
        'Caract_Propiedad',
        'Foto_Propiedad',
        'Foto_Propiedad_GXI',
    ];

    protected $hidden = ['Foto_Propiedad']; // longblob — no serializar por default

    protected function casts(): array
    {
        return [
            'Precio_Propiedad' => 'decimal:0',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'CodP', 'CodP');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'ID_Propiedad', 'ID_Propiedad');
    }
}
