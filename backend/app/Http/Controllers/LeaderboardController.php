<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        // Cache leaderboard for 60 seconds
        $leaderboard = Cache::remember('leaderboard', 60, function () {
            return User::where('is_private', false)
                ->orderBy('total_points', 'desc')
                ->take(100)
                ->get(['id', 'name', 'total_points', 'user_title']);
        });

        $user = $request->user();
        $globalRank = null;
        $clanRank = null;

        if ($user) {
            $globalRank = User::where('total_points', '>', $user->total_points)
                        ->orWhere(function($query) use ($user) {
                            $query->where('total_points', '=', $user->total_points)
                                  ->where('id', '<', $user->id);
                        })->count() + 1;

            if ($user->clan_id) {
                $clanRank = User::where('clan_id', $user->clan_id)
                            ->where(function ($q) use ($user) {
                                $q->where('total_points', '>', $user->total_points)
                                  ->orWhere(function($subQ) use ($user) {
                                      $subQ->where('total_points', '=', $user->total_points)
                                           ->where('id', '<', $user->id);
                                  });
                            })->count() + 1;
            }
        }

        return response()->json([
            'leaderboard' => $leaderboard,
            'user_ranks' => [
                'global' => $globalRank,
                'clan' => $clanRank,
            ]
        ]);
    }
}
