<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get current user
     */
    public function getCurrentUser(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'tier' => $user->tier ?? 'free',
            'credits' => $user->credits ?? 5,
            'join_date' => $user->created_at->toISOString(),
            'total_tracks' => $user->total_tracks ?? 0,
            'total_spent' => $user->total_spent ?? 0,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'tier' => $user->tier ?? 'free',
            'credits' => $user->credits ?? 5,
            'join_date' => $user->created_at->toISOString(),
            'total_tracks' => $user->total_tracks ?? 0,
            'total_spent' => $user->total_spent ?? 0,
        ]);
    }

    /**
     * Get user statistics
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'total_tracks' => $user->total_tracks ?? 0,
            'total_spent' => $user->total_spent ?? 0,
            'credits_remaining' => $user->credits ?? 5,
            'tier_usage' => [
                'free' => 0,
                'pro' => 0,
                'advanced' => 0,
            ],
        ]);
    }

    /**
     * Upgrade user tier
     */
    public function upgradeTier(Request $request)
    {
        $request->validate([
            'tier' => 'required|in:free,pro,advanced',
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();
        $user->tier = $request->tier;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Tier upgraded successfully',
        ]);
    }
} 