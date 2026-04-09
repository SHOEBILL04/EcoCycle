<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clan extends Model
{
    protected $fillable = [
        'name',
        'total_points',
        'accuracy_rate',
        'rank_title',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
