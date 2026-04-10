<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\Notification;
use App\Models\SystemAudit;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    private const POINTS_BY_CATEGORY = [
        'recyclable' => 10,
        'organic' => 8,
        'e-waste' => 15,
        'hazardous' => 20,
    ];

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|max:5120|required_without:image_b64',
            'image_b64' => 'nullable|string|required_without:image',
        ]);

        $user = $request->user();
        $image = $request->file('image');

        if ($image) {
            $storedPath = $image->store('submissions', 'public');
            $imageUrl = Storage::url($storedPath);
            $imageHash = md5_file($image->getRealPath());
        } else {
            $base64 = preg_replace('#^data:image/[^;]+;base64,#', '', (string) $request->input('image_b64'));
            $binary = base64_decode($base64);
            $filename = 'submissions/' . uniqid('submission_', true) . '.png';
            Storage::disk('public')->put($filename, $binary);
            $imageUrl = Storage::url($filename);
            $imageHash = md5($base64);
        }

        $scores = $this->mockConfidenceScores();
        [$topCategory, $topScore] = $this->highestCategoryAndScore($scores);
        $pointsForCategory = self::POINTS_BY_CATEGORY[$topCategory];

        DB::beginTransaction();
        try {
            $submission = Submission::create([
                'user_id' => $user->id,
                'image_url' => $imageUrl,
                'status' => $topScore >= 0.80 ? 'REWARDED' : 'PENDING',
                'ai_confidence_scores' => $scores,
                'category' => $topCategory,
                'confidence_score' => round($topScore, 2),
                'final_category' => $topScore >= 0.80 ? $topCategory : null,
                'final_confidence' => $topScore >= 0.80 ? round($topScore, 2) : null,
                'points_awarded' => 0,
                'image_hash' => $imageHash,
            ]);

            if ($topScore >= 0.80) {
                $awarded = $this->awardPointsOnce($submission, $user, $topCategory, $pointsForCategory);

                SystemAudit::create([
                    'event_type' => 'AUTO_CLASSIFIED',
                    'user_id' => $user->id,
                    'description' => "Submission #{$submission->id} auto-classified as {$topCategory} at {$topScore} confidence.",
                    'payload' => [
                        'submissionId' => $submission->id,
                        'finalCategory' => $topCategory,
                        'finalConfidence' => round($topScore, 2),
                        'pointsAwarded' => $awarded,
                    ],
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'auto_classified',
                    'finalCategory' => $topCategory,
                    'finalConfidence' => round($topScore, 2),
                    'pointsAwarded' => $awarded,
                    'aiConfidenceScores' => $scores,
                    'submission' => [
                        'id' => $submission->id,
                        'imageUrl' => $imageUrl,
                    ],
                ]);
            }

            $moderators = User::where('role', 'moderator')
                ->where(function ($query) {
                    $query->whereNull('is_banned')->orWhere('is_banned', false);
                })
                ->get();

            foreach ($moderators as $moderator) {
                Notification::create([
                    'user_id' => $moderator->id,
                    'message' => 'New dispute: A submission needs your review',
                    'type' => 'dispute_raised',
                    'submission_id' => $submission->id,
                    'is_read' => false,
                ]);
            }

            SystemAudit::create([
                'event_type' => 'DISPUTE_RAISED',
                'user_id' => $user->id,
                'description' => "Submission #{$submission->id} sent for moderator review.",
                'payload' => [
                    'submissionId' => $submission->id,
                    'aiConfidenceScores' => $scores,
                ],
            ]);

            DB::commit();

            return response()->json([
                'status' => 'pending',
                'message' => 'Sent for moderator review',
                'submission' => [
                    'id' => $submission->id,
                    'imageUrl' => $imageUrl,
                    'aiConfidenceScores' => $scores,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Submission creation failed.'], 500);
        }
    }

    public function submit(Request $request)
    {
        return $this->store($request);
    }

    private function mockConfidenceScores(): array
    {
        $raw = [
            'recyclable' => random_int(1, 100),
            'organic' => random_int(1, 100),
            'e-waste' => random_int(1, 100),
            'hazardous' => random_int(1, 100),
        ];

        $sum = array_sum($raw);

        $normalized = [];
        foreach ($raw as $category => $score) {
            $normalized[$category] = $score / $sum;
        }

        $rounded = [];
        $running = 0.0;
        $categories = array_keys($normalized);
        foreach ($categories as $index => $category) {
            if ($index === count($categories) - 1) {
                $rounded[$category] = round(max(0.0, 1 - $running), 4);
            } else {
                $rounded[$category] = round($normalized[$category], 4);
                $running += $rounded[$category];
            }
        }

        return $rounded;
    }

    private function highestCategoryAndScore(array $scores): array
    {
        $bestCategory = 'recyclable';
        $bestScore = 0.0;
        foreach ($scores as $category => $score) {
            if ($score > $bestScore) {
                $bestCategory = $category;
                $bestScore = (float) $score;
            }
        }

        return [$bestCategory, $bestScore];
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
            'description' => "Points for {$category} classification",
        ]);

        $user->increment('total_points', $points);

        $submission->points_awarded = $points;
        $submission->save();

        return $points;
    }
}
