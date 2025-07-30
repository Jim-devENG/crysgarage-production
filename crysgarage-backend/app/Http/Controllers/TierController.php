<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Audio;
use App\Models\AudioQuality;
use App\Models\Genre;

class TierController extends Controller
{
    /**
     * Get tier-specific features and limitations
     */
    public function getTierFeatures(Request $request)
    {
        $user = $request->user();
        $tier = $user ? $user->tier : 'free';

        $features = $this->getFeaturesForTier($tier);

        return response()->json([
            'success' => true,
            'tier' => $tier,
            'features' => $features
        ]);
    }

    /**
     * Get tier-specific dashboard data
     */
    public function getTierDashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tier = $user->tier;
        $dashboardData = $this->getDashboardDataForTier($user, $tier);

        return response()->json([
            'success' => true,
            'tier' => $tier,
            'dashboard' => $dashboardData
        ]);
    }

    /**
     * Get tier-specific upload options
     */
    public function getTierUploadOptions(Request $request)
    {
        $user = $request->user();
        $tier = $user ? $user->tier : 'free';

        $uploadOptions = $this->getUploadOptionsForTier($tier);

        return response()->json([
            'success' => true,
            'tier' => $tier,
            'upload_options' => $uploadOptions
        ]);
    }

    /**
     * Get tier-specific processing options
     */
    public function getTierProcessingOptions(Request $request)
    {
        $user = $request->user();
        $tier = $user ? $user->tier : 'free';

        $processingOptions = $this->getProcessingOptionsForTier($tier);

        return response()->json([
            'success' => true,
            'tier' => $tier,
            'processing_options' => $processingOptions
        ]);
    }

    /**
     * Get tier-specific user stats
     */
    public function getTierStats(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tier = $user->tier;
        $stats = $this->getStatsForTier($user, $tier);

        return response()->json([
            'success' => true,
            'tier' => $tier,
            'stats' => $stats
        ]);
    }

    /**
     * Upgrade user tier
     */
    public function upgradeTier(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'new_tier' => 'required|string|in:professional,advanced'
        ]);

        $newTier = $request->new_tier;
        $currentTier = $user->tier;

        // Check if upgrade is valid
        if ($currentTier === 'advanced') {
            return response()->json([
                'success' => false,
                'error' => 'Already at highest tier'
            ], 400);
        }

        if ($currentTier === 'professional' && $newTier === 'professional') {
            return response()->json([
                'success' => false,
                'error' => 'Already at professional tier'
            ], 400);
        }

        // Update user tier
        $user->tier = $newTier;
        
        // Add tier-specific benefits
        if ($newTier === 'professional') {
            $user->credits += 50; // Bonus credits for upgrade
        } elseif ($newTier === 'advanced') {
            $user->credits = -1; // Unlimited credits
        }
        
        $user->save();

        Log::info('User tier upgraded', [
            'user_id' => $user->id,
            'old_tier' => $currentTier,
            'new_tier' => $newTier
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tier upgraded successfully',
            'new_tier' => $newTier,
            'new_features' => $this->getFeaturesForTier($newTier)
        ]);
    }

    /**
     * Get features for specific tier
     */
    private function getFeaturesForTier($tier)
    {
        $features = [
            'free' => [
                'name' => 'Free Tier',
                'max_file_size' => 50, // MB
                'max_tracks_per_month' => 3,
                'supported_formats' => ['wav', 'mp3'],
                'supported_genres' => ['afrobeats', 'gospel'],
                'processing_quality' => 'standard',
                'download_formats' => ['wav'],
                'features' => [
                    'Basic audio mastering',
                    'Standard quality output',
                    'Limited genres',
                    'Basic support'
                ],
                'limitations' => [
                    'No advanced processing',
                    'Limited file formats',
                    'No priority processing',
                    'No custom settings'
                ]
            ],
            'professional' => [
                'name' => 'Professional Tier',
                'max_file_size' => 200, // MB
                'max_tracks_per_month' => 20,
                'supported_formats' => ['wav', 'mp3', 'flac'],
                'supported_genres' => ['afrobeats', 'gospel', 'hip_hop', 'highlife'],
                'processing_quality' => 'high',
                'download_formats' => ['wav', 'mp3'],
                'features' => [
                    'Advanced audio mastering',
                    'High quality output',
                    'All genres supported',
                    'Priority processing',
                    'Custom processing settings',
                    'Professional support'
                ],
                'limitations' => [
                    'No unlimited processing',
                    'No advanced analytics',
                    'No custom presets'
                ]
            ],
            'advanced' => [
                'name' => 'Advanced Tier',
                'max_file_size' => 500, // MB
                'max_tracks_per_month' => -1, // Unlimited
                'supported_formats' => ['wav', 'mp3', 'flac', 'aiff'],
                'supported_genres' => ['afrobeats', 'gospel', 'hip_hop', 'highlife'],
                'processing_quality' => 'master',
                'download_formats' => ['wav', 'mp3', 'flac'],
                'features' => [
                    'Master quality audio mastering',
                    'Unlimited processing',
                    'All genres and formats',
                    'Custom presets',
                    'Advanced analytics',
                    'Priority support',
                    'Custom processing algorithms'
                ],
                'limitations' => [
                    'No limitations'
                ]
            ]
        ];

        return $features[$tier] ?? $features['free'];
    }

    /**
     * Get dashboard data for specific tier
     */
    private function getDashboardDataForTier($user, $tier)
    {
        $audioCount = Audio::where('user_id', $user->id)->count();
        $recentAudio = Audio::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $baseData = [
            'user_info' => [
                'name' => $user->name,
                'email' => $user->email,
                'tier' => $user->tier,
                'credits' => $user->credits,
                'join_date' => $user->created_at->format('Y-m-d')
            ],
            'audio_stats' => [
                'total_tracks' => $audioCount,
                'recent_tracks' => $recentAudio
            ]
        ];

        switch ($tier) {
            case 'free':
                return array_merge($baseData, [
                    'tier_specific' => [
                        'tracks_remaining' => max(0, 3 - $audioCount),
                        'upgrade_prompt' => true,
                        'quick_actions' => [
                            'upload_audio' => true,
                            'view_pricing' => true,
                            'try_demo' => true
                        ]
                    ]
                ]);

            case 'professional':
                return array_merge($baseData, [
                    'tier_specific' => [
                        'tracks_remaining' => max(0, 20 - $audioCount),
                        'processing_queue' => $this->getProcessingQueue($user->id),
                        'quick_actions' => [
                            'upload_audio' => true,
                            'view_analytics' => true,
                            'manage_presets' => true,
                            'contact_support' => true
                        ]
                    ]
                ]);

            case 'advanced':
                return array_merge($baseData, [
                    'tier_specific' => [
                        'unlimited_tracks' => true,
                        'processing_queue' => $this->getProcessingQueue($user->id),
                        'advanced_analytics' => $this->getAdvancedAnalytics($user->id),
                        'quick_actions' => [
                            'upload_audio' => true,
                            'view_analytics' => true,
                            'manage_presets' => true,
                            'custom_algorithms' => true,
                            'priority_support' => true
                        ]
                    ]
                ]);

            default:
                return $baseData;
        }
    }

    /**
     * Get upload options for specific tier
     */
    private function getUploadOptionsForTier($tier)
    {
        $features = $this->getFeaturesForTier($tier);

        return [
            'max_file_size' => $features['max_file_size'],
            'supported_formats' => $features['supported_formats'],
            'supported_genres' => $features['supported_genres'],
            'upload_methods' => [
                'drag_drop' => true,
                'file_picker' => true,
                'url_upload' => $tier !== 'free',
                'batch_upload' => $tier === 'advanced'
            ],
            'processing_options' => [
                'custom_settings' => $tier !== 'free',
                'presets' => $tier !== 'free',
                'advanced_algorithms' => $tier === 'advanced'
            ]
        ];
    }

    /**
     * Get processing options for specific tier
     */
    private function getProcessingOptionsForTier($tier)
    {
        $features = $this->getFeaturesForTier($tier);

        return [
            'quality' => $features['processing_quality'],
            'download_formats' => $features['download_formats'],
            'processing_features' => [
                'real_time_progress' => true,
                'processing_history' => true,
                'comparison_tools' => $tier !== 'free',
                'advanced_analytics' => $tier === 'advanced',
                'custom_algorithms' => $tier === 'advanced'
            ],
            'priority_processing' => $tier !== 'free'
        ];
    }

    /**
     * Get stats for specific tier
     */
    private function getStatsForTier($user, $tier)
    {
        $totalAudio = Audio::where('user_id', $user->id)->count();
        $completedAudio = Audio::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $totalSize = Audio::where('user_id', $user->id)->sum('file_size');

        $baseStats = [
            'total_tracks' => $totalAudio,
            'completed_tracks' => $completedAudio,
            'total_size_mb' => round($totalSize / (1024 * 1024), 2),
            'success_rate' => $totalAudio > 0 ? round(($completedAudio / $totalAudio) * 100, 1) : 0
        ];

        switch ($tier) {
            case 'free':
                return array_merge($baseStats, [
                    'tracks_remaining' => max(0, 3 - $totalAudio),
                    'upgrade_benefits' => [
                        'more_tracks' => 'Upgrade to process up to 20 tracks per month',
                        'better_quality' => 'Get high-quality processing',
                        'more_formats' => 'Support for FLAC and more formats'
                    ]
                ]);

            case 'professional':
                return array_merge($baseStats, [
                    'tracks_remaining' => max(0, 20 - $totalAudio),
                    'processing_efficiency' => $this->getProcessingEfficiency($user->id),
                    'popular_genres' => $this->getPopularGenres($user->id)
                ]);

            case 'advanced':
                return array_merge($baseStats, [
                    'unlimited_tracks' => true,
                    'processing_efficiency' => $this->getProcessingEfficiency($user->id),
                    'popular_genres' => $this->getPopularGenres($user->id),
                    'advanced_metrics' => $this->getAdvancedMetrics($user->id)
                ]);

            default:
                return $baseStats;
        }
    }

    /**
     * Get processing queue for user
     */
    private function getProcessingQueue($userId)
    {
        return Audio::where('user_id', $userId)
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'asc')
            ->get(['id', 'file_name', 'status', 'progress', 'created_at']);
    }

    /**
     * Get advanced analytics for advanced tier
     */
    private function getAdvancedAnalytics($userId)
    {
        $audio = Audio::where('user_id', $userId)->get();
        
        return [
            'processing_trends' => $this->getProcessingTrends($audio),
            'quality_metrics' => $this->getQualityMetrics($audio),
            'genre_distribution' => $this->getGenreDistribution($audio)
        ];
    }

    /**
     * Get processing efficiency metrics
     */
    private function getProcessingEfficiency($userId)
    {
        $audio = Audio::where('user_id', $userId)->get();
        $totalProcessingTime = $audio->sum('processing_time') ?? 0;
        $totalTracks = $audio->count();

        return [
            'avg_processing_time' => $totalTracks > 0 ? round($totalProcessingTime / $totalTracks, 2) : 0,
            'total_processing_time' => $totalProcessingTime,
            'efficiency_score' => $this->calculateEfficiencyScore($audio)
        ];
    }

    /**
     * Get popular genres for user
     */
    private function getPopularGenres($userId)
    {
        return Audio::where('user_id', $userId)
            ->selectRaw('genre, COUNT(*) as count')
            ->groupBy('genre')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Get advanced metrics for advanced tier
     */
    private function getAdvancedMetrics($userId)
    {
        $audio = Audio::where('user_id', $userId)->get();
        
        return [
            'file_size_distribution' => $this->getFileSizeDistribution($audio),
            'processing_success_rate' => $this->getProcessingSuccessRate($audio),
            'peak_usage_times' => $this->getPeakUsageTimes($audio)
        ];
    }

    /**
     * Calculate efficiency score
     */
    private function calculateEfficiencyScore($audio)
    {
        if ($audio->count() === 0) return 0;
        
        $completed = $audio->where('status', 'completed')->count();
        $total = $audio->count();
        
        return round(($completed / $total) * 100, 1);
    }

    /**
     * Get processing trends
     */
    private function getProcessingTrends($audio)
    {
        // Group by month and count
        return $audio->groupBy(function($item) {
            return $item->created_at->format('Y-m');
        })->map(function($group) {
            return $group->count();
        });
    }

    /**
     * Get quality metrics
     */
    private function getQualityMetrics($audio)
    {
        return [
            'high_quality_tracks' => $audio->where('tier', 'professional')->count() + $audio->where('tier', 'advanced')->count(),
            'standard_quality_tracks' => $audio->where('tier', 'free')->count(),
            'average_file_size' => $audio->avg('file_size') ?? 0
        ];
    }

    /**
     * Get genre distribution
     */
    private function getGenreDistribution($audio)
    {
        return $audio->groupBy('genre')->map(function($group) {
            return $group->count();
        });
    }

    /**
     * Get file size distribution
     */
    private function getFileSizeDistribution($audio)
    {
        return [
            'small' => $audio->where('file_size', '<', 10 * 1024 * 1024)->count(), // < 10MB
            'medium' => $audio->whereBetween('file_size', [10 * 1024 * 1024, 50 * 1024 * 1024])->count(), // 10-50MB
            'large' => $audio->where('file_size', '>', 50 * 1024 * 1024)->count() // > 50MB
        ];
    }

    /**
     * Get processing success rate
     */
    private function getProcessingSuccessRate($audio)
    {
        if ($audio->count() === 0) return 0;
        
        $successful = $audio->where('status', 'completed')->count();
        return round(($successful / $audio->count()) * 100, 1);
    }

    /**
     * Get peak usage times
     */
    private function getPeakUsageTimes($audio)
    {
        return $audio->groupBy(function($item) {
            return $item->created_at->format('H'); // Hour of day
        })->map(function($group) {
            return $group->count();
        })->sortKeys();
    }
} 