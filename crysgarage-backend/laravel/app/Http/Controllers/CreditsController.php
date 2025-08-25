<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CreditsController extends Controller
{
    public function getBalance(Request $request)
    {
        return response()->json(['message' => 'Balance retrieved']);
    }

    public function purchase(Request $request)
    {
        return response()->json(['message' => 'Purchase successful']);
    }

    public function getHistory(Request $request)
    {
        return response()->json(['message' => 'History retrieved']);
    }
}
