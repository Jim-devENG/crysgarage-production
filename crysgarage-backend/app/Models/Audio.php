<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Audio extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'audio';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'user_id',
        'file_name',
        'file_size',
        'genre',
        'tier',
        'status',
        'progress',
        'output_files',
        'metadata',
        'processing_started_at',
        'processing_completed_at'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'file_size' => 'integer',
        'progress' => 'integer',
        'output_files' => 'array',
        'metadata' => 'array',
        'processing_started_at' => 'datetime',
        'processing_completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user that owns the audio.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include audio for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include audio with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include audio for a specific tier.
     */
    public function scopeForTier($query, $tier)
    {
        return $query->where('tier', $tier);
    }

    /**
     * Get the file path for the uploaded audio.
     */
    public function getFilePathAttribute()
    {
        return storage_path("app/uploads/{$this->id}.wav");
    }

    /**
     * Check if the audio file exists.
     */
    public function fileExists()
    {
        return file_exists($this->file_path);
    }

    /**
     * Get the processing duration in seconds.
     */
    public function getProcessingDurationAttribute()
    {
        if (!$this->processing_started_at || !$this->processing_completed_at) {
            return null;
        }

        return $this->processing_completed_at->diffInSeconds($this->processing_started_at);
    }

    /**
     * Check if processing is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if processing is in progress.
     */
    public function isProcessing()
    {
        return $this->status === 'processing';
    }

    /**
     * Check if processing has failed.
     */
    public function hasFailed()
    {
        return $this->status === 'failed';
    }

    /**
     * Get the output file URL for a specific format.
     */
    public function getOutputFileUrl($format = 'wav')
    {
        if (!$this->output_files || !isset($this->output_files[$format])) {
            return null;
        }

        return $this->output_files[$format];
    }

    /**
     * Get the analysis metadata.
     */
    public function getAnalysisAttribute()
    {
        return $this->metadata['analysis'] ?? null;
    }

    /**
     * Get the loudness value from analysis.
     */
    public function getLoudnessAttribute()
    {
        return $this->analysis['loudness'] ?? null;
    }

    /**
     * Get the dynamic range value from analysis.
     */
    public function getDynamicRangeAttribute()
    {
        return $this->analysis['dynamic_range'] ?? null;
    }

    /**
     * Get the frequency balance from analysis.
     */
    public function getFrequencyBalanceAttribute()
    {
        return $this->analysis['frequency_balance'] ?? null;
    }

    /**
     * Get the stereo width from analysis.
     */
    public function getStereoWidthAttribute()
    {
        return $this->analysis['stereo_width'] ?? null;
    }
} 