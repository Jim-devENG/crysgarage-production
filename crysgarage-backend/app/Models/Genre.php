<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'is_free_for_tier',
        'icon',
        'sort_order'
    ];

    protected $casts = [
        'is_free_for_tier' => 'array',
        'price' => 'decimal:2'
    ];

    /**
     * Get genres available for a specific tier
     */
    public static function getGenresForTier($tier)
    {
        return self::orderBy('sort_order')->get()->map(function ($genre) use ($tier) {
            $isFree = in_array($tier, $genre->is_free_for_tier ?? []);
            return [
                'id' => $genre->id,
                'name' => $genre->name,
                'description' => $genre->description,
                'price' => $isFree ? 0 : $genre->price,
                'is_free' => $isFree,
                'icon' => $genre->icon
            ];
        });
    }
}