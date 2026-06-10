<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ProfileController extends Controller
{
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();

        $user->Nombre_User = $request->string('name')->value();
        $user->Email_User = $request->string('email')->value();
        $user->save();

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): UserResource
    {
        $user = $request->user();

        $user->password = $request->string('password')->value();
        $user->save();

        // Regenerar sesión post-cambio de password (security.md regla 8)
        // e invalidar las demás sesiones activas del usuario.
        $request->session()->regenerate();

        DB::table('sessions')
            ->where('user_id', $user->ID_User)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return new UserResource($user);
    }
}
