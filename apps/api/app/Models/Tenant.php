<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Tenant extends Model
{
    use HasFactory;

    protected $table = 'inquilino';

    protected $primaryKey = 'ID_Inquilino';

    public $timestamps = false;

    protected $fillable = ['CodP', 'NYA_Inquilino', 'Tel_Inquilino', 'Email_Inquilino'];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'CodP', 'CodP');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'ID_Inquilino', 'ID_Inquilino');
    }
}
