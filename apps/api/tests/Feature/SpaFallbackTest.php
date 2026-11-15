<?php

declare(strict_types=1);

it('sirve el index.html del SPA sin cache para que el browser tome cada deploy', function () {
    $spa = public_path('index.html');
    file_put_contents($spa, '<!doctype html><div id="root"></div>');

    try {
        $response = $this->get('/recibos')->assertOk();
        expect($response->headers->get('Cache-Control'))->toContain('no-cache');
    } finally {
        @unlink($spa);
    }
});
