<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class IdempotencyMiddleware
{
    /**
     * Handle an incoming request.
     * Ensure Idempotency-Key header is present for POST/PUT/PATCH.
     * Caches the response to avoid duplicate executions.
     */
    public function handle(Request $request, Closure $next)
    {
        if (! $request->isMethod('POST') && ! $request->isMethod('PUT') && ! $request->isMethod('PATCH')) {
            return $next($request);
        }

        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->header('X-Idempotency-Key');

        if (! $idempotencyKey) {
            return response()->json(['error' => 'Idempotency-Key header is required for this action.'], 400);
        }

        $cacheKey = "idempotency_{$idempotencyKey}";

        // If a response is already cached, return it directly
        if (Cache::has($cacheKey)) {
            $cachedResponse = Cache::get($cacheKey);
            return response($cachedResponse['content'], $cachedResponse['status'], $cachedResponse['headers']);
        }

        // Prevent concurrent execution of the same request
        // Cache::add() returns true if it was added (key didn't exist)
        if (! Cache::add($cacheKey . '_lock', true, 60)) {
            return response()->json(['error' => 'Idempotent request is already in progress. Please wait.'], 409);
        }

        try {
            $response = $next($request);

            // Store the final response (even client errors) so identical retries get the same error
            // Server errors (500) we might not want to cache so the user can retry
            if ($response->getStatusCode() < 500) {
                Cache::put($cacheKey, [
                    'content' => $response->getContent(),
                    'status'  => $response->getStatusCode(),
                    'headers' => $response->headers->all(),
                ], now()->addHours(24));
            }

            return $response;
        } finally {
            // Always clear the lock when finished
            Cache::forget($cacheKey . '_lock');
        }
    }
}
