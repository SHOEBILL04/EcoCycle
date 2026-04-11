<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'not.banned'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/user/password', [AuthController::class, 'updatePassword']);
    Route::patch('/user/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/user/settings', [AuthController::class, 'updateSettings']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

    // ── Citizen-accessible ───────────────────────────────────────────────────
    Route::post('/submissions', [\App\Http\Controllers\SubmissionController::class, 'store']);
    Route::post('/submit-waste', [\App\Http\Controllers\SubmissionController::class, 'submit']);
    Route::get('/dashboard',    [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/leaderboard',  [\App\Http\Controllers\LeaderboardController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::get('/profile/stats', [\App\Http\Controllers\ProfileController::class, 'stats']);

    // Social layer
    Route::post('/follow/{id}',   [\App\Http\Controllers\SocialController::class, 'follow']);
    Route::post('/unfollow/{id}', [\App\Http\Controllers\SocialController::class, 'unfollow']);
    Route::get('/feed',           [\App\Http\Controllers\SocialController::class, 'feed']);

    // Redemption
    Route::get('/rewards', [\App\Http\Controllers\RewardController::class, 'index']);
    Route::post('/redeem', [\App\Http\Controllers\RewardController::class, 'redeem']);

    // ── Moderator & Admin ────────────────────────────────────────────────────
    Route::middleware('role:moderator,admin')->group(function () {
        // Dispute queue
        Route::get('/moderator/disputes', [\App\Http\Controllers\ModeratorController::class, 'disputes']);
        Route::post('/moderator/resolve/{id}', [\App\Http\Controllers\ModeratorController::class, 'resolve']);
        Route::post('/moderator/disputes/{submission}/verdict', [\App\Http\Controllers\ModeratorController::class, 'verdict']);

        // Secondary engine review — triggers the alternative classifier audit record
        Route::post('/moderator/secondary-review/{id}', [\App\Http\Controllers\ModeratorController::class, 'secondaryReview']);

        // Scoped audit trail: moderators may inspect entries for a specific submission
        Route::get('/moderator/audit/{submissionId}', [\App\Http\Controllers\ModeratorController::class, 'auditForSubmission']);
    });

    // ── Administrator-only ───────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users',              [\App\Http\Controllers\AdminController::class, 'users']);
        Route::get('/admin/users/{id}',         [\App\Http\Controllers\AdminController::class, 'showUser']);
        Route::patch('/admin/users/{id}/role',  [\App\Http\Controllers\AdminController::class, 'updateRole']);
        Route::patch('/admin/users/{id}/ban',   [\App\Http\Controllers\AdminController::class, 'banUser']);
        Route::get('/admin/audit-trail',        [\App\Http\Controllers\AdminController::class, 'auditTrail']);
        Route::get('/admin/system-stats',       [\App\Http\Controllers\AdminController::class, 'systemStats']);
        Route::put('/admin/config/threshold',        [\App\Http\Controllers\AdminController::class, 'updateThreshold']);
        Route::put('/admin/config/duplicate-window', [\App\Http\Controllers\AdminController::class, 'updateDuplicateWindow']);
    });
});
