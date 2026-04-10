<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use LogicException;

class SystemAudit extends Model
{
    /**
     * Audit records are append-only by design.
     * Any attempt to update or delete an existing record is blocked at the
     * application layer to protect audit integrity.
     */

    protected $guarded = [];

    protected $fillable = [
        'event_type',
        'user_id',
        'description',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Immutability guards ──────────────────────────────────────────────────

    /**
     * Block UPDATE on audit records.
     */
    protected function performUpdate(\Illuminate\Database\Eloquent\Builder $query): bool
    {
        throw new LogicException('Audit records are immutable and cannot be updated.');
    }

    /**
     * Block DELETE on audit records.
     */
    public function delete(): bool|null
    {
        throw new LogicException('Audit records are immutable and cannot be deleted.');
    }
}
