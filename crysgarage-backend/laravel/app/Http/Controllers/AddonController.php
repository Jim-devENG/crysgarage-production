<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function getAddons(Request $request)
    {
        return response()->json(['message' => 'Addons retrieved']);
    }

    public function getUserAddons(Request $request)
    {
        return response()->json(['message' => 'User addons retrieved']);
    }

    public function purchaseAddon(Request $request, $addon_id)
    {
        return response()->json(['message' => 'Addon purchased successfully']);
    }
}
