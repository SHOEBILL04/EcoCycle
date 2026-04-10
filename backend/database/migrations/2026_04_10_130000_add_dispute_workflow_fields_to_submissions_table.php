<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('user_id');
            $table->json('ai_confidence_scores')->nullable()->after('confidence_score');
            $table->string('final_category')->nullable()->after('status');
            $table->decimal('final_confidence', 5, 2)->nullable()->after('final_category');
            $table->foreignId('resolved_by')->nullable()->after('final_confidence')->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable()->after('resolved_by');
            $table->integer('points_awarded')->default(0)->after('resolved_at');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('resolved_by');
            $table->dropColumn([
                'image_url',
                'ai_confidence_scores',
                'final_category',
                'final_confidence',
                'resolved_at',
                'points_awarded',
            ]);
        });
    }
};