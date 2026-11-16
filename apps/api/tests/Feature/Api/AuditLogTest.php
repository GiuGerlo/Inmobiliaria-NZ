<?php

declare(strict_types=1);

use App\Models\AuditLog;
use App\Models\Contract;
use App\Models\Owner;
use App\Models\Receipt;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

it('registra alta, cambio y baja de un modelo con usuario y diff', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $contract = Contract::factory()->create(['Saldo' => 0]);
    $contract->update(['Saldo' => 1500]);
    $contract->delete();

    $logs = AuditLog::query()->where('auditable_type', 'Contract')->orderBy('id')->get();

    expect($logs->pluck('event')->all())->toBe(['created', 'updated', 'deleted'])
        ->and($logs->pluck('user_id')->unique()->all())->toBe([$user->ID_User])
        ->and($logs[1]->auditable_id)->toBe((string) $contract->ID_Contrato)
        ->and($logs[1]->new_values)->toBe(['Saldo' => 1500])
        ->and((int) $logs[1]->old_values['Saldo'])->toBe(0);
});

it('nunca guarda la contraseña en el log', function () {
    $this->actingAs(User::factory()->create());
    $target = User::factory()->create();

    $target->update(['password' => 'otra-clave-segura']);

    expect(AuditLog::query()->where('auditable_type', 'User')->pluck('new_values')->toJson())
        ->not->toContain('password')
        ->and(AuditLog::query()->where('auditable_type', 'User')->where('event', 'updated')->count())->toBe(0);
});

it('registra login, login fallido (solo email) y logout', function () {
    $this->withHeader('Referer', 'http://localhost:8080'); // request de la SPA (Sanctum stateful)
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/login', ['email' => $user->Email_User, 'password' => 'mal'])->assertUnprocessable();
    $this->postJson('/api/v1/auth/login', ['email' => $user->Email_User, 'password' => 'password'])->assertOk();
    $this->postJson('/api/v1/auth/logout')->assertNoContent();

    $logs = AuditLog::query()->where('event', '!=', 'created')->orderBy('id')->get();
    expect($logs->pluck('event')->all())->toBe(['login_failed', 'login', 'logout'])
        ->and($logs[0]->user_id)->toBeNull()
        ->and($logs[0]->new_values)->toBe(['email' => $user->Email_User])
        ->and($logs[1]->user_id)->toBe($user->ID_User)
        ->and($logs[2]->user_id)->toBe($user->ID_User);
});

it('registra el envío de un recibo por WhatsApp', function () {
    Queue::fake();
    $user = User::factory()->create();
    $this->actingAs($user);
    $contract = Contract::factory()->create([
        'ID_Inquilino' => Tenant::factory()->create(['Tel_Inquilino' => '3468495281'])->ID_Inquilino,
        'ID_Dueno' => Owner::factory()->create()->ID_Dueno,
    ]);
    $receipt = Receipt::factory()->create(['ID_Contrato' => $contract->ID_Contrato]);

    $this->postJson("/api/v1/receipts/{$receipt->Nro_Recibo}/whatsapp", ['type' => 'recibo'])->assertStatus(202);

    $log = AuditLog::query()->where('event', 'whatsapp.recibo')->sole();
    expect($log->user_id)->toBe($user->ID_User)
        ->and($log->new_values['receipt_id'])->toBe($receipt->Nro_Recibo);
});

it('el panel de auditoría es solo para superadmin y filtra', function () {
    $this->actingAs(User::factory()->create())->getJson('/api/v1/audit-logs')->assertForbidden();

    $this->actingAs(User::factory()->superadmin()->create());
    Contract::factory()->create();
    AuditLog::record('whatsapp.recibo');
    AuditLog::record('pdf.recibo');

    $this->getJson('/api/v1/audit-logs?filter[event]=whatsapp')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.event', 'whatsapp.recibo');

    $this->getJson('/api/v1/audit-logs?filter[auditable_type]=Contract')
        ->assertOk()
        ->assertJsonPath('data.0.event', 'created')
        ->assertJsonStructure(['data' => [['id', 'created_at', 'event', 'user_name', 'old_values', 'new_values', 'ip']], 'meta']);
});
