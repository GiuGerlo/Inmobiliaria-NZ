<?php

declare(strict_types=1);

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    config([
        'services.whatsapp.token' => 'TEST',
        'services.whatsapp.phone_number_id' => '100',
        'services.whatsapp.template_recordatorio_pago' => 'recordatorio_pago',
        'services.whatsapp.template_lang' => 'es',
    ]);
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.OK']]])]);
});

it('crea un lote con una fila por inquilino válido', function () {
    $t1 = Tenant::factory()->create(['Tel_Inquilino' => '3468495281']);
    $t2 = Tenant::factory()->create(['Tel_Inquilino' => '3514567890']);

    $this->postJson('/api/v1/whatsapp/payment-reminders', [
        'tenant_ids' => [$t1->ID_Inquilino, $t2->ID_Inquilino],
        'deadline' => 'MIÉRCOLES 10 AL MEDIODÍA',
    ])->assertStatus(202)
        ->assertJsonPath('total', 2)
        ->assertJsonPath('skipped', []);

    $this->assertDatabaseCount('whatsapp_messages', 2);
    $this->assertDatabaseHas('whatsapp_messages', ['type' => 'recordatorio_pago']);
});

it('saltea inquilinos con teléfono inválido e informa el nombre', function () {
    $ok = Tenant::factory()->create(['Tel_Inquilino' => '3468495281']);
    $bad = Tenant::factory()->create(['Tel_Inquilino' => '0', 'NYA_Inquilino' => 'Sin Tel']);

    $this->postJson('/api/v1/whatsapp/payment-reminders', [
        'tenant_ids' => [$ok->ID_Inquilino, $bad->ID_Inquilino],
        'deadline' => 'VIERNES 12',
    ])->assertStatus(202)
        ->assertJsonPath('total', 1)
        ->assertJsonPath('skipped', ['Sin Tel']);

    $this->assertDatabaseCount('whatsapp_messages', 1);
});

it('valida destinatarios y fecha', function () {
    $this->postJson('/api/v1/whatsapp/payment-reminders', ['tenant_ids' => [], 'deadline' => 'x'])
        ->assertStatus(422)->assertJsonValidationErrors('tenant_ids');

    $t = Tenant::factory()->create();
    $this->postJson('/api/v1/whatsapp/payment-reminders', ['tenant_ids' => [$t->ID_Inquilino]])
        ->assertStatus(422)->assertJsonValidationErrors('deadline');
});

it('rechaza sin sesión', function () {
    auth()->guard('web')->logout();
    $this->postJson('/api/v1/whatsapp/payment-reminders', ['tenant_ids' => [1], 'deadline' => 'x'])
        ->assertUnauthorized();
});
