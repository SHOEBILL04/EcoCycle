<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\User;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $totalSubmissions = Submission::where('user_id', $user->id)->count();
        $rewardedSubmissions = Submission::where('user_id', $user->id)->where('status', 'REWARDED')->count();
        $accuracyRate = $totalSubmissions > 0 ? round(($rewardedSubmissions / $totalSubmissions) * 100) : 0;
        
        $rank = User::where('total_points', '>', $user->total_points)->count() + 1;
        
        $recentSubmissions = Submission::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $clanAlerts = [];
        if ($user->clan_id) {
            $clanAlerts = User::where('clan_id', $user->clan_id)
                ->where('flags', '>=', 4)
                ->where('id', '!=', $user->id)
                ->select('id', 'name', 'flags')
                ->get();
        }

        // 1. Points over the last 7 days
        $pointsData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::today()->subDays($i);
            $count = Submission::where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->where('status', 'REWARDED')
                ->count();
            $pointsData[] = [
                'day' => $date->format('D'),
                'points' => $count * 12 // Simulated approx 12 pts per submission for visually pleasing chart
            ];
        }

        // 2. Categories Distribution
        $dbCategories = Submission::where('user_id', $user->id)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get();
            
        $categoryData = [];
        $colors = ['recyclable' => '#3b82f6', 'organic' => '#10b981', 'e-waste' => '#8b5cf6', 'hazardous' => '#ef4444'];
        foreach ($dbCategories as $cat) {
            if (!$cat->category) continue;
            $categoryData[] = [
                'name' => ucfirst($cat->category),
                'value' => $cat->count,
                'color' => $colors[$cat->category] ?? '#9ca3af'
            ];
        }

        // 3. Nearby Leaderboard
        $leaderboardNearby = [];
        $nearbyAbove = User::where('total_points', '>', $user->total_points)->orderBy('total_points', 'asc')->first();
        $nearbyBelow = User::where('total_points', '<=', $user->total_points)->where('id', '!=', $user->id)->orderBy('total_points', 'desc')->first();

        if ($nearbyAbove) {
            $leaderboardNearby[] = [
                'rank' => $rank - 1,
                'name' => $nearbyAbove->name,
                'score' => number_format($nearbyAbove->total_points) . ' pts',
                'initial' => strtoupper(substr($nearbyAbove->name, 0, 2)),
                'isMe' => false
            ];
        }
        $leaderboardNearby[] = [
            'rank' => $rank,
            'name' => $user->name,
            'score' => number_format($user->total_points) . ' pts',
            'initial' => strtoupper(substr($user->name, 0, 2)),
            'isMe' => true
        ];
        if ($nearbyBelow) {
            $leaderboardNearby[] = [
                'rank' => $rank + 1,
                'name' => $nearbyBelow->name,
                'score' => number_format($nearbyBelow->total_points) . ' pts',
                'initial' => strtoupper(substr($nearbyBelow->name, 0, 2)),
                'isMe' => false
            ];
        }

        // 4. Badges
        $badges = [
            [ 'emoji' => '🌱', 'label' => 'First Submit', 'earned' => $totalSubmissions >= 1 ],
            [ 'emoji' => '🔥', 'label' => 'Active Citizen', 'earned' => $totalSubmissions >= 5 ],
            [ 'emoji' => '♻️', 'label' => 'Eco Pro', 'earned' => $user->total_points >= 100 ],
        ];

        return response()->json([
            'stats' => [
                'name' => $user->name,
                'total_points' => $user->total_points,
                'classification_count' => $totalSubmissions,
                'accuracy_rate' => $accuracyRate,
                'community_rank' => $rank,
            ],
            'recent_submissions' => $recentSubmissions,
            'clan_alerts' => $clanAlerts,
            'points_data' => $pointsData,
            'category_data' => $categoryData,
            'leaderboard_nearby' => $leaderboardNearby,
            'badges' => $badges,
        ]);
    }
}
