# Temporary Audio Storage System

## Overview

This system implements temporary storage for audio files to prevent permanent storage of user uploads. Audio files are automatically deleted after processing is completed.

## How It Works

### 1. Upload Process
- Audio files are uploaded and stored temporarily in `storage/app/uploads/`
- Database records are created to track processing status
- Files remain available during the mastering process

### 2. Processing Period
- Files stay in storage while being processed
- Users can download their mastered files during this period
- Processing status is tracked in `storage/app/processing/` JSON files

### 3. Auto-Cleanup
- **10 minutes after completion**: Files are automatically deleted
- **Cleanup includes**:
  - Original uploaded file
  - Processed output files (WAV, MP3, FLAC)
  - Processing status JSON files
  - Database records

## Implementation Details

### Files Created/Modified

1. **`app/Console/Commands/CleanupAudioFiles.php`**
   - Artisan command for manual cleanup
   - Usage: `php artisan audio:cleanup --force --older-than=10`

2. **`app/Console/Kernel.php`**
   - Schedules automatic cleanup every 10 minutes
   - Runs in background without overlapping

3. **`app/Http/Controllers/AudioController.php`**
   - Added `cleanupCompletedFiles()` method
   - Added `manualCleanup()` method for admin use

4. **`routes/api.php`**
   - Added cleanup endpoints:
     - `POST /admin/audio/cleanup` - Manual cleanup
     - `POST /admin/audio/cleanup-auto` - Automatic cleanup

5. **`cleanup_all_audio.php`**
   - One-time script to remove all existing audio files
   - Usage: `php cleanup_all_audio.php`

### API Endpoints

#### Manual Cleanup (Admin Only)
```bash
POST /api/admin/audio/cleanup
Content-Type: application/json
Authorization: Bearer <token>

{
    "older_than_minutes": 10
}
```

#### Automatic Cleanup (Admin Only)
```bash
POST /api/admin/audio/cleanup-auto
Authorization: Bearer <token>
```

### Scheduled Tasks

The system automatically runs cleanup every 10 minutes:
```php
$schedule->command('audio:cleanup --force --older-than=10')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->runInBackground();
```

## Usage Instructions

### 1. Immediate Cleanup (Remove All Existing Files)
```bash
cd crysgarage-backend
php cleanup_all_audio.php
```

### 2. Manual Cleanup via Artisan
```bash
# Clean files older than 10 minutes (default)
php artisan audio:cleanup --force

# Clean files older than 5 minutes
php artisan audio:cleanup --force --older-than=5

# Interactive mode (asks for confirmation)
php artisan audio:cleanup
```

### 3. Manual Cleanup via API
```bash
curl -X POST http://localhost:8000/api/admin/audio/cleanup \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"older_than_minutes": 10}'
```

### 4. Check Scheduled Tasks
```bash
# List scheduled tasks
php artisan schedule:list

# Run scheduled tasks manually
php artisan schedule:run
```

## Storage Locations

### Files Stored Temporarily
- **Original files**: `storage/app/uploads/{audio_id}.wav`
- **Processing status**: `storage/app/processing/{audio_id}.json`
- **Processed files**: `storage/app/outputs/{audio_id}_{format}.{ext}`

### Database Records
- **Table**: `audio`
- **Key fields**: `id`, `user_id`, `file_name`, `status`, `processing_completed_at`
- **Auto-deleted**: 10 minutes after `processing_completed_at`

## Security Considerations

1. **No permanent storage**: Files are never stored permanently
2. **Automatic cleanup**: Reduces storage costs and security risks
3. **Admin-only cleanup**: Manual cleanup requires authentication
4. **Orphaned file cleanup**: Removes files without database records

## Monitoring

### Check Current Storage Usage
```bash
# Count files in uploads directory
ls -la storage/app/uploads/ | wc -l

# Count processing files
ls -la storage/app/processing/ | wc -l

# Check database records
php artisan tinker
>>> App\Models\Audio::count()
```

### Logs
Cleanup activities are logged in Laravel logs:
- `storage/logs/laravel.log`
- Look for "Cleaned up completed audio file" entries

## Troubleshooting

### Files Not Being Cleaned Up
1. Check if scheduler is running: `php artisan schedule:run`
2. Verify file permissions on storage directories
3. Check Laravel logs for errors
4. Ensure `processing_completed_at` is set correctly

### Manual Cleanup Fails
1. Check database connectivity
2. Verify file paths exist
3. Check storage disk permissions
4. Review error logs

### Scheduler Not Working
1. Add to crontab: `* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1`
2. Check if Laravel scheduler is enabled
3. Verify timezone settings

## Migration Notes

### From Permanent to Temporary Storage
1. Run `php cleanup_all_audio.php` to remove existing files
2. Deploy new code with temporary storage system
3. Monitor cleanup logs to ensure proper operation
4. Update any frontend code that expects permanent file URLs

### Backup Considerations
- **No backup needed**: Files are intentionally temporary
- **User data**: Only metadata is preserved in database temporarily
- **Processing history**: Consider logging processing statistics separately
