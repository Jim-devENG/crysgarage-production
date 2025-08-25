<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getCurrentUser(Request $request)
    {
        return response()->json(['message' => 'User data retrieved']);
    }

    public function updateProfile(Request $request)
    {
        return response()->json(['message' => 'Profile updated successfully']);
    }

    public function getStats(Request $request)
    {
        return response()->json(['message' => 'Stats retrieved']);
    }

    public function upgradeTier(Request $request)
    {
        return response()->json(['message' => 'Tier upgraded successfully']);
    }
}
