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
        
        $recentSubmissionsQuery = Submission::with('transactions')->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $recentSubmissions = $recentSubmissionsQuery->map(function ($sub) {
            $statusStr = $sub->status === 'REWARDED' ? 'approved' : ($sub->status === 'DISPUTED' ? 'dispute' : 'pending');
            $color = match($sub->category) {
                'Recyclable' => 'blue',
                'Organic' => 'green',
                'E-Waste' => 'purple',
                'Hazardous' => 'red',
                default => 'gray'
            };
            $emoji = match($sub->category) {
                'Recyclable' => '♻️',
                'Organic' => '🌱',
                'E-Waste' => '💻',
                'Hazardous' => '⚠️',
                default => '📦'
            };
            $points = $sub->transactions->sum('points') ?? 0;
            return [
                'id' => 'SUB-' . $sub->id,
                'item' => $sub->subcategory ?? $sub->category,
                'category' => $sub->category,
                'confidence' => ($sub->confidence_score ?? 0) / 100,
                'points' => $points,
                'status' => $statusStr,
                'time' => $sub->created_at->diffForHumans(),
                'emoji' => $emoji,
                'color' => $color,
            ];
        });

        $pointsHistory = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $pointsForDay = Transaction::where('user_id', $user->id)
                ->whereDate('created_at', $date->toDateString())
                ->sum('points');
            
            $pointsHistory[] = [
                'date' => $date->format('M j'),
                'points' => $pointsForDay
            ];
        }

        $categoryCounts = Submission::where('user_id', $user->id)
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->get();
            
        $colorMap = [
            'Recyclable' => '#3b82f6',
            'Organic' => '#22c55e',
            'E-Waste' => '#8b5cf6',
            'Hazardous' => '#ef4444'
        ];
        
        $categoryData = $categoryCounts->map(function ($cat) use ($totalSubmissions, $colorMap) {
            $val = $totalSubmissions > 0 ? round(($cat->count / $totalSubmissions) * 100) : 0;
            return [
                'name' => $cat->category,
                'value' => $val,
                'color' => $colorMap[$cat->category] ?? '#94a3b8'
            ];
        });

        $nearbyUsers = User::whereBetween('total_points', [max(0, $user->total_points - 500), $user->total_points + 500])
            ->orderBy('total_points', 'desc')
            ->take(5)
            ->get()
            ->map(function ($u) use ($user) {
                $theirRank = User::where('total_points', '>', $u->total_points)->count() + 1;
                return [
                    'rank' => $theirRank,
                    'name' => $u->name,
                    'pts' => $u->total_points,
                    'isYou' => $u->id === $user->id
                ];
            });
            
        $badges = [
            ['emoji' => '🌱', 'label' => 'First Submit', 'earned' => $totalSubmissions > 0],
            ['emoji' => '♻️', 'label' => 'Recycling Pro', 'earned' => $totalSubmissions >= 10],
            ['emoji' => '🔥', 'label' => 'Active Citizen', 'earned' => $accuracyRate > 90 && $totalSubmissions > 5],
            ['emoji' => '💯', 'label' => 'Top 100', 'earned' => $rank <= 100],
        ];

        return response()->json([
            'stats' => [
                'total_points' => $user->total_points,
                'classification_count' => $totalSubmissions,
                'accuracy_rate' => $accuracyRate,
                'community_rank' => $rank,
                'name' => $user->name,
            ],
            'points_history' => $pointsHistory,
            'category_data' => $categoryData,
            'recent_submissions' => $recentSubmissions,
            'leaderboard_nearby' => $nearbyUsers,
            'badges' => $badges,
        ]);
    }
}
