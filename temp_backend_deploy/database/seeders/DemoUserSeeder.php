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
        User::create([
            'name' => 'Demo Free User',
            'email' => 'demo.free@crysgarage.com',
            'password' => Hash::make('password'),
            'tier' => 'free',
            'credits' => 5,
            'total_tracks' => 0,
            'total_spent' => 0,
            'api_token' => 'demo_free_token_' . uniqid(),
        ]);

        // Demo Professional Tier User
        User::create([
            'name' => 'Demo Professional User',
            'email' => 'demo.pro@crysgarage.com',
            'password' => Hash::make('password'),
            'tier' => 'professional',
            'credits' => 100,
            'total_tracks' => 0,
            'total_spent' => 0,
            'api_token' => 'demo_pro_token_' . uniqid(),
        ]);

        // Demo Advanced Tier User
        User::create([
            'name' => 'Demo Advanced User',
            'email' => 'demo.advanced@crysgarage.com',
            'password' => Hash::make('password'),
            'tier' => 'advanced',
            'credits' => 999, // Unlimited for demo
            'total_tracks' => 0,
            'total_spent' => 0,
            'api_token' => 'demo_advanced_token_' . uniqid(),
        ]);

        $this->command->info('Demo users created successfully!');
        $this->command->info('Free Tier: demo.free@crysgarage.com / password');
        $this->command->info('Professional Tier: demo.pro@crysgarage.com / password');
        $this->command->info('Advanced Tier: demo.advanced@crysgarage.com / password');
    }
} 