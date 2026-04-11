<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;
use App\Models\Submission;
use App\Models\Transaction;
use App\Models\SystemAudit;

class SocialController extends Controller
{
    public function follow(Request $request, $id)
    {
        $user = $request->user();

        if ($user->id == $id) {
            return response()->json(['error' => 'Cannot follow yourself.'], 400);
        }

        $target = User::findOrFail($id);

        $exists = Follow::where('follower_id', $user->id)
            ->where('followed_id', $id)
            ->first();

        if (!$exists) {
            Follow::create(['follower_id' => $user->id, 'followed_id' => $id]);

            // Synchronous audit write
            SystemAudit::create([
                'event_type'  => 'FOLLOW_USER',
                'user_id'     => $user->id,
                'description' => "User [{$user->id}] followed user [{$id}].",
                'payload'     => ['follower_id' => $user->id, 'target_id' => (int) $id],
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    public function unfollow(Request $request, $id)
    {
        $user = $request->user();

        Follow::where('follower_id', $user->id)
            ->where('followed_id', $id)
            ->delete();

        // Synchronous audit write
        SystemAudit::create([
            'event_type'  => 'UNFOLLOW_USER',
            'user_id'     => $user->id,
            'description' => "User [{$user->id}] unfollowed user [{$id}].",
            'payload'     => ['follower_id' => $user->id, 'target_id' => (int) $id],
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Activity feed: recent submissions from followed accounts only.
     *
     * Privacy enforcement: private-profile users are excluded even if followed.
     * If the authenticated user follows nobody, the feed is intentionally empty.
     */
    public function feed(Request $request)
    {
        $user = $request->user();

        $followingIds = Follow::where('follower_id', $user->id)->pluck('followed_id')->toArray();

        // Build the base query scoped to followed users only
        $submissionsQuery = Submission::with([
                'user:id,name,is_private,total_points',
                'transactions' => fn ($q) => $q->where('type', 'reward')->select('submission_id', 'points'),
            ])
            // Privacy gate: never surface private-profile users regardless of follow status
            ->whereHas('user', fn ($q) => $q->where('is_private', false));

        if (empty($followingIds)) {
            // User follows nobody — return an empty feed (correct per spec)
            $submissions = collect();
        } else {
            // Filter to followed accounts only
            $submissions = $submissionsQuery
                ->whereIn('user_id', $followingIds)
                ->orderBy('created_at', 'desc')
                ->take(50)
                ->get();
        }

        $feed = $submissions->map(fn (Submission $s) => [
            'id'                   => $s->id,
            'user'                 => $s->user->name ?? 'Unknown',
            'avatar'               => strtoupper(substr($s->user->name ?? 'U', 0, 2)),
            'category'             => $s->category,
            'subcategory'          => $s->subcategory,
            'confidence_score'     => $s->confidence_score,
            'secondary_confidence' => $s->secondary_confidence_score,
            'points_awarded'       => $s->transactions->first()?->points ?? 0,
            'status'               => $s->status,
            'created_at'           => $s->created_at,
        ]);

        $following = User::whereIn('id', $followingIds)->select('id', 'name')->get()->map(fn ($u) => [
            'name' => $u->name,
            'avatar' => strtoupper(substr($u->name, 0, 2)),
            'color' => 'from-emerald-400 to-emerald-600',
            'active' => true,
        ]);

        $startOfDay = now()->startOfDay();
        
        $todayClassifications = Submission::where('created_at', '>=', $startOfDay)->count();
        $todayPoints = Transaction::where('type', 'reward')->where('created_at', '>=', $startOfDay)->sum('points');
        $highConfidence = Submission::where('created_at', '>=', $startOfDay)->where('confidence_score', '>=', 0.8)->count();
        $disputes = Submission::where('created_at', '>=', $startOfDay)->where('status', 'PENDING')->count();

        $stats = [
            ['label' => 'Classifications', 'val' => $todayClassifications, 'color' => 'text-gray-900'],
            ['label' => 'Total Pts Earned', 'val' => $todayPoints, 'color' => 'text-emerald-600'],
            ['label' => 'High Confidence', 'val' => $highConfidence, 'color' => 'text-emerald-600'],
            ['label' => 'Disputes', 'val' => $disputes, 'color' => 'text-amber-600'],
        ];

        $trendingRaw = \Illuminate\Support\Facades\DB::table('submissions')
            ->select('category', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->take(4)
            ->get();
            
        $totalCats = $trendingRaw->sum('count') ?: 1;
        $trending = $trendingRaw->map(fn($t) => [
            'cat' => $t->category ?: 'Unknown',
            'count' => $t->count,
            'pct' => round(($t->count / $totalCats) * 100),
        ]);

        return response()->json([
            'feed' => $feed,
            'following' => $following,
            'stats' => $stats,
            'trending' => $trending,
        ]);
    }
}
