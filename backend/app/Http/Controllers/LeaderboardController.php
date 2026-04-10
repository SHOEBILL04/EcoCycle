<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    public function index()
    {
        // Cache leaderboard for 60 seconds
        $leaderboard = Cache::remember('leaderboard', 60, function () {
            return User::where('is_private', false)
                ->orderBy('total_points', 'desc')
                ->take(100)
                ->get(['id', 'name', 'total_points', 'user_title']);
        });

        return response()->json([
            'leaderboard' => $leaderboard
        ]);
    }
}
