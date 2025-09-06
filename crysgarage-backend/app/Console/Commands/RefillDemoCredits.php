<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class RefillDemoCredits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:refill-credits';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refill demo account credits to their original values';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Refilling Demo Account Credits...');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Refill Free Tier Demo Account
        $freeUser = User::where('email', 'demo.free@crysgarage.com')->first();
        if ($freeUser) {
            $oldCredits = $freeUser->credits;
            $freeUser->credits = 0; // No free credits - pay per download
            $freeUser->save();
            $this->info('✅ Free Tier Demo Account Refilled:');
            $this->line("   📧 Email: demo.free@crysgarage.com");
            $this->line("   💰 Credits: {$oldCredits} → 0 (Pay per download)");
        } else {
            $this->error('❌ Free Tier Demo Account not found');
        }

        // Refill Professional Tier Demo Account
        $proUser = User::where('email', 'demo.pro@crysgarage.com')->first();
        if ($proUser) {
            $oldCredits = $proUser->credits;
            $proUser->credits = 5; // Reset to new 5 credits for $15.00
            $proUser->save();
            $this->info('✅ Professional Tier Demo Account Refilled:');
            $this->line("   📧 Email: demo.pro@crysgarage.com");
            $this->line("   💰 Credits: {$oldCredits} → 5 (New $15.00 pricing)");
        } else {
            $this->error('❌ Professional Tier Demo Account not found');
        }

        // Refill Advanced Tier Demo Account
        $advancedUser = User::where('email', 'demo.advanced@crysgarage.com')->first();
        if ($advancedUser) {
            $oldCredits = $advancedUser->credits;
            $advancedUser->credits = 6; // Reset to new 6 credits (5 + 1 bonus) for $25.00
            $advancedUser->save();
            $this->info('✅ Advanced Tier Demo Account Refilled:');
            $this->line("   📧 Email: demo.advanced@crysgarage.com");
            $this->line("   💰 Credits: {$oldCredits} → 6 (5 + 1 bonus for $25.00)");
        } else {
            $this->error('❌ Advanced Tier Demo Account not found');
        }

        $this->line('');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('🎯 Demo accounts are ready for testing!');
        $this->line('💡 Use these accounts to test different tier features:');
        $this->line('   • Free Tier: demo.free@crysgarage.com / password');
        $this->line('   • Professional: demo.pro@crysgarage.com / password');
        $this->line('   • Advanced: demo.advanced@crysgarage.com / password');
        $this->line('');
    }
}
