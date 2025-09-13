<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Audio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_filename',
        'original_path',
        'file_size',
        'duration',
        'sample_rate',
        'bit_depth',
        'channels',
        'format',
        'genre',
        'tier',
        'status',
        'processing_started_at',
        'processing_completed_at',
        'processed_files',
        'ml_recommendations',
        'error_message',
    ];

    protected $casts = [
        'processed_files' => 'array',
        'ml_recommendations' => 'array',
        'processing_started_at' => 'datetime',
        'processing_completed_at' => 'datetime',
        'file_size' => 'integer',
        'duration' => 'float',
        'sample_rate' => 'integer',
        'bit_depth' => 'integer',
        'channels' => 'integer',
    ];

    // Status constants
    const STATUS_UPLOADED = 'uploaded';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    // Relationship
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get processing duration
    public function getProcessingDurationAttribute(): ?int
    {
        if ($this->processing_started_at && $this->processing_completed_at) {
            return $this->processing_completed_at->diffInSeconds($this->processing_started_at);
        }
        return null;
    }

    // Check if processing is complete
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    // Check if processing failed
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    // Check if processing is in progress
    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    // Get download URL for specific format
    public function getDownloadUrl(string $format): ?string
    {
        if (!$this->isCompleted() || !isset($this->processed_files[$format])) {
            return null;
        }

        return route('api.download', [
            'audioId' => $this->id,
            'format' => $format
        ]);
    }

    // Get available formats
    public function getAvailableFormats(): array
    {
        if (!$this->isCompleted()) {
            return [];
        }

        return array_keys($this->processed_files ?? []);
    }
}
