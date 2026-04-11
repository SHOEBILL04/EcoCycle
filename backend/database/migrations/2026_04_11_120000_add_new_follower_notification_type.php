<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const TYPES = [
        'reward_earned',
        'points_redeemed',
        'submission_flagged',
        'submission_rejected',
        'submission_pending',
        'dispute_resolved',
        'dispute_raised',
        'new_follower',
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check');
        DB::statement(sprintf(
            "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (%s))",
            implode(', ', array_map(
                static fn (string $type): string => "'" . str_replace("'", "''", $type) . "'",
                self::TYPES
            ))
        ));
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check');
        DB::statement(
            "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('reward_earned', 'points_redeemed', 'submission_flagged', 'submission_rejected', 'submission_pending', 'dispute_resolved', 'dispute_raised'))"
        );
    }
};
