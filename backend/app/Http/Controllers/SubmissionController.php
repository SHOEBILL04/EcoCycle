<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\SystemAudit;
use App\Services\WasteClassificationService;
use App\Services\RewardEngineService;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function __construct(
        protected WasteClassificationService $classifier,
        protected RewardEngineService $rewardEngine,
    ) {}

    /**
     * Submit a waste item for AI classification and points.
     * 
     * Workflow:
     * 1. Extract base64 and hash for fraud detection.
     * 2. Fraud Check: Detect identical duplicate submissions.
     * 3. Classification: Run dual AI engines (VisionNet & EcoClassifier).
     * 4. Routing:
     *    - High confidence + Clean: Auto-Reward.
     *    - Mixed Waste/Hazardous/Low Confidence: Route to Moderator Queue (PENDING).
     */
    public function submit(Request $request)
    {
        $request->validate([
            'image_b64' => 'required|string',
            'engine'    => 'nullable|string|in:model-a,model-b,dual',
        ]);

        $user  = $request->user();
        $b64   = preg_replace('#^data:image/[^;]+;base64,#', '', $request->input('image_b64'));
        $imageHash = md5($b64);

        // ── Fraud check: duplicate image ever ──────────────────────────────
        $recentDuplicate = Submission::where('user_id', $user->id)
            ->where('image_hash', $imageHash)
            ->first();

        if ($recentDuplicate) {
            DB::beginTransaction();
            try {
                // Apply Penalty: Deduct points and mark flag
                $user->decrement('total_points', 30);
                $user->increment('flags');
                
                $submission = Submission::create([
                    'user_id'          => $user->id,
                    'category'         => 'unknown',
                    'confidence_score' => 0.00,
                    'status'           => 'FLAGGED',
                    'flagged_reason'   => 'Identical image submitted previously. Cheating detected.',
                    'image_hash'       => $imageHash,
                ]);

                SystemAudit::create([
                    'event_type'  => 'FAILED_SUBMISSION_FLAGGED_PENALTY',
                    'user_id'     => $user->id,
                    'description' => "User submitted a repetitive duplicate image hash. Deducted 30 points.",
                    'payload'     => ['submission_id' => $submission->id, 'hash' => $imageHash, 'penalty' => 30],
                ]);

                DB::commit();

                return response()->json([
                    'status'       => 'FLAGGED',
                    'message'      => 'Duplicate image detected. You have been penalized 30 points.',
                    'submission'   => $submission,
                    'penalty'      => 30,
                    'total_points' => $user->fresh()->total_points,
                ], 422);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => 'Database failure applying penalty.'], 500);
            }
        }

        // ── Classify with real AI ───────────────────────────────────────────
        try {
            $classification = $this->classifier->classifyBase64($b64);
        } catch (\Exception $e) {
            return response()->json(['error' => 'AI Classification failed: ' . $e->getMessage()], 503);
        }

        $threshold      = (float) env('CONFIDENCE_THRESHOLD', 0.85);
        $engineChoice   = $request->input('engine', 'dual');

        // Logic to select "Primary" based on user preference or defaults
        if ($engineChoice === 'model-b') {
            $primaryScore = $classification['secondary_confidence'];
            $primaryCategory = $classification['secondary_category'];
            $altScore = $classification['primary_confidence'];
            $altCategory = $classification['category'];
        } else {
            $primaryScore = $classification['primary_confidence'];
            $primaryCategory = $classification['category'];
            $altScore = $classification['secondary_confidence'];
            $altCategory = $classification['secondary_category'];
        }

        DB::beginTransaction();
        try {
            $submission = Submission::create([
                'user_id'                    => $user->id,
                'category'                   => $primaryCategory,
                'subcategory'                => $classification['subcategory'] ?? null,
                'confidence_score'           => $primaryScore,
                'secondary_confidence_score' => $altScore,
                'status'                     => 'SUBMITTED',
                'image_hash'                 => $imageHash,
            ]);

            SystemAudit::create([
                'event_type'  => 'SUBMISSION_CREATED',
                'user_id'     => $user->id,
                'description' => "Submission classified as '{$primaryCategory}' via AI.",
                'payload'     => $classification,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Database failure during submission creation.'], 500);
        }

        // ── Route by confidence & quality checks ──────────────────────────────
        $isMixed = $classification['is_mixed'] ?? false;
        
        // Block auto-reward for mixed waste, hazardous waste, or low confidence
        if ($primaryScore >= $threshold && !$isMixed && $primaryCategory !== 'hazardous') {
            try {
                $points = 10;
                $this->rewardEngine->processResolvedSubmission($submission, $points);

                return response()->json([
                    'status'        => 'REWARDED',
                    'message'       => "High confidence! You earned {$points} points.",
                    'submission'    => $submission->fresh(),
                    'classification'=> $classification,
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Reward processing failed: ' . $e->getMessage()], 500);
            }
        }

        // ── Dispute / Manual Queue Path ───────────────────────────────────────
        DB::beginTransaction();
        try {
            // Attempt auto-resolution with alternative engine IF clean
            if ($altScore >= $threshold && !$isMixed && $altCategory !== 'hazardous') {
                $points = 10;
                $submission->category = $altCategory;
                $this->rewardEngine->processResolvedSubmission($submission, $points);

                DB::commit();

                return response()->json([
                    'status'        => 'REWARDED_VIA_DISPUTE',
                    'message'       => "Resolved by alternative engine! You earned {$points} points.",
                    'submission'    => $submission->fresh(),
                    'classification'=> $classification,
                ]);
            }

            // Otherwise, finalize as PENDING
            $submission->status = 'PENDING';
            $submission->save();

            $reason = "Low confidence";
            if ($isMixed) $reason = "Mixed waste detected";
            if ($primaryCategory === 'hazardous') $reason = "Hazardous/Non-Recycleable detected";

            SystemAudit::create([
                'event_type'  => 'SUBMISSION_PENDING',
                'user_id'     => $user->id,
                'description' => "Submission #{$submission->id} queued for moderation. Reason: {$reason}.",
                'payload'     => $classification,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to queue submission for review.'], 500);
        }

        return response()->json([
            'status'        => 'PENDING',
            'message'       => "AI detected: {$reason}. Submitted for moderator review.",
            'submission'    => $submission,
            'classification'=> $classification,
        ]);
    }
}
