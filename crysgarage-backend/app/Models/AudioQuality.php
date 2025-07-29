<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AudioQuality extends Model
{
    protected $fillable = [
        'name',
        'sample_rate',
        'bit_depth',
        'description',
        'price',
        'is_free_for_tier',
        'sort_order'
    ];

    protected $casts = [
        'is_free_for_tier' => 'array',
        'price' => 'decimal:2',
        'sample_rate' => 'integer',
        'bit_depth' => 'integer'
    ];

    /**
     * Get audio quality options for a specific tier
     */
    public static function getQualityOptionsForTier($tier)
    {
        return self::orderBy('sort_order')->get()->map(function ($quality) use ($tier) {
            $isFree = in_array($tier, $quality->is_free_for_tier ?? []);
            return [
                'id' => $quality->id,
                'name' => $quality->name,
                'sample_rate' => $quality->sample_rate,
                'bit_depth' => $quality->bit_depth,
                'description' => $quality->description,
                'price' => $isFree ? 0 : $quality->price,
                'is_free' => $isFree
            ];
        });
    }
}