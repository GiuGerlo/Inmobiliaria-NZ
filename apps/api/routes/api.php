<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Middleware\NoStoreHeaders;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'ok' => true,
            'service' => 'inmobiliaria-api',
            'ts' => now()->toIso8601String(),
        ]);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', NoStoreHeaders::class])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/me', [ProfileController::class, 'show']);
        Route::patch('/me', [ProfileController::class, 'update']);
        Route::put('/me/password', [ProfileController::class, 'updatePassword']);
    });
});
