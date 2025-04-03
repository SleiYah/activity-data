<?php

namespace App\Listeners;

use App\Events\AiPredictionsEvent;
use App\Http\Controllers\AiPredictionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AiPredictionsListener
{
    /**
     * The AI prediction controller instance.
     *
     * @var \App\Http\Controllers\AiPredictionController
     */
    protected $aiPredictionController;
    
    /**
     * Create the event listener.
     *
     * @param \App\Http\Controllers\AiPredictionController $aiPredictionController
     * @return void
     */
    public function __construct(AiPredictionController $aiPredictionController)
    {
        $this->aiPredictionController = $aiPredictionController;
    }
    
    /**
     * Handle the event.
     *
     * @param \App\Events\AiPredictionsEvent $event
     * @return void
     */
    public function handle(AiPredictionsEvent $event)
    {
        try {
            // Set the authenticated user for the request
            Auth::loginUsingId($event->userId);
            
            Log::info('Generating AI predictions for user: ' . $event->userId);
            
            // Generate all predictions
            $this->aiPredictionController->predictGoalAchievement(new Request());
            $this->aiPredictionController->detectPatternDeviations(new Request());
            $this->aiPredictionController->predictFutureTrends(new Request());
            $this->aiPredictionController->generateInsights();
            
            Log::info('AI prediction generation completed for user: ' . $event->userId);
        } catch (\Exception $e) {
            Log::error('Failed to generate AI predictions: ' . $e->getMessage());
        }
    }
}