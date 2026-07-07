<?php

declare(strict_types=1);

use App\Models\User;
use App\Services\PublicMaintenanceGate;
use App\Support\MaintenanceState;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('con mantenimiento OFF el acceso es normal', function () {
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->getJson('/api/v1/cities')->assertOk();
});

it('con mantenimiento ON bloquea (503) a inmobiliaria desde IP no permitida', function () {
    MaintenanceState::enable('1.2.3.4');
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->withServerVariables(['REMOTE_ADDR' => '9.9.9.9'])
        ->getJson('/api/v1/cities')
        ->assertStatus(503);
});

it('con mantenimiento ON deja pasar al superadmin (anti-lockout, aunque cambie la IP)', function () {
    MaintenanceState::enable('1.2.3.4');
    $this->actingAs(User::factory()->superadmin()->create());

    $this->withServerVariables(['REMOTE_ADDR' => '9.9.9.9'])
        ->getJson('/api/v1/cities')
        ->assertOk();
});

it('con mantenimiento ON deja pasar a la IP permitida', function () {
    MaintenanceState::enable('9.9.9.9');
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->withServerVariables(['REMOTE_ADDR' => '9.9.9.9'])
        ->getJson('/api/v1/cities')
        ->assertOk();
});

it('con mantenimiento ON el login-flow (/me) y el status siguen accesibles', function () {
    MaintenanceState::enable('1.2.3.4');
    $this->actingAs(User::factory()->inmobiliaria()->create());
    $this->withServerVariables(['REMOTE_ADDR' => '9.9.9.9']);

    $this->getJson('/api/v1/me')->assertOk();
    $this->getJson('/api/v1/maintenance/status')->assertOk()->assertJsonPath('enabled', true);
});

it('el superadmin activa y desactiva el mantenimiento capturando su IP', function () {
    $this->actingAs(User::factory()->superadmin()->create());
    $this->withServerVariables(['REMOTE_ADDR' => '5.6.7.8']);

    $this->postJson('/api/v1/maintenance')
        ->assertOk()
        ->assertJsonPath('enabled', true)
        ->assertJsonPath('allowed_ip', '5.6.7.8')
        ->assertJsonPath('your_ip', '5.6.7.8');
    expect(MaintenanceState::enabled())->toBeTrue();

    $this->deleteJson('/api/v1/maintenance')
        ->assertOk()
        ->assertJsonPath('enabled', false);
    expect(MaintenanceState::enabled())->toBeFalse();
});

it('inmobiliaria no puede gestionar el mantenimiento (403)', function () {
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->postJson('/api/v1/maintenance')->assertForbidden();
});

it('actualizar IP cambia la IP permitida sin apagar el mantenimiento', function () {
    $this->actingAs(User::factory()->superadmin()->create());
    MaintenanceState::enable('1.1.1.1');

    $this->withServerVariables(['REMOTE_ADDR' => '2.2.2.2'])
        ->postJson('/api/v1/maintenance/ip')
        ->assertOk()
        ->assertJsonPath('allowed_ip', '2.2.2.2');

    expect(MaintenanceState::allowedIp())->toBe('2.2.2.2');
    expect(MaintenanceState::enabled())->toBeTrue();
});

it('PublicMaintenanceGate escribe y quita el bloque del .htaccess (idempotente)', function () {
    $dir = sys_get_temp_dir().'/nz-maint-'.uniqid();
    mkdir($dir);
    file_put_contents($dir.'/.htaccess', "# base rules\nRewriteEngine On\n");
    config(['maintenance.public_docroot' => $dir]);

    $gate = app(PublicMaintenanceGate::class);

    $gate->enable('4.5.6.7');
    $gate->enable('4.5.6.7'); // idempotente: no duplica el bloque
    $content = (string) file_get_contents($dir.'/.htaccess');

    expect($content)->toContain('# base rules')
        ->and($content)->toContain('RewriteCond %{REMOTE_ADDR} !=4.5.6.7')
        ->and(substr_count($content, '# BEGIN NZ-MAINTENANCE'))->toBe(1);

    $gate->disable();
    $content = (string) file_get_contents($dir.'/.htaccess');

    expect($content)->toContain('# base rules')
        ->and($content)->not->toContain('NZ-MAINTENANCE');

    unlink($dir.'/.htaccess');
    rmdir($dir);
});

it('PublicMaintenanceGate es no-op sin PUBLIC_DOCROOT_PATH (local)', function () {
    config(['maintenance.public_docroot' => null]);

    app(PublicMaintenanceGate::class)->enable('4.5.6.7');

    expect(true)->toBeTrue(); // no explota
});
