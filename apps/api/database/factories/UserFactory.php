<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Role;
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
            'password' => self::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function superadmin(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::firstOrCreate(
                ['name' => Role::SUPERADMIN],
                ['label' => 'Superadministrador'],
            )->id,
        ]);
    }

    public function inmobiliaria(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::firstOrCreate(
                ['name' => Role::INMOBILIARIA],
                ['label' => 'Inmobiliaria'],
            )->id,
        ]);
    }
}
