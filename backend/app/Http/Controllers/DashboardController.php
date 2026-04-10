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

        return response()->json([
            'stats' => [
                'total_points' => $user->total_points,
                'classification_count' => $totalSubmissions,
                'accuracy_rate' => $accuracyRate,
                'community_rank' => $rank,
            ],
            'recent_submissions' => $recentSubmissions
        ]);
    }
}
