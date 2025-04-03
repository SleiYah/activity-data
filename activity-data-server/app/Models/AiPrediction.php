<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiPrediction extends Model
{
    use HasFactory;
    
    
    protected $fillable = [
        'user_id',
        'prediction_type',
        'prediction_result',
    ];
    
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}