<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Dispara el workflow de GitHub Actions que reconstruye+redeploya el sitio público SSG
 * (deploy-public.yml). El catálogo se hornea en el build, así que un alta/edición en el
 * admin recién se ve tras publicar. Solo superadmin (gate manage-sales). El token vive en
 * config/.env y NUNCA se loguea.
 *
 * ponytail: llamada única, sin clase Service; extraer a un client si aparece más lógica de GitHub.
 */
final class SitePublishController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $cfg = config('services.github');
        $token = (string) ($cfg['token'] ?? '');

        if ($token === '') {
            Log::warning('site/publish: GITHUB_API_TOKEN sin configurar.');

            return response()->json(
                ['message' => 'Publicación no configurada. Falta el token de GitHub.'],
                502,
            );
        }

        $url = sprintf(
            'https://api.github.com/repos/%s/%s/actions/workflows/%s/dispatches',
            $cfg['owner'],
            $cfg['repo'],
            $cfg['workflow'],
        );

        $response = Http::withToken($token)
            ->withHeaders([
                'Accept' => 'application/vnd.github+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->post($url, [
                'ref' => $cfg['ref'],
                'inputs' => ['force_full' => 'false'],
            ]);

        // GitHub responde 204 No Content al aceptar el dispatch.
        if ($response->status() !== 204) {
            Log::error('site/publish: GitHub rechazó el dispatch.', [
                'status' => $response->status(),
                'body' => $response->json('message') ?? $response->body(),
            ]);

            return response()->json(
                ['message' => 'No pudimos iniciar la publicación. Reintentá en un momento.'],
                502,
            );
        }

        return response()->json(
            ['message' => 'Publicación iniciada. El sitio se actualiza en unos minutos.'],
            202,
        );
    }
}
