#!/bin/bash

# Crys Garage Deployment Fixes Script
# This script fixes the login modal issues and backend API problems

echo "🚀 Deploying Crys Garage fixes..."

# 1. Deploy frontend fixes
echo "📦 Deploying frontend fixes..."
cd /var/www/crysgarage/crysgarage-frontend
npm run build

# 2. Fix backend API issues
echo "🔧 Fixing backend API issues..."
cd /var/www/crysgarage/crysgarage-backend

# Create a more robust bootstrap/app.php
cat > bootstrap/app.php << 'EOF'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Set PHP configuration for large file uploads
if (function_exists('ini_set')) {
    ini_set('upload_max_filesize', '100M');
    ini_set('post_max_size', '100M');
    ini_set('max_execution_time', '300');
    ini_set('max_input_time', '300');
    ini_set('memory_limit', '256M');
    ini_set('max_file_uploads', '20');
    ini_set('max_input_vars', '3000');
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add JSON parsing middleware for API routes
        $middleware->alias([
            'json' => \Illuminate\Http\Middleware\HandleJsonRequests::class,
        ]);
        
        // Configure API middleware group
        $middleware->group('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
        // Configure web middleware group
        $middleware->group('web', [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
EOF

# 3. Create a more robust AuthController
cat > app/Http/Controllers/AuthController.php << 'EOF'
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
        // Log the raw request for debugging
        \Log::info('Sign in request received', [
            'content_type' => $request->header('Content-Type'),
            'raw_content' => $request->getContent(),
            'all_data' => $request->all(),
            'json_data' => $request->json()->all()
        ]);

        // Try multiple ways to get the input data
        $input = $request->all();
        
        // If the request is empty, try to parse JSON from raw input
        if (empty($input)) {
            $rawInput = $request->getContent();
            if (!empty($rawInput)) {
                $input = json_decode($rawInput, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    \Log::info('Parsed JSON input manually', $input);
                } else {
                    \Log::error('Failed to parse JSON input', ['raw' => $rawInput, 'error' => json_last_error_msg()]);
                }
            }
        }

        // If still empty, try JSON method
        if (empty($input)) {
            $input = $request->json()->all();
            \Log::info('Got input from json() method', $input);
        }

        \Log::info('Final input data', ['input' => $input]);

        $validator = Validator::make($input, [
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

        $credentials = [
            'email' => $input['email'],
            'password' => $input['password']
        ];
        
        \Log::info('Attempting authentication', ['email' => $credentials['email']]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = Str::random(60);

            \Log::info('Authentication successful', ['user_id' => $user->id, 'email' => $user->email]);

            // Store token in user record
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
        // Log the raw request for debugging
        \Log::info('Sign up request received', [
            'content_type' => $request->header('Content-Type'),
            'raw_content' => $request->getContent(),
            'all_data' => $request->all(),
            'json_data' => $request->json()->all()
        ]);

        // Try multiple ways to get the input data
        $input = $request->all();
        
        // If the request is empty, try to parse JSON from raw input
        if (empty($input)) {
            $rawInput = $request->getContent();
            if (!empty($rawInput)) {
                $input = json_decode($rawInput, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    \Log::info('Parsed JSON input manually', $input);
                } else {
                    \Log::error('Failed to parse JSON input', ['raw' => $rawInput, 'error' => json_last_error_msg()]);
                }
            }
        }

        // If still empty, try JSON method
        if (empty($input)) {
            $input = $request->json()->all();
            \Log::info('Got input from json() method', $input);
        }

        \Log::info('Final input data', ['input' => $input]);

        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', $validator->errors()->toArray());
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

        \Log::info('User created successfully', ['user_id' => $user->id, 'email' => $user->email]);

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
        $user = Auth::user();
        if ($user) {
            $user->api_token = null;
            $user->save();
            \Log::info('User signed out', ['user_id' => $user->id]);
        }

        Auth::logout();
        
        return response()->json([
            'message' => 'Signed out successfully'
        ]);
    }
}
EOF

# 4. Ensure database exists and has demo users
echo "🗄️ Setting up database..."
if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
    chown nginx:nginx database/database.sqlite
    chmod 664 database/database.sqlite
fi

# Run migrations
php artisan migrate --force

# Seed demo users
php artisan db:seed --class=DemoUserSeeder --force

# 5. Restart services
echo "🔄 Restarting services..."
systemctl restart crysgarage-backend
systemctl restart nginx

echo "✅ All fixes deployed successfully!"
echo ""
echo "🎯 Frontend fixes:"
echo "   - Modal close button now works"
echo "   - Backdrop click to close added"
echo "   - Demo credentials updated"
echo ""
echo "🔧 Backend fixes:"
echo "   - Enhanced JSON parsing in AuthController"
echo "   - Improved error logging"
echo "   - Database and demo users ensured"
echo ""
echo "🧪 Test with:"
echo "   Email: demo.free@crysgarage.com"
echo "   Password: password" 