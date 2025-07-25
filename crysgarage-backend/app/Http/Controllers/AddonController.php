<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AddonController extends Controller
{
    /**
     * Get available addons
     */
    public function getAddons(Request $request)
    {
        $user = $request->user();
        
        // In a real app, you'd query a database
        // For now, we'll return sample addons
        
        $addons = [
            [
                'id' => 1,
                'name' => 'Advanced EQ Suite',
                'description' => 'Professional 8-band parametric EQ with presets',
                'price' => 29.99,
                'required_tier' => 'advanced',
                'category' => 'processing',
                'features' => ['8-band parametric EQ', 'Genre presets', 'Real-time preview'],
                'is_purchased' => false,
            ],
            [
                'id' => 2,
                'name' => 'Compression Master',
                'description' => 'Multi-band compression with advanced controls',
                'price' => 19.99,
                'required_tier' => 'pro',
                'category' => 'processing',
                'features' => ['Multi-band compression', 'Sidechain options', 'Visual feedback'],
                'is_purchased' => false,
            ],
            [
                'id' => 3,
                'name' => 'Stereo Enhancement',
                'description' => 'Advanced stereo width and imaging tools',
                'price' => 14.99,
                'required_tier' => 'pro',
                'category' => 'stereo',
                'features' => ['Stereo width control', 'Mid-side processing', 'Phase correlation'],
                'is_purchased' => false,
            ],
            [
                'id' => 4,
                'name' => 'Loudness Analyzer',
                'description' => 'Professional loudness metering and analysis',
                'price' => 24.99,
                'required_tier' => 'advanced',
                'category' => 'analysis',
                'features' => ['LUFS metering', 'True peak detection', 'Dynamic range analysis'],
                'is_purchased' => false,
            ],
        ];
        
        // Filter based on user tier
        $userTier = $user->tier ?? 'free';
        $tierHierarchy = ['free' => 0, 'pro' => 1, 'advanced' => 2];
        $userTierLevel = $tierHierarchy[$userTier] ?? 0;
        
        foreach ($addons as &$addon) {
            $requiredTierLevel = $tierHierarchy[$addon['required_tier']] ?? 0;
            $addon['can_access'] = $userTierLevel >= $requiredTierLevel;
        }
        
        return response()->json($addons);
    }

    /**
     * Get user's purchased addons
     */
    public function getUserAddons(Request $request)
    {
        $user = $request->user();
        
        // In a real app, you'd query a user_addons table
        // For now, we'll return an empty array
        
        return response()->json([]);
    }

    /**
     * Purchase addon
     */
    public function purchaseAddon($addonId, Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();
        
        // In a real app, you'd:
        // 1. Verify the addon exists
        // 2. Check if user can afford it
        // 3. Process payment
        // 4. Add addon to user's account
        
        return response()->json([
            'success' => true,
            'message' => 'Addon purchased successfully',
        ]);
    }
} 