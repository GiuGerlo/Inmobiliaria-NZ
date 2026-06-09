<?php

declare(strict_types=1);

it('responde ok en /api/v1/health', function () {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertJson([
            'ok' => true,
            'service' => 'inmobiliaria-api',
        ])
        ->assertJsonStructure(['ok', 'service', 'ts']);
});
