<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\Transaction;
use App\Models\SystemAudit;
use Illuminate\Support\Facades\DB;
use Exception;

class RewardEngineService
{
    /**
     * The single canonical path for awarding points to a resolved submission.
     *
     * Guards:
     *  - Throws if submission is already REWARDED (idempotency).
     *  - Throws if submission is not in a resolvable state (state-machine enforcement).
     *
     * All writes (user points, clan points, transaction record, audit) are
     * executed inside a single DB transaction — atomic and synchronous.
     *
     * @param Submission $submission
     * @param int $pointsAwarded
     * @return bool
     * @throws Exception
     */
    public function processResolvedSubmission(Submission $submission, int $pointsAwarded): bool
    {
        // ── Idempotency guard ────────────────────────────────────────────────
        if ($submission->status === 'REWARDED') {
            throw new Exception("Submission #{$submission->id} has already been rewarded.");
        }

        // ── State machine guard ──────────────────────────────────────────────
        $allowedFromStates = ['SUBMITTED', 'PENDING'];
        if (!in_array($submission->status, $allowedFromStates, true)) {
            throw new Exception(
                "Invalid state transition: cannot reward a submission in status '{$submission->status}'."
            );
        }

        DB::beginTransaction();

        try {
            $user = $submission->user;
            $clan = $user->clan;

            // Update submission status first
            $submission->status = 'REWARDED';
            $submission->save();

            // Create the Transaction record
            // The unique index on (submission_id, type='reward') prevents race conditions
            Transaction::create([
                'user_id'       => $user->id,
                'submission_id' => $submission->id,
                'points'        => $pointsAwarded,
                'type'          => 'reward',
                'description'   => 'Classification reward',
            ]);

            // Update user points
            $user->increment('total_points', $pointsAwarded);

            // Update clan points if applicable
            if ($clan) {
                $clan->increment('total_points', $pointsAwarded);
            }

            // Synchronous audit write — part of the same transaction
            SystemAudit::create([
                'event_type'  => 'SUBMISSION_REWARDED',
                'user_id'     => $user->id,
                'description' => "Awarded {$pointsAwarded} pts for submission #{$submission->id}",
                'payload'     => [
                    'submission_id'  => $submission->id,
                    'points_awarded' => $pointsAwarded,
                    'new_user_total' => $user->total_points + $pointsAwarded,
                    'new_clan_total' => $clan ? ($clan->total_points + $pointsAwarded) : 0,
                ],
            ]);

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
