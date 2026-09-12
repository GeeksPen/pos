<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CustomerController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('products', ProductController::class);
Route::apiResource('customers', CustomerController::class);
Route::get('customers/{customer}/wallet', [CustomerController::class, 'walletHistory']);
Route::apiResource('invoices', App\Http\Controllers\API\InvoiceController::class);
Route::get('invoices/{invoice}/pdf', [App\Http\Controllers\API\InvoiceController::class, 'exportPdf']);
Route::get('invoices/{invoice}/qrcode', [App\Http\Controllers\API\InvoiceController::class, 'generateQrCode']);
Route::post('register', [App\Http\Controllers\API\AuthController::class, 'register']);
Route::post('login', [App\Http\Controllers\API\AuthController::class, 'login']);

Route::apiResource('subscriptions', App\Http\Controllers\API\SubscriptionController::class);

Route::get('settings', [App\Http\Controllers\API\SettingController::class, 'index']);
Route::post('settings', [App\Http\Controllers\API\SettingController::class, 'update']);
