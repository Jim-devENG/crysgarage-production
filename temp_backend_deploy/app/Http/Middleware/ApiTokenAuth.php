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
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $user = User::where('api_token', $token)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }
        
        // Add user to request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        return $next($request);
    }
} 