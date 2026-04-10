<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WasteClassificationService
{
    private array $categoryMap = [
        'recyclable' => ['plastic', 'glass', 'paper', 'cardboard', 'metal', 'can', 'bottle', 'tin', 'aluminium', 'aluminum', 'carton', 'newspaper', 'clothing', 'textile'],
        'organic'    => ['food', 'plant', 'fruit', 'vegetable', 'leaf', 'wood', 'biodegradable', 'compost', 'coffee', 'soil'],
        'e-waste'    => ['electronic', 'computer', 'phone', 'battery', 'cable', 'appliance', 'circuit', 'laptop', 'tablet', 'charger', 'monitor'],
        'hazardous'  => ['chemical', 'paint', 'oil', 'toxic', 'medical', 'syringe', 'acid', 'solvent', 'bleach', 'pesticide', 'drug', 'fuel'],
    ];

    public function classifyBase64(string $base64Image): array
    {
        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            Log::error('GEMINI_API_KEY is not set in environment variables.');
            return $this->fallbackClassification();
        }

        try {
            // Using Gemini 1.5 Flash (Free and Fast)
            $response = Http::post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => "Identify this item for waste sorting. Classify it into one of these categories: recyclable, organic, e-waste, hazardous. Also provide a specific subcategory (e.g., Plastic Bottle, Banana Peel, Battery). Return ONLY a JSON object like this: {\"category\": \"recyclable\", \"subcategory\": \"Plastic Bottle\", \"confidence\": 0.95}"],
                                [
                                    'inline_data' => [
                                        'mime_type' => 'image/jpeg',
                                        'data' => $base64Image
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                    ]
                ]
            );

            if ($response->failed()) {
                Log::error('Gemini API Error: ' . $response->body());
                return $this->fallbackClassification();
            }

            $responseText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Strip markdown JSON blocks if present
            $responseText = preg_replace('/^```json\s*|```$/', '', trim($responseText));
            $result = json_decode($responseText, true);
            
            return [
                'category'             => $result['category'] ?? 'recyclable',
                'subcategory'          => $result['subcategory'] ?? 'Unknown',
                'primary_confidence'   => (float) ($result['confidence'] ?? 0.5),
                'secondary_category'   => $result['category'] ?? 'recyclable',
                'secondary_confidence' => (float) ($result['confidence'] ?? 0.5),
                'primary_distribution' => [$result['category'] ?? 'recyclable' => 1.0],
                'secondary_distribution' => [],
                'primary_engine'       => 'Gemini 1.5 Flash',
                'secondary_engine'     => 'Gemini 1.5 Flash',
            ];

        } catch (\Exception $e) {
            Log::error('Waste Classification Exception: ' . $e->getMessage());
            return $this->fallbackClassification();
        }
    }

    private function fallbackClassification(): array
    {
        return [
            'category'             => 'recyclable',
            'subcategory'          => 'Detection Failed',
            'primary_confidence'   => 0.4,
            'secondary_confidence' => 0.4,
            'primary_distribution' => ['recyclable' => 1.0],
            'secondary_distribution' => [],
            'primary_engine'       => 'Fallback Engine',
            'secondary_engine'     => 'Fallback Engine',
        ];
    }
}
