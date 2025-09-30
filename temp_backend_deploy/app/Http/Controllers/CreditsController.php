<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CreditsController extends Controller
{
    /**
     * Get credit balance
     */
    public function getBalance(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'credits' => $user->credits ?? 5,
            'tier' => $user->tier ?? 'free',
        ]);
    }

    /**
     * Purchase credits
     */
    public function purchase(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();
        $amount = $request->input('amount');
        
        // In a real app, you'd process payment here
        // For now, we'll just add the credits
        
        $user->credits = ($user->credits ?? 0) + $amount;
        $user->save();

        return response()->json([
            'success' => true,
            'credits_added' => $amount,
        ]);
    }

    /**
     * Get credit history
     */
    public function getHistory(Request $request)
    {
        $user = $request->user();

        // In a real app, you'd query a credit history table
        // For now, we'll return a sample history
        
        return response()->json([
            [
                'id' => 1,
                'type' => 'purchase',
                'amount' => 10,
                'description' => 'Credit purchase',
                'created_at' => now()->subDays(5)->toISOString(),
            ],
            [
                'id' => 2,
                'type' => 'usage',
                'amount' => -1,
                'description' => 'Audio mastering',
                'created_at' => now()->subDays(2)->toISOString(),
            ],
        ]);
    }
} 