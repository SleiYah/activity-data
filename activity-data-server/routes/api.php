<?php

use App\Http\Controllers\ActivityDetailController;
use App\Http\Controllers\AiPredictionController;
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
        Route::group(["prefix" => "predictions"], function() {
            Route::post('/goal', [AiPredictionController::class, 'predictGoalAchievement']);
            Route::post('/deviations', [AiPredictionController::class, 'detectPatternDeviations']);
            Route::post('/trends', [AiPredictionController::class, 'predictFutureTrends']);
            Route::post('/insights', [AiPredictionController::class, 'generateInsights']);
            Route::get('/get-predictions', [AiPredictionController::class, 'getUserPredictions']);

        });
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
