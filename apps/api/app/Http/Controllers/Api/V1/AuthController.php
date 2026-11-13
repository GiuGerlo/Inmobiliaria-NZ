<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 60;

    public function login(LoginRequest $request): UserResource|JsonResponse
    {
        $email = Str::lower($request->string('email')->value());
        $password = $request->string('password')->value();
        $remember = $request->boolean('remember');
        $throttleKey = 'login:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'message' => 'Demasiados intentos de inicio de sesión. Probá de nuevo en '.$seconds.' segundos.',
            ], 429, ['Retry-After' => $seconds]);
        }

        $authenticated = Auth::guard('web')->attempt(
            ['Email_User' => $email, 'password' => $password],
            $remember,
        );

        if (! $authenticated) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            // Mensaje genérico: no revelar si el email existe.
            throw ValidationException::withMessages([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        return new UserResource($request->user());
    }

    public function logout(): Response
    {
        Auth::guard('web')->logout();

        session()->invalidate();
        session()->regenerateToken();

        return response()->noContent();
    }
}
