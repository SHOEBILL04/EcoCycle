<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SystemAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * List all users.
     */
    public function users(Request $request)
    {
        $users = User::where(function ($query) {
            $query->whereNull('is_banned')
                  ->orWhere('is_banned', false);
            })
            ->select('id', 'name as username', 'email', 'role', 'created_at as createdAt')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Get a single user's full profile details.
     */
    public function showUser($id)
    {
        $user = User::with('clan')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Change a user's role. Logs the change synchronously inside the same DB transaction.
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => ['required', Rule::in(['citizen', 'moderator'])],
        ]);

        $admin = $request->user();
        $target = User::findOrFail($id);

        // Prevent admins from changing their own role
        if ($target->id === $admin->id) {
            return response()->json(['error' => 'Administrators cannot change their own role.'], 400);
        }

        $oldRole = $target->role;
        $newRole = $request->role;

        if ($oldRole === $newRole) {
            return response()->json(['error' => 'User already has this role.'], 400);
        }

        DB::beginTransaction();
        try {
            $target->role = $newRole;
            $target->save();

            // MANDATORY: Synchronous audit write in same transaction
            SystemAudit::create([
                'event_type'  => 'ROLE_CHANGED',
                'user_id'     => $admin->id,
                'description' => "Admin [{$admin->id}] changed role of user [{$target->id}] from '{$oldRole}' to '{$newRole}'.",
                'payload'     => [
                    'changedBy'    => $admin->id,
                    'targetUserId' => $target->id,
                    'oldRole'      => $oldRole,
                    'newRole'      => $newRole,
                    'timestamp'    => now()->toISOString(),
                ],
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => "User {$target->name} role updated to '{$newRole}'.",
                'user'    => [
                    'id'       => $target->id,
                    'username' => $target->name,
                    'email'    => $target->email,
                    'role'     => $target->role,
                    'createdAt'=> $target->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Role update transaction failed.'], 500);
        }
    }

    /**
     * Ban a user and revoke active sessions.
     */
    public function banUser(Request $request, $id)
    {
        $admin = $request->user();
        $target = User::findOrFail($id);

        if ($target->id === $admin->id) {
            return response()->json(['error' => 'Administrators cannot ban themselves.'], 400);
        }

        if ($target->role === 'admin') {
            return response()->json(['error' => 'Administrators cannot ban other administrators.'], 400);
        }

        if ($target->is_banned) {
            return response()->json(['error' => 'User is already banned.'], 400);
        }

        DB::beginTransaction();
        try {
            $target->is_banned = true;
            $target->banned_at = now();
            $target->save();

            $target->tokens()->delete();

            SystemAudit::create([
                'event_type'  => 'USER_BANNED',
                'user_id'     => $admin->id,
                'description' => "Admin [{$admin->id}] banned user [{$target->id}] ({$target->email}).",
                'payload'     => [
                    'changedBy'    => $admin->id,
                    'targetUserId' => $target->id,
                    'email'        => $target->email,
                    'timestamp'    => now()->toISOString(),
                ],
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "User {$target->name} has been banned.",
                'user' => [
                    'id' => $target->id,
                    'username' => $target->name,
                    'email' => $target->email,
                    'role' => $target->role,
                    'createdAt' => $target->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Ban transaction failed.'], 500);
        }
    }

    /**
     * Full paginated audit trail — admin only.
     * Supports optional filtering by event_type and user_id.
     */
    public function auditTrail(Request $request)
    {
        $query = SystemAudit::with('user:id,name,role')
            ->orderBy('created_at', 'desc');

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(100);

        return response()->json($logs);
    }

    /**
     * System-level observability: counts of each status across submissions.
     */
    public function systemStats()
    {
        $submissionStats = DB::table('submissions')
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $userStats = DB::table('users')
            ->select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get()
            ->keyBy('role');

        $auditEventStats = DB::table('system_audits')
            ->select('event_type', DB::raw('count(*) as total'))
            ->groupBy('event_type')
            ->orderByDesc('total')
            ->get();

        $startDate = \Carbon\Carbon::now()->subDays(6)->startOfDay();
        $chartDataRaw = DB::table('submissions')
            ->select(DB::raw('DATE(created_at) as date'), 'status', DB::raw('count(*) as total'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('date', 'status')
            ->get();
            
        $weeklyChart = [];
        for ($i = 0; $i < 7; $i++) {
            $date = \Carbon\Carbon::now()->subDays(6 - $i)->format('Y-m-d');
            $dayName = \Carbon\Carbon::now()->subDays(6 - $i)->format('D');
            
            $dayStats = $chartDataRaw->where('date', $date);
            
            $weeklyChart[] = [
                'day' => $dayName,
                'approved' => (int) $dayStats->where('status', 'REWARDED')->sum('total'),
                'disputed' => (int) $dayStats->where('status', 'PENDING')->sum('total'),
                'flagged'  => (int) $dayStats->whereIn('status', ['FLAGGED', 'REJECTED'])->sum('total')
            ];
        }

        return response()->json([
            'submission_breakdown' => $submissionStats,
            'user_role_breakdown'  => $userStats,
            'audit_event_counts'   => $auditEventStats,
            'total_points_awarded' => clone DB::table('transactions')->where('type', 'reward')->sum('points'),
            'total_redeemed'       => clone DB::table('transactions')->where('type', 'redemption')->sum(DB::raw('ABS(points)')),
            'weekly_chart'         => $weeklyChart,
        ]);
    }
}
