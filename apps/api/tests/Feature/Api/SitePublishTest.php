<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.github.token' => 'test-token',
        'services.github.owner' => 'GiuGerlo',
        'services.github.repo' => 'Inmobiliaria-NZ',
        'services.github.workflow' => 'deploy-public.yml',
        'services.github.ref' => 'production',
    ]);
});

it('el superadmin dispara el workflow y recibe 202', function () {
    Http::fake([
        'api.github.com/*' => Http::response('', 204),
    ]);

    $this->actingAs(User::factory()->superadmin()->create());

    $this->postJson('/api/v1/site/publish')
        ->assertStatus(202)
        ->assertJsonPath('message', fn ($m) => str_contains((string) $m, 'Publicación iniciada'));

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.github.com/repos/GiuGerlo/Inmobiliaria-NZ/actions/workflows/deploy-public.yml/dispatches'
            && $request['ref'] === 'production'
            && $request->hasHeader('Authorization', 'Bearer test-token');
    });
});

it('inmobiliaria no puede publicar (403) y no llama a GitHub', function () {
    Http::fake();

    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->postJson('/api/v1/site/publish')->assertForbidden();

    Http::assertNothingSent();
});

it('sin token configurado devuelve 502 sin llamar a GitHub', function () {
    config(['services.github.token' => '']);
    Http::fake();

    $this->actingAs(User::factory()->superadmin()->create());

    $this->postJson('/api/v1/site/publish')->assertStatus(502);

    Http::assertNothingSent();
});

it('si GitHub rechaza el dispatch devuelve 502', function () {
    Http::fake([
        'api.github.com/*' => Http::response(['message' => 'Bad credentials'], 401),
    ]);

    $this->actingAs(User::factory()->superadmin()->create());

    $this->postJson('/api/v1/site/publish')->assertStatus(502);
});
