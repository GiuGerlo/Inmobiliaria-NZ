<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

function insertSession(int $userId, string $sessionId = 'abc123'): void
{
    DB::table('sessions')->insert([
        'id'            => $sessionId,
        'user_id'       => $userId,
        'ip_address'    => '127.0.0.1',
        'user_agent'    => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
        'payload'       => 'payload',
        'last_activity' => now()->timestamp,
    ]);
}

it('superadmin puede ver sesiones de un usuario', function () {
    $target = User::factory()->inmobiliaria()->create();
    insertSession($target->ID_User, 'sess-1');
    insertSession($target->ID_User, 'sess-2');

    $this->actingAs(User::factory()->superadmin()->create())
        ->getJson("/api/v1/users/{$target->ID_User}/sessions")
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure(['data' => [['id', 'ip_address', 'user_agent', 'last_activity', 'is_current']]]);
});

it('superadmin puede revocar una sesión individual', function () {
    $target = User::factory()->inmobiliaria()->create();
    insertSession($target->ID_User, 'to-revoke');

    $this->actingAs(User::factory()->superadmin()->create())
        ->deleteJson("/api/v1/users/{$target->ID_User}/sessions/to-revoke")
        ->assertNoContent();

    expect(DB::table('sessions')->where('id', 'to-revoke')->exists())->toBeFalse();
});

it('superadmin puede revocar todas las sesiones de un usuario', function () {
    $target = User::factory()->inmobiliaria()->create();
    insertSession($target->ID_User, 'sess-a');
    insertSession($target->ID_User, 'sess-b');

    $this->actingAs(User::factory()->superadmin()->create())
        ->deleteJson("/api/v1/users/{$target->ID_User}/sessions")
        ->assertNoContent();

    expect(DB::table('sessions')->where('user_id', $target->ID_User)->count())->toBe(0);
});

it('inmobiliaria no puede ver ni revocar sesiones (403)', function () {
    $target = User::factory()->inmobiliaria()->create();

    $this->actingAs(User::factory()->inmobiliaria()->create())
        ->getJson("/api/v1/users/{$target->ID_User}/sessions")
        ->assertForbidden();

    $this->actingAs(User::factory()->inmobiliaria()->create())
        ->deleteJson("/api/v1/users/{$target->ID_User}/sessions")
        ->assertForbidden();
});

it('al eliminar un usuario se borran sus sesiones', function () {
    $target = User::factory()->inmobiliaria()->create();
    insertSession($target->ID_User, 'orphan');

    $this->actingAs(User::factory()->superadmin()->create())
        ->deleteJson("/api/v1/users/{$target->ID_User}")
        ->assertNoContent();

    expect(DB::table('sessions')->where('user_id', $target->ID_User)->exists())->toBeFalse();
});
