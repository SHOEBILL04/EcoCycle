<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add a unique constraint on (submission_id, type) for reward transactions.
 *
 * This provides database-level idempotency: no matter how many concurrent
 * requests try to award points for the same submission, only one 'reward'
 * Transaction row can exist per submission. Any duplicate attempt throws a
 * QueryException which is caught and rolled back by the RewardEngineService.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Add the unique constraint only for reward-type transactions.
        // Redemptions (type='redemption') may have multiple rows per user.
        // We use a partial-style unique index via a standard composite index
        // and rely on the application to pass type='reward' consistently.
        Schema::table('transactions', function (Blueprint $table) {
            $table->unique(['submission_id', 'type'], 'unique_reward_per_submission');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('unique_reward_per_submission');
        });
    }
};
