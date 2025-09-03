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
     * Google OAuth authentication
     */
    public function googleAuth(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'google_id' => 'required|string',
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
                        'phone' => $user->phone,
                        'company' => $user->company,
                        'location' => $user->location,
                        'bio' => $user->bio,
                        'website' => $user->website,
                        'instagram' => $user->instagram,
                        'twitter' => $user->twitter,
                        'facebook' => $user->facebook,
                        'youtube' => $user->youtube,
                        'tiktok' => $user->tiktok,
                        'profile_picture' => $user->profile_picture,
                        'kyc_verified' => $user->kyc_verified,
                    ],
                    'token' => $user->api_token
                ], 200, [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'POST, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept'
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sign in user
     */
    public function signIn(Request $request)
    {
        try {
            // Try to get data from request, fallback to raw input
            $input = $request->all();
            if (empty($input)) {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true) ?: [];
                
                // If JSON decode failed, try to fix malformed JSON
                if (empty($input) && !empty($rawInput)) {
                    // Fix double-escaped JSON
                    $fixedJson = str_replace(['\\"', '\\:', '\\,'], ['"', ':', ','], $rawInput);
                    $input = json_decode($fixedJson, true) ?: [];
                }
            }
            
            // Debug logging
            error_log('SignIn - Request all: ' . json_encode($request->all()));
            error_log('SignIn - Raw input: ' . file_get_contents('php://input'));
            error_log('SignIn - Parsed input: ' . json_encode($input));
            
            $validator = Validator::make($input, [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $credentials = [
                'email' => $input['email'],
                'password' => $input['password']
            ];

            if (Auth::attempt($credentials)) {
                $user = Auth::user();
                $token = Str::random(60);
                
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
                        'phone' => $user->phone,
                        'company' => $user->company,
                        'location' => $user->location,
                        'bio' => $user->bio,
                        'website' => $user->website,
                        'instagram' => $user->instagram,
                        'twitter' => $user->twitter,
                        'facebook' => $user->facebook,
                        'youtube' => $user->youtube,
                        'tiktok' => $user->tiktok,
                        'profile_picture' => $user->profile_picture,
                        'kyc_verified' => $user->kyc_verified,
                    ],
                    'token' => $token
                ]);
            }

            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Authentication failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sign up user
     */
    public function signUp(Request $request)
    {
        try {
            // Try to get data from request, fallback to raw input
            $input = $request->all();
            if (empty($input)) {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true) ?: [];
            }
            
            // Debug logging
            error_log('SignUp - Request all: ' . json_encode($request->all()));
            error_log('SignUp - Raw input: ' . file_get_contents('php://input'));
            error_log('SignUp - Parsed input: ' . json_encode($input));
            
            $validator = Validator::make($input, [
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
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
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
                    'phone' => $user->phone,
                    'company' => $user->company,
                    'location' => $user->location,
                    'bio' => $user->bio,
                    'website' => $user->website,
                    'instagram' => $user->instagram,
                    'twitter' => $user->twitter,
                    'facebook' => $user->facebook,
                    'youtube' => $user->youtube,
                    'tiktok' => $user->tiktok,
                    'profile_picture' => $user->profile_picture,
                    'kyc_verified' => $user->kyc_verified,
                ],
                'token' => $user->api_token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sign out user
     */
    public function signOut(Request $request)
    {
        try {
            $user = $request->user();
            if ($user) {
                $user->api_token = null;
                $user->save();
            }

            return response()->json([
                'message' => 'Successfully signed out'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Sign out failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user
     */
    public function getCurrentUser(Request $request)
    {
        try {
            // Try to get user from token manually since we removed middleware
            $token = $request->bearerToken();
            $user = null;
            
            if ($token) {
                $user = User::where('api_token', $token)->first();
            }
            
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
                    'phone' => $user->phone,
                    'company' => $user->company,
                    'location' => $user->location,
                    'bio' => $user->bio,
                    'website' => $user->website,
                    'instagram' => $user->instagram,
                    'twitter' => $user->twitter,
                    'facebook' => $user->facebook,
                    'youtube' => $user->youtube,
                    'tiktok' => $user->tiktok,
                    'profile_picture' => $user->profile_picture,
                    'kyc_verified' => $user->kyc_verified,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get user data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Facebook OAuth authentication
     */
    public function facebookAuth(Request $request)
    {
        try {
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
            return response()->json([
                'message' => 'Authentication failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Not authenticated'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'company' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'bio' => 'sometimes|string|max:1000',
                'website' => 'sometimes|url|max:255',
                'instagram' => 'sometimes|string|max:100',
                'twitter' => 'sometimes|string|max:100',
                'facebook' => 'sometimes|string|max:100',
                'youtube' => 'sometimes|string|max:100',
                'tiktok' => 'sometimes|string|max:100',
                'profile_picture' => 'sometimes|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user profile
            $user->update($request->only([
                'name', 'phone', 'company', 'location', 'bio', 
                'website', 'instagram', 'twitter', 'facebook', 
                'youtube', 'tiktok', 'profile_picture'
            ]));

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
                    'phone' => $user->phone,
                    'company' => $user->company,
                    'location' => $user->location,
                    'bio' => $user->bio,
                    'website' => $user->website,
                    'instagram' => $user->instagram,
                    'twitter' => $user->twitter,
                    'facebook' => $user->facebook,
                    'youtube' => $user->youtube,
                    'tiktok' => $user->tiktok,
                    'profile_picture' => $user->profile_picture,
                    'kyc_verified' => $user->kyc_verified,
                ],
                'message' => 'Profile updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
