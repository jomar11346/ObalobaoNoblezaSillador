<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FlowerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)->prefix('/auth')->group(function () {
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::controller(AuthController::class)->prefix('/auth')->group(function () {
        Route::get('/me', 'me');
        Route::post('/logout', 'logout');
    });

    Route::controller(GenderController::class)->prefix('/gender')->group(function () {
        Route::get('/loadGenders', 'loadGenders');
    });

    Route::controller(FlowerController::class)->prefix('/flower')->group(function () {
        Route::get('/loadFlowers', 'loadFlowers');
        Route::get('/getFlower/{flowerId}', 'getFlower');
        Route::post('/storeFlower', 'storeFlower');
        Route::post('/updateFlower/{flower}', 'updateFlower');
        Route::put('/updateFlower/{flower}', 'updateFlower');
        Route::put('/destroyFlower/{flower}', 'destroyFlower');
    });

    Route::controller(CustomerController::class)->prefix('/customer')->group(function () {
        Route::get('/loadCustomers', 'loadCustomers');
        Route::post('/storeCustomer', 'storeCustomer');
        Route::post('/updateCustomer/{customer}', 'updateCustomer');
        Route::put('/updateCustomer/{customer}', 'updateCustomer');
        Route::put('/destroyCustomer/{customer}', 'destroyCustomer');
    });

    Route::controller(OrderController::class)->prefix('/order')->group(function () {
        Route::get('/loadOrders', 'loadOrders');
        Route::post('/storeOrder', 'storeOrder');
        Route::post('/updateOrderStatus/{order}', 'updateOrderStatus');
        Route::put('/destroyOrder/{order}', 'destroyOrder');
    });

    Route::controller(DashboardController::class)->prefix('/dashboard')->group(function () {
        Route::get('/getDashboardStats', 'getDashboardStats');
    });

    Route::controller(UserController::class)->prefix('/user')->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::post('/updateUser/{user}', 'updateUser');
        Route::put('/updateUser/{user}', 'updateUser');
        Route::put('/destroyUser/{user}', 'destroyUser');
    });
});
