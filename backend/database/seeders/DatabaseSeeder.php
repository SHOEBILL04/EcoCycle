<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Clan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create initial clans
        $clans = [
            ['name' => 'Eco Titans', 'rank_title' => 'Gold'],
            ['name' => 'Green Guardians', 'rank_title' => 'Silver'],
            ['name' => 'Recycle Rangers', 'rank_title' => 'Bronze'],
        ];

        foreach ($clans as $clan) {
            Clan::firstOrCreate(['name' => $clan['name']], $clan);
        }

        $testClan = Clan::first();

        // Create Users
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@ecocycle.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'clan_id' => $testClan->id,
        ]);

        User::factory()->create([
            'name' => 'Moderator User',
            'email' => 'moderator@ecocycle.com',
            'password' => bcrypt('password'),
            'role' => 'moderator',
            'clan_id' => $testClan->id,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'citizen',
            'clan_id' => $testClan->id,
        ]);
    }
}
