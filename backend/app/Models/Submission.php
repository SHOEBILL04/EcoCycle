<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'user_id',
        'category',
        'subcategory',
        'confidence_score',
        'status',
        'image_hash',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
