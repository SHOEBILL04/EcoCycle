<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function isPrimaryAdminEmail(string $email): bool
    {
        return strtolower(trim($email)) === 'rockstar@gmail.com';
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'country' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'sub_district' => 'required|string|max:255',
        ]);

        $area = trim($request->sub_district);
        $clanName = ucfirst(strtolower($area)) . ' Titans';
        
        $clan = \App\Models\Clan::firstOrCreate(['name' => $clanName]);

        $assignedRole = $this->isPrimaryAdminEmail($request->email) ? 'admin' : 'citizen';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country' => $request->country,
            'district' => $request->district,
            'clan_id' => $clan->id,
            'role' => $assignedRole,
            'is_private' => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('clan'),
            'access_token' => $token,
            'role' => $user->role,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'This account has been banned.'
            ], 403);
        }

        if ($this->isPrimaryAdminEmail($user->email) && $user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('clan'),
            'access_token' => $token,
            'role' => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password does not match.'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:160',
            'location' => 'sometimes|string|max:255',
            'website' => 'sometimes|nullable|url',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'bio', 'location', 'website']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'privacy' => 'sometimes|array',
            'notifications' => 'sometimes|array',
            'is_private' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        
        // Merge or replace settings
        $settings = $user->settings ?? [];
        
        if ($request->has('privacy')) {
            $settings['privacy'] = array_merge($settings['privacy'] ?? [], $request->privacy);
            if (isset($request->privacy['is_private'])) {
                $user->is_private = filter_var($request->privacy['is_private'], FILTER_VALIDATE_BOOLEAN);
            }
        }
        
        if ($request->has('is_private')) {
            $user->is_private = filter_var($request->is_private, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('notifications')) {
            $settings['notifications'] = array_merge($settings['notifications'] ?? [], $request->notifications);
        }

        $user->settings = $settings;
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $user->settings,
            'is_private' => (bool)$user->is_private
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'The provided password does not match. Account deletion cancelled.'], 401);
        }

        // ── Primary Admin Protection ────────────────────────────────────────
        if ($this->isPrimaryAdminEmail($user->email)) {
            return response()->json(['message' => 'The primary administrator account cannot be deleted.'], 403);
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // Log the intentional deletion before the record is gone
            \App\Models\SystemAudit::create([
                'event_type' => 'ACCOUNT_PERMANENTLY_DELETED',
                'user_id' => $user->id,
                'description' => "User {$user->email} requested permanent account deletion.",
            ]);

            // Delete related resources
            // Note: If cascading deletes are NOT configured in migrations, we do it here
            $user->submissions()->delete();
            $user->notifications()->delete();
            \App\Models\Transaction::where('user_id', $user->id)->delete();

            // Revoke all tokens
            $user->tokens()->delete();

            // Final deletion
            $user->delete();

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['message' => 'Account deleted successfully. We are sorry to see you go!']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => 'Deletion failed: ' . $e->getMessage()], 500);
        }
    }
}
