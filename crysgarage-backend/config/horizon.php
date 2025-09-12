<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    |
    | This is the subdomain where Horizon will be accessible from. If this
    | setting is null, Horizon will reside under the same domain as the
    | application. Otherwise, this value will serve as the subdomain.
    |
    */

    'domain' => null,

    /*
    |--------------------------------------------------------------------------
    | Horizon Path
    |--------------------------------------------------------------------------
    |
    | This is the URI path where Horizon will be accessible from. Feel free
    | to change this path to anything you like. Note that the URI will not
    | affect the paths of its internal API that aren't exposed to users.
    |
    */

    'path' => 'horizon',

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    |
    | This is the name of the Redis connection where Horizon will store the
    | meta information required for it to function. It includes the list
    | of supervisors, failed jobs, job metrics, and other information.
    |
    */

    'use' => 'default',

    /*
    |--------------------------------------------------------------------------
    | Horizon Middleware
    |--------------------------------------------------------------------------
    |
    | This is the list of middleware that will be applied to the Horizon
    | dashboard. You may modify this list to change which middleware are
    | applied to the dashboard.
    |
    */

    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds
    |--------------------------------------------------------------------------
    |
    | This option allows you to configure when the "long wait" notification
    | will be shown. Every connection / queue combination may have its
    | own threshold. The "slow" threshold will be used as the threshold
    | for the queue connection.
    |
    */

    'waits' => [
        'redis:default' => 60,
        'redis:high-priority' => 30,
        'redis:medium-priority' => 60,
        'redis:low-priority' => 120,
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Trimming Times
    |--------------------------------------------------------------------------
    |
    | Here you can configure for how long (in minutes) you desire Horizon to
    | persist the recent and failed jobs. Typically, you want at least a few
    | minutes of history for debugging purposes. You may also want to keep
    | failed jobs for a longer period of time for debugging purposes.
    |
    */

    'trim' => [
        'recent' => 60,
        'completed' => 60,
        'recent_failed' => 10080, // 7 days
        'failed' => 10080, // 7 days
        'monitored' => 10080, // 7 days
    ],

    /*
    |--------------------------------------------------------------------------
    | Fast Termination
    |--------------------------------------------------------------------------
    |
    | When this option is enabled, Horizon's "terminate" command will not
    | wait on all of the current jobs to finish executing before terminating
    | the worker. This option should be enabled when Horizon is running in
    | a container where a SIGTERM signal will be sent to terminate workers.
    |
    */

    'fast_termination' => false,

    /*
    |--------------------------------------------------------------------------
    | Memory Limit (MB)
    |--------------------------------------------------------------------------
    |
    | This value describes the maximum amount of memory the Horizon worker
    | may consume before it is terminated and restarted. You should set
    | this value according to the resources available to your server.
    |
    */

    'memory_limit' => 512,

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the queue worker settings used by your application
    | in all environments. These supervisors and settings work together to
    | provide a robust queue processing system for your application.
    |
    */

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['high-priority'],
                'balance' => 'simple',
                'autoScaling' => true,
                'maxProcesses' => 3,
                'maxTime' => 0,
                'maxJobs' => 0,
                'memory' => 512,
                'tries' => 3,
                'timeout' => 300,
                'nice' => 0,
            ],
            'supervisor-2' => [
                'connection' => 'redis',
                'queue' => ['medium-priority'],
                'balance' => 'simple',
                'autoScaling' => true,
                'maxProcesses' => 2,
                'maxTime' => 0,
                'maxJobs' => 0,
                'memory' => 256,
                'tries' => 3,
                'timeout' => 300,
                'nice' => 0,
            ],
            'supervisor-3' => [
                'connection' => 'redis',
                'queue' => ['low-priority'],
                'balance' => 'simple',
                'autoScaling' => true,
                'maxProcesses' => 1,
                'maxTime' => 0,
                'maxJobs' => 0,
                'memory' => 128,
                'tries' => 3,
                'timeout' => 300,
                'nice' => 0,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['high-priority', 'medium-priority', 'low-priority'],
                'balance' => 'simple',
                'autoScaling' => false,
                'maxProcesses' => 2,
                'maxTime' => 0,
                'maxJobs' => 0,
                'memory' => 256,
                'tries' => 3,
                'timeout' => 300,
                'nice' => 0,
            ],
        ],
    ],
];
