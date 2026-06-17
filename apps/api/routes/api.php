<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MonthlyPaymentsReportController;
use App\Http\Controllers\Api\V1\OwnerController;
use App\Http\Controllers\Api\V1\PaymentMethodController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\PropertyPhotoController;
use App\Http\Controllers\Api\V1\ReceiptController;
use App\Http\Controllers\Api\V1\ReceiptPdfController;
use App\Http\Controllers\Api\V1\TenantController;
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

        Route::get('/dashboard', DashboardController::class);

        Route::get('/me', [ProfileController::class, 'show']);
        Route::patch('/me', [ProfileController::class, 'update']);
        Route::put('/me/password', [ProfileController::class, 'updatePassword']);

        Route::apiResource('cities', CityController::class);
        Route::apiResource('owners', OwnerController::class);
        Route::apiResource('tenants', TenantController::class);
        Route::apiResource('properties', PropertyController::class);
        Route::post('/properties/{property}/photo', [PropertyPhotoController::class, 'store']);
        Route::delete('/properties/{property}/photo', [PropertyPhotoController::class, 'destroy']);
        Route::apiResource('contracts', ContractController::class);
        Route::apiResource('receipts', ReceiptController::class);

        // PDFs de recibos (sub-F): se abren inline en pestaña nueva.
        Route::get('/receipts/{receipt}/pdf', [ReceiptPdfController::class, 'receipt']);
        Route::get('/receipts/{receipt}/settlement', [ReceiptPdfController::class, 'settlement']);

        // Reporte mensual de pagos (pagados / no pagados) por mes+año.
        Route::get('/reports/monthly-payments', MonthlyPaymentsReportController::class);
        Route::apiResource('payment-methods', PaymentMethodController::class);
    });
});
