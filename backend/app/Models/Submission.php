<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $guarded = [];

    protected $fillable = [
        'user_id',
        'category',
        'subcategory',
        'confidence_score',
        'secondary_confidence_score',
        'status',
        'flagged_reason',
        'image_hash',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * All transaction records associated with this submission.
     * Used by the activity feed to resolve points_awarded per entry.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
