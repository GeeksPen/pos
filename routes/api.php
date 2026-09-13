<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SubscriptionController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\AnalyticsController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('products', ProductController::class);

    Route::apiResource('customers', CustomerController::class);
    Route::get('customers/{customer}/wallet', [CustomerController::class, 'walletHistory']);

    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'exportPdf']);
    Route::get('invoices/{invoice}/qrcode', [InvoiceController::class, 'generateQrCode']);

    Route::apiResource('subscriptions', SubscriptionController::class);

    Route::get('settings', [SettingController::class, 'index']);
    Route::post('settings', [SettingController::class, 'update']);

    Route::get('analytics', [AnalyticsController::class, 'index']);
});
