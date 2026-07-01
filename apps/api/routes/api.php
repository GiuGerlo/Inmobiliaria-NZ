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
use App\Http\Controllers\Api\V1\PropertyTypeController;
use App\Http\Controllers\Api\V1\SalePropertyController;
use App\Http\Controllers\Api\V1\SalePropertyImageController;
use App\Http\Controllers\Api\V1\ReceiptController;
use App\Http\Controllers\Api\V1\ReceiptPdfController;
use App\Http\Controllers\Api\V1\ReceiptWhatsAppController;
use App\Http\Controllers\Api\V1\WhatsAppMessageController;
use App\Http\Controllers\Api\V1\WhatsAppReminderController;
use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Middleware\NoStoreHeaders;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'ok' => true,
            'service' => 'inmobiliaria-api',
            'env' => app()->environment(),
            'ts' => now()->toIso8601String(),
        ]);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);

    // ── Ventas: lectura pública (consumida por el sitio público SSG, sin auth) ──
    Route::get('/property-types', [PropertyTypeController::class, 'index']);
    Route::get('/sale-properties', [SalePropertyController::class, 'index']);
    Route::get('/sale-properties/{saleProperty}', [SalePropertyController::class, 'show']);

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

        // Envío por WhatsApp (sub-I): recibo→inquilino / rendición→dueño. Throttle anti-spam.
        Route::post('/receipts/{receipt}/whatsapp', ReceiptWhatsAppController::class)
            ->middleware('throttle:30,1');

        // Recordatorios manuales (sub-J) + historial unificado.
        Route::post('/whatsapp/payment-reminders', [WhatsAppReminderController::class, 'paymentReminders'])
            ->middleware('throttle:10,1');
        Route::post('/whatsapp/missing-items', [WhatsAppReminderController::class, 'missingItems'])
            ->middleware('throttle:60,1');
        Route::get('/whatsapp/messages', [WhatsAppMessageController::class, 'index']);
        Route::get('/whatsapp/batches/{batch}', [WhatsAppMessageController::class, 'batch']);
        Route::post('/whatsapp/batches/{batch}/retry', [WhatsAppMessageController::class, 'retry'])
            ->middleware('throttle:10,1');

        // Reporte mensual de pagos (pagados / no pagados) por mes+año.
        Route::get('/reports/monthly-payments', MonthlyPaymentsReportController::class);
        Route::apiResource('payment-methods', PaymentMethodController::class);

        // ── Ventas (Fusión NZ): escritura solo superadmin (gate manage-sales) ──
        // reorder ANTES del binding {saleProperty} para que no lo capture el modelo.
        Route::middleware('can:manage-sales')->group(function () {
            Route::post('/property-types', [PropertyTypeController::class, 'store']);
            Route::patch('/property-types/{propertyType}', [PropertyTypeController::class, 'update']);
            Route::delete('/property-types/{propertyType}', [PropertyTypeController::class, 'destroy']);

            Route::patch('/sale-properties/reorder', [SalePropertyController::class, 'reorder']);
            Route::post('/sale-properties', [SalePropertyController::class, 'store']);
            Route::patch('/sale-properties/{saleProperty}', [SalePropertyController::class, 'update']);
            Route::delete('/sale-properties/{saleProperty}', [SalePropertyController::class, 'destroy']);

            Route::patch('/sale-property-images/reorder', [SalePropertyImageController::class, 'reorder']);
            Route::post('/sale-properties/{saleProperty}/images', [SalePropertyImageController::class, 'store']);
            Route::delete('/sale-property-images/{propertyImage}', [SalePropertyImageController::class, 'destroy']);
        });
    });
});
