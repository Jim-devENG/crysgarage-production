<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'tier',
        'credits',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'credits' => 'integer',
        ];
    }

    // Tier constants
    const TIER_FREE = 'free';
    const TIER_PRO = 'pro';
    const TIER_ADVANCED = 'advanced';
    const TIER_ONE_ON_ONE = 'one_on_one';

    // Get tier limits
    public function getTierLimits(): array
    {
        return match($this->tier) {
            self::TIER_FREE => [
                'max_file_size' => 50 * 1024 * 1024, // 50MB
                'supported_formats' => ['wav', 'mp3'],
                'supported_genres' => ['hip_hop', 'afrobeats'],
                'max_tracks_per_month' => 3,
                'processing_priority' => 'standard',
            ],
            self::TIER_PRO => [
                'max_file_size' => 200 * 1024 * 1024, // 200MB
                'supported_formats' => ['wav', 'mp3', 'flac'],
                'supported_genres' => ['hip_hop', 'afrobeats', 'gospel', 'highlife'],
                'max_tracks_per_month' => 20,
                'processing_priority' => 'fast',
            ],
            self::TIER_ADVANCED => [
                'max_file_size' => 500 * 1024 * 1024, // 500MB
                'supported_formats' => ['wav', 'mp3', 'flac', 'aiff'],
                'supported_genres' => ['hip_hop', 'afrobeats', 'gospel', 'highlife', 'r_b'],
                'max_tracks_per_month' => 100,
                'processing_priority' => 'highest',
            ],
            self::TIER_ONE_ON_ONE => [
                'max_file_size' => 1000 * 1024 * 1024, // 1GB
                'supported_formats' => ['wav', 'mp3', 'flac', 'aiff'],
                'supported_genres' => ['all'],
                'max_tracks_per_month' => -1, // unlimited
                'processing_priority' => 'highest',
            ],
            default => [
                'max_file_size' => 50 * 1024 * 1024,
                'supported_formats' => ['wav', 'mp3'],
                'supported_genres' => ['hip_hop', 'afrobeats'],
                'max_tracks_per_month' => 3,
                'processing_priority' => 'standard',
            ],
        };
    }

    // Check if user can process audio
    public function canProcessAudio(): bool
    {
        if ($this->tier === self::TIER_ONE_ON_ONE) {
            return true; // One-on-one tier has unlimited processing
        }

        if ($this->tier === self::TIER_FREE) {
            return true; // Free tier uses pay-per-download
        }

        return $this->credits > 0;
    }

    // Deduct credits for processing
    public function deductCredits(int $amount = 1): bool
    {
        if ($this->tier === self::TIER_FREE || $this->tier === self::TIER_ONE_ON_ONE) {
            return true; // These tiers don't use credits
        }

        if ($this->credits >= $amount) {
            $this->credits -= $amount;
            $this->save();
            return true;
        }

        return false;
    }
}
