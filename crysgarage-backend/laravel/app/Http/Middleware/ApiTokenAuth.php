<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

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
        \Log::info('=== API TOKEN AUTH DEBUG ===');
        \Log::info('Request URL:', ['url' => $request->url()]);
        \Log::info('Request method:', ['method' => $request->method()]);
        
        $token = $request->bearerToken();
        \Log::info('Bearer token:', ['token' => $token ? substr($token, 0, 20) . '...' : 'No token']);
        
        if (!$token) {
            \Log::warning('No bearer token provided');
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $user = User::where('api_token', $token)->first();
        \Log::info('User lookup result:', [
            'user_found' => !!$user,
            'user_id' => $user?->id,
            'user_email' => $user?->email
        ]);
        
        if (!$user) {
            \Log::warning('Invalid token provided', ['token_preview' => substr($token, 0, 20)]);
            return response()->json(['message' => 'Invalid token'], 401);
        }
        
        \Log::info('Authentication successful', ['user_id' => $user->id, 'email' => $user->email]);
        
        // Add user to request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        return $next($request);
    }
}
