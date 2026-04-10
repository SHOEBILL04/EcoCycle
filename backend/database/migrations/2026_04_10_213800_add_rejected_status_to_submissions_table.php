<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we use ALTER COLUMN ... TYPE
        DB::statement("ALTER TABLE submissions ALTER COLUMN status TYPE VARCHAR(255)");
        DB::statement("ALTER TABLE submissions ALTER COLUMN status SET DEFAULT 'SUBMITTED'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For PostgreSQL, we use ALTER COLUMN ... TYPE
        DB::statement("ALTER TABLE submissions ALTER COLUMN status TYPE VARCHAR(255)");
        DB::statement("ALTER TABLE submissions ALTER COLUMN status SET DEFAULT 'SUBMITTED'");
    }
};
