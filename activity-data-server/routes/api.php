<?php

use App\Http\Controllers\ActivityDetailController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v0.1"], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::group(["prefix" => "activity"] , function(){

            Route::post('/upload', [ActivityDetailController::class, 'uploadActivityData']);
            Route::get('/data', [ActivityDetailController::class, 'getUserActivityData']);
            Route::get('/daily', [ActivityDetailController::class, 'getDailyTrends']);
            Route::get('/weekly', [ActivityDetailController::class, 'getWeeklyTrends']);
            Route::get('/summary', [ActivityDetailController::class, 'getActivitySummary']);
    
    
        });
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
