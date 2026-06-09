<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'ok' => true,
            'service' => 'inmobiliaria-api',
            'ts' => now()->toIso8601String(),
        ]);
    });
});
