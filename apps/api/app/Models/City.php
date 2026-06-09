<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class City extends Model
{
    use HasFactory;

    protected $table = 'ciudad';

    protected $primaryKey = 'CodP';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['CodP', 'Nombre_Ciudad', 'Provincia'];

    public function owners(): HasMany
    {
        return $this->hasMany(Owner::class, 'CodP', 'CodP');
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'CodP', 'CodP');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'CodP', 'CodP');
    }
}
