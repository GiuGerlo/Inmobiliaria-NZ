<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Owner extends Model
{
    use HasFactory;

    protected $table = 'dueno';

    protected $primaryKey = 'ID_Dueno';

    public $timestamps = false;

    protected $fillable = ['CodP', 'NYA_Dueno', 'Tel_Dueno', 'Email_Dueno'];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'CodP', 'CodP');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'ID_Dueno', 'ID_Dueno');
    }
}
