<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiPrediction extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
