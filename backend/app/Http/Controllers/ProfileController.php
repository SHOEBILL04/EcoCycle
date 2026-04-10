<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\Transaction;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        // 1. Radar Data
        $categories = ['recyclable', 'organic', 'e-waste', 'hazardous'];
        $radarData = [];
        
        foreach ($categories as $cat) {
            $catSubs = Submission::where('user_id', $user->id)->where('category', $cat)->get();
            $total = $catSubs->count();
            
            if ($total === 0) {
                $radarData[] = ['subject' => ucfirst($cat), 'A' => 0];
                continue;
            }
            $accurateCount = $catSubs->where('status', 'REWARDED')->count();
            $accuracy = round(($accurateCount / $total) * 100);
            $radarData[] = ['subject' => ucfirst($cat), 'A' => $accuracy];
        }
        
        $allTotal = Submission::where('user_id', $user->id)->count();
        $allAccurate = Submission::where('user_id', $user->id)->where('status', 'REWARDED')->count();
        $baseAccuracy = $allTotal > 0 ? round(($allAccurate / $allTotal) * 100) : 0;
        
        $radarData[] = ['subject' => 'Accuracy', 'A' => $baseAccuracy];
        $radarData[] = ['subject' => 'Volume', 'A' => min($allTotal * 2, 100)];

        // 2. Activity Data (Points per month)
        $activityData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            
            $points = Transaction::where('user_id', $user->id)
                ->where('type', 'reward')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('points');
                
            $activityData[] = [
                'month' => $monthStart->format('M'),
                'points' => (int) $points
            ];
        }

        // 3. Badges
        $badges = [];
        if ($allTotal > 0) $badges[] = ["emoji" => "🌱", "label" => "First Submit", "desc" => "Made your first submission"];
        if (Submission::where('user_id', $user->id)->where('category', 'recyclable')->count() >= 100) {
             $badges[] = ["emoji" => "♻️", "label" => "Recycling Pro", "desc" => "100+ recyclable items"];
        }
        if (Submission::where('user_id', $user->id)->where('confidence_score', '>=', 0.8)->count() >= 50) {
             $badges[] = ["emoji" => "🎯", "label" => "Sharpshooter", "desc" => "50 high-confidence submissions"];
        }
        if ($allTotal >= 10) {
             $badges[] = ["emoji" => "⚡", "label" => "Speed Runner", "desc" => "10+ submissions lifetime"];
        }

        return response()->json([
            'radarData' => $radarData,
            'activityData' => $activityData,
            'badges' => $badges
        ]);
    }
}
