<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\User;
use App\Models\Transaction;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $totalSubmissions = Submission::where('user_id', $user->id)->count();
        $rewardedSubmissions = Submission::where('user_id', $user->id)->where('status', 'REWARDED')->count();
        $accuracyRate = $totalSubmissions > 0 ? round(($rewardedSubmissions / $totalSubmissions) * 100, 1) : 0;
        
        $rank = User::where('total_points', '>', $user->total_points)->count() + 1;

        // Calculate Disputes Won (Simulated for now based on REWARDED status if it required fallback or moderator)
        $disputesWon = Submission::where('user_id', $user->id)
            ->where('status', 'REWARDED')
            ->where('confidence_score', '<', (float) Cache::get('CONFIDENCE_THRESHOLD', 0.85))
            ->count();

        // Calculate Streak (Consecutive days with at least one submission)
        $streak = 0;
        $checkDate = Carbon::today();
        while (Submission::where('user_id', $user->id)->whereDate('created_at', $checkDate)->exists()) {
            $streak++;
            $checkDate->subDay();
        }
        
        // 1. Recent Submissions
        $recentSubmissions = Submission::with('transactions')->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($sub) {
                $statusStr = match($sub->status) {
                    'REWARDED' => 'approved',
                    'PENDING'  => 'pending',
                    'FLAGGED', 'REJECTED' => 'flagged',
                    default => 'pending'
                };
                $color = match($sub->category) {
                    'recyclable' => 'blue',
                    'organic'    => 'green',
                    'e-waste'    => 'purple',
                    'hazardous'  => 'red',
                    default      => 'gray'
                };
                $emoji = match($sub->category) {
                    'recyclable' => '♻️',
                    'organic'    => '🌱',
                    'e-waste'    => '💻',
                    'hazardous'  => '⚠️',
                    default      => '📦'
                };
                $points = $sub->transactions->where('type', 'reward')->sum('points') ?? 0;
                return [
                    'id' => 'SUB-' . $sub->id,
                    'item' => $sub->subcategory ?? $sub->category,
                    'category' => $sub->category,
                    'confidence' => ($sub->confidence_score ?? 0),
                    'points' => $points,
                    'status' => $statusStr,
                    'time' => $sub->created_at->diffForHumans(),
                    'emoji' => $emoji,
                    'color' => $color,
                ];
            });

        // 2. Points History (Last 7 Days)
        $pointsHistory = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $pointsForDay = Transaction::where('user_id', $user->id)
                ->where('type', 'reward')
                ->whereDate('created_at', $date->toDateString())
                ->sum('points');
            
            $pointsHistory[] = [
                'day' => $date->format('D'),
                'date' => $date->format('M j'),
                'points' => (int) $pointsForDay
            ];
        }

        // 3. Category Data
        $categoryCounts = Submission::where('user_id', $user->id)
            ->where('status', 'REWARDED')
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->get();
            
        $colorMap = [
            'recyclable' => '#3b82f6',
            'organic'    => '#22c55e',
            'e-waste'    => '#8b5cf6',
            'hazardous'  => '#ef4444'
        ];
        
        $categoryData = $categoryCounts->map(function ($cat) use ($rewardedSubmissions, $colorMap) {
            $val = $rewardedSubmissions > 0 ? round(($cat->count / $rewardedSubmissions) * 100) : 0;
            return [
                'name' => ucfirst($cat->category),
                'value' => $val,
                'count' => $cat->count,
                'color' => $colorMap[$cat->category] ?? '#94a3b8'
            ];
        });

        // 4. Leaderboard Nearby
        $nearbyUsers = User::where('is_banned', false)
            ->whereBetween('total_points', [max(0, $user->total_points - 1000), $user->total_points + 1000])
            ->orderBy('total_points', 'desc')
            ->take(5)
            ->get()
            ->map(function ($u) {
                $theirRank = User::where('total_points', '>', $u->total_points)->count() + 1;
                return [
                    'rank' => $theirRank,
                    'name' => $u->name,
                    'score' => number_format($u->total_points) . ' pts',
                    'initial' => strtoupper(substr($u->name, 0, 2)),
                    'isMe' => $u->id === auth()->id()
                ];
            });
            
        // 5. Badges & Challenges
        $badges = [
            ['emoji' => '🌱', 'label' => 'First Submit', 'earned' => $totalSubmissions > 0],
            ['emoji' => '🔥', 'label' => 'Active Citizen', 'earned' => $rewardedSubmissions >= 5],
            ['emoji' => '♻️', 'label' => 'Eco Expert', 'earned' => $rewardedSubmissions >= 20 || $user->total_points >= 200],
            ['emoji' => '💯', 'label' => 'Top 100', 'earned' => $rank <= 100],
        ];

        $challenges = [
            ['title' => 'Eco Hero', 'desc' => '100 total submissions', 'progress' => min(100, round(($totalSubmissions / 100) * 100)), 'color' => 'bg-emerald-500'],
            ['title' => 'Plastic Ninja', 'desc' => '50 recyclable items', 'progress' => min(100, round((Submission::where('user_id', $user->id)->where('category', 'recyclable')->count() / 50) * 100)), 'color' => 'bg-blue-500'],
            ['title' => 'Dispute Master', 'desc' => '5 disputes won', 'progress' => min(100, round(($disputesWon / 5) * 100)), 'color' => 'bg-amber-500'],
        ];

        $clanAlerts = [];
        if ($user->clan_id) {
            $clanAlerts = User::where('clan_id', $user->clan_id)
                ->where('flags', '>=', 3)
                ->where('id', '!=', $user->id)
                ->select('id', 'name', 'flags')
                ->get();
        }

        return response()->json([
            'stats' => [
                'name' => $user->name,
                'total_points' => $user->total_points,
                'classification_count' => $totalSubmissions,
                'accuracy_rate' => $accuracyRate,
                'community_rank' => $rank,
                'streak' => $streak,
                'disputes_won' => $disputesWon,
            ],
            'recent_submissions' => $recentSubmissions,
            'clan_alerts' => $clanAlerts,
            'points_history' => $pointsHistory,
            'category_data' => $categoryData,
            'leaderboard_nearby' => $nearbyUsers,
            'badges' => $badges,
            'challenges' => $challenges,
        ]);
    }
}
