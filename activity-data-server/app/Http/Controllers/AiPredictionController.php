<?php

namespace App\Http\Controllers;

use App\Models\AiPrediction;
use App\Models\ActivityDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiPredictionController extends Controller
{
    protected $activityDetailController;
    protected $geminiApiKey;
    protected $geminiApiUrl;

    public function __construct(ActivityDetailController $activityDetailController)
    {
        $this->activityDetailController = $activityDetailController;
        $this->geminiApiKey = env('GEMINI_API_KEY');
        $this->geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    }

 
    public function predictGoalAchievement(Request $request)
    {
        try {
            $userId = Auth::id();
            $stepsGoal = $request->input('goal', 10000); 
            
            
            $activityResponse = $this->activityDetailController->getDailyTrends(new Request([
                'days' => 30 
            ]));
            
            $activityData = json_decode($activityResponse->getContent())->data;
            
            if (empty($activityData)) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Not enough activity data to make a prediction'
                ], 400);
            }
            
            
            $formattedData = [];
            foreach ($activityData as $day) {
                $formattedData[] = [
                    'date' => $day->date,
                    'steps' => $day->steps
                ];
            }
            
            
            $summaryResponse = $this->activityDetailController->getActivitySummary();
            $summaryData = json_decode($summaryResponse->getContent());
            
            
            $prompt = "Based on the following historical activity data, predict whether the user will achieve their daily steps goal of {$stepsGoal} steps tomorrow. ";
            $prompt .= "User's average daily steps: " . $summaryData->allTime->avgSteps . ". ";
            $prompt .= "User's daily steps data for the last 30 days: " . json_encode($formattedData) . ". ";
            $prompt .= "Analyze this data for patterns (weekday vs weekend trends, recent performance, overall consistency). ";
            $prompt .= "Your response should be conversational and encouraging, as if you're talking directly to the user. Use a friendly, supportive tone. ";
            $prompt .= "Include specific observations about their data that show you've analyzed their personal patterns. ";
            $prompt .= "Mention specific dates or trends when relevant. Add a motivational tip at the end. ";
            $prompt .= "While being conversational, make sure to still return your answer as valid JSON in this format: ";
            $prompt .= "{\"prediction\": \"yes\" or \"no\", \"confidence_percentage\": number, \"reasoning\": \"your conversational explanation here\"}";
            
            
            $response = $this->callGeminiApi($prompt);
            
            
            $prediction = new AiPrediction();
            $prediction->user_id = $userId;
            $prediction->prediction_type = 'goal_achievement';
            $prediction->prediction_result = $response;
            $prediction->save();
            
            return response()->json([
                'success' => true,
                'prediction' => json_decode($response)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Steps goal prediction error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msg' => 'Failed to generate steps goal prediction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
  
    public function detectPatternDeviations(Request $request)
    {
        try {
            $userId = Auth::id();
            $days = $request->input('days', 60); 
            
            
            $activityResponse = $this->activityDetailController->getDailyTrends(new Request([
                'days' => $days
            ]));
            
            $activityData = json_decode($activityResponse->getContent())->data;
            
            if (count($activityData) < 14) { 
                return response()->json([
                    'success' => false,
                    'msg' => 'Not enough activity data to detect patterns. Need at least 14 days.'
                ], 400);
            }
            
            
            $prompt = "You are an AI fitness analyst. Analyze this fitness activity data and identify exactly 3 days when the user's activity significantly deviates from their normal pattern: " . json_encode($activityData) . " ";
            $prompt .= "Focus on clear statistical outliers where activity levels are notably different from the user's averages. ";
            $prompt .= "For each deviation you identify: ";
            $prompt .= "1. Explain it in a conversational, friendly tone as if talking directly to the user ";
            $prompt .= "2. Use supportive language even for low-activity days ";
            $prompt .= "3. Make observations specific to their data patterns ";
            $prompt .= "4. Note the approximate percentage difference from their average ";
            $prompt .= "IMPORTANT: Your response MUST be a valid JSON array with exactly this format and no additional text before or after: ";
            $prompt .= "[{\"date\": \"YYYY-MM-DD\", \"deviation_type\": \"higher\" or \"lower\", \"metrics_affected\": [\"steps\", \"distance\", \"activeMinutes\"], \"magnitude\": \"XX% above/below average\", \"explanation\": \"your friendly explanation\"}]";
            $prompt .= " Ensure your response is correctly formatted as valid JSON that can be parsed with JSON.parse().";
            
            
            $response = $this->callGeminiApi($prompt);
            
            
            $prediction = new AiPrediction();
            $prediction->user_id = $userId;
            $prediction->prediction_type = 'pattern_deviation';
            $prediction->prediction_result = $response;
            $prediction->save();
            
            return response()->json([
                'success' => true,
                'deviations' => json_decode($response)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Pattern deviation detection error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msg' => 'Failed to detect pattern deviations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function predictFutureTrends(Request $request)
    {
        try {
            $userId = Auth::id();
            $daysToPredict = $request->input('days_to_predict', 7); 
            
            
            $activityResponse = $this->activityDetailController->getDailyTrends(new Request([
                'days' => 90
            ]));
            
            $activityData = json_decode($activityResponse->getContent())->data;
            
            if (count($activityData) < 30) { 
                return response()->json([
                    'success' => false,
                    'msg' => 'Not enough historical data. Need at least 30 days for accurate active minutes predictions.'
                ], 400);
            }
            
            
            $formattedDailyData = [];
            foreach ($activityData as $day) {
                $formattedDailyData[] = [
                    'date' => $day->date,
                    'activeMinutes' => $day->activeMinutes
                ];
            }
            
            
            $prompt = "Based on this historical active minutes data for the past " . count($activityData) . " days: " . json_encode($formattedDailyData) . ", ";
            $prompt .= "predict the user's active minutes for the next {$daysToPredict} days. ";
            $prompt .= "Consider day-of-week patterns and recent trends in daily activity. ";
            $prompt .= "Be conversational and personalized in your analysis, as if you're talking directly to the user. ";
            $prompt .= "Include observations about their specific patterns and any interesting insights you discover. ";
            $prompt .= "Return your prediction as a JSON array of objects, one for each future day, with the format: ";
            $prompt .= "{\"date\": \"YYYY-MM-DD\", \"activeMinutes\": number, \"confidence\": percentage, \"explanation\": \"brief personalized explanation for this day's prediction\"}";
            
            
            $response = $this->callGeminiApi($prompt);
            
            
            $prediction = new AiPrediction();
            $prediction->user_id = $userId;
            $prediction->prediction_type = 'future_trend';
            $prediction->prediction_result = $response;
            $prediction->save();
            
            return response()->json([
                'success' => true,
                'predictions' => json_decode($response)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Active minutes prediction error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msg' => 'Failed to predict active minutes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    
   
    public function generateInsights()
    {
        try {
            $userId = Auth::id();
            
            
            $summaryResponse = $this->activityDetailController->getActivitySummary();
            $summaryData = json_decode($summaryResponse->getContent());
            
            
            $dailyResponse = $this->activityDetailController->getDailyTrends(new Request([
                'days' => 30
            ]));
            $dailyData = json_decode($dailyResponse->getContent())->data;
            
            if (empty($dailyData) || count($dailyData) < 14) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Not enough activity data to generate insights. Need at least 14 days.'
                ], 400);
            }
            
            
            $prompt = "You are a fitness and health AI assistant. Analyze this user's activity data and provide ONE comprehensive, personalized insight. ";
            $prompt .= "Daily activity data: " . json_encode($dailyData) . ". ";
            $prompt .= "Activity summary: " . json_encode($summaryData) . ". ";
            $prompt .= "Based on this data, create a single, detailed insight that covers: ";
            $prompt .= "- The user's strongest patterns (when they're most/least active) ";
            $prompt .= "- How they compare to typical fitness recommendations ";
            $prompt .= "- One specific area for improvement ";
            $prompt .= "- A concrete, actionable suggestion they can implement immediately ";
            $prompt .= "Make your response conversational and motivational, as if you're a personal coach talking directly to them. ";
            $prompt .= "Highlight specific data points from their history to make it personalized. ";
            $prompt .= "Format your response as a single JSON object: ";
            $prompt .= "{\"title\": \"catchy title for the insight\", \"insight\": \"your conversational, personalized insight\", \"action_step\": \"one clear action they can take\"}";
            
            
            $response = $this->callGeminiApi($prompt);
            
            
            $prediction = new AiPrediction();
            $prediction->user_id = $userId;
            $prediction->prediction_type = 'insight';
            $prediction->prediction_result = $response;
            $prediction->save();
            
            return response()->json([
                'success' => true,
                'insight' => json_decode($response)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Insight generation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msg' => 'Failed to generate insight',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
 
 
    protected function callGeminiApi($prompt)
    {
        $response = Http::withOptions([
            'verify' => false, 
        ])->withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, [
                'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2, 
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
                'responseMimeType' => 'application/json'
            ]
        ]);
        
        if ($response->successful()) {
            $data = $response->json();
            
            
            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                return $data['candidates'][0]['content']['parts'][0]['text'];
            }
            
            throw new \Exception('Unexpected Gemini API response format');
        }
        
        throw new \Exception('Gemini API request failed: ' . $response->body());
    }
}