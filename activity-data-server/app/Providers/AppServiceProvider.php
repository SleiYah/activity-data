<?php

namespace App\Providers;

use App\Events\AiPredictionsEvent;
use App\Listeners\AiPredictionsListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public function register(): void
    {
    }

 
    public function boot(): void
    {
        Event::listen(
            AiPredictionsEvent::class,
            AiPredictionsListener::class
        );
    }
}