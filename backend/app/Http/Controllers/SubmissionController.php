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
            'image_b64'     => 'required|string',
            'engine'        => 'nullable|string|in:model-a,model-b,dual,echo_engine',
            'tm_category'   => 'nullable|string',
            'tm_confidence' => 'nullable|numeric',
            'tm_predictions' => 'nullable|array',
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
                // Apply Penalty
                $newPoints = max(0, $user->total_points - 30);
                $user->total_points = $newPoints;
                $user->flags += 1;
                $user->save();

                $submission = Submission::create([
                    'user_id'          => $user->id,
                    'category'         => 'unknown',
                    'confidence_score' => 0.00,
                    'status'           => 'FLAGGED',
                    'flagged_reason'   => 'Identical image submitted previously. Cheating detected.',
                    'image_hash'       => $imageHash,
                ]);

                // Synchronous audit write — penalised
                SystemAudit::create([
                    'event_type'  => 'FAILED_SUBMISSION_FLAGGED_PENALTY',
                    'user_id'     => $user->id,
                    'description' => "User submitted a repetitive duplicate image hash. Deducted 30 points. User now has {$user->flags} flags.",
                    'payload'     => ['submission_id' => $submission->id, 'hash' => $imageHash, 'penalty' => 30, 'flags' => $user->flags],
                ]);

                DB::commit();

                return response()->json([
                    'status'       => 'FLAGGED',
                    'message'      => 'Duplicate image detected. You have been penalized 30 points and received 1 flag.',
                    'submission'   => $submission,
                    'penalty'      => 30,
                    'flags'        => $user->flags,
                    'total_points' => $user->total_points,
                ], 422);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => 'Database failure applying penalty.'], 500);
            }
        }

        // ── Classify with engines or bypass for Teachable Machine ─────────────
        $engineChoice   = $request->input('engine', 'echo_engine');
        $threshold      = (float) \Illuminate\Support\Facades\Cache::get('CONFIDENCE_THRESHOLD', 0.85);
        $echoFallbackTriggered = false;

        if ($engineChoice === 'echo_engine') {
            $tmCategory = strtolower($request->input('tm_category', 'unknown'));
            $tmConfidence = (float) $request->input('tm_confidence', 0.0);
            
            if ($tmConfidence < $threshold) {
                $echoFallbackTriggered = true;
                // Low confidence fallback — trigger Gemini-backed classification.
                $classification = $this->classifier->classifyBase64($b64);
                $classification['fallback_triggered'] = true;
                $classification['fallback_reason'] = 'Echo_engine confidence below threshold';
            } else {
                $classification = [
                    'category' => $tmCategory,
                    'subcategory' => 'Custom AI Model',
                    'primary_confidence' => $tmConfidence,
                    'secondary_confidence' => 0.0,
                    'secondary_category' => 'unknown',
                    'primary_distribution' => $this->normaliseClientDistribution($request->input('tm_predictions', []), $tmCategory, $tmConfidence),
                    'secondary_distribution' => [],
                    'primary_engine' => 'Echo_engine (Teachable Machine)',
                    'secondary_engine' => 'Gemini High Accuracy Fallback',
                    'fallback_triggered' => false,
                    'fallback_reason' => null,
                ];
            }
        } else {
            $classification = $this->classifier->classifyBase64($b64);
            $classification['fallback_triggered'] = false;
            $classification['fallback_reason'] = null;
        }

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
            // Create the submission record (always SUBMITTED initially)
            $submission = Submission::create([
                'user_id'                    => $user->id,
                'category'                   => $primaryCategory,
                'subcategory'                => $classification['subcategory'] ?? null,
                'confidence_score'           => $primaryScore,
                'secondary_confidence_score' => $altScore,
                'status'                     => 'SUBMITTED',
                'image_hash'                 => $imageHash,
            ]);

            // Synchronous audit — classification decision
            SystemAudit::create([
                'event_type'  => 'SUBMISSION_CREATED',
                'user_id'     => $user->id,
                'description' => "Submission classified as '{$primaryCategory}' "
                               . "(primary: {$primaryScore}, alternative: {$altScore}). "
                               . "Engine choice: {$engineChoice}. Threshold: {$threshold}.",
                'payload'     => $classification,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('DB Error: ' . $e->getMessage());
            return response()->json(['error' => 'Database failure during submission creation.'], 500);
        }

        // ── Route by confidence ───────────────────────────────────────────────
        if ($primaryScore >= $threshold) {
            // High-confidence path: delegate entirely to RewardEngineService
            try {
                $points = 10;
                $this->rewardEngine->processResolvedSubmission($submission, $points);
                $responseStatus = $echoFallbackTriggered ? 'REWARDED_VIA_DISPUTE' : 'REWARDED';
                $responseMessage = $echoFallbackTriggered
                    ? "Echo_engine confidence was low, so Gemini high accuracy fallback checked the image and you earned {$points} points."
                    : "High confidence! You earned {$points} points.";

                return response()->json([
                    'status'        => $responseStatus,
                    'message'       => $responseMessage,
                    'submission'    => $submission->fresh(),
                    'points_awarded'=> $points,
                    'total_points'  => $user->fresh()->total_points,
                    'classification'=> [
                        'category'             => $primaryCategory,
                        'subcategory'          => $classification['subcategory'] ?? null,
                        'primary_confidence'   => $primaryScore,
                        'secondary_confidence' => $altScore,
                        'primary_engine'       => $classification['primary_engine'] ?? 'Selected Engine',
                        'secondary_engine'     => $classification['secondary_engine'] ?? 'Alternative Engine',
                        'primary_distribution' => $classification['primary_distribution'] ?? [],
                        'secondary_distribution' => $classification['secondary_distribution'] ?? [],
                        'threshold'            => $threshold,
                        'fallback_triggered'   => $classification['fallback_triggered'] ?? false,
                        'fallback_reason'      => $classification['fallback_reason'] ?? null,
                    ],

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
            } catch (\Exception $e) {
                return response()->json(['error' => 'Reward processing failed: ' . $e->getMessage()], 500);
            }
        }

        // ── Dispute Resolution Workflow ───────────────────────────────────────
        DB::beginTransaction();
        try {
            if ($altScore >= $threshold) {
                // Auto-resolved by the alternative engine
                $points = 10;
                $submission->category = $altCategory;
                $this->rewardEngine->processResolvedSubmission($submission, $points);

                SystemAudit::create([
                    'event_type'  => 'DISPUTE_AUTO_RESOLVED',
                    'user_id'     => $user->id,
                    'description' => "Dispute resolved automatically using alternative engine. Category changed to '{$altCategory}'.",
                    'payload'     => ['submission_id' => $submission->id, 'new_category' => $altCategory, 'score' => $altScore],
                ]);

                DB::commit();

                return response()->json([
                    'status'        => 'REWARDED_VIA_DISPUTE',
                    'message'       => "Initial confidence low, but resolved by alternative engine! You earned {$points} points.",
                    'submission'    => $submission->fresh(),
                    'points_awarded'=> $points,
                    'total_points'  => $user->fresh()->total_points,
                    'classification'=> [
                        'category'             => $altCategory,
                        'subcategory'          => null,
                        'primary_confidence'   => $primaryScore,
                        'secondary_confidence' => $altScore,
                        'primary_engine'       => $classification['primary_engine'] ?? 'Selected Engine',
                        'secondary_engine'     => $classification['secondary_engine'] ?? 'Alternative Engine',
                        'primary_distribution' => $classification['primary_distribution'] ?? [],
                        'secondary_distribution' => $classification['secondary_distribution'] ?? [],
                        'threshold'            => $threshold,
                        'fallback_triggered'   => $classification['fallback_triggered'] ?? false,
                        'fallback_reason'      => $classification['fallback_reason'] ?? null,
                    ],
                ]);
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

            $submission->status = 'PENDING';
            $submission->save();

            SystemAudit::create([
                'event_type'  => 'SUBMISSION_PENDING',
                'user_id'     => $user->id,
                'description' => "Submission #{$submission->id} entered dispute queue. (primary {$primaryScore}, alternative {$altScore} < threshold {$threshold}).",
                'payload'     => ['submission_id' => $submission->id, 'primary' => $primaryScore, 'alternative' => $altScore],
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
            \Illuminate\Support\Facades\Log::error('DB Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to resolve dispute or queue submission.'], 500);
        }

        return response()->json([
            'status'        => 'PENDING',
            'message'       => 'Confidence too low across all engines. Submitted for moderator review.',
            'submission'    => $submission,
            'points_awarded'=> 0,
            'classification'=> [
                'category'             => $primaryCategory,
                'subcategory'          => $classification['subcategory'] ?? null,
                'primary_confidence'   => $primaryScore,
                'secondary_confidence' => $altScore,
                'primary_engine'       => $classification['primary_engine'] ?? 'Selected Engine',
                'secondary_engine'     => $classification['secondary_engine'] ?? 'Alternative Engine',
                'primary_distribution' => $classification['primary_distribution'] ?? [],
                'secondary_distribution' => $classification['secondary_distribution'] ?? [],
                'threshold'            => $threshold,
                'fallback_triggered'   => $classification['fallback_triggered'] ?? false,
                'fallback_reason'      => $classification['fallback_reason'] ?? null,
            ],
        ]);
    }

    private function normaliseClientDistribution(array $predictions, string $fallbackCategory, float $fallbackConfidence): array
    {
        $distribution = [
            'recyclable' => 0.0,
            'organic' => 0.0,
            'e-waste' => 0.0,
            'hazardous' => 0.0,
        ];

        foreach ($predictions as $category => $score) {
            if (array_key_exists($category, $distribution)) {
                $distribution[$category] = max(0.0, min(1.0, (float) $score));
            }
        }

        if (array_sum($distribution) <= 0 && array_key_exists($fallbackCategory, $distribution)) {
            $distribution[$fallbackCategory] = max(0.0, min(1.0, $fallbackConfidence));
        }

        $total = array_sum($distribution);
        if ($total <= 0) {
            return $distribution;
        }

        foreach ($distribution as $category => $score) {
            $distribution[$category] = round($score / $total, 4);
        }

        arsort($distribution);

        return $distribution;
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
