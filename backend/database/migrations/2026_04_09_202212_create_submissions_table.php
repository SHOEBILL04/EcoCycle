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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->decimal('confidence_score', 5, 2);
            $table->decimal('secondary_confidence_score', 5, 2)->nullable();
            $table->enum('status', ['SUBMITTED', 'PENDING', 'RESOLVED', 'REWARDED', 'FLAGGED'])->default('SUBMITTED')->index();
            $table->string('flagged_reason')->nullable();
            $table->string('image_hash')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
