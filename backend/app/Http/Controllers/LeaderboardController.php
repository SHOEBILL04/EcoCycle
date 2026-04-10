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
        $period = $request->query('period', 'all-time');

        // 1. Global Leaderboard
        $global = Cache::remember("leaderboard_global_{$period}", 60, function () use ($period) {
            $query = User::where('is_private', false)
                ->where('is_banned', false);

            if ($period === 'all-time') {
                $query->withCount(['submissions as total_count'])
                    ->withCount(['submissions as rewarded_count' => function($q) {
                        $q->where('status', 'REWARDED');
                    }])
                    ->orderBy('total_points', 'desc');
            } else {
                $dateLimit = match($period) {
                    'daily' => now()->startOfDay(),
                    'weekly' => now()->startOfWeek(),
                    'monthly' => now()->startOfMonth(),
                    default => now()->startOfCentury(),
                };

                $query->withCount(['submissions as total_count' => function($q) use ($dateLimit) {
                        $q->where('created_at', '>=', $dateLimit);
                    }])
                    ->withCount(['submissions as rewarded_count' => function($q) use ($dateLimit) {
                        $q->where('status', 'REWARDED')->where('created_at', '>=', $dateLimit);
                    }])
                    ->withSum(['transactions as period_points' => function($q) use ($dateLimit) {
                        $q->where('type', 'reward')->where('created_at', '>=', $dateLimit);
                    }], 'points')
                    ->orderByDesc('period_points')
                    ->orderByDesc('total_points');
            }

            return $query->take(100)->get();
        })->map(function ($u, $index) use ($user, $period) {
            $accuracy = $u->total_count > 0 ? round(($u->rewarded_count / $u->total_count) * 100, 1) : 0;
            $points = $period === 'all-time' ? $u->total_points : ((int) $u->period_points ?? 0);
            return [
                'rank' => $index + 1,
                'id' => $u->id,
                'name' => $u->name,
                'username' => '@' . strtolower(str_replace(' ', '', $u->name)),
                'points' => $points,
                'accuracy' => $accuracy,
                'submissions' => $u->total_count,
                'flags' => $u->flags,
                'change' => 0,
                'avatar' => strtoupper(substr($u->name, 0, 2)),
                'color' => 'from-gray-400 to-gray-500',
                'isYou' => $user && $user->id === $u->id,
                'following' => false,
            ];
        });

        // 2. Clan Leaderboard
        $clans = Cache::remember("leaderboard_clans_{$period}", 60, function () use ($period) {
            $allClans = \App\Models\Clan::withCount('users')
                ->withSum('users as all_time_flags', 'flags');

            if ($period === 'all-time') {
                $allClans->withSum('users as period_points', 'total_points');
            }
            $clansData = $allClans->get();

            if ($period !== 'all-time') {
                $dateLimit = match($period) {
                    'daily' => now()->startOfDay(),
                    'weekly' => now()->startOfWeek(),
                    'monthly' => now()->startOfMonth(),
                    default => now()->startOfCentury(),
                };
                
                $clanPoints = \Illuminate\Support\Facades\DB::table('transactions')
                    ->join('users', 'transactions.user_id', '=', 'users.id')
                    ->where('transactions.type', 'reward')
                    ->where('transactions.created_at', '>=', $dateLimit)
                    ->whereNotNull('users.clan_id')
                    ->groupBy('users.clan_id')
                    ->selectRaw('users.clan_id, SUM(transactions.points) as period_points')
                    ->pluck('period_points', 'clan_id');
            }

            return $clansData->map(function ($clan) use ($period, &$clanPoints) {
                $loc = trim(str_ireplace('Titans', '', $clan->name));
                
                if ($period === 'all-time') {
                    $points = $clan->period_points ?? 0;
                } else {
                    $points = (int) ($clanPoints[$clan->id] ?? 0);
                }

                return [
                    'id' => (string) $clan->id,
                    'name' => $clan->name,
                    'tag' => strtoupper(substr($loc, 0, 3)),
                    'members' => $clan->users_count,
                    'totalPoints' => $points,
                    'avgAccuracy' => 95.0,
                    'location' => $loc,
                    'change' => 0,
                    'flaggedMembers' => $clan->all_time_flags ?? 0,
                ];
            })->sortByDesc('totalPoints')->values()->map(function ($clan, $index) {
                $clan['rank'] = $index + 1;
                return $clan;
            });
        });

        // 3. My Clan Members
        $myClanMembers = [];
        if ($user && $user->clan_id) {
            $clanQuery = User::where('clan_id', $user->clan_id)
                ->where('is_banned', false);

            if ($period === 'all-time') {
                $clanQuery->withCount(['submissions as total_count'])
                    ->withCount(['submissions as rewarded_count' => function($q) {
                        $q->where('status', 'REWARDED');
                    }])
                    ->orderBy('total_points', 'desc');
            } else {
                $dateLimit = match($period) {
                    'daily' => now()->startOfDay(),
                    'weekly' => now()->startOfWeek(),
                    'monthly' => now()->startOfMonth(),
                    default => now()->startOfCentury(),
                };
                $clanQuery->withCount(['submissions as total_count' => function($q) use ($dateLimit) {
                        $q->where('created_at', '>=', $dateLimit);
                    }])
                    ->withCount(['submissions as rewarded_count' => function($q) use ($dateLimit) {
                        $q->where('status', 'REWARDED')->where('created_at', '>=', $dateLimit);
                    }])
                    ->withSum(['transactions as period_points' => function($q) use ($dateLimit) {
                        $q->where('type', 'reward')->where('created_at', '>=', $dateLimit);
                    }], 'points')
                    ->orderByDesc('period_points')
                    ->orderByDesc('total_points');
            }

            $myClanMembers = $clanQuery->get()->map(function($u, $index) use ($user, $period) {
                $accuracy = $u->total_count > 0 ? round(($u->rewarded_count / $u->total_count) * 100, 1) : 0;
                $points = $period === 'all-time' ? $u->total_points : ((int) $u->period_points ?? 0);
                return [
                    'rank' => $index + 1,
                    'id' => $u->id,
                    'name' => $u->name,
                    'username' => '@' . strtolower(str_replace(' ', '', $u->name)),
                    'points' => $points,
                    'accuracy' => $accuracy,
                    'submissions' => $u->total_count,
                    'flags' => $u->flags,
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
            $inGlobal = $global->firstWhere('id', $user->id);
            if ($inGlobal) {
                $myRank = $inGlobal['rank'];
                $myPoints = $inGlobal['points'];
            } else {
                $myRank = '>100';
                $myPoints = $period === 'all-time' ? $user->total_points : 0;
            }

            $myInfo = [
                'rank' => $myRank,
                'name' => $user->name,
                'points' => $myPoints,
                'flags' => $user->flags,
                'avatar' => strtoupper(substr($user->name, 0, 2))
            ];

            if ($user->clan_id) {
                $inClans = $clans->firstWhere('id', (string)$user->clan_id);
                $c = $user->clan;
                $loc = trim(str_ireplace('Titans', '', $c->name));
                $myClanInfo = [
                    'rank' => $inClans ? $inClans['rank'] : '-',
                    'name' => $c->name,
                    'tag' => strtoupper(substr($loc, 0, 3)),
                    'points' => $inClans ? $inClans['totalPoints'] : 0
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
