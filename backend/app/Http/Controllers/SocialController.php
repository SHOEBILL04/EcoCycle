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
     * Activity feed: recent REWARDED submissions from followed, non-private users.
     *
     * Each feed item includes:
     *  - category, confidence score  (spec requirement)
     *  - points_awarded              (spec requirement — resolved from the Transaction record)
     *
     * Privacy enforcement: users with is_private=true are excluded regardless of follow status.
     */
    public function feed(Request $request)
    {
        $user = $request->user();

        $followingIds = Follow::where('follower_id', $user->id)->pluck('followed_id');

        $submissions = Submission::with([
                'user:id,name,is_private,total_points',
                // Eager-load only the reward transaction for each submission
                'transactions' => fn ($q) => $q->where('type', 'reward')->select('submission_id', 'points'),
            ])
            ->whereIn('user_id', $followingIds)
            ->whereHas('user', fn ($q) => $q->where('is_private', false))
            ->where('status', 'REWARDED')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        // Map to the spec-required feed shape
        $feed = $submissions->map(fn (Submission $s) => [
            'id'                   => $s->id,
            'user'                 => $s->user,
            'category'             => $s->category,
            'subcategory'          => $s->subcategory,
            'confidence_score'     => $s->confidence_score,
            'secondary_confidence' => $s->secondary_confidence_score,
            'points_awarded'       => $s->transactions->first()?->points ?? 0,
            'created_at'           => $s->created_at,
        ]);

        return response()->json(['feed' => $feed]);
    }
}
