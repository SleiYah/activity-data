<?php

namespace App\Http\Controllers;

use App\Models\ActivityDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ActivityDetailController extends Controller
{

    public function uploadActivityData(Request $request)
    {
        set_time_limit(120); // Set to 2 minutes
        
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|string', 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'msg' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = Auth::id();
            
            // Delete all existing activity data for this user
            ActivityDetail::where('user_id', $userId)->delete();
            
            // Decode base64 string to file content
            $base64Data = $request->csv_file;
            $fileData = base64_decode($base64Data);
            
            if (!$fileData) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Invalid base64 data'
                ], 422);
            }

            // Parse CSV directly from the string
            $rows = explode("\n", $fileData);
            
            // Get headers from the first row
            $headers = str_getcsv(array_shift($rows));
            
            // Map headers to expected column names
            $headerMap = array_flip($headers);
            $requiredFields = ['date', 'steps', 'distance_km', 'active_minutes'];
            
            // Check if required headers exist
            $missingFields = array_diff($requiredFields, array_keys($headerMap));
            if (!empty($missingFields)) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Missing required CSV columns: ' . implode(', ', $missingFields)
                ], 422);
            }
            
            $insertedCount = 0;
            $errorCount = 0;
            
            // Prepare records for batch insert
            $batchSize = 100; // Process 100 records at a time
            $batch = [];
            
            // Process each CSV row
            foreach ($rows as $index => $row) {
                $row = trim($row);
                if (empty($row)) continue;
                
                $values = str_getcsv($row);
                if (count($values) !== count($headers)) {
                    $errorCount++;
                    continue;
                }
                
                // Create a record with proper key mappings
                $record = [];
                foreach ($headers as $headerIndex => $header) {
                    $record[$header] = $values[$headerIndex] ?? null;
                }
                
                // Validate required fields
                if (empty($record['date']) || !isset($record['steps']) || 
                    !isset($record['distance_km']) || !isset($record['active_minutes'])) {
                    $errorCount++;
                    continue;
                }
                
                // Add record to batch
                $batch[] = [
                    'user_id' => $userId,
                    'date' => $record['date'],
                    'steps' => (int) $record['steps'],
                    'distance_km' => (float) $record['distance_km'],
                    'active_minutes' => (int) $record['active_minutes'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // Process batch if we've reached batch size or this is the last record
                if (count($batch) >= $batchSize || $index === count($rows) - 1) {
                    if (!empty($batch)) {
                        try {
                            // Insert batch
                            ActivityDetail::insert($batch);
                            $insertedCount += count($batch);
                        } catch (\Exception $e) {
                            // Fall back to inserting records one by one if batch insert fails
                            foreach ($batch as $item) {
                                try {
                                    ActivityDetail::create($item);
                                    $insertedCount++;
                                } catch (\Exception $inner) {
                                    $errorCount++;
                                    Log::error('Error inserting record: ' . $inner->getMessage());
                                }
                            }
                        }
                        
                        // Clear batch for next round
                        $batch = [];
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'msg' => 'Existing data cleared and new activity data processed successfully',
                'stats' => [
                    'inserted' => $insertedCount,
                    'errors' => $errorCount
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('CSV Processing Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msg' => 'Failed to process activity data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
  
    public function getUserActivityData(Request $request)
    {
        $userId = Auth::id();
        $perPage = $request->input('per_page', 20); 
        
        $query = ActivityDetail::where('user_id', $userId);
        
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $activities = $query->orderBy('date', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }
    

    public function getDailyTrends(Request $request)
    {
        $userId = Auth::id();
        $days = $request->input('days', 30);
        
        if ($days > 90) {
            $days = 90;
        }
        
        $activities = ActivityDetail::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->take($days)
            ->get(['id', 'date', 'steps', 'distance_km', 'active_minutes']);
        
        $activities = $activities->sortBy('date')->values();
        
        $chartData = $activities->map(function ($activity) {
            return [
                'date' => $activity->date->format('Y-m-d'),
                'steps' => $activity->steps,
                'distance' => $activity->distance_km,
                'activeMinutes' => $activity->active_minutes,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $chartData,
            'count' => $chartData->count(),
            'requested_days' => $days
        ]);
    }
    
    public function getWeeklyTrends(Request $request)
    {
        $userId = Auth::id();
        $weeks = $request->input('weeks', 4);
        
        if ($weeks > 52) {
            $weeks = 52;
        }
        
        $activities = ActivityDetail::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->get(['id', 'date', 'steps', 'distance_km', 'active_minutes']);
        
        $weeklyData = [];
        foreach ($activities as $activity) {
            $weekStart = $activity->date->startOfWeek()->format('Y-m-d');
            
            if (!isset($weeklyData[$weekStart])) {
                if (count($weeklyData) >= $weeks) {
                    continue;
                }
                
                $weeklyData[$weekStart] = [
                    'weekStart' => $weekStart,
                    'weekEnd' => $activity->date->endOfWeek()->format('Y-m-d'),
                    'totalSteps' => 0,
                    'totalDistance' => 0,
                    'totalActiveMinutes' => 0,
                    'daysTracked' => 0,
                ];
            }
            
            $weeklyData[$weekStart]['totalSteps'] += $activity->steps;
            $weeklyData[$weekStart]['totalDistance'] += $activity->distance_km;
            $weeklyData[$weekStart]['totalActiveMinutes'] += $activity->active_minutes;
            $weeklyData[$weekStart]['daysTracked']++;
        }
        
        $result = [];
        foreach ($weeklyData as $week) {
            $daysTracked = max(1, $week['daysTracked']);
            
            $result[] = [
                'weekStart' => $week['weekStart'],
                'weekEnd' => $week['weekEnd'],
                'weekLabel' => $week['weekStart'] . ' to ' . $week['weekEnd'],
                'totalSteps' => $week['totalSteps'],
                'totalDistance' => round($week['totalDistance'], 2),
                'totalActiveMinutes' => $week['totalActiveMinutes'],
                'avgSteps' => round($week['totalSteps'] / $daysTracked),
                'avgDistance' => round($week['totalDistance'] / $daysTracked, 2),
                'avgActiveMinutes' => round($week['totalActiveMinutes'] / $daysTracked),
                'daysTracked' => $week['daysTracked']
            ];
        }
        
        usort($result, function ($a, $b) {
            return strtotime($b['weekStart']) - strtotime($a['weekStart']);
        });
        
        $result = array_slice($result, 0, $weeks);
        usort($result, function ($a, $b) {
            return strtotime($a['weekStart']) - strtotime($b['weekStart']);
        });
        
        return response()->json([
            'success' => true,
            'data' => $result,
            'count' => count($result),
            'requested_weeks' => $weeks
        ]);
    }


    public function getActivitySummary()
    {
        $userId = Auth::id();
        
        $today = now()->format('Y-m-d');
        $todayActivity = ActivityDetail::where('user_id', $userId)
            ->where('date', $today)
            ->first();
        
        $yesterday = now()->subDay()->format('Y-m-d');
        $yesterdayActivity = ActivityDetail::where('user_id', $userId)
            ->where('date', $yesterday)
            ->first();
        
        $lastWeekStart = now()->subDays(7)->format('Y-m-d');
        $lastWeekActivities = ActivityDetail::where('user_id', $userId)
            ->where('date', '>=', $lastWeekStart)
            ->where('date', '<', $today)
            ->get();
        
        $weeklyAvg = [
            'steps' => $lastWeekActivities->avg('steps') ?? 0,
            'distance_km' => $lastWeekActivities->avg('distance_km') ?? 0,
            'active_minutes' => $lastWeekActivities->avg('active_minutes') ?? 0
        ];
        
        $allTimeStats = ActivityDetail::where('user_id', $userId)
            ->selectRaw('MAX(steps) as max_steps, AVG(steps) as avg_steps, 
                        MAX(active_minutes) as max_active_minutes, 
                        AVG(active_minutes) as avg_active_minutes,
                        MAX(distance_km) as max_distance,
                        AVG(distance_km) as avg_distance,
                        COUNT(*) as total_days_tracked')
            ->first();
        
        $activities = ActivityDetail::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->get(['date'])
            ->map(function ($item) {
                return $item->date->format('Y-m-d');
            })
            ->toArray();
        
        $currentStreak = 0;
        $date = now();
        
        while (in_array($date->format('Y-m-d'), $activities)) {
            $currentStreak++;
            $date->subDay();
        }
        
        return response()->json([
            'success' => true,
            'today' => $todayActivity,
            'yesterday' => $yesterdayActivity,
            'weeklyAverage' => [
                'steps' => round($weeklyAvg['steps']),
                'distance' => round($weeklyAvg['distance_km'], 2),
                'activeMinutes' => round($weeklyAvg['active_minutes'])
            ],
            'allTime' => [
                'maxSteps' => round($allTimeStats->max_steps),
                'avgSteps' => round($allTimeStats->avg_steps),
                'maxActiveMinutes' => round($allTimeStats->max_active_minutes),
                'avgActiveMinutes' => round($allTimeStats->avg_active_minutes),
                'maxDistance' => round($allTimeStats->max_distance, 2),
                'avgDistance' => round($allTimeStats->avg_distance, 2),
                'totalDaysTracked' => $allTimeStats->total_days_tracked
            ],
            'currentStreak' => $currentStreak
        ]);
    }
}