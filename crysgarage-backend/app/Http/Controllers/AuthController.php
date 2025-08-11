<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Sign in user
     */
    public function signIn(Request $request)
    {
        \Log::info('Sign in attempt', ['email' => $request->email]);
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');
        \Log::info('Attempting authentication', ['email' => $credentials['email']]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = Str::random(60);
            
            \Log::info('Authentication successful', ['user_id' => $user->id, 'email' => $user->email]);
            
            // Store token in user record (simple approach)
            $user->api_token = $token;
            $user->save();

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tier' => $user->tier ?? 'free',
                    'credits' => $user->credits ?? 5,
                    'join_date' => $user->created_at->toISOString(),
                    'total_tracks' => $user->total_tracks ?? 0,
                    'total_spent' => $user->total_spent ?? 0,
                ],
                'token' => $token
            ]);
        }

        \Log::error('Authentication failed', ['email' => $credentials['email']]);
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Sign up user
     */
    public function signUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tier' => 'free',
            'credits' => 5,
            'total_tracks' => 0,
            'total_spent' => 0,
            'api_token' => Str::random(60),
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tier' => $user->tier,
                'credits' => $user->credits,
                'join_date' => $user->created_at->toISOString(),
                'total_tracks' => $user->total_tracks,
                'total_spent' => $user->total_spent,
            ],
            'token' => $user->api_token
        ], 201);
    }

    /**
     * Sign out user
     */
    public function signOut(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->api_token = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Successfully signed out'
        ]);
    }
} 