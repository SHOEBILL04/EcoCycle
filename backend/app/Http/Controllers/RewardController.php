<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\SystemAudit;
use Illuminate\Support\Facades\DB;

class RewardController extends Controller
{
    public function redeem(Request $request)
    {
        $request->validate([
            'cost' => 'required|integer|min:10',
            'reward_name' => 'required|string'
        ]);

        $user = $request->user();
        $cost = $request->cost;

        if ($user->total_points < $cost) {
            return response()->json(['error' => 'Insufficient points.'], 400);
        }

        DB::beginTransaction();
        try {
            Transaction::create([
                'user_id' => $user->id,
                'points' => -$cost,
                'type' => 'redemption',
                'description' => "Redeemed for: {$request->reward_name}",
            ]);

            $user->decrement('total_points', $cost);

            SystemAudit::create([
                'event_type' => 'POINTS_REDEEMED',
                'user_id' => $user->id,
                'description' => "User {$user->id} redeemed {$cost} points for {$request->reward_name}",
                'payload' => json_encode(['cost' => $cost, 'reward' => $request->reward_name])
            ]);

            DB::commit();
            return response()->json(['status' => 'success', 'remaining_points' => $user->total_points]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Redemption transaction failed.'], 500);
        }
    }
}
