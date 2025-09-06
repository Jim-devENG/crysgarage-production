<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Demo Free Tier User
        User::updateOrCreate(
            ['email' => 'demo.free@crysgarage.com'],
            [
                'name' => 'Demo Free User',
                'password' => Hash::make('password'),
                'tier' => 'free',
                'credits' => 0, // Free tier users start with 0 credits (pay per download)
                'total_tracks' => 0,
                'total_spent' => 0,
                'api_token' => 'demo_free_token_' . uniqid(),
            ]
        );

        // Demo Professional Tier User
        User::updateOrCreate(
            ['email' => 'demo.pro@crysgarage.com'],
            [
                'name' => 'Demo Professional User',
                'password' => Hash::make('password'),
                'tier' => 'professional',
                'credits' => 5, // New pricing: 5 credits for $15.00
                'total_tracks' => 0,
                'total_spent' => 0,
                'api_token' => 'demo_pro_token_' . uniqid(),
            ]
        );

        // Demo Advanced Tier User
        User::updateOrCreate(
            ['email' => 'demo.advanced@crysgarage.com'],
            [
                'name' => 'Demo Advanced User',
                'password' => Hash::make('password'),
                'tier' => 'advanced',
                'credits' => 6, // New pricing: 6 credits (5 + 1 bonus) for $25.00
                'total_tracks' => 0,
                'total_spent' => 0,
                'api_token' => 'demo_advanced_token_' . uniqid(),
            ]
        );

        $this->command->info('Demo users created successfully!');
        $this->command->info('Free Tier: demo.free@crysgarage.com / password');
        $this->command->info('Professional Tier: demo.pro@crysgarage.com / password');
        $this->command->info('Advanced Tier: demo.advanced@crysgarage.com / password');
    }
} 