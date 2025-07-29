<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AudioQuality;

class AudioQualityController extends Controller
{
    /**
     * Get audio quality options for a specific tier
     */
    public function getQualityOptionsForTier(Request $request)
    {
        $tier = $request->query('tier', 'free');
        
        \Log::info('Getting audio quality options for tier', ['tier' => $tier]);
        
        $qualityOptions = AudioQuality::getQualityOptionsForTier($tier);
        
        return response()->json([
            'quality_options' => $qualityOptions,
            'tier' => $tier
        ]);
    }

    /**
     * Get all audio quality options (admin endpoint)
     */
    public function getAllQualityOptions()
    {
        $qualityOptions = AudioQuality::orderBy('sort_order')->get();
        
        return response()->json([
            'quality_options' => $qualityOptions
        ]);
    }

    /**
     * Create a new audio quality option (admin endpoint)
     */
    public function createQualityOption(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sample_rate' => 'required|integer|min:8000',
            'bit_depth' => 'required|integer|in:16,24,32',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'is_free_for_tier' => 'array',
            'sort_order' => 'integer'
        ]);

        $qualityOption = AudioQuality::create($request->all());

        return response()->json([
            'message' => 'Audio quality option created successfully',
            'quality_option' => $qualityOption
        ], 201);
    }

    /**
     * Update an audio quality option (admin endpoint)
     */
    public function updateQualityOption(Request $request, $id)
    {
        $qualityOption = AudioQuality::findOrFail($id);
        
        $request->validate([
            'name' => 'string|max:255',
            'sample_rate' => 'integer|min:8000',
            'bit_depth' => 'integer|in:16,24,32',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'is_free_for_tier' => 'array',
            'sort_order' => 'integer'
        ]);

        $qualityOption->update($request->all());

        return response()->json([
            'message' => 'Audio quality option updated successfully',
            'quality_option' => $qualityOption
        ]);
    }

    /**
     * Delete an audio quality option (admin endpoint)
     */
    public function deleteQualityOption($id)
    {
        $qualityOption = AudioQuality::findOrFail($id);
        $qualityOption->delete();

        return response()->json([
            'message' => 'Audio quality option deleted successfully'
        ]);
    }
}