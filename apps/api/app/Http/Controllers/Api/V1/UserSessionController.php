<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class UserSessionController extends Controller
{
    public function index(Request $request, User $user): JsonResponse
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $user->ID_User)
            ->orderByDesc('last_activity')
            ->get();

        $currentId = $request->hasSession() ? $request->session()->getId() : null;

        $data = $sessions->map(fn (object $session) => [
            'id'           => $session->id,
            'ip_address'   => $session->ip_address,
            'user_agent'   => $this->parseUserAgent($session->user_agent ?? ''),
            'last_activity' => Carbon::createFromTimestamp($session->last_activity)->toIso8601String(),
            'is_current'   => $session->id === $currentId,
        ]);

        return response()->json(['data' => $data]);
    }

    public function destroy(User $user, string $sessionId): Response
    {
        DB::table('sessions')
            ->where('user_id', $user->ID_User)
            ->where('id', $sessionId)
            ->delete();

        return response()->noContent();
    }

    public function destroyAll(User $user): Response
    {
        DB::table('sessions')
            ->where('user_id', $user->ID_User)
            ->delete();

        return response()->noContent();
    }

    private function parseUserAgent(string $ua): string
    {
        if ($ua === '') {
            return 'Desconocido';
        }

        $browser = match (true) {
            str_contains($ua, 'Edg')                                     => 'Edge',
            str_contains($ua, 'Chrome')                                  => 'Chrome',
            str_contains($ua, 'Firefox')                                 => 'Firefox',
            str_contains($ua, 'Safari') && ! str_contains($ua, 'Chrome') => 'Safari',
            str_contains($ua, 'MSIE') || str_contains($ua, 'Trident')   => 'IE',
            default                                                       => 'Navegador desconocido',
        };

        $os = match (true) {
            str_contains($ua, 'Android') => 'Android',
            str_contains($ua, 'iPhone') || str_contains($ua, 'iPad') => 'iOS',
            str_contains($ua, 'Windows') => 'Windows',
            str_contains($ua, 'Mac OS X') || str_contains($ua, 'Macintosh') => 'macOS',
            str_contains($ua, 'Linux')   => 'Linux',
            default                      => '',
        };

        return $os !== '' ? "{$browser} en {$os}" : $browser;
    }
}
