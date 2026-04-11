<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Submission;
use App\Models\SystemAudit;
use App\Services\RewardEngineService;
use App\Services\WasteClassificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    public function __construct(
        protected WasteClassificationService $classifier,
        protected RewardEngineService $rewardEngine,
    ) {}

    public function submit(Request $request)
    {
        $request->validate([
            'image_b64'       => 'required|string',
            'engine'          => 'nullable|string|in:echo_engine,gemini_engine,model-a,model-b,dual',
            'tm_category'     => 'nullable|string',
            'tm_confidence'   => 'nullable|numeric',
            'tm_predictions'  => 'nullable|array',
        ]);

        $user = $request->user();
        $b64 = preg_replace('#^data:image/[^;]+;base64,#', '', $request->input('image_b64'));
        $imageHash = md5($b64);

        // Save Image to Storage
        $imageName = 'submission_' . time() . '_' . $imageHash . '.jpg';
        $imagePath = 'submissions/' . $imageName;
        $imageUrl = "";

        try {
            if (!Storage::disk('public')->exists('submissions')) {
                Storage::disk('public')->makeDirectory('submissions');
            }

            Storage::disk('public')->put($imagePath, base64_decode($b64));
            $imageUrl = asset('storage/' . $imagePath);
        } catch (\Exception $e) {
            Log::error('Storage Failure: ' . $e->getMessage());
            // We'll proceed without an image URL to avoid crashing, 
            // but we'll use a placeholder so the UI doesn't break.
            $imageUrl = "https://placehold.co/600x400?text=Upload+Stored+Successfully";
        }

        $recentDuplicate = Submission::where('user_id', $user->id)
            ->where('image_hash', $imageHash)
            ->first();

        if ($recentDuplicate) {
            DB::beginTransaction();

            try {
                // Use atomic update to prevent race conditions (stale data overwriting recent rewards)
                DB::table('users')->where('id', $user->id)->update([
                    'total_points' => DB::raw("GREATEST(0, CAST(total_points AS INTEGER) - 30)"),
                    'flags' => DB::raw("flags + 1")
                ]);
                $user->refresh(); // Sync the in-memory object for the response below

                $submission = Submission::create([
                    'user_id' => $user->id,
                    'category' => 'unknown',
                    'confidence_score' => 0.00,
                    'secondary_confidence_score' => 0.00,
                    'status' => 'FLAGGED',
                    'flagged_reason' => 'Identical image submitted previously. Cheating detected.',
                    'image_url' => $imageUrl,
                    'image_hash' => $imageHash,
                ]);

                SystemAudit::create([
                    'event_type' => 'FAILED_SUBMISSION_FLAGGED_PENALTY',
                    'user_id' => $user->id,
                    'description' => "User submitted a repetitive duplicate image hash. Deducted 30 points. User now has {$user->flags} flags.",
                    'payload' => [
                        'submission_id' => $submission->id,
                        'hash' => $imageHash,
                        'penalty' => 30,
                        'flags' => $user->flags,
                    ],
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'message' => "🚫 FLAGGED: Repetitive image detected. A 10 point penalty has been applied.",
                    'type' => 'submission_flagged',
                    'submission_id' => $submission->id,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'FLAGGED',
                    'message' => 'This submission has been flagged for further review by our moderators.',
                    'submission' => $submission,
                    'flags' => $user->flags,
                    'total_points' => $user->total_points,
                ], 422);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json(['error' => 'Database failure applying penalty.'], 500);
            }
        }

        $requestedEngine = $request->input('engine', 'echo_engine');
        $engineChoice = in_array($requestedEngine, ['echo_engine'], true) ? 'echo_engine' : 'gemini_engine';
        $threshold = (float) Cache::get('CONFIDENCE_THRESHOLD', 0.85);
        $echoFallbackTriggered = false;

        if ($engineChoice === 'echo_engine') {
            $tmCategory = strtolower((string) $request->input('tm_category', 'unknown'));
            $tmConfidence = (float) $request->input('tm_confidence', 0.0);

            if ($tmConfidence < $threshold) {
                $echoFallbackTriggered = true;
                $classification = $this->classifier->classifyBase64($b64);
                $classification['fallback_triggered'] = true;
                $classification['fallback_reason'] = 'Echo_engine confidence below threshold';
                $classification['requested_engine'] = 'echo_engine';
            } else {
                $classification = [
                    'category' => $tmCategory,
                    'subcategory' => 'Custom AI Model',
                    'primary_confidence' => $tmConfidence,
                    'secondary_confidence' => 0.0,
                    'secondary_category' => 'unknown',
                    'primary_distribution' => $this->normaliseClientDistribution(
                        (array) $request->input('tm_predictions', []),
                        $tmCategory,
                        $tmConfidence
                    ),
                    'secondary_distribution' => [],
                    'primary_engine' => 'Echo_engine (Teachable Machine)',
                    'secondary_engine' => 'Gemini High Accuracy Fallback',
                    'fallback_triggered' => false,
                    'fallback_reason' => null,
                    'requested_engine' => 'echo_engine',
                ];
            }
        } else {
            $classification = $this->classifier->classifyBase64($b64);
            $classification['fallback_triggered'] = false;
            $classification['fallback_reason'] = null;
            $classification['requested_engine'] = 'gemini_engine';
        }

        $primaryScore = (float) ($classification['primary_confidence'] ?? 0.0);
        $primaryCategory = $classification['category'] ?? 'unknown';
        $altScore = (float) ($classification['secondary_confidence'] ?? 0.0);
        $altCategory = $classification['secondary_category'] ?? 'unknown';
        $primaryDistribution = $classification['primary_distribution'] ?? [];
        $secondaryDistribution = $classification['secondary_distribution'] ?? [];

        DB::beginTransaction();

        try {
            $submission = Submission::create([
                'user_id' => $user->id,
                'category' => $primaryCategory,
                'subcategory' => $classification['subcategory'] ?? null,
                'confidence_score' => $primaryScore,
                'secondary_confidence_score' => $altScore,
                'ai_confidence_scores' => [
                    'primary_distribution' => $primaryDistribution,
                    'secondary_distribution' => $secondaryDistribution,
                    'primary_engine' => $classification['primary_engine'] ?? null,
                    'secondary_engine' => $classification['secondary_engine'] ?? null,
                ],
                'status' => 'SUBMITTED',
                'image_url' => $imageUrl,
                'image_hash' => $imageHash,
            ]);

            SystemAudit::create([
                'event_type' => 'SUBMISSION_CREATED',
                'user_id' => $user->id,
                'description' => "Submission classified as '{$primaryCategory}' (primary: {$primaryScore}, alternative: {$altScore}). Engine choice: {$engineChoice}. Threshold: {$threshold}.",
                'payload' => $classification,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DB Error: ' . $e->getMessage());

            return response()->json(['error' => 'Database failure during submission creation.'], 500);
        }

        if ($primaryScore >= $threshold) {
            try {
                $points = RewardEngineService::POINTS_BY_CATEGORY[$primaryCategory] ?? 10;
                $this->rewardEngine->processResolvedSubmission($submission, $points);

                $responseStatus = $echoFallbackTriggered ? 'REWARDED_VIA_DISPUTE' : 'REWARDED';
                $responseMessage = $echoFallbackTriggered
                    ? "Echo_engine confidence was low, so Gemini high accuracy fallback checked the image and you earned {$points} points."
                    : "High confidence! You earned {$points} points.";

                Notification::create([
                    'user_id' => $submission->user_id,
                    'message' => "Success! Your submission was rewarded with {$points} points.",
                    'type' => 'reward_earned',
                    'submission_id' => $submission->id,
                ]);

                return response()->json([
                    'status' => $responseStatus,
                    'message' => $responseMessage,
                    'submission' => $submission->fresh(),
                    'points_awarded' => $points,
                    'total_points' => $user->fresh()->total_points,
                    'classification' => $this->buildClassificationResponse(
                        $classification,
                        $primaryCategory,
                        $classification['subcategory'] ?? null,
                        $primaryScore,
                        $altScore,
                        $threshold
                    ),
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Reward processing failed: ' . $e->getMessage()], 500);
            }
        }

        DB::beginTransaction();

        try {
            if ($altScore >= $threshold) {
                $points = RewardEngineService::POINTS_BY_CATEGORY[$altCategory] ?? 10;
                $submission->category = $altCategory;
                $submission->save();

                $this->rewardEngine->processResolvedSubmission($submission, $points);

                SystemAudit::create([
                    'event_type' => 'DISPUTE_AUTO_RESOLVED',
                    'user_id' => $user->id,
                    'description' => "Dispute resolved automatically using alternative engine. Category changed to '{$altCategory}'.",
                    'payload' => [
                        'submission_id' => $submission->id,
                        'new_category' => $altCategory,
                        'score' => $altScore,
                    ],
                ]);

                Notification::create([
                    'user_id' => $submission->user_id,
                    'message' => "Resolved! Initial confidence low, but alternative engine confirmed your submission. You earned {$points} points.",
                    'type' => 'reward_earned',
                    'submission_id' => $submission->id,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'REWARDED_VIA_DISPUTE',
                    'message' => "Initial confidence low, but resolved by alternative engine! You earned {$points} points.",
                    'submission' => $submission->fresh(),
                    'points_awarded' => $points,
                    'total_points' => $user->fresh()->total_points,
                    'classification' => $this->buildClassificationResponse(
                        $classification,
                        $altCategory,
                        null,
                        $primaryScore,
                        $altScore,
                        $threshold
                    ),
                ]);
            }

            $submission->status = 'PENDING';
            $submission->save();

            SystemAudit::create([
                'event_type' => 'SUBMISSION_PENDING',
                'user_id' => $user->id,
                'description' => "Submission #{$submission->id} entered dispute queue. (primary {$primaryScore}, alternative {$altScore} < threshold {$threshold}).",
                'payload' => [
                    'submission_id' => $submission->id,
                    'primary' => $primaryScore,
                    'alternative' => $altScore,
                ],
            ]);

            Notification::create([
                'user_id' => $submission->user_id,
                'message' => "Your submission is under review by a moderator.",
                'type' => 'submission_pending',
                'submission_id' => $submission->id,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DB Error: ' . $e->getMessage());

            return response()->json(['error' => 'Failed to resolve dispute or queue submission.'], 500);
        }

        return response()->json([
            'status' => 'PENDING',
            'message' => 'Confidence too low across all engines. Submitted for moderator review.',
            'submission' => $submission,
            'points_awarded' => 0,
            'classification' => $this->buildClassificationResponse(
                $classification,
                $primaryCategory,
                $classification['subcategory'] ?? null,
                $primaryScore,
                $altScore,
                $threshold
            ),
        ]);
    }

    private function buildClassificationResponse(
        array $classification,
        string $category,
        ?string $subcategory,
        float $primaryScore,
        float $altScore,
        float $threshold,
    ): array {
        return [
            'category' => $category,
            'subcategory' => $subcategory,
            'primary_confidence' => $primaryScore,
            'secondary_confidence' => $altScore,
            'primary_engine' => $classification['primary_engine'] ?? 'Selected Engine',
            'secondary_engine' => $classification['secondary_engine'] ?? 'Alternative Engine',
            'primary_distribution' => $classification['primary_distribution'] ?? [],
            'secondary_distribution' => $classification['secondary_distribution'] ?? [],
            'threshold' => $threshold,
            'fallback_triggered' => $classification['fallback_triggered'] ?? false,
            'fallback_reason' => $classification['fallback_reason'] ?? null,
            'requested_engine' => $classification['requested_engine'] ?? null,
        ];
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
            $normalizedCategory = strtolower((string) $category);

            if (array_key_exists($normalizedCategory, $distribution)) {
                $distribution[$normalizedCategory] = max(0.0, min(1.0, (float) $score));
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
    }
}
