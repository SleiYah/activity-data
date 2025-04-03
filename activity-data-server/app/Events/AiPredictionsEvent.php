<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AiPredictionsEvent
{
    use Dispatchable, SerializesModels;
    
    public $userId;
    
    public function __construct($userId)
    {
        $this->userId = $userId;
    }
}