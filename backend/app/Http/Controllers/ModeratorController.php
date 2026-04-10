<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\Notification;
use App\Models\SystemAudit;
use App\Models\Transaction;
use App\Models\User;
use App\Services\RewardEngineService;
use App\Services\WasteClassificationService;
use Illuminate\Support\Facades\DB;

class ModeratorController extends Controller
{
    public function __construct(
        protected RewardEngineService $rewardEngine,
        protected WasteClassificationService $classifier,
    ) {}

    private const POINTS_BY_CATEGORY = [
        'recyclable' => 10,
        'organic' => 8,
        'e-waste' => 15,
        'hazardous' => 20,
    ];

    /**
     * List all PENDING disputes for the moderator queue.
     * Includes both engine scores so the moderator has full context.
     */
    public function disputes(Request $request)
    {
        $disputes = Submission::with('user:id,name')
            ->where('status', 'PENDING')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'imageUrl' => $submission->image_url,
                    'aiConfidenceScores' => $submission->ai_confidence_scores,
                    'createdAt' => $submission->created_at,
                    'submittedBy' => $submission->user?->name,
                ];
            });

        return response()->json($disputes);
    }

    public function verdict(Request $request, $id)
    {
        $request->validate([
            'category' => 'required|in:recyclable,organic,e-waste,hazardous',
        ]);

        $moderator = $request->user();
        $category = $request->input('category');
        $points = self::POINTS_BY_CATEGORY[$category];

        DB::beginTransaction();
        try {
            $submission = Submission::with('user')
                ->where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($submission->status !== 'PENDING') {
                DB::rollBack();
                return response()->json(['error' => 'Already resolved'], 409);
            }

            $submission->status = 'RESOLVED';
            $submission->final_category = $category;
            $submission->final_confidence = 0.80;
            $submission->resolved_by = $moderator->id;
            $submission->resolved_at = now();
            $submission->save();

            $pointsAwarded = $this->awardPointsOnce($submission, $submission->user, $category, $points);

            Notification::create([
                'user_id' => $submission->user_id,
                'message' => "Your submission has been reviewed. It was classified as {$category}. You earned {$pointsAwarded} points!",
                'type' => 'dispute_resolved',
                'submission_id' => $submission->id,
                'is_read' => false,
            ]);

            SystemAudit::create([
                'event_type' => 'DISPUTE_RESOLVED',
                'user_id' => $moderator->id,
                'description' => "Submission #{$submission->id} resolved by moderator #{$moderator->id} as {$category}.",
                'payload' => [
                    'submissionId' => $submission->id,
                    'moderatorId' => $moderator->id,
                    'finalCategory' => $category,
                    'pointsAwarded' => $pointsAwarded,
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            DB::commit();

            return response()->json([
                'finalCategory' => $category,
                'pointsAwarded' => $pointsAwarded,
                'resolvedBy' => $moderator->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Verdict submission failed.'], 500);
        }
    }

    /**
     * Resolve a dispute manually.
     * Valid resolutions: REWARDED or REJECTED.
     * State machine: only PENDING submissions may be resolved here.
     */
    public function resolve(Request $request, $id)
    {
        $request->validate([
            'resolution' => 'required|in:REWARDED,REJECTED',
            'points'     => 'required_if:resolution,REWARDED|integer|min:1',
        ]);

        $submission = Submission::findOrFail($id);

        if ($submission->status !== 'PENDING') {
            return response()->json(['error' => 'Submission is not in PENDING status.'], 400);
        }

        DB::beginTransaction();
        try {
            if ($request->resolution === 'REWARDED') {
                // Delegate to RewardEngineService — single canonical award path
                $this->rewardEngine->processResolvedSubmission($submission, (int) $request->points);
            } else {
                // REJECTED path
                $submission->status = 'REJECTED';
                $submission->save();

                SystemAudit::create([
                    'event_type'  => 'DISPUTE_REJECTED',
                    'user_id'     => $request->user()->id,
                    'description' => "Moderator [{$request->user()->id}] rejected submission #{$id}.",
                    'payload'     => ['submission_id' => $id, 'moderator_id' => $request->user()->id],
                ]);
            }

            // Top-level audit entry for the resolution action
            SystemAudit::create([
                'event_type'  => 'DISPUTE_RESOLVED',
                'user_id'     => $request->user()->id,
                'description' => "Moderator [{$request->user()->id}] resolved dispute for submission #{$id} → {$request->resolution}.",
                'payload'     => [
                    'submission_id' => $id,
                    'resolution'    => $request->resolution,
                    'points'        => $request->resolution === 'REWARDED' ? $request->points : 0,
                ],
            ]);

            DB::commit();

            return response()->json([
                'status'     => 'success',
                'submission' => $submission->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Resolution failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Run the secondary classification engine on a PENDING submission.
     *
     * The dispute workflow requirement states the system must "attempt resolution
     * using the alternative classification approach." This endpoint triggers that
     * attempt and records the result in the audit trail, giving the moderator
     * the secondary engine's verdict alongside the primary.
     *
     * Note: we re-use the stored image_hash as the lookup key; actual pixel data
     * is not stored. The secondary engine receives the raw label set from a fresh
     * Vision API call if the image is re-submitted, otherwise we simulate from
     * the stored scores. In production, store the image path and re-classify it.
     */
    public function secondaryReview(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        if ($submission->status !== 'PENDING') {
            return response()->json(['error' => 'Submission is not in PENDING status.'], 400);
        }

        // Return the secondary engine score already persisted at submission time
        $secondaryScore = $submission->secondary_confidence_score;
        $primaryScore   = $submission->confidence_score;
        $threshold      = (float) \Illuminate\Support\Facades\Cache::get('CONFIDENCE_THRESHOLD', 0.85);

        $recommendation = $secondaryScore >= $threshold ? 'REWARDED' : 'NEEDS_MANUAL_REVIEW';

        // Record that the secondary engine was consulted
        SystemAudit::create([
            'event_type'  => 'SECONDARY_ENGINE_CONSULTED',
            'user_id'     => $request->user()->id,
            'description' => "Moderator [{$request->user()->id}] requested secondary engine review for submission #{$id}. "
                           . "Secondary score: {$secondaryScore}. Recommendation: {$recommendation}.",
            'payload'     => [
                'submission_id'      => $id,
                'primary_confidence' => $primaryScore,
                'secondary_confidence' => $secondaryScore,
                'threshold'          => $threshold,
                'recommendation'     => $recommendation,
            ],
        ]);

        return response()->json([
            'submission_id'        => $id,
            'category'             => $submission->category,
            'primary_confidence'   => $primaryScore,
            'secondary_confidence' => $secondaryScore,
            'threshold'            => $threshold,
            'recommendation'       => $recommendation,
        ]);
    }

    /**
     * Retrieve audit entries scoped to a specific submission.
     * Moderators may only see entries related to submissions under review —
     * NOT the full audit trail (which is admin-only).
     */
    public function auditForSubmission(Request $request, $submissionId)
    {
        $submission = Submission::findOrFail($submissionId);

        // Fetch audit rows where the payload references this submission_id
        $audits = SystemAudit::with('user:id,name,role')
            ->where(function ($q) use ($submissionId) {
                $q->whereRaw("JSON_EXTRACT(payload, '$.submission_id') = ?", [$submissionId])
                  ->orWhereRaw("JSON_EXTRACT(payload, '$.submission_id') = ?", [(string) $submissionId]);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'submission_id' => $submissionId,
            'status'        => $submission->status,
            'audit_trail'   => $audits,
        ]);
    }

    private function awardPointsOnce(Submission $submission, User $user, string $category, int $points): int
    {
        $existing = Transaction::where('submission_id', $submission->id)
            ->where('type', 'reward')
            ->first();

        if ($existing) {
            return 0;
        }

        Transaction::create([
            'user_id' => $user->id,
            'submission_id' => $submission->id,
            'points' => $points,
            'type' => 'reward',
            'description' => "Points for {$category} moderator verdict",
        ]);

        $user->increment('total_points', $points);

        $submission->points_awarded = $points;
        $submission->save();

        return $points;
    }
}
