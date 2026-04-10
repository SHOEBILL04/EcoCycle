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
        // For MySQL, we need to modify the enum column. 
        // We add REJECTED to the existing list.
        DB::statement("ALTER TABLE submissions MODIFY COLUMN status ENUM('SUBMITTED', 'PENDING', 'RESOLVED', 'REWARDED', 'FLAGGED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE submissions MODIFY COLUMN status ENUM('SUBMITTED', 'PENDING', 'RESOLVED', 'REWARDED', 'FLAGGED') NOT NULL DEFAULT 'SUBMITTED'");
    }
};
