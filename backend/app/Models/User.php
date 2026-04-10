<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'country',
        'district',
        'clan_id',
        'total_points',
        'user_title',
        'role',
        'is_banned',
        'banned_at',
        'is_private',
        'flags',
        'bio',
        'location',
        'website',
        'settings',
    ];

    public function clan()
    {
        return $this->belongsTo(Clan::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function systemAudits()
    {
        return $this->hasMany(SystemAudit::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'banned_at' => 'datetime',
            'settings' => 'array',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            $user->settings = $user->settings ?? [
                'privacy' => [
                    'show_in_leaderboard' => true,
                    'show_activity' => true,
                    'allow_followers' => true,
                    'show_accuracy_rate' => true,
                    'show_points' => true,
                ],
                'notifications' => [
                    'submission_results' => true,
                    'dispute_updates' => true,
                    'leaderboard_changes' => false,
                    'new_followers' => true,
                    'weekly_digest' => true,
                    'reward_reminders' => false,
                    'email_notifs' => true,
                    'push_notifs' => false,
                ]
            ];
        });
    }
}
