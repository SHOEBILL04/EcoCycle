<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Global Leaderboard
        $global = Cache::remember('leaderboard_global', 60, function () {
            return User::where('is_private', false)
                ->where('is_banned', false)
                ->withCount(['submissions as total_count'])
                ->withCount(['submissions as rewarded_count' => function($q) {
                    $q->where('status', 'REWARDED');
                }])
                ->orderBy('total_points', 'desc')
                ->take(100)
                ->get();
        })->map(function ($u, $index) use ($user) {
            $accuracy = $u->total_count > 0 ? round(($u->rewarded_count / $u->total_count) * 100, 1) : 0;
            return [
                'rank' => $index + 1,
                'id' => $u->id,
                'name' => $u->name,
                'username' => '@' . strtolower(str_replace(' ', '', $u->name)),
                'points' => $u->total_points,
                'accuracy' => $accuracy,
                'submissions' => $u->total_count, 
                'change' => 0,
                'avatar' => strtoupper(substr($u->name, 0, 2)),
                'color' => 'from-gray-400 to-gray-500',
                'isYou' => $user && $user->id === $u->id,
                'following' => false,
            ];
        });

        // 2. Clan Leaderboard
        $clans = Cache::remember('leaderboard_clans', 60, function () {
            $allClans = \App\Models\Clan::withCount('users')
                ->withSum('users', 'total_points')
                ->withSum('users', 'flags')
                ->get();

            return $allClans->map(function ($clan) {
                $loc = trim(str_ireplace('Titans', '', $clan->name));
                return [
                    'id' => (string) $clan->id,
                    'name' => $clan->name,
                    'tag' => strtoupper(substr($loc, 0, 3)),
                    'members' => $clan->users_count,
                    'totalPoints' => $clan->users_sum_total_points ?? 0,
                    'avgAccuracy' => 95.0,
                    'location' => $loc,
                    'change' => 0,
                    'flaggedMembers' => $clan->users_sum_flags ?? 0,
                ];
            })->sortByDesc('totalPoints')->values()->map(function ($clan, $index) {
                $clan['rank'] = $index + 1;
                return $clan;
            });
        });

        // 3. My Clan Members
        $myClanMembers = [];
        if ($user && $user->clan_id) {
            $myClanMembers = User::where('clan_id', $user->clan_id)
                ->where('is_banned', false)
                ->withCount(['submissions as total_count'])
                ->withCount(['submissions as rewarded_count' => function($q) {
                    $q->where('status', 'REWARDED');
                }])
                ->orderBy('total_points', 'desc')
                ->get()
                ->map(function($u, $index) use ($user) {
                    $accuracy = $u->total_count > 0 ? round(($u->rewarded_count / $u->total_count) * 100, 1) : 0;
                    return [
                        'rank' => $index + 1,
                        'id' => $u->id,
                        'name' => $u->name,
                        'username' => '@' . strtolower(str_replace(' ', '', $u->name)),
                        'points' => $u->total_points,
                        'accuracy' => $accuracy,
                        'submissions' => $u->total_count,
                        'change' => 0,
                        'avatar' => strtoupper(substr($u->name, 0, 2)),
                        'color' => 'from-emerald-400 to-emerald-600',
                        'isYou' => $user->id === $u->id,
                        'following' => false,
                    ];
                });
        }

        // 4. User's Own Dynamic Info
        $myInfo = null;
        $myClanInfo = null;
        if ($user) {
            $myRank = User::where('total_points', '>', $user->total_points)->count() + 1;
            $myInfo = [
                'rank' => $myRank,
                'name' => $user->name,
                'points' => $user->total_points,
                'avatar' => strtoupper(substr($user->name, 0, 2))
            ];

            if ($user->clan_id) {
                // Find clan's global rank among clans to display in the My Clan card
                $allClansPoints = \App\Models\Clan::withSum('users', 'total_points')->get()->sortByDesc('users_sum_total_points')->values();
                $myClanRank = $allClansPoints->search(function($c) use ($user) {
                    return $c->id === $user->clan_id;
                }) !== false ? $allClansPoints->search(function($c) use ($user) {
                    return $c->id === $user->clan_id;
                }) + 1 : '-';

                $c = $user->clan;
                $loc = trim(str_ireplace('Titans', '', $c->name));
                $myClanInfo = [
                    'rank' => $myClanRank,
                    'name' => $c->name,
                    'tag' => strtoupper(substr($loc, 0, 3)),
                    'points' => $allClansPoints->firstWhere('id', $user->clan_id)->users_sum_total_points ?? 0
                ];
            }
        }

        // Return combined standard packet used by the new frontend requirements
        return response()->json([
            'global' => $global,
            'clans' => $clans,
            'my_clan' => $myClanMembers,
            'my_info' => $myInfo,
            'my_clan_info' => $myClanInfo,
            'userClanId' => $user ? (string)$user->clan_id : null,
        ]);
    }
}
