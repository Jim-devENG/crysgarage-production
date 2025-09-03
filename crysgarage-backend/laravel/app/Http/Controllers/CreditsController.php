<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\CreditTransaction;

class CreditsController extends Controller
{
    public function purchaseCredits(Request $request)
    {
        try {
            $request->validate([
                'tier' => 'required|in:free,pro,advanced',
                'credits' => 'required|integer|min:1',
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string'
            ]);

            $user = auth()->user();
            
            // Add credits to user
            $user->increment('credits', $request->credits);
            
            // Record transaction
            CreditTransaction::create([
                'user_id' => $user->id,
                'type' => 'purchase',
                'amount' => $request->credits,
                'tier' => $request->tier,
                'payment_amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'description' => "Purchased {$request->credits} credits for {$request->tier} tier"
            ]);

            Log::info('Credits purchased', [
                'user_id' => $user->id,
                'tier' => $request->tier,
                'credits' => $request->credits,
                'amount' => $request->amount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully purchased {$request->credits} credits",
                'credits_added' => $request->credits,
                'new_balance' => $user->fresh()->credits
            ]);

        } catch (\Exception $e) {
            Log::error('Credit purchase error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase credits'
            ], 500);
        }
    }

    public function deductCreditForDownload(Request $request)
    {
        try {
            $request->validate([
                'audio_id' => 'required|string'
            ]);

            $user = auth()->user();
            
            // Check if user has enough credits
            if ($user->credits < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient credits. Please purchase more credits to download.',
                    'required_credits' => 1,
                    'available_credits' => $user->credits
                ], 400);
            }
            
            // Deduct credit
            $user->decrement('credits', 1);
            
            // Record transaction
            CreditTransaction::create([
                'user_id' => $user->id,
                'type' => 'usage',
                'amount' => -1, // Negative for deduction
                'tier' => $user->tier,
                'description' => "Downloaded audio file: {$request->audio_id}",
                'metadata' => json_encode(['audio_id' => $request->audio_id])
            ]);

            Log::info('Credit deducted for download', [
                'user_id' => $user->id,
                'audio_id' => $request->audio_id,
                'remaining_credits' => $user->fresh()->credits
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Credit deducted successfully',
                'credits_deducted' => 1,
                'remaining_credits' => $user->fresh()->credits
            ]);

        } catch (\Exception $e) {
            Log::error('Credit deduction error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'audio_id' => $request->audio_id ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to deduct credit'
            ], 500);
        }
    }

    public function getBalance(Request $request)
    {
        try {
            $user = auth()->user();
            
            return response()->json([
                'success' => true,
                'credits' => $user->credits,
                'tier' => $user->tier
            ]);

        } catch (\Exception $e) {
            Log::error('Get balance error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get credit balance'
            ], 500);
        }
    }

    public function getCreditHistory(Request $request)
    {
        try {
            $transactions = CreditTransaction::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);

        } catch (\Exception $e) {
            Log::error('Credit history error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get credit history'
            ], 500);
        }
    }
}
