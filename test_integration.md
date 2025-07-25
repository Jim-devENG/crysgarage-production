# Crys Garage Integration Test Guide

## Services Running

- ✅ **Frontend**: http://localhost:3000 (React/TypeScript)
- ✅ **Backend**: http://localhost:8000 (Laravel API)
- ✅ **Ruby Engine**: http://localhost:4567 (Audio Mastering Service)

## Complete End-to-End Flow Test

### 1. Frontend Upload Flow

1. Open http://localhost:3000
2. Login with any credentials (simulated auth)
3. Navigate to the mastering dashboard
4. Upload an audio file (WAV, MP3, FLAC)
5. Select genre (Afrobeats, Hip-Hop, etc.)
6. Watch the processing status update every 3 seconds

### 2. Backend Processing Flow

1. Laravel receives upload via `/api/upload`
2. Stores file and creates processing record
3. Sends request to Ruby service at `http://localhost:4567/process`
4. Ruby service processes audio with genre-specific settings
5. Returns session ID and processing status

### 3. Status Polling Flow

1. Frontend polls `/api/status/{audio_id}` every 3 seconds
2. Laravel checks Ruby service status via `/status/{session_id}`
3. Updates processing progress and status
4. When complete, provides download URLs

### 4. Download Flow

1. User clicks download button for desired format (WAV, MP3, FLAC)
2. Frontend calls `/api/audio/{audio_id}/download/{format}`
3. Laravel serves the processed file from Ruby service output

### 5. Advanced Controls Flow (Advanced Tier)

1. User adjusts EQ, compression, stereo width
2. Frontend sends advanced config to `/api/mastering/{audio_id}/start`
3. Laravel forwards to Ruby service with custom parameters
4. Ruby applies advanced processing settings

## API Endpoints

### Frontend → Backend

- `POST /api/upload` - Upload audio file
- `GET /api/status/{audio_id}` - Get processing status
- `GET /api/audio/{audio_id}/download/{format}` - Download processed file
- `POST /api/mastering/{audio_id}/start` - Start advanced mastering

### Backend → Ruby Service

- `POST http://localhost:4567/process` - Process audio file
- `GET http://localhost:4567/status/{session_id}` - Check processing status
- `GET http://localhost:4567/download/{session_id}/{format}` - Download file

## Test Audio Files

You can use any audio file for testing:

- WAV files (recommended for best quality)
- MP3 files (common format)
- FLAC files (lossless compression)

## Expected Behavior

1. **Upload**: File uploads successfully, shows progress
2. **Processing**: Status updates from "pending" → "processing" → "done"
3. **Playback**: Original and mastered audio can be played
4. **Download**: Download buttons work for all formats
5. **Advanced Controls**: EQ, compression, stereo width adjustments work

## Troubleshooting

- If upload fails: Check backend is running on port 8000
- If processing fails: Check Ruby service is running on port 4567
- If frontend errors: Check React dev server on port 3000
- Check browser console for any JavaScript errors
- Check Laravel logs for PHP errors
- Check Ruby server output for processing errors

## Success Indicators

- ✅ File upload completes without errors
- ✅ Processing status updates every 3 seconds
- ✅ Progress bar shows actual progress
- ✅ "Done" status appears when processing complete
- ✅ Audio playback works for both original and mastered
- ✅ Download buttons are functional
- ✅ Advanced controls work for advanced tier users
