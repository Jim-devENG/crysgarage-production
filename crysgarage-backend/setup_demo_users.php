<?php

/**
 * Demo Users Setup Script
 * 
 * This script creates demo users for testing different tiers
 * Run this script to set up demo accounts for Free, Professional, and Advanced tiers
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Bootstrap Laravel
$app = Application::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__ . '/routes/web.php',
        api: __DIR__ . '/routes/api.php',
        commands: __DIR__ . '/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

// Run the seeder
$app->make('Illuminate\Contracts\Console\Kernel')->call('db:seed', ['--class' => 'DemoUserSeeder']);

echo "\n✅ Demo users created successfully!\n\n";
echo "📧 Demo Account Credentials:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "🎵 Free Tier:\n";
echo "   Email: demo.free@crysgarage.com\n";
echo "   Password: password\n";
echo "   Credits: 5\n\n";
echo "⚡ Professional Tier:\n";
echo "   Email: demo.pro@crysgarage.com\n";
echo "   Password: password\n";
echo "   Credits: 100\n\n";
echo "👑 Advanced Tier:\n";
echo "   Email: demo.advanced@crysgarage.com\n";
echo "   Password: password\n";
echo "   Credits: Unlimited (999)\n\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "💡 Use these accounts to test different tier features!\n\n"; 