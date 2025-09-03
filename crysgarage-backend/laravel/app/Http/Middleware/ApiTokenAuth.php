<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        Log::info('API Token Auth Middleware', [
            'token' => $token ? substr($token, 0, 10) . '...' : 'null',
            'url' => $request->url(),
            'method' => $request->method()
        ]);

        if (!$token) {
            Log::warning('No token provided');
            return response()->json(['message' => 'No token provided'], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            Log::warning('Invalid token provided', ['token' => substr($token, 0, 10) . '...']);
            return response()->json(['message' => 'Invalid token'], 401);
        }

        // Set the authenticated user
        auth()->login($user);
        
        Log::info('User authenticated successfully', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return $next($request);
    }
}
