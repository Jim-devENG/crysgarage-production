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
        ]);
    }

    /**
     * Google OAuth authentication
     */
    public function googleAuth(Request $request)
    {
        \Log::info('Google OAuth request received', $request->all());
        
        $validator = Validator::make($request->all(), [
            'google_id' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'picture' => 'nullable|string',
            'access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Google OAuth validation failed', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if user already exists by email
            $user = User::where('email', $request->email)->first();

            if ($user) {
                // User exists, update their information and generate new token
                $user->update([
                    'name' => $request->name,
                    'api_token' => Str::random(60),
                ]);

                \Log::info('Google login successful for existing user', [
                    'user_id' => $user->id, 
                    'email' => $user->email
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'tier' => 'free',
                    'credits' => 5,
                    'total_tracks' => 0,
                    'total_spent' => 0,
                    'api_token' => Str::random(60),
                ]);

                \Log::info('Google signup successful for new user', [
                    'user_id' => $user->id, 
                    'email' => $user->email
                ]);
            }

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
            ]);
        } catch (\Exception $e) {
            \Log::error('Google OAuth error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to authenticate with our servers. Please try again.'
            ], 500);
        }
    }

    /**
     * Facebook OAuth authentication
     */
    public function facebookAuth(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'facebook_id' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'picture' => 'nullable|string',
            'access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already exists by email
        $user = User::where('email', $request->email)->first();

        if ($user) {
            // User exists, update their information and generate new token
            $user->update([
                'name' => $request->name,
                'api_token' => Str::random(60),
            ]);

            \Log::info('Facebook login successful for existing user', [
                'user_id' => $user->id, 
                'email' => $user->email
            ]);
        } else {
            // Create new user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                'tier' => 'free',
                'credits' => 5,
                'total_tracks' => 0,
                'total_spent' => 0,
                'api_token' => Str::random(60),
            ]);

            \Log::info('Facebook signup successful for new user', [
                'user_id' => $user->id, 
                'email' => $user->email
            ]);
        }

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
        ]);
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

    /**
     * Get current user
     */
    public function getCurrentUser(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Not authenticated'
            ], 401);
        }

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
            ]
        ]);
    }
}
