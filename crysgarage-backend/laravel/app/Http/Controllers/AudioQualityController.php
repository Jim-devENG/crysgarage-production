<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AudioQualityController extends Controller
{
    public function getQualityOptionsForTier(Request $request)
    {
        return response()->json([
            'quality_options' => [
                ['id' => 1, 'name' => 'Standard', 'description' => 'Standard quality'],
                ['id' => 2, 'name' => 'High', 'description' => 'High quality'],
                ['id' => 3, 'name' => 'Premium', 'description' => 'Premium quality'],
            ]
        ]);
    }

    public function getAllQualityOptions(Request $request)
    {
        return response()->json([
            'quality_options' => [
                ['id' => 1, 'name' => 'Standard', 'description' => 'Standard quality'],
                ['id' => 2, 'name' => 'High', 'description' => 'High quality'],
                ['id' => 3, 'name' => 'Premium', 'description' => 'Premium quality'],
            ]
        ]);
    }

    public function createQualityOption(Request $request)
    {
        return response()->json(['message' => 'Quality option created successfully']);
    }

    public function updateQualityOption(Request $request, $id)
    {
        return response()->json(['message' => 'Quality option updated successfully']);
    }

    public function deleteQualityOption(Request $request, $id)
    {
        return response()->json(['message' => 'Quality option deleted successfully']);
    }
}
