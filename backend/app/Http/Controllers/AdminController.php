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
     * List all users with their role and stats.
     */
    public function users(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'total_points', 'is_private', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($users);
    }

    /**
     * Change a user's role. Logs the change synchronously inside the same DB transaction.
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => ['required', Rule::in(['citizen', 'moderator', 'admin'])],
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
                'payload'     => json_encode([
                    'target_user_id' => $target->id,
                    'old_role'       => $oldRole,
                    'new_role'       => $newRole,
                ]),
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => "User {$target->name} role updated to '{$newRole}'.",
                'user'    => $target->only('id', 'name', 'email', 'role'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Role update transaction failed.'], 500);
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
