<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        $clan = \App\Models\Clan::firstOrCreate(['name' => $request->sub_district]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country' => $request->country,
            'district' => $request->district,
            'clan_id' => $clan->id,
            'role' => 'citizen', 
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
        ]);

        $user = $request->user();
        
        // Merge or replace settings
        $settings = $user->settings ?? [];
        if ($request->has('privacy')) {
            $settings['privacy'] = array_merge($settings['privacy'] ?? [], $request->privacy);
        }
        if ($request->has('notifications')) {
            $settings['notifications'] = array_merge($settings['notifications'] ?? [], $request->notifications);
        }

        $user->settings = $settings;
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $user->settings
        ]);
    }
}
