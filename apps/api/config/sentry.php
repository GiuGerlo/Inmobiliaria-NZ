<?php

declare(strict_types=1);

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.0),

    'breadcrumbs' => [
        'logs'        => true,
        'cache'       => false,
        'livewire'    => false,
        'sql_queries' => false,
    ],

    'send_default_pii' => false,
];
