<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\SystemAudit;
use App\Services\WasteClassificationService;
use App\Services\RewardEngineService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubmissionController extends Controller
{
    public function __construct(
        protected WasteClassificationService $classifier,
        protected RewardEngineService $rewardEngine,
    ) {}

    public function submit(Request $request)
    {
        $request->validate([
            'image_b64' => 'required|string',
        ]);

        $user  = $request->user();
        $b64   = preg_replace('#^data:image/[^;]+;base64,#', '', $request->input('image_b64'));
        $imageHash = md5($b64);

        // ── Fraud check: duplicate image within 24 h ─────────────────────────
        $recentDuplicate = Submission::where('user_id', $user->id)
            ->where('image_hash', $imageHash)
            ->where('created_at', '>=', Carbon::now()->subDay())
            ->first();

        if ($recentDuplicate) {
            $submission = Submission::create([
                'user_id'          => $user->id,
                'category'         => 'unknown',
                'confidence_score' => 0.00,
                'status'           => 'FLAGGED',
                'flagged_reason'   => 'Identical image submitted within 24 hours.',
                'image_hash'       => $imageHash,
            ]);

            // Synchronous audit write — no points awarded
            SystemAudit::create([
                'event_type'  => 'FAILED_SUBMISSION_FLAGGED',
                'user_id'     => $user->id,
                'description' => 'User submitted duplicate image hash within 24 h window.',
                'payload'     => ['submission_id' => $submission->id, 'hash' => $imageHash],
            ]);

            return response()->json([
                'status'     => 'FLAGGED',
                'message'    => 'This image was flagged as a duplicate. No points awarded.',
                'submission' => $submission,
            ], 422);
        }

        // ── Classify with both engines ────────────────────────────────────────
        $classification = $this->classifier->classifyBase64($b64);
        $threshold      = (float) env('CONFIDENCE_THRESHOLD', 0.85);
        $primaryScore   = $classification['primary_confidence'];

        DB::beginTransaction();
        try {
            // Create the submission record (always SUBMITTED initially)
            $submission = Submission::create([
                'user_id'                    => $user->id,
                'category'                   => $classification['category'],
                'subcategory'                => $classification['subcategory'] ?? null,
                'confidence_score'           => $primaryScore,
                'secondary_confidence_score' => $classification['secondary_confidence'],
                'status'                     => 'SUBMITTED',
                'image_hash'                 => $imageHash,
            ]);

            // Synchronous audit — classification decision
            SystemAudit::create([
                'event_type'  => 'SUBMISSION_CREATED',
                'user_id'     => $user->id,
                'description' => "Submission classified as '{$classification['category']}' "
                               . "(primary: {$primaryScore}, secondary: {$classification['secondary_confidence']}). "
                               . "Threshold: {$threshold}.",
                'payload'     => $classification,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Database failure during submission creation.'], 500);
        }

        // ── Route by confidence ───────────────────────────────────────────────
        if ($primaryScore >= $threshold) {
            // High-confidence path: delegate entirely to RewardEngineService
            try {
                $points = 10;
                $this->rewardEngine->processResolvedSubmission($submission, $points);

                return response()->json([
                    'status'        => 'REWARDED',
                    'message'       => "High confidence! You earned {$points} points.",
                    'submission'    => $submission->fresh(),
                    'points_awarded'=> $points,
                    'total_points'  => $user->fresh()->total_points,
                    'classification'=> [
                        'category'             => $classification['category'],
                        'subcategory'          => $classification['subcategory'] ?? null,
                        'primary_confidence'   => $primaryScore,
                        'secondary_confidence' => $classification['secondary_confidence'],
                        'primary_engine'       => $classification['primary_engine'],
                        'secondary_engine'     => $classification['secondary_engine'],
                    ],
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Reward processing failed: ' . $e->getMessage()], 500);
            }
        }

        // Low-confidence path: move to PENDING for dispute resolution
        DB::beginTransaction();
        try {
            $submission->status = 'PENDING';
            $submission->save();

            SystemAudit::create([
                'event_type'  => 'SUBMISSION_PENDING',
                'user_id'     => $user->id,
                'description' => "Submission #{$submission->id} entered dispute queue (confidence {$primaryScore} < threshold {$threshold}).",
                'payload'     => ['submission_id' => $submission->id, 'primary' => $primaryScore, 'secondary' => $classification['secondary_confidence']],
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to queue submission for review.'], 500);
        }

        return response()->json([
            'status'        => 'PENDING',
            'message'       => 'Confidence too low for automatic reward. Submitted for moderator review.',
            'submission'    => $submission,
            'points_awarded'=> 0,
            'classification'=> [
                'category'             => $classification['category'],
                'subcategory'          => $classification['subcategory'] ?? null,
                'primary_confidence'   => $primaryScore,
                'secondary_confidence' => $classification['secondary_confidence'],
                'primary_engine'       => $classification['primary_engine'],
                'secondary_engine'     => $classification['secondary_engine'],
            ],
        ]);
    }
}
