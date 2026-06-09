<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PaymentMethod extends Model
{
    use HasFactory;

    protected $table = 'formadepago';

    protected $primaryKey = 'ID_FP';

    public $timestamps = false;

    protected $fillable = ['Desc_FP'];

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'ID_FP', 'ID_FP');
    }
}
