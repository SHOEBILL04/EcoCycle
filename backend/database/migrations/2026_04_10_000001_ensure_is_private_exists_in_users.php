<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_private')) {
                $table->boolean('is_private')->default(false);
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('citizen');
            }
            if (!Schema::hasColumn('users', 'total_points')) {
                $table->integer('total_points')->default(0)->index();
            }
            if (!Schema::hasColumn('users', 'user_title')) {
                $table->string('user_title')->default('Citizen');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safety mitigation migration
    }
};
