<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Mapea la tabla users legacy. Pass_User (MD5) queda solo para la migración
 * de credenciales en sub-C; password (bcrypt) es el destino.
 */
final class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'ID_User';

    public $timestamps = false;

    protected $fillable = ['Nombre_User', 'Email_User', 'password', 'role_id'];

    protected $hidden = ['Pass_User', 'password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function isSuperadmin(): bool
    {
        return $this->role?->name === Role::SUPERADMIN;
    }
}
