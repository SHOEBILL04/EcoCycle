<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\SystemAudit;
use Illuminate\Support\Facades\DB;
use Exception;

class RewardEngineService
{
    /**
     * @param Submission $submission
     * @param int $pointsAwarded
     * @return bool
     * @throws Exception
     */
    public function processResolvedSubmission(Submission $submission, int $pointsAwarded)
    {
        if ($submission->status === 'REWARDED') {
            throw new Exception("Submission already rewarded.");
        }

        DB::beginTransaction();

        try {
            $user = $submission->user;
            $clan = $user->clan;

            // Update user points
            $user->total_points += $pointsAwarded;
            $user->save();

            // Update clan points if they have one
            if ($clan) {
                $clan->total_points += $pointsAwarded;
                $clan->save();
            }

            // Update submission status
            $submission->status = 'REWARDED';
            $submission->save();

            // Log to system audits
            SystemAudit::create([
                'event_type' => 'SUBMISSION_REWARDED',
                'user_id' => $user->id,
                'description' => "Awarded {$pointsAwarded} points for submission #{$submission->id}",
                'payload' => [
                    'submission_id' => $submission->id,
                    'points_awarded' => $pointsAwarded,
                    'new_user_total' => $user->total_points,
                    'new_clan_total' => $clan ? $clan->total_points : 0
                ]
            ]);

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
