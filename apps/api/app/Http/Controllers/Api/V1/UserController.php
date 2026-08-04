<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

final class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = max(1, min($request->integer('per_page', 25), 100));

        $users = User::with('role')
            ->orderBy('Nombre_User')
            ->paginate($perPage)
            ->appends($request->query());

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = new User();
        $user->Nombre_User = $validated['name'];
        $user->Email_User  = $validated['email'];
        $user->password    = $validated['password'];
        $user->role_id     = $validated['role_id'];
        $user->Pass_User   = ''; // legacy field; vacío para usuarios nuevos
        $user->save();

        return (new UserResource($user->load('role')))->response()->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $validated = $request->validated();

        $data = [
            'Nombre_User' => $validated['name'],
            'Email_User'  => $validated['email'],
            'role_id'     => $validated['role_id'],
        ];

        if (filled($validated['password'] ?? null)) {
            $data['password'] = $validated['password'];
        }

        $user->fill($data)->save();

        return new UserResource($user->load('role'));
    }

    public function destroy(User $user): Response
    {
        DB::table('sessions')->where('user_id', $user->ID_User)->delete();
        $user->delete();

        return response()->noContent();
    }
}
