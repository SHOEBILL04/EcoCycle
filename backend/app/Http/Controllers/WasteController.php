<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;

class WasteController extends Controller
{
    public function classifyWaste(Request $request)
    {
        $request->validate([
            'image_hash' => 'required|string',
            'category' => 'required|string',
            'subcategory' => 'nullable|string',
        ]);

        // Idempotency & Fraud: Prevent duplicate uploads within 24 hours
        $recentDuplicate = Submission::where('user_id', $request->user()->id)
            ->where('image_hash', $request->image_hash)
            ->where('created_at', '>=', now()->subHours(24))
            ->first();

        if ($recentDuplicate) {
            return response()->json([
                'error' => 'Duplicate submission detected within 24 hours.'
            ], 422);
        }

        // Simulate Dual-AI Logic
        $confidenceScore = $request->input('simulated_confidence', rand(70, 99) / 100);

        $status = 'SUBMITTED';
        if ($confidenceScore < 0.85) {
            $status = 'PENDING'; // Route to Moderator review
        }

        $submission = Submission::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'subcategory' => $request->subcategory,
            'confidence_score' => $confidenceScore,
            'status' => $status,
            'image_hash' => $request->image_hash,
        ]);

        return response()->json([
            'message' => 'Waste classified successfully.',
            'submission' => $submission,
            'requires_review' => $status === 'PENDING'
        ], 201);
    }
}
