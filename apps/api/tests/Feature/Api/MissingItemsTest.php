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
        'services.whatsapp.template_recordatorio_faltante' => 'recordatorio_faltante',
        'services.whatsapp.template_lang' => 'es',
    ]);
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.OK']]])]);
});

it('envía el recordatorio de faltantes y lo registra', function () {
    $tenant = Tenant::factory()->create(['Tel_Inquilino' => '3468495281', 'NYA_Inquilino' => 'Juan']);

    $this->postJson('/api/v1/whatsapp/missing-items', [
        'tenant_id' => $tenant->ID_Inquilino,
        'message' => 'pasarme foto del pago de municipal y agua',
    ])->assertStatus(202)
        ->assertJsonPath('data.type', 'recordatorio_faltante')
        ->assertJsonPath('data.status', 'sent');

    $this->assertDatabaseHas('whatsapp_messages', [
        'type' => 'recordatorio_faltante',
        'recipient_name' => 'Juan',
        'status' => 'sent',
    ]);
});

it('rechaza si el inquilino no tiene teléfono válido', function () {
    $tenant = Tenant::factory()->create(['Tel_Inquilino' => '0']);

    $this->postJson('/api/v1/whatsapp/missing-items', [
        'tenant_id' => $tenant->ID_Inquilino,
        'message' => 'pasarme el pago',
    ])->assertStatus(422)->assertJsonValidationErrors('tenant_id');
});
