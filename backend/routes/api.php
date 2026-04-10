<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', fn (Request $request) => $request->user());

    // ── Citizen-accessible ───────────────────────────────────────────────────
    Route::post('/submit-waste', [\App\Http\Controllers\SubmissionController::class, 'submit']);
    Route::get('/dashboard',    [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/leaderboard',  [\App\Http\Controllers\LeaderboardController::class, 'index']);

    // Social layer
    Route::post('/follow/{id}',   [\App\Http\Controllers\SocialController::class, 'follow']);
    Route::post('/unfollow/{id}', [\App\Http\Controllers\SocialController::class, 'unfollow']);
    Route::get('/feed',           [\App\Http\Controllers\SocialController::class, 'feed']);

    // Redemption
    Route::post('/redeem', [\App\Http\Controllers\RewardController::class, 'redeem']);

    // ── Moderator & Admin ────────────────────────────────────────────────────
    Route::middleware('role:moderator,admin')->group(function () {
        // Dispute queue
        Route::get('/moderator/disputes', [\App\Http\Controllers\ModeratorController::class, 'disputes']);
        Route::post('/moderator/resolve/{id}', [\App\Http\Controllers\ModeratorController::class, 'resolve']);

        // Secondary engine review — triggers the alternative classifier audit record
        Route::post('/moderator/secondary-review/{id}', [\App\Http\Controllers\ModeratorController::class, 'secondaryReview']);

        // Scoped audit trail: moderators may inspect entries for a specific submission
        Route::get('/moderator/audit/{submissionId}', [\App\Http\Controllers\ModeratorController::class, 'auditForSubmission']);
    });

    // ── Administrator-only ───────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users',              [\App\Http\Controllers\AdminController::class, 'users']);
        Route::patch('/admin/users/{id}/role',  [\App\Http\Controllers\AdminController::class, 'updateRole']);
        Route::get('/admin/audit-trail',        [\App\Http\Controllers\AdminController::class, 'auditTrail']);
        Route::get('/admin/system-stats',       [\App\Http\Controllers\AdminController::class, 'systemStats']);
    });
});
