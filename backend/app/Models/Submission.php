<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'user_id',
        'image_url',
        'category',
        'subcategory',
        'confidence_score',
        'ai_confidence_scores',
        'secondary_confidence_score',
        'status',
        'final_category',
        'final_confidence',
        'resolved_by',
        'resolved_at',
        'points_awarded',
        'flagged_reason',
        'image_hash',
    ];

    protected $casts = [
        'ai_confidence_scores' => 'array',
        'resolved_at' => 'datetime',
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

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
