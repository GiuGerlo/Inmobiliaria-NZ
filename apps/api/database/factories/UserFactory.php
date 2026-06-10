<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
final class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'Nombre_User' => fake()->name(),
            'Email_User' => fake()->unique()->safeEmail(),
            'Pass_User' => '', // legacy MD5 — vacío en datos nuevos
            'password' => self::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Usuario legacy sin migrar: solo credencial MD5, password bcrypt null.
     */
    public function legacyMd5(string $plainPassword = 'password'): static
    {
        return $this->state(fn () => [
            'Pass_User' => md5($plainPassword),
            'password' => null,
            'remember_token' => null,
        ]);
    }
}
