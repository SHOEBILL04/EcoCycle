<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\SystemAudit;
use Illuminate\Support\Facades\DB;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $rewards = [
            ["id" => 1, "title" => "$10 Grocery Voucher", "partner" => "GreenMart", "points" => 500, "category" => "vouchers", "icon" => "ShoppingBag", "color" => "from-emerald-400 to-green-500", "bg" => "bg-emerald-50", "popular" => true, "remaining" => 48, "description" => "Redeemable at any GreenMart location nationwide"],
            ["id" => 2, "title" => "Free Coffee", "partner" => "EcoBrew Café", "points" => 150, "category" => "experiences", "icon" => "Coffee", "color" => "from-amber-400 to-orange-500", "bg" => "bg-amber-50", "popular" => false, "remaining" => 200, "description" => "One free coffee or tea at any EcoBrew Café"],
            ["id" => 3, "title" => "Monthly Bus Pass", "partner" => "City Transit", "points" => 1200, "category" => "transport", "icon" => "Bus", "color" => "from-blue-400 to-blue-600", "bg" => "bg-blue-50", "popular" => true, "remaining" => 15, "description" => "Free unlimited rides on all city buses for 30 days"],
            ["id" => 4, "title" => "Plant a Tree", "partner" => "ReforeStation.org", "points" => 300, "category" => "eco", "icon" => "TreePine", "color" => "from-green-500 to-emerald-600", "bg" => "bg-green-50", "popular" => false, "remaining" => 999, "description" => "We'll plant a tree in your name in a reforestation project"],
            ["id" => 5, "title" => "$25 EcoStore Credit", "partner" => "EcoStore Online", "points" => 1000, "category" => "vouchers", "icon" => "ShoppingBag", "color" => "from-violet-400 to-purple-600", "bg" => "bg-violet-50", "popular" => false, "remaining" => 30, "description" => "Shop sustainable products with EcoStore credit"],
            ["id" => 6, "title" => "Museum Pass", "partner" => "Science & Nature Museum", "points" => 800, "category" => "experiences", "icon" => "Star", "color" => "from-pink-400 to-rose-500", "bg" => "bg-pink-50", "popular" => false, "remaining" => 50, "description" => "Free entry to the Science & Nature Museum for one adult"],
            ["id" => 7, "title" => "5 Trees Planted", "partner" => "ReforeStation.org", "points" => 1400, "category" => "eco", "icon" => "TreePine", "color" => "from-teal-400 to-emerald-600", "bg" => "bg-teal-50", "popular" => true, "remaining" => 999, "description" => "Plant a grove of 5 trees in your name"],
            ["id" => 8, "title" => "10-Ride Bike Share", "partner" => "GreenBike", "points" => 400, "category" => "transport", "icon" => "Bus", "color" => "from-cyan-400 to-blue-500", "bg" => "bg-cyan-50", "popular" => false, "remaining" => 100, "description" => "10 free rides on the city bike share network"]
        ];

        $redemptionHistory = Transaction::where('user_id', $user->id)
            ->where('type', 'redemption')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($t) {
                return [
                    "reward" => str_replace("Redeemed for: ", "", $t->description),
                    "partner" => "EcoCycle Network",
                    "points" => abs($t->points),
                    "date" => $t->created_at->format('M j, Y'),
                    "status" => "redeemed"
                ];
            });

        return response()->json([
            'rewards' => $rewards,
            'redemptionHistory' => $redemptionHistory,
            'userPoints' => $user->total_points,
            'totalEarned' => Transaction::where('user_id', $user->id)->where('type', 'reward')->sum('points'),
            'totalRedeemed' => abs(Transaction::where('user_id', $user->id)->where('type', 'redemption')->sum('points')),
            'redemptionsCount' => Transaction::where('user_id', $user->id)->where('type', 'redemption')->count(),
            'joined' => $user->created_at ? $user->created_at->format('M Y') : 'recently'
        ]);
    }

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

            Notification::create([
                'user_id' => $user->id,
                'message' => "You successfully redeemed {$cost} points for: {$request->reward_name}",
                'type' => 'points_redeemed',
            ]);

            DB::commit();
            return response()->json(['status' => 'success', 'remaining_points' => $user->total_points]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Redemption transaction failed.'], 500);
        }
    }
}
