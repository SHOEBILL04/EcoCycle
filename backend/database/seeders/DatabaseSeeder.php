<?php

namespace Database\Seeders;

use App\Models\Clan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $clans = [
            ['name' => 'Eco Titans', 'rank_title' => 'Gold'],
            ['name' => 'Green Guardians', 'rank_title' => 'Silver'],
            ['name' => 'Recycle Rangers', 'rank_title' => 'Bronze'],
            ['name' => 'Dhaka Titans', 'rank_title' => 'Bronze'],
        ];

        foreach ($clans as $clan) {
            Clan::firstOrCreate(
                ['name' => $clan['name']],
                [
                    'total_points' => 0,
                    'accuracy_rate' => 0,
                    'rank_title' => $clan['rank_title'],
                ]
            );
        }

        $testClan = Clan::first();

        User::updateOrCreate([
            'email' => 'rockstar@gmail.com',
        ], [
            'name' => 'Admin User',
            'password' => Hash::make(env('SEED_ADMIN_PASSWORD', 'password')),
            'role' => 'admin',
            'country' => 'Bangladesh',
            'district' => 'Dhaka',
            'clan_id' => $testClan->id,
            'is_private' => false,
            'is_banned' => false,
        ]);

        User::updateOrCreate([
            'email' => 'moderator@ecocycle.com',
        ], [
            'name' => 'Moderator User',
            'password' => Hash::make(env('SEED_MODERATOR_PASSWORD', 'password')),
            'role' => 'moderator',
            'country' => 'Bangladesh',
            'district' => 'Dhaka',
            'clan_id' => $testClan->id,
            'is_private' => false,
            'is_banned' => false,
        ]);

        User::updateOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => Hash::make(env('SEED_TEST_PASSWORD', 'password')),
            'role' => 'citizen',
            'country' => 'Bangladesh',
            'district' => 'Dhaka',
            'clan_id' => $testClan->id,
            'is_private' => false,
            'is_banned' => false,
        ]);
    }
}
